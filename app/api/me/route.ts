import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* =======================
   GET CURRENT USER
======================= */
export async function GET() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        isApproved: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/me error:", err);

    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/* =======================
   UPDATE CURRENT USER
======================= */
export async function PATCH(req: Request) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, profilePicture } = body;

    // ✅ clean update object (prevents overwriting with empty strings)
    const updateData: {
      name?: string;
      email?: string;
      profilePicture?: string;
    } = {};

    if (name?.trim()) updateData.name = name.trim();
    if (email?.trim()) updateData.email = email.trim();
    if (profilePicture?.trim()) {
      updateData.profilePicture = profilePicture.trim();
    }

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated",
      user: updated,
    });
  } catch (err) {
    console.error("PATCH /api/me error:", err);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}