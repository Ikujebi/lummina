// /pages/api/matters/routes.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessMatter } from "@/lib/permissions";

interface MatterBody {
  id?: string;
  title?: string;
  description?: string;
  status?: "OPEN" | "IN_PROGRESS" | "PENDING" | "CLOSED";
  clientId?: string;
  lawyerId?: string;
}

// ----------------------------
// GET: List all matters for the current user
// ----------------------------
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const matters = await prisma.matter.findMany({
    where: {
      OR: [
        { clientId: user.id },
        { lawyerId: user.id },
      ],
    },
    include: {
      client: true,
      lawyer: true,
      documents: true,
      tasks: true,
      appointments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(matters);
}

// ----------------------------
// POST: Create a new matter
// ----------------------------
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: MatterBody = await req.json();
    const { title, description, status, clientId, lawyerId } = body;

    if (!title || !status || !clientId || !lawyerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Only admin or lawyer can create matters
    if (!["ADMIN", "LAWYER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const matter = await prisma.matter.create({
      data: { title, description, status, clientId, lawyerId },
      include: {
        client: true,
        lawyer: true,
        documents: true,
        tasks: true,
        appointments: true,
      },
    });

    return NextResponse.json({ message: "Matter created", matter });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create matter" }, { status: 500 });
  }
}

// ----------------------------
// PATCH: Update an existing matter
// ----------------------------
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: MatterBody = await req.json();
    const { id, title, description, status } = body;

    if (!id) return NextResponse.json({ error: "Missing matter ID" }, { status: 400 });

    const matter = await prisma.matter.findUnique({ where: { id } });
    if (!matter) return NextResponse.json({ error: "Matter not found" }, { status: 404 });

    // Check if current user owns the matter
    const userOwnsMatter = matter.lawyerId === user.id || matter.clientId === user.id;
    if (!canAccessMatter(user.role, userOwnsMatter)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedMatter = await prisma.matter.update({
      where: { id },
      data: { title, description, status },
      include: {
        client: true,
        lawyer: true,
        documents: true,
        tasks: true,
        appointments: true,
      },
    });

    return NextResponse.json({ message: "Matter updated", matter: updatedMatter });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update matter" }, { status: 500 });
  }
}

// ----------------------------
// DELETE: Remove a matter
// ----------------------------
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing matter ID" }, { status: 400 });

    const matter = await prisma.matter.findUnique({ where: { id } });
    if (!matter) return NextResponse.json({ error: "Matter not found" }, { status: 404 });

    // Check if current user owns the matter
    const userOwnsMatter = matter.lawyerId === user.id || matter.clientId === user.id;
    if (!canAccessMatter(user.role, userOwnsMatter)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.matter.delete({ where: { id } });

    return NextResponse.json({ message: "Matter deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete matter" }, { status: 500 });
  }
}