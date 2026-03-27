// /pages/api/auth/forgot-password.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal if email exists for security reasons
    if (!user) {
      return NextResponse.json({
        message: "If that email exists, a reset link was sent.",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt, used: false },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // Send email using separate arguments
    await sendEmail(
      user.email,                                       // to
      "Password Reset Request",                          // subject
      `Hello ${user.name || "user"}, reset your password using this link: ${resetUrl}`, // text
      `<p>Hello ${user.name || "user"},</p>
       <p>You requested a password reset. Click the link below to reset your password:</p>
       <a href="${resetUrl}">Reset Password</a>
       <p>This link will expire in 1 hour.</p>`        // html
    );

    return NextResponse.json({
      message: "If that email exists, a reset link was sent.",
    });
  } catch (err) {
    console.error("Forgot-password error:", err);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}