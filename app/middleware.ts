import { NextRequest, NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "@/lib/jwt";

const roleRoutes: Record<TokenPayload["role"], string> = {
  ADMIN: "/admin",
  LAWYER: "/lawyer",
  CLIENT: "/client",
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // Public routes (IMPORTANT: allow chat route access logic to continue)
  const isPublicChatRoute = path.startsWith("/chat");

  // If no token and route is protected → redirect
  if (!token) {
    // allow chat to still redirect properly instead of hard blocking
    if (isPublicChatRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const decoded: TokenPayload = verifyToken(token);
    const allowedRoute = roleRoutes[decoded.role];

    // Prevent role mismatch access
    if (!path.startsWith(allowedRoute) && !isPublicChatRoute) {
      return NextResponse.redirect(new URL(allowedRoute, req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/lawyer/:path*",
    "/client/:path*",
    "/chat/:path*", // ✅ REQUIRED for your chat route to work properly
  ],
};