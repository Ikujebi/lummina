import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

// ===============================
// GET CLIENT DASHBOARD
// ===============================
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ===============================
    // 1. GET CLIENT (REAL SOURCE OF TRUTH)
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
        charts: {
          doughnut: { labels: [], values: [] },
          line: [],
          progress: 0,
        },
      });
    }

    // ===============================
    // 2. GET MATTERS
    // ===============================
    const matters = await prisma.matter.findMany({
      where: {
        clientId: client.id,
      },
      include: {
        lawyer: true,
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

  
  

   

    // ===============================
    // 3. BUILD TIMELINE (SAFE)
    // ===============================
   const timeline = matters.flatMap((matter) =>
  (matter.activities ?? []).map((activity) => ({
    id: activity.id,
    action: activity.action,
    details: activity.details ?? "",
    time: formatTime(activity.createdAt), // ✅ USE IT HERE
    matter: {
      id: matter.id,
      caseNumber: matter.caseNumber,
    },
  }))
);

    // ===============================
    // 4. LATEST MATTER
    // ===============================
    const latestMatter = matters[0];

    // ===============================
    // 5. CHART DATA (SAFE)
    // ===============================
    const statusCounts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      PENDING: 0,
      CLOSED: 0,
    };

    for (const matter of matters) {
      if (statusCounts[matter.status as keyof typeof statusCounts] !== undefined) {
        statusCounts[matter.status as keyof typeof statusCounts]++;
      }
    }

    const charts = {
      doughnut: {
        labels: Object.keys(statusCounts),
        values: Object.values(statusCounts),
      },

      line: matters.slice(0, 7).map((m, i) => ({
        label: m.caseNumber || `Case ${i + 1}`,
        value: m.activities?.length ?? 0,
      })),

      progress: matters.length
        ? Math.round(
            (matters.filter((m) => m.status === "CLOSED").length /
              matters.length) *
              100
          )
        : 0,
    };

    // ===============================
    // 6. RESPONSE
    // ===============================
    return NextResponse.json({
      client: {
        id: client.id,
        name: user.name || "Client",
        caseId: latestMatter?.caseNumber || "Not Assigned",
        lawyer: latestMatter?.lawyer?.name || "Pending Assignment",
        status: latestMatter?.status || "OPEN",
        matters,
      },

      timeline,

      charts,
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