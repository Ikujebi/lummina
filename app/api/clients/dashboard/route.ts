import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ===============================
    // 1. GET CLIENT FROM USER
    // ===============================
    const client = await prisma.client.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!client) {
      return NextResponse.json({
        client: null,
        timeline: [],
      });
    }

    // ===============================
    // 2. GET MATTERS USING CLIENT ID (CRITICAL FIX)
    // ===============================
    const matters = await prisma.matter.findMany({
      where: {
        clientId: client.id, // ✅ FIXED (THIS WAS YOUR BUG)
      },
      include: {
        lawyer: true,
        client: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        documents: true,
        tasks: true,
        appointments: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // ===============================
    // 3. BUILD TIMELINE
    // ===============================
    const timeline = matters.flatMap((matter) =>
      matter.activities.map((a) => ({
        id: a.id,
        title: a.action,
        content: a.details ?? "",
        time: formatTime(a.createdAt),
      }))
    );

    const latestMatter = matters[0];

    // ===============================
    // 4. RESPONSE
    // ===============================
    return NextResponse.json({
      client: {
        id: client.id,
        name: user.name || "Client",
        caseId: latestMatter?.caseNumber || "",
        lawyer: latestMatter?.lawyer?.name || "",
        status: latestMatter?.status || "OPEN",
        matters, // optional but useful for frontend
      },
      timeline,
    });

  } catch (err) {
    console.error("CLIENT DASHBOARD ERROR:", err);

    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}

// ===============================
// TIME FORMATTER
// ===============================
function formatTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(diff / 86400000);
  return `${days} days ago`;
}