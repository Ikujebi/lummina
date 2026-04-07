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

  // Fetch clients and count their matters directly in Prisma
  const clients = await prisma.client.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      matters: {
        select: { id: true },
      },
    },
  });

  // Compute the response without using a callback parameter
  const result = clients.map(({ id, name, email, matters }) => ({
    id,
    name,
    email,
    casesCount: matters.length,
  }));

  return NextResponse.json(result);
}