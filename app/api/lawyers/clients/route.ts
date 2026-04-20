import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clients = await prisma.client.findMany({
      where: {
        matters: {
          some: {
            lawyerId: user.id,
          },
        },
      },
      include: {
        matters: {
          where: {
            lawyerId: user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ clients });
  } catch (err) {
    console.error("LAWYER CLIENTS ERROR:", err);

    return NextResponse.json(
      { error: "Failed to load clients" },
      { status: 500 }
    );
  }
}