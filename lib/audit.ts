// lib/audit.ts
import { prisma } from "./prisma";

/**
 * Logs an action to the auditLog table.
 */
export async function logAudit(
  userId: string,
  action: string,
  entity?: string,
  entityId?: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dynamicPrisma = prisma as unknown as Record<string, any>;

  await dynamicPrisma["auditLog"].create({
    data: {
      userId,
      action,
      entity,
      entityId,
    },
  });
}