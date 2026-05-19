import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const existing =
      await prisma.newsletterSubscriber.findUnique({
        where: {
          email,
        },
      });

    if (existing) {
      return NextResponse.json({
        message: "Already subscribed",
      });
    }

    const subscriber =
      await prisma.newsletterSubscriber.create({
        data: {
          email,
        },
      });

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}