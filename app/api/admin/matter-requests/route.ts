import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const requests = await prisma.matter.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        client: true,
        lawyer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      requests,
    });

  } catch (err) {
    console.error("ADMIN REQUEST FETCH ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}