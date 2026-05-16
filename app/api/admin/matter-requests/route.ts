import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

type ParsedBody = {
  clientId?: string;
  title?: string;
  description?: string;
};

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ ONLY FETCH PENDING REQUESTS
    const requests = await prisma.emailLog.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    const formattedRequests = await Promise.all(
      requests.map(async (req) => {
        let parsedBody: ParsedBody = {};

        // ✅ safer parsing
        if (typeof req.body === "string") {
          try {
            parsedBody = JSON.parse(req.body);
          } catch {
            parsedBody = {};
          }
        } else if (req.body && typeof req.body === "object") {
          parsedBody = req.body as ParsedBody;
        }

        const clientId = parsedBody.clientId;

        const client = clientId
          ? await prisma.client.findUnique({
              where: { id: clientId },
              select: {
                id: true,
                name: true,
              },
            })
          : null;

        return {
          id: req.id,
          subject: req.subject,
          recipient: req.recipient,
          status: req.status,
          sentAt: req.sentAt,
          data: parsedBody,
          client,
        };
      })
    );

    return NextResponse.json({ requests: formattedRequests });
  } catch (err) {
    console.error("ADMIN REQUEST FETCH ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}