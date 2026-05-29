import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:3001",
  "https://www.lumminalaw.com",
  "https://lumminalaw.com",
];

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  const headers: Record<string, string> = {};

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type";

  return headers;
}

// Preflight (important even for GET in some cases)
export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

export async function GET(req: NextRequest) {
  const insights = await prisma.newsletter.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return Response.json(insights, {
    headers: corsHeaders(req),
  });
}