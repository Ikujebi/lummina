import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "month";
    const lawyerId = url.searchParams.get("lawyerId");
    const clientId = url.searchParams.get("clientId");

    const now = new Date();
    let startDate: Date;
    const endDate = now;

    // ================= PERIOD =================
    switch (period) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // ================= FILTER =================
    const matterFilter: Prisma.MatterWhereInput = {
      createdAt: { gte: startDate, lte: endDate },
      ...(lawyerId ? { lawyerId } : {}),
      ...(clientId ? { clientId } : {}),
    };

    // ================= CORE METRICS =================
    const [newClients, newCases, closedCases, openCases] = await Promise.all([
      prisma.client.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.matter.count({ where: matterFilter }),
      prisma.matter.count({
        where: { ...matterFilter, status: "CLOSED" },
      }),
      prisma.matter.count({
        where: {
          ...matterFilter,
          status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] },
        },
      }),
    ]);

    // ================= TIME SERIES (LINE / BAR) =================
    const matters = await prisma.matter.findMany({
      where: matterFilter,
      select: { createdAt: true, status: true },
    });

    const graphData: Record<
      string,
      { newCases: number; closedCases: number }
    > = {};

    matters.forEach((m) => {
      const key = m.createdAt.toISOString().split("T")[0];

      if (!graphData[key]) {
        graphData[key] = { newCases: 0, closedCases: 0 };
      }

      graphData[key].newCases += 1;

      if (m.status === "CLOSED") {
        graphData[key].closedCases += 1;
      }
    });

    const chartData = Object.entries(graphData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, ...value }));

    // ================= STATUS DISTRIBUTION =================
    const statusCounts = await prisma.matter.groupBy({
      by: ["status"],
      where: matterFilter,
      _count: true,
    });

    // Optional (nice for reuse)
    const caseSnapshot = {
      labels: statusCounts.map((s) => s.status),
      values: statusCounts.map((s) => s._count),
    };

    // ================= PRODUCTIVITY =================
    const productivityMap: Record<string, number> = {};

    matters.forEach((m) => {
      const day = new Date(m.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
      });

      productivityMap[day] = (productivityMap[day] || 0) + 1;
    });

    const weeklyProductivity = Object.entries(productivityMap).map(
      ([label, value]) => ({ label, value })
    );

    // ================= PROGRESS =================
    const overallProgress =
      newCases === 0 ? 0 : Math.round((closedCases / newCases) * 100);

    // ================= FILTER DATA =================
    const [lawyers, clients] = await Promise.all([
      prisma.user.findMany({
        where: { role: "LAWYER" },
        select: { id: true, name: true },
      }),
      prisma.client.findMany({
        select: { id: true, name: true },
      }),
    ]);

    // ================= RESPONSE =================
    return NextResponse.json({
      // cards
      newClients,
      newCases,
      closedCases,
      openCases,

      // charts
      chartData,
      statusCounts,       // ✅ REQUIRED (fixes your error)
      caseSnapshot,       // optional reuse
      weeklyProductivity,
      overallProgress,

      // filters
      lawyers,
      clients,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}