import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { createNotification } from "@/lib/notifications/notifications.helper";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const insight = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!insight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
    });

    if (!subscribers.length) {
      if (insight.authorId) {
        await createNotification({
          userId: insight.authorId,
          title: "Newsletter Send Aborted",
          message: `No active subscribers found for "${insight.title}"`,
          type: "WARNING",
        });
      }

      return NextResponse.json({
        success: false,
        message: "No active subscribers",
      });
    }

    let sentCount = 0;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px;">
        <h1>${insight.title}</h1>
        <p>${insight.summary}</p>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/insights/${insight.slug}"
           style="display:inline-block;background:#5F021F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Read Full Insight
        </a>
      </div>
    `;

    const textContent = `
${insight.title}

${insight.summary}

Read full insight:
${process.env.NEXT_PUBLIC_APP_URL}/insights/${insight.slug}
    `;

    for (const subscriber of subscribers) {
      if (!subscriber.email) continue;

      const response = await resend.emails.send({
        from: "Lummina Law <news@legal.lumminalaw.com>",

        to: subscriber.email,
        subject: insight.title,

        html: htmlContent,
        text: textContent,

        // 🔥 IMPORTANT FOR GMAIL INBOXING
        headers: {
          "List-Unsubscribe": `<${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe>`,
        },
      });

      console.log("RESEND RESPONSE:", response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      sentCount++;
    }

    await prisma.newsletter.update({
      where: { id },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    });

    if (insight.authorId) {
      await createNotification({
        userId: insight.authorId,
        title: "Newsletter Sent Successfully",
        message: `"${insight.title}" sent to ${sentCount} subscribers`,
        type: "INFO",
      });
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
    });
  } catch (error) {
    console.error("SEND INSIGHT FAILED:", error);

    return NextResponse.json(
      { error: "Failed to send insight" },
      { status: 500 }
    );
  }
}