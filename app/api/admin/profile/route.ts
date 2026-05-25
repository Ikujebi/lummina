// app/api/admin/profile/route.ts

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/hash";
import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

/* ================= GET PROFILE ================= */
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        profilePicturePublicId: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, admin });
  } catch (err) {
    console.error("GET /admin/profile error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/* ================= PATCH PROFILE ================= */
export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: body.name,
        email: body.email,
        profilePicture: body.profilePicture,
        profilePicturePublicId: body.profilePicturePublicId,
      },
    });

    await logAudit(
      currentUser.id,
      "UPDATE",
      "AdminProfile",
      currentUser.id
    );

    return NextResponse.json({
      success: true,
      admin: updated,
    });
  } catch (err) {
    console.error("PATCH /admin/profile error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

/* ================= PUT PASSWORD ================= */
export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    const admin = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    const isValid = await comparePassword(
      currentPassword,
      admin.password
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword },
    });

    await logAudit(
      currentUser.id,
      "UPDATE_PASSWORD",
      "AdminProfile",
      currentUser.id
    );

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("PUT /admin/profile error:", err);

    return NextResponse.json(
      { success: false, error: "Failed to update password" },
      { status: 500 }
    );
  }
}