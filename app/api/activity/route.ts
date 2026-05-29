import { NextRequest, NextResponse } from "next/server";

function setCorsHeaders(response: NextResponse) {
  response.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NODE_ENV === "production"
      ? "https://www.lumminalaw.com"
      : "http://localhost:3001"
  );

  response.headers.set(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  return response;
}

// Handle preflight request (VERY IMPORTANT for CORS)
export async function OPTIONS() {
  const response = new NextResponse(null, {
    status: 204,
  });

  return setCorsHeaders(response);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { event, path, metadata } = body;

    // Basic validation (important in production)
    if (!event || !path) {
      const res = NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
      return setCorsHeaders(res);
    }

    // Example: log activity (replace with DB insert if needed)
    console.log("Activity event:", {
      event,
      path,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // If you later use DB, this is where you'd insert:
    // await prisma.activity.create({ data: {...} })

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    return setCorsHeaders(response);
  } catch (error) {
    console.error("Activity API error:", error);

    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );

    return setCorsHeaders(response);
  }
}