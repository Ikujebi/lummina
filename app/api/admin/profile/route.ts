// app/api/admin/profile/route.ts
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/hash";
import { NextRequest, NextResponse } from "next/server";

// ================= GET admin profile =================
export async function GET() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        profilePicture: admin.profilePicture || "",
      },
    });
  } catch (err) {
    console.error("GET /admin/profile error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

// ================= PATCH update profile info =================
export async function PATCH(req: NextRequest) {
  try {
    const { name, email, profilePicture } = await req.json();

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: { name, email, profilePicture },
    });

    return NextResponse.json({ success: true, admin: updated });
  } catch (err) {
    console.error("PATCH /admin/profile error:", err);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}

// ================= PUT update password =================
export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json();

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    const isValid = await comparePassword(currentPassword, admin.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Current password incorrect" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /admin/profile error:", err);
    return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 });
  }
}