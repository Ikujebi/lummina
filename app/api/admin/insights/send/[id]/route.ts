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
    
    // Using the verified NEXT_PUBLIC_BASE_URL variable from your invitations file
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px;">
        <h1>${insight.title}</h1>
        <p>${insight.summary}</p>

        <a href="${baseUrl}/insights/${insight.slug}"
           style="display:inline-block;background:#5F021F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Read Full Insight
        </a>
      </div>
    `;

    const textContent = `
${insight.title}

${insight.summary}

Read full insight:
${baseUrl}/insights/${insight.slug}
    `;

    for (const subscriber of subscribers) {
      if (!subscriber.email) continue;

      const unsubscribeUrl = `${baseUrl}/api/admin/unsubscribe?id=${subscriber.id}`;

      // 🔥 CRITICAL FIX: Forces the entire header string onto one single clean line.
      // There must be absolutely NO hidden carriage returns or spaces inside this value.
      const listUnsubscribeValue = `<${unsubscribeUrl}>, <mailto:unsubscribe@legal.lumminalaw.com?subject=Unsubscribe-${subscriber.id}>`;

      const response = await resend.emails.send({
        from: "Lummina Law <news@legal.lumminalaw.com>",
        to: subscriber.email,
        subject: insight.title,
        
        html: htmlContent + `
          <hr style="border:none;border-top:1px solid #eee;margin-top:40px;"/>
          <p style="font-size:12px;color:#666;text-align:center;">
            Sent to ${subscriber.email}. If you wish to opt-out, you can 
            <a href="${unsubscribeUrl}" style="color:#5F021F;">unsubscribe here</a>.
          </p>
        `,
        text: textContent + `\n\nUnsubscribe:\n${unsubscribeUrl}`,

        headers: {
          "List-Unsubscribe": listUnsubscribeValue,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
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