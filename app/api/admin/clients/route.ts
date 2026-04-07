import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { Client, Matter } from "@prisma/client";

// Helper to ensure user is admin
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
  return user;
}

export async function GET() {
  // Ensure only admins can access
  await requireAdmin();

  // Fetch clients including their matters
  const clients = await prisma.client.findMany({
    include: { matters: true },
  });

  // Explicitly type 'c' here
  const result = clients.map((c: Client & { matters: Matter[] }) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    casesCount: c.matters.length,
  }));

  return NextResponse.json(result);
}