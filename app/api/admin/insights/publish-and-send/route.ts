import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      authorId,
    } = body;

    if (!slug || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. CREATE OR UPDATE INSIGHT
    let insight = await prisma.newsletter.findUnique({
      where: { slug },
    });

    if (!insight) {
      insight = await prisma.newsletter.create({
        data: {
          title,
          slug,
          summary,
          content,
          coverImage,
          published: true,
          publishedAt: new Date(),
          authorId,
        },
      });
    } else {
      insight = await prisma.newsletter.update({
        where: { slug },
        data: {
          title,
          summary,
          content,
          coverImage,
          published: true,
          publishedAt: insight.publishedAt ?? new Date(),
        },
      });
    }

    // 2. CHECK IF ALREADY SENT (USING EmailLog)
    const alreadySent = await prisma.emailLog.findFirst({
      where: {
        subject: insight.title,
      },
    });

    if (alreadySent) {
      return NextResponse.json(
        { error: "Insight already sent to subscribers" },
        { status: 409 }
      );
    }

    // 3. GET SUBSCRIBERS
    const subscribers =
      await prisma.newsletterSubscriber.findMany({
        where: { active: true },
      });

    // 4. SEND EMAILS
    for (const subscriber of subscribers) {
      await resend.emails.send({
        from: "Lummina Law <insights@yourdomain.com>",
        to: subscriber.email,
        subject: insight.title,
        html: `
          <div style="font-family:sans-serif;padding:40px;">
            <h1>${insight.title}</h1>
            <p>${insight.summary}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/insights/${insight.slug}">
              Read Full Insight
            </a>
          </div>
        `,
      });

      // 5. LOG EMAIL (CRITICAL FOR DUPLICATE PREVENTION)
      await prisma.emailLog.create({
        data: {
          recipient: subscriber.email,
          subject: insight.title,
          body: insight.summary,
          status: "SENT",
        },
      });
    }

    return NextResponse.json({
      success: true,
      id: insight.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to publish and send insight" },
      { status: 500 }
    );
  }
}