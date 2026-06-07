import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        matter: {
          clientId: id,
        },
      },
      include: {
        matter: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      payments: timeEntries,
      note: "Using TimeEntry as billing proxy (no Payment model yet)",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}