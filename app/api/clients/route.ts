import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hash } from "bcryptjs";

interface ClientBody {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string; // needed when admin creates client
}

// GET: List all clients
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { matters: true, user: true },
  });

  return NextResponse.json(clients);
}

// POST: Admin creates a new client (User + Client)
export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body: ClientBody = await req.json();
    const { name, email, phone, address, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT",
        clients: {
          create: {
            name,
            email,
            phone,
            address,
          },
        },
      },
      include: {
        clients: true,
      },
    });

    return NextResponse.json(
      {
        message: "Client created",
        userId: newUser.id,
        client: newUser.clients[0],
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

// PATCH: Update an existing client
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: ClientBody = await req.json();
    const { id, name, email, phone, address } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
      },
      include: { matters: true, user: true },
    });

    return NextResponse.json({ message: "Client updated", client });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// DELETE: Remove a client (and optionally user)
export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    // Get client to find linked user
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Delete client
    await prisma.client.delete({
      where: { id },
    });

    // OPTIONAL: also delete the user account
    await prisma.user.delete({
      where: { id: client.userId },
    });

    return NextResponse.json({ message: "Client deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}