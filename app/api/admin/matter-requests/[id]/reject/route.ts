import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// ============================================
// REJECT MATTER REQUEST
// ============================================
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ============================================
    // AUTH
    // ============================================
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ============================================
    // PARAMS
    // ============================================
    const { id: requestId } = params;

    // ============================================
    // FIND REQUEST
    // ============================================
    const request = await prisma.matter.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // ============================================
    // ENSURE IT IS STILL PENDING
    // ============================================
    if (request.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    // ============================================
    // REJECT REQUEST
    // ============================================
    const matter = await prisma.matter.update({
      where: {
        id: requestId,
      },
      data: {
        status: "CLOSED",
      },
    });

    // ============================================
    // AUDIT LOG
    // ============================================
    await logAudit(
      user.id,
      "REJECT_REQUEST",
      "Matter",
      matter.id
    );

    // ============================================
    // RESPONSE
    // ============================================
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