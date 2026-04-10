import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messageId, status } = await req.json();

    if (!messageId || !status) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const receipt = await prisma.messageReceipt.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: user.id,
        },
      },
      update: { status },
      create: {
        messageId,
        userId: user.id,
        status,
      },
    });

    return NextResponse.json(receipt);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 }
    );
  }
}