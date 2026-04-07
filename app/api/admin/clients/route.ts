// app/api/admin/clients/route.ts
"use server";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { Client, Matter } from "@prisma/client";

interface ClientBody {
  name?: string;
  email?: string;
}

type ClientWithMatters = Client & { matters: Matter[] };

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return user;
}

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

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    const body: ClientBody = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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