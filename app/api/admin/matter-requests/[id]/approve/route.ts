import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// ============================================
// GENERATE CASE NUMBER
// ============================================
async function generateCaseNumber() {
  const year = new Date().getFullYear();
  const prefix = `LUM-${year}`;

  const last = await prisma.matter.findFirst({
    where: {
      caseNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      caseNumber: "desc",
    },
  });

  let next = 1;

  if (last?.caseNumber) {
    const parts = last.caseNumber.split("-");
    next = Number(parts[2] ?? 0) + 1;
  }

  return `${prefix}-${String(next).padStart(4, "0")}`;
}

// ============================================
// APPROVE MATTER REQUEST (emailLog based)
// ============================================
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ================= AUTH =================
    const user = await getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ================= PARAMS =================
    const { id: requestId } = await params;

    const body = await req.json();
    const lawyerId = body.lawyerId;

    if (!lawyerId) {
      return NextResponse.json(
        { error: "Lawyer is required" },
        { status: 400 }
      );
    }

    // ================= FIND EMAIL LOG =================
    const request = await prisma.emailLog.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    // ================= PARSE REQUEST DATA =================
    const parsedBody =
      typeof request.body === "string"
        ? JSON.parse(request.body)
        : request.body || {};

    const clientId = parsedBody.clientId;
    const title = parsedBody.title;
    const description = parsedBody.description;

    if (!clientId || !title) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    // ================= VALIDATE LAWYER =================
    const lawyer = await prisma.user.findUnique({
      where: {
        id: lawyerId,
      },
    });

    if (!lawyer || lawyer.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Invalid lawyer selected" },
        { status: 400 }
      );
    }

    // ================= CREATE MATTER =================
    const matter = await prisma.matter.create({
      data: {
        title,
        description,
        clientId,
        lawyerId,
        status: "OPEN",
        caseNumber: await generateCaseNumber(),
      },
      include: {
        client: true,
        lawyer: true,
      },
    });

    // ================= MARK EMAIL LOG AS PROCESSED =================
    await prisma.emailLog.update({
      where: {
        id: requestId,
      },
      data: {
        status: "APPROVED",
      },
    });

    // ================= AUDIT LOG =================
    await logAudit(
      user.id,
      "APPROVE_REQUEST",
      "Matter",
      matter.id
    );

    // ================= RESPONSE =================
    return NextResponse.json({
      message: "Matter approved successfully",
      matter,
    });
  } catch (error) {
    console.error("Approve matter error:", error);

    return NextResponse.json(
      { error: "Failed to approve request" },
      { status: 500 }
    );
  }
}