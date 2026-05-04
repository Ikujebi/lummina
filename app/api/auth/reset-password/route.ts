import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { token, newPassword } = body;

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Find token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    // Token not found
    if (!resetRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Reset link is invalid",
        },
        { status: 404 }
      );
    }

    // Token already used
    if (resetRecord.used) {
      return NextResponse.json(
        {
          success: false,
          error: "This reset link has already been used",
        },
        { status: 400 }
      );
    }

    // Token expired
    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          error: "Reset link has expired",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        password: hashedPassword,
      },
    });

    // Mark token used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: {
        used: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password successfully reset",
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while resetting password",
      },
      { status: 500 }
    );
  }
}