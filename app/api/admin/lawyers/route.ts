import { prisma } from "@/lib/prisma";
import type { User, Matter } from "@prisma/client";

export async function GET() {
  const lawyers = await prisma.user.findMany({
    where: { role: "LAWYER" },
  });

  // map with type assertion
  return Response.json(
    lawyers.map((l: User & { mattersAsLawyer?: Matter[] }) => ({
      id: l.id,
      name: l.name,
      email: l.email,
      createdAt: l.createdAt,
      casesCount: l.mattersAsLawyer?.length ?? 0,
    }))
  );
}