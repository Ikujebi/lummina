import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const insights = await prisma.newsletter.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            views: true,
          },
        },
      },
    });

    const formatted = insights.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: item.content,
      coverImage: item.coverImage,
      published: item.published,
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      authorId: item.authorId,

      // REAL analytics
      views: item._count.views,

      // ✅ FIX: include sent status
      sent: item.sent,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET_INSIGHTS_ERROR:", error);

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
    console.error("CREATE_INSIGHT_ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create insight" },
      { status: 500 }
    );
  }
}

