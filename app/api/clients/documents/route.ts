import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIX: resolve real client first
    const client = await prisma.client.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!client) {
      return NextResponse.json({
        success: true,
        documents: [],
      });
    }

    const documents = await prisma.document.findMany({
      where: {
        matter: {
          clientId: client.id,
          
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
    console.log({
  userId: user.id,
  clientId: client?.id,
});

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("CLIENT_DOCUMENTS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch documents",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}