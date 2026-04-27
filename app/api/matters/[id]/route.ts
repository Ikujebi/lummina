import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();

  if (!user || user.role !== "LAWYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matter = await prisma.matter.findFirst({
    where: {
      id,
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