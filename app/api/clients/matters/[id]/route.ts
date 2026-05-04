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

  console.log("USER:", user);
  console.log("ROLE:", user?.role);
  console.log("USER ID:", user?.id);

  if (!user || user.role !== "CLIENT") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 🔥 STEP 1: get client profile
  const client = await prisma.client.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!client) {
    return NextResponse.json(
      { error: "Client profile not found" },
      { status: 404 }
    );
  }

  // 🔥 STEP 2: fetch matter WITH lawyer + activities
  const matter = await prisma.matter.findFirst({
    where: {
      id,
      clientId: client.id,
    },
    include: {
      client: true,

      // 🔥 IMPORTANT FIX: include lawyer relation
      lawyer: true,

      // 🔥 ensure activities are loaded properly
      activities: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!matter) {
    return NextResponse.json(
      { error: "Matter not found or access denied" },
      { status: 403 }
    );
  }

  return NextResponse.json({ matter });
}