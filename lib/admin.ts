// lib/admin.ts
import { prisma } from "./prisma";
import { hashPassword } from "./hash";

export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;

  if (!email || !password) {
    console.warn("ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
    return;
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (!existingAdmin) {
    const hashed = await hashPassword(password);
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: "ADMIN",
        name: "Admin",
      },
    });
    console.log("Admin user created ✅");
  }
}