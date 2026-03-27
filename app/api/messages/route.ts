import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

interface MessageBody {
  id?: string;
  content?: string;
  matterId?: string;
  attachments?: string[]; // array of file URLs
}

// GET: List messages for a matter
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const matterId = url.searchParams.get("matterId");
  if (!matterId) return NextResponse.json({ error: "Missing matterId" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { matterId },
    include: {
      sender: true,
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

// POST: Send a new message
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: MessageBody = await req.json();
    const { content, matterId, attachments } = body;

    if (!content || !matterId) {
      return NextResponse.json({ error: "Missing content or matterId" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        matterId,
        attachments: attachments
          ? { create: attachments.map(fileUrl => ({ fileUrl })) }
          : undefined,
      },
      include: {
        sender: true,
        attachments: true,
      },
    });

    return NextResponse.json({ message: "Message sent", data: message });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// PATCH: Edit a message (optional)
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: MessageBody = await req.json();
    const { id, content } = body;

    if (!id || !content) {
      return NextResponse.json({ error: "Missing id or content" }, { status: 400 });
    }

    const message = await prisma.message.update({
      where: { id },
      data: { content },
      include: { sender: true, attachments: true },
    });

    return NextResponse.json({ message: "Message updated", data: message });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

// DELETE: Remove a message
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing message ID" }, { status: 400 });

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Message deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}