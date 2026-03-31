import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const lawyers = await prisma.user.count({ where: { role: "LAWYER" } });
    const clients = await prisma.user.count({ where: { role: "CLIENT" } });
    const activeCases = await prisma.matter.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    });
    const pendingCases = await prisma.matter.count({
      where: { status: "PENDING" },
    });

    return Response.json([
      { label: "Total Lawyers", value: lawyers, trend: "+0 this month", trendUp: true },
      { label: "Total Clients", value: clients, trend: "+0 this week", trendUp: true },
      { label: "Active Cases", value: activeCases, trend: "+0 this week" },
      { label: "Pending Approvals", value: pendingCases, trend: "Requires attention", trendUp: false },
    ]);
  } catch (error) {
    console.error("Stats error:", error);

    // fallback (prevents UI crash)
    return Response.json([
      { label: "Total Lawyers", value: 0 },
      { label: "Total Clients", value: 0 },
      { label: "Active Cases", value: 0 },
      { label: "Pending Approvals", value: 0 },
    ]);
  }
}