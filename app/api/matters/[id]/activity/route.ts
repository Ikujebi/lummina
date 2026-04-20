import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RouteContext } from "@/types/route";


export async function POST(req: Request, { params }: RouteContext<{ id: string }>) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, details } = await req.json();

    // ensure lawyer owns this matter
    const matter = await prisma.matter.findFirst({
      where: {
        id: params.id,
        lawyerId: user.id,
      },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404 }
      );
    }

    const activity = await prisma.matterActivity.create({
      data: {
        matterId: matter.id,
        action,
        details,
      },
    });

    return NextResponse.json({ activity });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}