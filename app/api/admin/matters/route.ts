import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const matters = await prisma.matter.findMany({
      include: {
        client: true,
        lawyer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      matters.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        client: m.client.name,
        lawyer: m.lawyer.name,
        createdAt: m.createdAt,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}