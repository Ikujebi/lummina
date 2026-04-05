import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  const logs: Prisma.AuditLogGetPayload<{
    include: {
      user: {
        select: { name: true; email: true };
      };
    };
  }>[] = await prisma.auditLog.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const transformedLogs = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    user: log.user?.name || log.user?.email || null,
    createdAt: log.createdAt,
  }));

  return Response.json(transformedLogs);
}