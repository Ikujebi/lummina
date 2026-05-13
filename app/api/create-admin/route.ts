import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  // Prevent usage in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not allowed" },
      { status: 403 }
    );
  }

  try {
    const email = "info@lumminalaw.com";
    const password = "Admin123!";
    const name = "Admin";

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("CREATE_ADMIN_ERROR", error);

    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}