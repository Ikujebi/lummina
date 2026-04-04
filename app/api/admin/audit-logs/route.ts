import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Use inferred types without importing from @prisma/client
  const transformedLogs = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    user: log.user?.name || log.user?.email || null,
    createdAt: log.createdAt,
  }));

  return new Response(JSON.stringify(transformedLogs), {
    headers: { "Content-Type": "application/json" },
  });
}