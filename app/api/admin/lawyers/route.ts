import { prisma } from "@/lib/prisma";

export async function GET() {
  const lawyers = await prisma.user.findMany({
    where: { role: "LAWYER" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      mattersAsLawyer: {
        select: { id: true },
      },
    },
  });

  return Response.json(
    lawyers.map((l) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      createdAt: l.createdAt,
      casesCount: l.mattersAsLawyer.length,
    }))
  );
}