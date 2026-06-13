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

  // Strict check: Only attach headers if origin matches exactly
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400"; // 24-hour preflight cache for speed optimization
  }

  return headers;
}

// Preflight CORS Handler
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

// Single Insight GET Handler
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = corsHeaders(req);

  try {
    const { id } = await params;

    // Defensive input check against basic malformed string requests
    if (!id || typeof id !== "string") {
      return Response.json(
        { error: "Invalid parameters provided" },
        { status: 400, headers }
      );
    }

    // Fixed: findFirst allows mixing unique 'id' with non-unique 'published' fields safely
    const insight = await prisma.newsletter.findFirst({
      where: { 
        id: id,
        published: true 
      },
    });

    if (!insight) {
      return Response.json(
        { error: "Insight article not found" },
        { status: 404, headers }
      );
    }

    const formatted = {
      ...insight,
      images: insight.coverImage ? [insight.coverImage] : [],
    };

    return Response.json(formatted, { headers });

  } catch (error) {
    // Keeps logs clean in your production APM tracker (like Vercel Logs or Datadog)
    console.error(`[API ERROR] Fetching insight failed:`, error);
    
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers }
    );
  }
}