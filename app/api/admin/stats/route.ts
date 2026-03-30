import { prisma } from "@/lib/prisma";

export async function GET() {
  const lawyers = await prisma.user.count({
    where: { role: "LAWYER" },
  });

  const clients = await prisma.user.count({
    where: { role: "CLIENT" },
  });

  const activeCases = await prisma.matter.count({
    where: {
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
    },
  });

  const pendingCases = await prisma.matter.count({
    where: {
      status: "PENDING",
    },
  });

  return Response.json({
    lawyers,
    clients,
    activeCases,
    pendingCases,
  });
}