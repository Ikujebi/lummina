import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalMatters = await prisma.matter.count();

  const statusBreakdown = await prisma.matter.groupBy({
    by: ["status"],
    _count: true,
  });

  const monthlyMatters = await prisma.matter.findMany({
    select: { createdAt: true },
  });

  return Response.json({
    totalMatters,
    statusBreakdown,
    monthlyMatters,
  });
}