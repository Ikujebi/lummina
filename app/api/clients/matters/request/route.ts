import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const matter = await prisma.matter.create({
      data: {
        title,
        description,
        status: "PENDING",
        caseNumber: `REQ-${Date.now()}`,
        clientId: client.id,
        lawyerId: "", // or null if your schema allows
      },
    });

    return NextResponse.json({ matter });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}