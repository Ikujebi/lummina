import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedOrigins = [
  "https://www.lumminalaw.com",
  "https://lumminalaw.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin":
      origin && allowedOrigins.includes(origin)
        ? origin
        : "https://www.lumminalaw.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req: Request) {
  return NextResponse.json(
    {},
    {
      headers: getCorsHeaders(req.headers.get("origin")),
    }
  );
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        {
          status: 400,
          headers: getCorsHeaders(req.headers.get("origin")),
        }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing =
      await prisma.newsletterSubscriber.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: "Already subscribed",
        },
        {
          headers: getCorsHeaders(req.headers.get("origin")),
        }
      );
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Subscribed successfully",
      },
      {
        headers: getCorsHeaders(req.headers.get("origin")),
      }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to subscribe",
      },
      {
        status: 500,
        headers: getCorsHeaders(req.headers.get("origin")),
      }
    );
  }
}