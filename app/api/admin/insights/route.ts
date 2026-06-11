import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { getCurrentUser } from "@/lib/auth";

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

      views: item._count.views,
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
    // -------------------------------
    // 1. AUTH (IMPORTANT FIX)
    // -------------------------------
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -------------------------------
    // 2. REQUEST BODY
    // -------------------------------
    const body = await req.json();

    const {
      title,
      summary,
      content,
      coverImage,
      published,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // -------------------------------
    // 3. SLUG GENERATION
    // -------------------------------
    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.newsletter.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // -------------------------------
    // 4. CREATE NEWSLETTER (FIXED authorId)
    // -------------------------------
    const insight = await prisma.newsletter.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImage,
        published,
        publishedAt: published ? new Date() : null,

        // ✅ FIXED HERE
        authorId: user.id,
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