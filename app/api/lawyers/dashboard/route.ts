import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // 🔒 SECURITY: Only lawyers allowed
    if (!user || user.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 📦 Fetch ONLY matters assigned to this lawyer
    const matters = await prisma.matter.findMany({
      where: {
        lawyerId: user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // =========================
    // 📊 STATS (DERIVED FROM DB)
    // =========================
    const totalMatters = matters.length;

    const completedMatters = matters.filter(
      (m) => m.status === "CLOSED"
    ).length;

    const activeMatters = matters.filter(
      (m) => m.status !== "CLOSED"
    ).length;

    const pendingMatters = matters.filter(
      (m) => m.status === "PENDING"
    ).length;

    // =========================
    // 🎯 UI FORMAT TRANSFORM
    // =========================
    const formattedMatters = matters.map((m) => {
      const progressMap: Record<string, number> = {
        OPEN: 20,
        IN_PROGRESS: 60,
        PENDING: 80,
        CLOSED: 100,
      };

      return {
        id: m.id,
        caseNumber: m.caseNumber,
        title: m.title,
        status: m.status,
        client: m.client,
        updatedAt: m.updatedAt,

        // UI-specific fields (for dashboard cards)
        stage: m.status,
        progress: progressMap[m.status] ?? 0,
        update: m.updatedAt.toISOString(),
      };
    });

    // 🚀 FINAL RESPONSE
    return NextResponse.json({
      matters: formattedMatters,
      stats: {
        totalMatters,
        completedMatters,
        activeMatters,
        pendingMatters,
      },
    });
  } catch (err) {
    console.error("LAWYER DASHBOARD ERROR:", err);

    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}