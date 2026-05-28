import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newsletterId } = body;

    if (!newsletterId) {
      return NextResponse.json(
        { error: "newsletterId is required" },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Prevent duplicate views from same IP within 24 hours
    const existingView = await prisma.newsletterView.findFirst({
      where: {
        newsletterId,
        ipAddress,
        viewedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingView) {
      return NextResponse.json({
        success: true,
        message: "View already recorded recently",
      });
    }

    await prisma.newsletterView.create({
      data: {
        newsletterId,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("VIEW_TRACK_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}