import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matters = await prisma.matter.findMany({
      where: {
        clientId: user.id,
      },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        lawyer: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const timeline = matters.flatMap((matter) =>
  matter.activities.map((a) => ({
    id: a.id,
    title: a.action,
    content: a.details ?? "",
    time: formatTime(a.createdAt),
  }))
);

    const latestMatter = matters[0];

    return NextResponse.json({
      client: {
        name: user.name || "Client",
        caseId: latestMatter?.caseNumber || "",
        lawyer: latestMatter?.lawyer?.name || "",
        status: latestMatter?.status || "OPEN",
      },
      timeline,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}

function formatTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(diff / 86400000);
  return `${days} days ago`;
}