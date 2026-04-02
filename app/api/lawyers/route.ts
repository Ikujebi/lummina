// app/api/lawyers/route.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin"; // server-side only

/**
 * GET - Fetch all lawyers
 */
export async function GET() {
  try {
    const lawyers = await prisma.user.findMany({
      where: { role: "LAWYER" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, lawyers });
  } catch (err) {
    console.error("GET /api/lawyers error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lawyers" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new lawyer (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const lawyer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "LAWYER",
      },
    });

    return NextResponse.json({
      success: true,
      lawyer: {
        id: lawyer.id,
        name: lawyer.name,
        email: lawyer.email,
        role: lawyer.role,
      },
    });
  } catch (err) {
    console.error("POST /api/lawyers error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create lawyer" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update a lawyer (Admin only)
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();

    const { id, name, email, password } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lawyer ID is required" },
        { status: 400 }
      );
    }

    const updateData: { name?: string; email?: string; password?: string } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hash(password, 12);

    const updatedLawyer = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, lawyer: updatedLawyer });
  } catch (err) {
    console.error("PUT /api/lawyers error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update lawyer" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove a lawyer (Admin only)
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lawyer ID is required" },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Lawyer deleted" });
  } catch (err) {
    console.error("DELETE /api/lawyers error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete lawyer" },
      { status: 500 }
    );
  }
}