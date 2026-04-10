import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);

  const matterId = url.searchParams.get("matterId");
  const query = url.searchParams.get("query");

  if (!matterId || !query) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: 400 }
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      matterId,
      content: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      sender: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(messages);
}