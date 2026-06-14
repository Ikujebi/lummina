import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://www.lumminalaw.com",
  "https://lumminalaw.com",
];

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {};

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] =
      "GET, PUT, OPTIONS, DELETE";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }

  return headers;
}

/**
 * Preflight CORS Handler
 */
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

/**
 * GET /api/public/insights/[id]
 * Fetch single insight for frontend page
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = corsHeaders(req);

  try {
    const { id } = await params;

    const insight = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!insight) {
      return Response.json(
        { error: "Insight not found" },
        { status: 404, headers }
      );
    }

    return Response.json(insight, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[PUBLIC INSIGHT GET ERROR]", error);

    return Response.json(
      { error: "Failed to fetch insight" },
      { status: 500, headers }
    );
  }
}

/**
 * PUT /api/public/insights/[id]
 * Admin update
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = corsHeaders(req);

  try {
    const { id } = await params;

    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      published,
    } = await req.json();

    const updatedInsight = await prisma.newsletter.update({
      where: { id },
      data: {
        title,
        slug,
        summary,
        content,
        coverImage,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
      },
    });

    return Response.json(updatedInsight, { headers });
  } catch (error: any) {
    console.error("[ADMIN API ERROR] Updating insight failed:", error);

    if (error.code === "P2025") {
      return Response.json(
        { error: "Target legal insight record not found in database." },
        { status: 404, headers }
      );
    }

    return Response.json(
      { error: "Internal server admin processing error" },
      { status: 500, headers }
    );
  }
}