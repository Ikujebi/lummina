import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { matterId, action, details } = body;

    if (!matterId || !action) {
      return NextResponse.json(
        { error: "matterId and action are required" },
        { status: 400 }
      );
    }

    // optional safety check: ensure lawyer owns matter
    const matter = await prisma.matter.findFirst({
      where: {
        id: matterId,
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
        matterId,
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

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = await prisma.matterActivity.findMany({
      where: {
        matter: {
          lawyerId: user.id,
        },
      },
      include: {
        matter: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ activities });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}