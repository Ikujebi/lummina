// validators.ts
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";

// ----------------------------
// Password Reset
// ----------------------------
export async function generatePasswordReset(userId: string, email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: { userId, token, expiresAt, used: false }
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await sendEmail(
    email,
    "Password Reset Request",
    `Click the link to reset your password: ${resetLink}`
  );

  return token;
}

export async function validatePasswordReset(token: string) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });

  if (!record || record.used || record.expiresAt < new Date()) {
    return null;
  }

  return record;
}

export async function markPasswordResetUsed(token: string) {
  await prisma.passwordReset.update({
    where: { token },
    data: { used: true }
  });
}

// ----------------------------
// Two-Factor Authentication (2FA)
// ----------------------------
export async function send2FACode(userId: string, email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.twoFactorToken.create({
    data: { userId, code, expiresAt, used: false }
  });

  await sendEmail(email, "Your 2FA Code", `Your code is ${code}`);
}

export async function validate2FACode(userId: string, code: string) {
  const record = await prisma.twoFactorToken.findFirst({
    where: {
      userId,
      code,
      used: false,
      expiresAt: { gte: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!record) return false;

  await prisma.twoFactorToken.update({
    where: { id: record.id },
    data: { used: true }
  });

  return true;
}

// ----------------------------
// Generic Validators
// ----------------------------
export function isEmailValid(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isPasswordStrong(password: string) {
  return password.length >= 8;
}