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

    const matters = await prisma.matter.findMany({
      where: {
        clientId: id, // IMPORTANT: client user mapping
      },
      include: {
        lawyer: true,
        activities: true,
        _count: {
          select: {
            documents: true,
            messages: true,
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, matters });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch matters" },
      { status: 500 }
    );
  }
}