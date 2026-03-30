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

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const decoded: TokenPayload = verifyToken(token);
    const allowedRoute = roleRoutes[decoded.role];

    if (!path.startsWith(allowedRoute)) {
      return NextResponse.redirect(new URL(allowedRoute, req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/lawyer/:path*", "/client/:path*"],
};