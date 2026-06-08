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

    const timeline = await prisma.matterActivity.findMany({
      where: {
        matter: {
          clientId: id,
        },
      },
      include: {
        matter: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, timeline });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}