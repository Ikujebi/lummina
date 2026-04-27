import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, password, role, token } =
      await req.json();

    // =========================
    // 1. CHECK IF USER EXISTS
    // =========================
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      );
    }

    let invitation = null;

    // =========================
    // 2. LAWYER INVITATION FLOW
    // =========================
    if (role === "LAWYER") {
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Invitation token required" }),
          { status: 400 }
        );
      }

      invitation = await prisma.invitation.findUnique({
        where: { token },
      });

      if (!invitation || invitation.expiresAt < new Date()) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          { status: 400 }
        );
      }

      if (invitation.role !== "LAWYER") {
        return new Response(
          JSON.stringify({ error: "Invalid role for this invitation" }),
          { status: 400 }
        );
      }
    }

    // =========================
    // 3. HASH PASSWORD
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // 4. CREATE USER
    // =========================
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isApproved: false,
      },
    });

    // =========================
    // 5. CREATE CLIENT PROFILE
    // =========================
    if (role === "CLIENT") {
      await prisma.client.create({
        data: {
          name,
          email,
          phone,
          address,
          userId: user.id,
        },
      });
    }

    // =========================
    // 6. UPDATE INVITATION (LAWYER ONLY)
    // =========================
    if (role === "LAWYER" && invitation) {
      await prisma.invitation.update({
        where: { token },
        data: {
          accepted: true,
          userId: user.id,
        },
      });
    }

    // =========================
    // 7. RESPONSE
    // =========================
    return new Response(
      JSON.stringify({
        message: "User created successfully",
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
}