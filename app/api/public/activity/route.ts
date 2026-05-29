import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await prisma.websiteActivity.create({
      data: {
        event: body.event,
        path: body.path,
        ipAddress: null,
        userAgent: req.headers.get("user-agent"),
      },
    });

    return Response.json(
      { success: true },
      { headers: corsHeaders }
    );
  } catch (err) {
    return Response.json(
      { success: false },
      { status: 500, headers: corsHeaders }
    );
  }
}