import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RouteContext } from "@/types/route";


export async function GET(req: Request, { params }: RouteContext<{ id: string }>) {
  const user = await getCurrentUser();

  if (!user || user.role !== "LAWYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({
    where: {
      id: params.id,
      lawyerId: user.id,
    },
    include: {
      client: true,
      activities: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!matter) {
    return NextResponse.json(
      { error: "Matter not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ matter });
}