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

    console.log("SEND INSIGHT TRIGGERED:", id);

    const insight = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!insight) {
      return NextResponse.json(
        { error: "Insight not found" },
        { status: 404 }
      );
    }

    console.log("INSIGHT FOUND:", insight.title);

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
    });

    console.log("SUBSCRIBERS COUNT:", subscribers.length);

    if (!subscribers.length) {
      return NextResponse.json({
        success: false,
        message: "No active subscribers",
      });
    }

    for (const subscriber of subscribers) {
      if (!subscriber.email) continue;

      const response = await resend.emails.send({
        from: "Lummina Law <onboarding@resend.dev>",
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

      

      if (response.error) {
        throw new Error(response.error.message);
      }
    }

    // ✅ FIX: mark as sent AFTER successful email loop
    await prisma.newsletter.update({
      where: { id },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sent: subscribers.length,
    });
  } catch (error) {
    console.error("SEND INSIGHT FAILED:", error);

    return NextResponse.json(
      { error: "Failed to send insight" },
      { status: 500 }
    );
  }
}