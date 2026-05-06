import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { Resend } from "resend";

interface InvitationBody {
  id?: string;
  email?: string;
  role?: "ADMIN" | "LAWYER" | "CLIENT";
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function GET() {
  try {
    await requireAdmin();

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    const body: InvitationBody = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        userId: admin.id,
      } as Prisma.InvitationUncheckedCreateInput,
    });

    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?token=${token}`;

    const { error } = await resend.emails.send({
      from: "Lummina Law <noreply@legal.lumminalaw.com>",
      to: email,
      subject: "You're invited to Lummina Law",
      text: `You have been invited as a ${role}.\n\n${invitationLink}`,
      html: `
        <p>Hello,</p>
        <p>You have been invited to join Lummina Law as a <strong>${role}</strong>.</p>
        <p><a href="${invitationLink}">Accept Invitation</a></p>
        <p>Expires: ${expiresAt.toLocaleString()}</p>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      message: "Invitation created and email sent",
      invitation,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const body: InvitationBody = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing invitation ID" },
        { status: 400 }
      );
    }

    const invitation = await prisma.invitation.update({
      where: { id },
      data: {},
    });

    return NextResponse.json({
      message: "Invitation updated",
      invitation,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update invitation" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing invitation ID" },
        { status: 400 }
      );
    }

    await prisma.invitation.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Invitation deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete invitation" },
      { status: 500 }
    );
  }
}