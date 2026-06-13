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
    headers["Access-Control-Allow-Methods"] = "PUT, OPTIONS, DELETE";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
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

// Admin Update (PUT) Handler
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = corsHeaders(req);

  try {
    // 1. Resolve the dynamic route parameter safely
    const { id } = await params;

    // 2. Parse payload using clean names matching your Newsletter model schema
    const { title, slug, summary, content, coverImage, published } = await req.json();

    // 3. Directly update the model properties without variable aliases
    const updatedInsight = await prisma.newsletter.update({
      where: { 
        id: id 
      },
      data: {
        title,
        slug,
        summary,     // ✅ Matches schema perfectly
        content,
        coverImage,  // ✅ Matches schema perfectly
        published: published ?? false,
        publishedAt: published ? new Date() : null, // Sets publication date if live
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