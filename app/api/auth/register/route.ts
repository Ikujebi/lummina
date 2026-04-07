import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, password, role, token } =
      await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
      });
    }

    // Lawyer registration requires invitation token
    if (role === "LAWYER") {
      if (!token)
        return new Response(
          JSON.stringify({ error: "Invitation token required" }),
          { status: 400 }
        );

      const invitation = await prisma.invitation.findUnique({ where: { token } });
      if (!invitation || invitation.expiresAt < new Date()) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 400,
        });
      }
      if (invitation.role !== "LAWYER") {
        return new Response(JSON.stringify({ error: "Invalid role" }), {
          status: 400,
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    // If client, create Client record
    if (role === "CLIENT") {
      await prisma.client.create({
        data: { name, email, phone, address, userId: user.id },
      });
    }

    // If lawyer, mark invitation as accepted
    if (role === "LAWYER") {
      await prisma.invitation.update({
        where: { token },
        data: { accepted: true, userId: user.id },
      });
    }

    return new Response(
      JSON.stringify({ message: "User created successfully" }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}