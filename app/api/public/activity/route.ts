import { prisma } from "@/lib/prisma";

const allowedOrigins = [
  "https://www.lumminalaw.com",
  "https://lumminalaw.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin":
      origin && allowedOrigins.includes(origin)
        ? origin
        : "https://www.lumminalaw.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");

  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  try {
    const body = await req.json();

    await prisma.websiteActivity.create({
      data: {
        event: body.event,
        path: body.path,
        metadata: body.metadata,
        ipAddress: null,
        userAgent: req.headers.get("user-agent"),
      },
    });

    return Response.json(
      { success: true },
      {
        headers: getCorsHeaders(origin),
      }
    );
  } catch (err) {
    console.error("Activity logging error:", err);

    return Response.json(
      { success: false },
      {
        status: 500,
        headers: getCorsHeaders(origin),
      }
    );
  }
}