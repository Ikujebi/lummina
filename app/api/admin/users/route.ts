// app/api/admin/users/route.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET - Get all users
 */
export async function GET() {
  try {
    // Ensure requester is admin
    await requireAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * POST - Create new user
 */
export async function POST(req: NextRequest) {
  try {
    // Ensure requester is admin
    await requireAdmin();

    const { name, email, password, role } = await req.json();

    if (!["LAWYER", "ADMIN", "CLIENT"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    // ✅ Log creation in audit
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logAudit(currentUser.id, "CREATE", "User", user.id);
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}