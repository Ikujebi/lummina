// app/api/admin/users/route.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify({ success: true, users }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Failed to fetch users" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!["LAWYER", "ADMIN", "CLIENT"].includes(role)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid role" }), { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ success: false, error: "User already exists" }), { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    return new Response(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Failed to create user" }), { status: 500 });
  }
}