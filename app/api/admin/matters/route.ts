// app/api/admin/matters/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";

// ================= CASE NUMBER GENERATOR =================
async function generateCaseNumber() {
  const year = new Date().getFullYear();
  const prefix = `LUM-${year}`;

  const lastCase = await prisma.matter.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastCase?.caseNumber) {
    const lastSequence = parseInt(lastCase.caseNumber.split("-")[2]);
    nextNumber = lastSequence + 1;
  }

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

// ================= GET ALL CASES =================
export async function GET() {
  try {
    const matters = await prisma.matter.findMany({
      include: { client: true, lawyer: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      matters.map((m) => ({
        id: m.id,
        caseNumber: m.caseNumber,
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

// ================= CREATE CASE =================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, lawyerId, clientId, status } = body;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate lawyer and client
    const lawyer = await prisma.user.findUnique({ where: { id: lawyerId } });
    if (!lawyer || lawyer.role !== "LAWYER") {
      return NextResponse.json({ error: "Invalid lawyer ID" }, { status: 400 });
    }
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    // Generate case number
    const caseNumber = await generateCaseNumber();

    // Create case
    const matter = await prisma.matter.create({
      data: { caseNumber, title, status, lawyerId, clientId },
      include: { client: true, lawyer: true },
    });

    // Log audit
    await logAudit(currentUser.id, "CREATE", "Case", matter.id);

    return NextResponse.json({
      id: matter.id,
      caseNumber: matter.caseNumber,
      title: matter.title,
      status: matter.status,
      client: matter.client.name,
      lawyer: matter.lawyer.name,
      createdAt: matter.createdAt,
    });
  } catch (err) {
    console.error("Failed to create case:", err);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}

// ================= UPDATE CASE =================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, lawyerId, clientId, status } = body;

    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate matter exists
    const matter = await prisma.matter.findUnique({ where: { id } });
    if (!matter) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    // Validate lawyer and client if provided
    if (lawyerId) {
      const lawyer = await prisma.user.findUnique({ where: { id: lawyerId } });
      if (!lawyer || lawyer.role !== "LAWYER") return NextResponse.json({ error: "Invalid lawyer ID" }, { status: 400 });
    }
    if (clientId) {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const updatedMatter = await prisma.matter.update({
      where: { id },
      data: { title, status, lawyerId, clientId },
      include: { client: true, lawyer: true },
    });

    // Log audit
    await logAudit(currentUser.id, "UPDATE", "Case", updatedMatter.id);

    return NextResponse.json(updatedMatter);
  } catch (err) {
    console.error("Failed to update case:", err);
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}

// ================= DELETE CASE =================
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const matter = await prisma.matter.findUnique({ where: { id } });
    if (!matter) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    await prisma.matter.delete({ where: { id } });

    // Log audit
    await logAudit(currentUser.id, "DELETE", "Case", id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete case:", err);
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}