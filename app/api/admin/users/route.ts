// app/api/admin/users/route.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();

  if (role !== "LAWYER" && role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Invalid role" }), { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role }
  });

  return new Response(JSON.stringify({ userId: user.id, email: user.email, role: user.role }));
}