import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";

// --- Types ---
interface InvitationBody {
  id?: string;
  email?: string;
  role?: "ADMIN" | "LAWYER" | "CLIENT";
  expiresAt?: string; // ISO string
}

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- Helper: Require admin ---
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    const error = new Error("Unauthorized");
    throw error;
  }
  return user;
}

// --- GET: List all invitations (Admin only) ---
export async function GET() {
  try {
    await requireAdmin(); // Only admins can view invitations

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invitations);
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// --- POST: Create a new invitation & send email (frontend form only) ---
export async function POST(req: Request) {
  try {
    const body: InvitationBody = (await req.json()) as InvitationBody;
    const { email, role, expiresAt } = body;

    if (!email || !role || !expiresAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = randomUUID();

    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt: new Date(expiresAt),
      },
    });

    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${token}`;

    await transporter.sendMail({
      from: `"Lummina Law" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "You're invited to Lummina Law",
      html: `
        <p>Hello,</p>
        <p>You have been invited to join Lummina Law as a <strong>${role}</strong>.</p>
        <p>Click the link below to accept your invitation:</p>
        <a href="${invitationLink}">${invitationLink}</a>
        <p>This link expires on ${new Date(expiresAt).toLocaleString()}.</p>
        <p>Thanks,<br/>Lummina Law Team</p>
      `,
    });

    return NextResponse.json({ message: "Invitation created and email sent", invitation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}

// --- PATCH: Update invitation (Admin only) ---
export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const body: InvitationBody = (await req.json()) as InvitationBody;
    const { id, expiresAt } = body;

    if (!id) return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });

    const invitation = await prisma.invitation.update({
      where: { id },
      data: { expiresAt: expiresAt ? new Date(expiresAt) : undefined },
    });

    return NextResponse.json({ message: "Invitation updated", invitation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 });
  }
}

// --- DELETE: Remove invitation (Admin only) ---
export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const body: { id?: string } = (await req.json()) as { id?: string };
    const { id } = body;

    if (!id) return NextResponse.json({ error: "Missing invitation ID" }, { status: 400 });

    await prisma.invitation.delete({ where: { id } });

    return NextResponse.json({ message: "Invitation deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete invitation" }, { status: 500 });
  }
}