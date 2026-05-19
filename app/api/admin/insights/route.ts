import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const insights = await prisma.newsletter.findMany({
      orderBy: {
        createdAt: "desc",
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      published,
      authorId,
    } = body;

    const insight = await prisma.newsletter.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImage,
        published,
        publishedAt: published ? new Date() : null,
        authorId,
      },
    });

    return NextResponse.json(insight);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create insight" },
      { status: 500 }
    );
  }
}