import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // =========================
    // AUTH
    // =========================
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // BODY
    // =========================
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // =========================
    // GET USER
    // =========================
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!dbUser || !dbUser.password) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // =========================
    // VERIFY CURRENT PASSWORD
    // =========================
    const isValidPassword = await compare(
      currentPassword,
      dbUser.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // =========================
    // PREVENT SAME PASSWORD
    // =========================
    const samePassword = await compare(
      newPassword,
      dbUser.password
    );

    if (samePassword) {
      return NextResponse.json(
        { error: "New password cannot be the same as current password" },
        { status: 400 }
      );
    }

    // =========================
    // HASH PASSWORD
    // =========================
    const hashedPassword = await hash(newPassword, 12);

    // =========================
    // UPDATE USER
    // =========================
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // =========================
    // EMAIL NOTIFICATION (NON-BLOCKING)
    // =========================
    if (dbUser.email) {
      await resend.emails.send({
        from: "Lummina Law Security <onboarding@resend.dev>",
        to: dbUser.email,
        subject: "Your Lummina Law Password Was Changed",
        text: `
Hello ${dbUser.name || "User"},

Your password was successfully changed.

If you did not make this change, please contact support immediately.

- Lummina Law Security
        `,
        html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
  <h2 style="color:#5F021F;">Password Changed Successfully</h2>

  <p>Hello <strong>${dbUser.name || "User"}</strong>,</p>

  <p>Your Lummina Law account password was successfully changed.</p>

  <p>If you made this change, no further action is required.</p>

  <p style="color:#b91c1c;">
    If you did NOT make this change, please contact support immediately.
  </p>

  <hr />

  <p style="font-size:12px;color:#6b7280;">
    Lummina Law Security Team
  </p>
</div>
        `,
      }).catch(() => {
        // silently fail email (do not block flow)
      });
    }

    // =========================
    // AUTO LOGOUT
    // =========================
    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return response;

  } catch {
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}