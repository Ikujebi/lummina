import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    // ✅ FIX: must await params
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing insight id" },
        { status: 400 }
      );
    }

    const insight = await prisma.newsletter.findUnique({
      where: { id },
      select: {
        id: true,
        published: true,
      },
    });

    if (!insight) {
      return NextResponse.json(
        { success: false, error: "Insight not found" },
        { status: 404 }
      );
    }

    if (insight.published) {
      return NextResponse.json({
        success: true,
        message: "Already published",
      });
    }

    const updated = await prisma.newsletter.update({
      where: { id },
      data: {
        published: true,
        publishedAt: new Date(),
      },
      select: {
        id: true,
        published: true,
        publishedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Insight published successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PUBLISH_INSIGHT_ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}