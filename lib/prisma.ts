console.log("PRISMA FILE LOADED");

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrisma() {
    console.log("CREATE PRISMA CALLED x2");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing in environment variables");
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}