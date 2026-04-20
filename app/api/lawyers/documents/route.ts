import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ OPTION 1 (BEST PRACTICE: direct relation filtering through Matter)
    const documents = await prisma.document.findMany({
      where: {
        matter: {
          lawyerId: user.id,
        },
      },
      include: {
        matter: {
          select: {
            id: true,
            title: true,
            caseNumber: true,
            status: true,
          },
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      documents,
    });
  } catch (err) {
    console.error("GET /api/lawyer/documents error:", err);

    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}