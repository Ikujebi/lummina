import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import Pusher from "pusher";
import { Attachment } from "@/types/chat";

interface MessageBody {
  id?: string;
  content?: string;
  matterId?: string;
  attachments?: Attachment[];
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
  cluster: "eu",
  useTLS: true,
});

// =====================
// ERROR HELPER
// =====================
function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Unknown error";
}

// =====================
// AUTH CHECK
// =====================
async function assertMatterAccess(user: AuthUser, matterId: string) {
  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
  });

  if (!matter) throw new Error("Matter not found");

  const isAllowed =
    user.role === "ADMIN" ||
    user.id === matter.clientId ||
    user.id === matter.lawyerId;

  if (!isAllowed) throw new Error("Forbidden");

  return matter;
}

// =====================
// GET
// =====================
export async function GET(req: Request) {
  const user = (await getCurrentUser()) as AuthUser | null;

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
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

// =====================
// POST MESSAGE
// =====================
export async function POST(req: Request) {
  const user = (await getCurrentUser()) as AuthUser | null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MessageBody = await req.json();

    const content = body.content ?? "";
    const matterId = body.matterId;

    const attachments: Attachment[] = Array.isArray(body.attachments)
      ? body.attachments.filter(
          (a): a is Attachment =>
            typeof a?.fileUrl === "string" && a.fileUrl.length > 0
        )
      : [];

    if (typeof matterId !== "string") {
      return NextResponse.json(
        { error: "Invalid matterId" },
        { status: 400 }
      );
    }

    if (!content.trim() && attachments.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    await assertMatterAccess(user, matterId);

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        matterId,
        attachments: attachments.length
          ? {
              create: attachments.map((att) => ({
                fileUrl: att.fileUrl,
              })),
            }
          : undefined,
      },
      include: {
        sender: true,
        attachments: true,
      },
    });

    // ==========================
    // 🔥 FIX: SMALL PUSHER PAYLOAD
    // ==========================
    const safeMessageForPusher = {
      id: message.id,
      content: message.content,
      matterId: message.matterId,
      senderId: message.senderId,
      createdAt: message.createdAt,
      attachments: message.attachments.map((a) => ({
        id: a.id,
        fileUrl: a.fileUrl,
      })),
    };

    await pusher.trigger(
      `matter-${matterId}`,
      "new-message",
      safeMessageForPusher
    );

    return NextResponse.json({
      message: "Message sent",
      data: message,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

// =====================
// PATCH MESSAGE
// =====================
export async function PATCH(req: Request) {
  const user = (await getCurrentUser()) as AuthUser | null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MessageBody = await req.json();
    const { id, content } = body;

    if (!id || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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
      {
        id: message.id,
        content: message.content,
        matterId: message.matterId,
      }
    );

    return NextResponse.json({
      message: "Message updated",
      data: message,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}

// =====================
// DELETE MESSAGE
// =====================
export async function DELETE(req: Request) {
  const user = (await getCurrentUser()) as AuthUser | null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

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
    return NextResponse.json(
      { error: getErrorMessage(err) },
      { status: 500 }
    );
  }
}