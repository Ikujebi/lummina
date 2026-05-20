import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const insight = await prisma.newsletter.findUnique({
      where: {
        id,
      },
    });

    if (!insight) {
      return NextResponse.json(
        { error: "Insight not found" },
        { status: 404 }
      );
    }

    const subscribers =
      await prisma.newsletterSubscriber.findMany({
        where: {
          active: true,
        },
      });

    for (const subscriber of subscribers) {
      await resend.emails.send({
        from: "Lummina Law <insights@yourdomain.com>",
        to: subscriber.email,
        subject: insight.title,
        html: `
          <div style="font-family:sans-serif;padding:40px;">
            <h1>${insight.title}</h1>

            <p>${insight.summary}</p>

            <a
              href="${process.env.NEXT_PUBLIC_APP_URL}/insights/${insight.slug}"
              style="
                display:inline-block;
                background:#5F021F;
                color:white;
                padding:12px 24px;
                border-radius:10px;
                text-decoration:none;
              "
            >
              Read Full Insight
            </a>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to send insight" },
      { status: 500 }
    );
  }
}