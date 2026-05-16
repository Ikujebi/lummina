import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ IMPORTANT: match approve style
    const { id: requestId } = await params;

    // FIND REQUEST
    const request = await prisma.matter.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    // REJECT (CLOSE)
    const matter = await prisma.matter.update({
      where: { id: requestId },
      data: {
        status: "CLOSED",
      },
    });

    await logAudit(
      user.id,
      "REJECT_REQUEST",
      "Matter",
      matter.id
    );

    return NextResponse.json({
      message: "Matter request rejected successfully",
    });

  } catch (error) {
    console.error("Reject matter error:", error);

    return NextResponse.json(
      { error: "Failed to reject request" },
      { status: 500 }
    );
  }
}