// app/api/admin/users/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET - Get single user
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
}

/**
 * PATCH - Update user role
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params; // ✅ IMPORTANT (same as GET)

    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing user id" },
        { status: 400 }
      );
    }

    const data: Prisma.UserUpdateInput = {};

    if (typeof body.role === "string") {
      data.role = body.role;
    }

    if (typeof body.isApproved === "boolean") {
      data.isApproved = body.isApproved;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PATCH error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete user
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    await prisma.user.delete({ where: { id } });

    // ✅ Log audit
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logAudit(currentUser.id, "DELETE", "User", id);
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}