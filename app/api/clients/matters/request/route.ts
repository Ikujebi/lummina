import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit"; 
import { notifyMatterRequestCreated } from "@/lib/events/matterRequestEvents";


export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await prisma.client.findFirst({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // ✅ STORE AS REQUEST (NOT A MATTER)
    const request = await prisma.emailLog.create({
      data: {
        recipient: "admin@system.com",
        subject: `New Matter Request: ${title}`,
        body: JSON.stringify({
          clientId: client.id,
          title,
          description,
        }),
        status: "PENDING",
      },
    });
   await logAudit(
  user.id,
  "CREATE",
  "MatterRequest",
  request.id
);

    await notifyMatterRequestCreated({
      clientUserId: user.id,
      clientName: user.name,
      title,
    });

    return NextResponse.json({
      message: "Request submitted successfully",
      requestId: request.id,
    });
  } catch (error) {
    console.error("MATTER REQUEST ERROR:", error);

    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}