import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../lib/jwt";

// Define the shape of your decoded token
interface DecodedToken {
  role: "ADMIN" | "LAWYER" | "CLIENT";
 
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = verifyToken(token) as DecodedToken;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && decoded.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/lawyer") && decoded.role !== "LAWYER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/client") && decoded.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/lawyer/:path*", "/client/:path*"],
};