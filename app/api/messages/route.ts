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

type AuthUser = {
  id: string;
  role: "ADMIN" | "LAWYER" | "CLIENT";
};

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
// HELPER: AUTH CHECK
// =====================
async function assertMatterAccess(user: AuthUser, matterId: string) {
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
  });

  if (!matter) {
    throw new Error("Matter not found");
  }

  const isAllowed =
    user.role === "ADMIN" ||
    user.id === matter.clientId ||
    user.id === matter.lawyerId;

  if (!isAllowed) {
    throw new Error("Forbidden");
  }

  return matter;
}

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

  try {
    await assertMatterAccess(user, matterId);

    const messages = await prisma.message.findMany({
      where: { matterId },
      include: {
        sender: true,
        attachments: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Forbidden");

    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Forbidden" ? 403 : 404 }
    );
  }
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

    await assertMatterAccess(user, matterId);

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

    if (attachments?.length) {
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

    try {
      await pusher.trigger(`matter-${matterId}`, "new-message", message);
    } catch (err) {
      console.error("Pusher trigger error:", err);
    }

    return NextResponse.json({
      message: "Message sent",
      data: message,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Failed to send message");

    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Forbidden" ? 403 : 500 }
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

    const existing = await prisma.message.findUnique({
      where: { id },
      select: { matterId: true },
    });

    if (!existing?.matterId) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    await assertMatterAccess(user, existing.matterId);

    const message = await prisma.message.update({
      where: { id },
      data: { content },
      include: { sender: true, attachments: true },
    });

    await pusher.trigger(
      `matter-${existing.matterId}`,
      "update-message",
      message
    );

    return NextResponse.json({
      message: "Message updated",
      data: message,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Failed to update message");

    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Forbidden" ? 403 : 500 }
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

    const existing = await prisma.message.findUnique({
      where: { id },
      select: { matterId: true },
    });

    if (!existing?.matterId) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    await assertMatterAccess(user, existing.matterId);

    await prisma.message.delete({
      where: { id },
    });

    await pusher.trigger(
      `matter-${existing.matterId}`,
      "delete-message",
      {
        id,
        matterId: existing.matterId,
      }
    );

    return NextResponse.json({ message: "Message deleted" });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Failed to delete message");

    return NextResponse.json(
      { error: error.message },
      { status: error.message === "Forbidden" ? 403 : 500 }
    );
  }
}