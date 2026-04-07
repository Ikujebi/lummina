// app/api/admin/clients/route.ts
"use server";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { Client, Matter } from "@prisma/client";

// --- Types ---
interface ClientBody {
  name?: string;
  email?: string;
}

// --- Type for clients with their matters ---
type ClientWithMatters = Client & { matters: Matter[] };

// --- Helper: Require admin ---
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return user;
}

// --- GET: List all clients with cases count ---
export async function GET() {
  await requireAdmin();

  const clients: ClientWithMatters[] = await prisma.client.findMany({
    include: { matters: true },
  });

  return NextResponse.json(
    clients.map((c: ClientWithMatters) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      casesCount: c.matters.length,
    }))
  );
}

// --- POST: Create a new client ---
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(); // get admin user

    const body: ClientBody = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the client
    const client = await prisma.client.create({
      data: {
        name,
        email,
        user: {
          connect: { id: admin.id },
        },
      },
    });

    return NextResponse.json({
      message: "Client created successfully",
      client,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}