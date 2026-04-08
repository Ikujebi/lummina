import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // ===== CURRENT WEEK =====
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - 7);

    // ===== PREVIOUS WEEK =====
    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfCurrentWeek.getDate() - 7);

    const endOfPreviousWeek = new Date(startOfCurrentWeek);

    // ===== COUNTS =====
    const [
      totalLawyers,
      totalClients,
      activeCases,
      pendingCases,

      currentWeekClients,
      previousWeekClients,

      currentWeekLawyers,
      previousWeekLawyers,

      currentWeekCases,
      previousWeekCases,
    ] = await Promise.all([
      // totals
      prisma.user.count({ where: { role: "LAWYER" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.matter.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.matter.count({
        where: { status: "PENDING" },
      }),

      // trends → CLIENTS
      prisma.user.count({
        where: {
          role: "CLIENT",
          createdAt: { gte: startOfCurrentWeek },
        },
      }),
      prisma.user.count({
        where: {
          role: "CLIENT",
          createdAt: {
            gte: startOfPreviousWeek,
            lt: endOfPreviousWeek,
          },
        },
      }),

      // trends → LAWYERS
      prisma.user.count({
        where: {
          role: "LAWYER",
          createdAt: { gte: startOfCurrentWeek },
        },
      }),
      prisma.user.count({
        where: {
          role: "LAWYER",
          createdAt: {
            gte: startOfPreviousWeek,
            lt: endOfPreviousWeek,
          },
        },
      }),

      // trends → CASES
      prisma.matter.count({
        where: {
          createdAt: { gte: startOfCurrentWeek },
        },
      }),
      prisma.matter.count({
        where: {
          createdAt: {
            gte: startOfPreviousWeek,
            lt: endOfPreviousWeek,
          },
        },
      }),
    ]);

    // ===== TREND CALCULATIONS =====
    const clientTrend = currentWeekClients - previousWeekClients;
    const lawyerTrend = currentWeekLawyers - previousWeekLawyers;
    const caseTrend = currentWeekCases - previousWeekCases;

    return Response.json([
      {
        label: "Total Lawyers",
        value: totalLawyers,
        trend: `${lawyerTrend >= 0 ? "+" : ""}${lawyerTrend} this week`,
        trendUp: lawyerTrend >= 0,
      },
      {
        label: "Total Clients",
        value: totalClients,
        trend: `${clientTrend >= 0 ? "+" : ""}${clientTrend} this week`,
        trendUp: clientTrend >= 0,
      },
      {
        label: "Active Cases",
        value: activeCases,
        trend: `${caseTrend >= 0 ? "+" : ""}${caseTrend} this week`,
        trendUp: caseTrend >= 0,
      },
      {
        label: "Pending Approvals",
        value: pendingCases,
        trend: pendingCases > 0 ? "Needs attention" : "All clear",
        trendUp: pendingCases === 0,
      },
    ]);
  } catch (error) {
    console.error("Stats error:", error);

    return Response.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}