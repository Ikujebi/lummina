import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Ensure the user is an admin
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export async function GET() {
  await requireAdmin();

  // Fetch clients with a count of their matters directly from the database
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { matters: true },
      },
    },
  });

  // Return the response directly without needing any map parameter
  const result = clients.map(client => ({
    id: client.id,
    name: client.name,
    email: client.email,
    casesCount: client._count.matters,
  }));

  return NextResponse.json(result);
}