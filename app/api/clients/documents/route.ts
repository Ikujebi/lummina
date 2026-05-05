import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Get authenticated user
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const clientId = user.id;

    // 2. Fetch documents
    const documents = await prisma.document.findMany({
      where: {
        matter: {
          clientId,
        },
      },
      include: {
        matter: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
          },
        },

        // ✅ FIX: correct relation name from Prisma schema
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("CLIENT_DOCUMENTS_ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch documents",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}