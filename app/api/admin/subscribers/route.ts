import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        email: true,
        subscribedAt: true,
        active: true,
      },
      orderBy: {
        subscribedAt: "desc",
      },
    });

    return NextResponse.json(subscribers, {
      status: 200,
    });
  } catch (error) {
    console.error("Failed to fetch subscribers:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscribers",
      },
      {
        status: 500,
      }
    );
  }
}