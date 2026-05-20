import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const allowedOrigins = [
  "https://lummina.com",
  "https://www.lumminalaw.com",
];

function getCorsHeaders(
  origin: string | null
) {
  return {
    "Access-Control-Allow-Origin":
      origin &&
      allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0],

    "Access-Control-Allow-Methods":
      "POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type",
  };
}

export async function OPTIONS(
  req: Request
) {
  return NextResponse.json(
    {},
    {
      headers: getCorsHeaders(
        req.headers.get("origin")
      ),
    }
  );
}

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const {
      event,
      path,
      metadata,
      userId,
    } = body;

    const forwardedFor =
      req.headers.get(
        "x-forwarded-for"
      );

    const ipAddress =
      forwardedFor
        ? forwardedFor
            .split(",")[0]
            .trim()
        : "unknown";

    const activity =
      await prisma.websiteActivity.create({
        data: {
          event,
          path,
          metadata,
          userId,

          ipAddress,

          userAgent:
            req.headers.get(
              "user-agent"
            ) || "unknown",

          referrer:
            req.headers.get(
              "referer"
            ) || undefined,
        },
      });

    return NextResponse.json(
      {
        success: true,
        activity,
      },
      {
        headers: getCorsHeaders(
          req.headers.get("origin")
        ),
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to track activity",
      },
      {
        status: 500,

        headers: getCorsHeaders(
          req.headers.get("origin")
        ),
      }
    );
  }
}