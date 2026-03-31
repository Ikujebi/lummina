// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Prisma 7+ Postgres adapter

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Use globalThis to prevent multiple instances in dev
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}