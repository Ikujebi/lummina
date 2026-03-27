// app/api/auth/register/route.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
  }

  const hashedPassword = await hash(password, 12);

const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: "CLIENT",
    clients: { create: { name, email } }, // works now
  },
  include: { clients: true }
});

  return new Response(JSON.stringify({ userId: user.id, email: user.email }));
}