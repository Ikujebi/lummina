import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // 🔒 only admin can view global activity feed
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 📦 fetch raw activities with relations
    const activities = await prisma.matterActivity.findMany({
      include: {
        matter: {
          include: {
            client: true,
            lawyer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 🧠 format for frontend consumption
    const formatted = activities.map((a) => ({
      id: a.id,
      action: a.action,
      details: a.details,
      createdAt: a.createdAt,

      matter: {
        id: a.matter.id,
        title: a.matter.title,
        caseNumber: a.matter.caseNumber,
      },

      lawyer: {
        id: a.matter.lawyer.id,
        name: a.matter.lawyer.name,
      },

      client: {
        id: a.matter.client.id,
        name: a.matter.client.name,
      },
    }));

    return NextResponse.json({
      activities: formatted,
    });
  } catch (err) {
    console.error("ADMIN ACTIVITY ERROR:", err);

    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}