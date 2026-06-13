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
    // 1. Resolve the dynamic route segment params securely
    const { id } = await params;

    // 2. Parse the payload coming from your frontend admin form
    const { title, excerpt, content, imageUrl, published } = await req.json();

    // 3. Execute the database modification with mapped schema properties
    const updatedInsight = await prisma.newsletter.update({
      where: { 
        id: id 
      },
      data: {
        title,
        summary: excerpt,     // ✅ Fixed: Redirects frontend 'excerpt' into database 'summary'
        content,
        coverImage: imageUrl, // ✅ Fixed: Redirects frontend 'imageUrl' into database 'coverImage'
        published: published ?? false,
        // If your administrative update edits the slug dynamically, uncomment below:
        // slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      },
    });

    return Response.json(updatedInsight, { headers });

  } catch (error: any) {
    console.error("[ADMIN API ERROR] Updating insight failed:", error);
    
    // Fallback error messaging if prisma throws a target record-not-found error code (P2025)
    if (error.code === "P2025") {
      return Response.json(
        { error: "Target legal insight record not found in system schema" },
        { status: 404, headers }
      );
    }

    return Response.json(
      { error: "Internal server admin processing error" },
      { status: 500, headers }
    );
  }
}