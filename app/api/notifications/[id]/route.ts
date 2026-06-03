import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    });

    return NextResponse.json({
      message: "Marked as read",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}