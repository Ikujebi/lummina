import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const insights = await prisma.newsletter.findMany({
      where: {
        published: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}