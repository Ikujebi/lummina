import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const transformedLogs = logs.map((log: typeof logs[number]) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      user: log.user?.name || log.user?.email || null,
      createdAt: log.createdAt,
    }));

    return NextResponse.json(transformedLogs);
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}