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

    // 📦 Fetch matters assigned to this lawyer
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

    // 📊 Compute stats (real DB-driven)
    const totalMatters = matters.length;

    const completedMatters = await prisma.matter.count({
      where: {
        lawyerId: user.id,
        status: "CLOSED",
      },
    });

    const activeMatters = await prisma.matter.count({
      where: {
        lawyerId: user.id,
        status: {
          in: ["OPEN", "IN_PROGRESS", "PENDING"],
        },
      },
    });

    const pendingMatters = await prisma.matter.count({
      where: {
        lawyerId: user.id,
        status: "PENDING",
      },
    });

    // 🎯 Transform DB → UI format (THIS FIXES YOUR TYPE ERROR)
    const formattedMatters = matters.map((m) => {
      let progress = 0;

      switch (m.status) {
        case "OPEN":
          progress = 20;
          break;
        case "IN_PROGRESS":
          progress = 60;
          break;
        case "PENDING":
          progress = 80;
          break;
        case "CLOSED":
          progress = 100;
          break;
      }

      return {
        id: m.caseNumber, // UI expects case id
        client: m.client?.name || "Unknown Client",
        stage: m.status,
        progress,
        update: new Date(m.updatedAt).toLocaleDateString(),
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