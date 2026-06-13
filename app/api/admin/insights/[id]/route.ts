import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}


/**
 * GET /api/admin/insights/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing insight id" },
        { status: 400 }
      );
    }

    const insight = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!insight) {
      return NextResponse.json(
        { success: false, error: "Insight not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(insight);
  } catch (error) {
    console.error("GET_INSIGHT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch insight",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/insights/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing insight id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      title,
      excerpt,
      content,
      imageUrl,
      category,
      author,
      status,
    } = body;

    const existing = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Insight not found" },
        { status: 404 }
      );
    }

    const updatedInsight = await prisma.newsletter.update({
      where: { id },
      data: {
        title,
        excerpt,
        content,
        imageUrl,
        category,
        author,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      insight: updatedInsight,
    });
  } catch (error) {
    console.error("PATCH_INSIGHT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update insight",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/insights/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing insight id" },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletter.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Insight not found" },
        { status: 404 }
      );
    }

    await prisma.newsletter.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Insight deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_INSIGHT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete insight",
      },
      { status: 500 }
    );
  }
}