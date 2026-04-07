"use server";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { Client, Matter } from "@prisma/client";

// Helper to ensure the current user is an admin
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function GET() {
  // Ensure only admins can access
  await requireAdmin();

  // Fetch clients with their related matters
  const clients: (Client & { matters: Matter[] })[] = await prisma.client.findMany({
    include: { matters: true },
  });

  // Map clients to a clean response
  const result = clients.map((c: Client & { matters: Matter[] }) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    casesCount: c.matters.length,
  }));

  return NextResponse.json(result);
}