import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// simple case number generator (reuse your existing logic if you already have one)
async function generateCaseNumber() {
  const year = new Date().getFullYear();
  const prefix = `LUM-${year}`;

  const last = await prisma.matter.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: "desc" },
  });

  let next = 1;

  if (last?.caseNumber) {
    const parts = last.caseNumber.split("-");
    next = Number(parts[2] ?? 0) + 1;
  }

  return `${prefix}-${String(next).padStart(4, "0")}`;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;
    const { lawyerId } = await req.json();

    if (!lawyerId) {
      return NextResponse.json(
        { error: "Lawyer is required" },
        { status: 400 }
      );
    }

    // 1. fetch request
    const request = await prisma.matter.findUnique({
      where: { id: requestId },
      include: { client: true },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // 2. validate lawyer
    const lawyer = await prisma.user.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer || lawyer.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Invalid lawyer" },
        { status: 400 }
      );
    }

    // 3. convert request → real case (this is your design)
    const matter = await prisma.matter.update({
      where: { id: requestId },
      data: {
        lawyerId,
        status: "OPEN",
        caseNumber: await generateCaseNumber(),
      },
      include: {
        client: true,
        lawyer: true,
      },
    });

    await logAudit(user.id, "APPROVE_REQUEST", "Matter", requestId);

    return NextResponse.json({
      message: "Request approved",
      matter,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to approve request" },
      { status: 500 }
    );
  }
}