import { prisma } from "@/lib/prisma";

export async function GET() {
  const newLawyers = await prisma.user.count({
    where: {
      role: "LAWYER",
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  return Response.json([
    {
      title: "New Lawyer Registrations",
      meta: `${newLawyers} new lawyers this week`,
      actionText: "Review",
    },
    {
      title: "System Status",
      meta: "All systems operational",
      actionText: "View",
    },
  ]);
}