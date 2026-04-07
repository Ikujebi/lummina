import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export async function GET() {
  await requireAdmin();

  // Fetch clients with cases count directly from the database
  const clients = await prisma.$queryRaw<
    { id: string; name: string; email: string | null; casesCount: number }[]
  >`
    SELECT c.id, c.name, c.email, COUNT(m.id) as "casesCount"
    FROM "Client" c
    LEFT JOIN "Matter" m ON m."clientId" = c.id
    GROUP BY c.id
  `;

  return NextResponse.json(clients);
}