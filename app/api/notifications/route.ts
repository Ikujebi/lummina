import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

interface NotificationBody {
  id?: string;
  title?: string;
  message?: string;
  type?: "INFO" | "WARNING" | "DEADLINE" | "MESSAGE";
  read?: boolean;
  userId?: string;
}

// GET: List notifications for current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notifications);
}

// POST: Create a notification
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: NotificationBody = await req.json();
    const { title, message, type, userId } = body;

    if (!title || !message || !type || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
      },
    });

    return NextResponse.json({ message: "Notification created", data: notification });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}

// PATCH: Mark notification as read/unread
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: NotificationBody = await req.json();
    const { id, read } = body;

    if (!id || read === undefined) {
      return NextResponse.json({ error: "Missing id or read status" }, { status: 400 });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json({ message: "Notification updated", data: notification });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

// DELETE: Remove a notification
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}