import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      event,
      path,
      metadata,
      userId,
    } = body;

    const activity =
      await prisma.websiteActivity.create({
        data: {
          event,
          path,
          metadata,
          userId,
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            "unknown",
          userAgent:
            req.headers.get("user-agent") ||
            "unknown",
          referrer:
            req.headers.get("referer") || undefined,
        },
      });

    return NextResponse.json(activity);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to track activity" },
      { status: 500 }
    );
  }
}