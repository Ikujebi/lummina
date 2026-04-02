import { prisma } from "@/lib/prisma";

export async function GET() {
  const lawyers = await prisma.user.findMany({
    where: { role: "LAWYER" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      lawyerMatters: {
        select: { id: true },
      },
    },
  });

  return Response.json(
    lawyers.map((l) => ({
      ...l,
      casesCount: l.lawyerMatters.length,
    }))
  );
}