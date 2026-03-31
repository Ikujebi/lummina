import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Total matters/cases
    const totalMatters = await prisma.matter.count();

    // Status breakdown (Active, Pending, Closed, etc.)
    const statusBreakdown = await prisma.matter.groupBy({
      by: ["status"],
      _count: true,
    });

    // Monthly matters: group by month (for chart/cards)
    const monthlyMattersRaw = await prisma.matter.findMany({
      select: { createdAt: true },
    });

    // Aggregate monthly counts
    const monthlyCounts: Record<string, number> = {};
    monthlyMattersRaw.forEach((m) => {
      const month = new Date(m.createdAt).toLocaleString("default", { month: "long", year: "numeric" });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    // Dummy data for clients and closed cases (if you want real logic, replace with actual tables)
    const newClients = await prisma.client.count();
    const closedCases = await prisma.matter.count({
      where: { status: "CLOSED" },
    });

    return NextResponse.json({
      totalMatters,
      statusBreakdown,
      monthlyCounts,
      newClients,
      closedCases,
    });
  } catch (err) {
    console.error("Failed to fetch reports:", err);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}