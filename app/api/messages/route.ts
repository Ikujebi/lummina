import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Pusher from "pusher";

interface MessageBody {
  id?: string;
  content?: string;
  matterId?: string;
  attachments?: string[];
}

// =====================
// Pusher setup
// =====================
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// =====================
// GET messages
// =====================
export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const matterId = url.searchParams.get("matterId");

  if (!matterId) {
    return NextResponse.json({ error: "Missing matterId" }, { status: 400 });
  }

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

// =====================
// POST message
// =====================
export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MessageBody = await req.json();
    const { content, matterId, attachments } = body;

    if (!content || !matterId) {
      return NextResponse.json(
        { error: "Missing content or matterId" },
        { status: 400 }
      );
    }

    // 1. Create message + attachments
    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        matterId,
        attachments: attachments?.length
          ? {
              create: attachments.map((fileUrl) => ({
                fileUrl,
              })),
            }
          : undefined,
      },
      include: {
        sender: true,
        attachments: true,
      },
    });

    // 2. ALSO store attachments in Document table (global access)
    if (attachments && attachments.length > 0) {
      await prisma.document.createMany({
        data: attachments.map((fileUrl) => ({
          name: fileUrl.split("/").pop() || "Chat File",
          fileUrl,
          status: "DRAFT",
          matterId,
          uploadedBy: user.id,
        })),
      });
    }

    // 3. Trigger realtime update
    try {
      await pusher.trigger(`matter-${matterId}`, "new-message", message);
    } catch (err) {
      console.error("Pusher trigger error:", err);
    }

    return NextResponse.json({
      message: "Message sent",
      data: message,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// =====================
// PATCH message
// =====================
export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MessageBody = await req.json();
    const { id, content } = body;

    if (!id || !content) {
      return NextResponse.json(
        { error: "Missing id or content" },
        { status: 400 }
      );
    }

    const message = await prisma.message.update({
      where: { id },
      data: { content },
      include: { sender: true, attachments: true },
    });

    const updated = await prisma.message.findUnique({
      where: { id },
      select: { matterId: true },
    });

    if (updated?.matterId) {
      await pusher.trigger(
        `matter-${updated.matterId}`,
        "update-message",
        message
      );
    }

    return NextResponse.json({
      message: "Message updated",
      data: message,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// =====================
// DELETE message
// =====================
export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing message ID" },
        { status: 400 }
      );
    }

    const existingMessage = await prisma.message.findUnique({
      where: { id },
      select: { matterId: true },
    });

    await prisma.message.delete({
      where: { id },
    });

    if (existingMessage?.matterId) {
      await pusher.trigger(
        `matter-${existingMessage.matterId}`,
        "delete-message",
        {
          id,
          matterId: existingMessage.matterId,
        }
      );
    }

    return NextResponse.json({ message: "Message deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}