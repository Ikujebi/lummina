import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

interface InvitationBody {
  id?: string;
  email?: string;
  role?: "ADMIN" | "LAWYER" | "CLIENT";
  expiresAt?: string; // ISO string
}

// GET: List all invitations
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invitations);
}

// POST: Create a new invitation
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: InvitationBody = await req.json();
    const { email, role, expiresAt } = body;

    if (!email || !role || !expiresAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = randomUUID(); // generate unique invitation token

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt: new Date(expiresAt),
      },
    });

    // TODO: Send email with invitation link containing token

    return NextResponse.json({ message: "Invitation created", invitation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}

// PATCH: Update an invitation (e.g., mark as accepted or change expiry)
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: InvitationBody = await req.json();
    const { id, expiresAt } = body;

    if (!id) return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });

    const invitation = await prisma.invitation.update({
      where: { id },
      data: {
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    return NextResponse.json({ message: "Invitation updated", invitation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}

// DELETE: Remove an invitation
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });

    await prisma.invitation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Invitation deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete invitation" }, { status: 500 });
  }
}