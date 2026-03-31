import { comparePassword } from "@/lib/hash";
import { signToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/admin";

export async function POST(req: Request) {
  try {
    await ensureAdmin(); // <- ensures admin exists

    const { email, password } = await req.json();

    // check hard-coded admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const adminUser = await prisma.user.findUnique({ where: { email } });
      const token = signToken({ id: adminUser!.id, email, role: "ADMIN" });

      const response = NextResponse.json({ role: "ADMIN" });
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
      });

      return response;
    }

    // normal users
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const valid = await comparePassword(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ role: user.role });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}