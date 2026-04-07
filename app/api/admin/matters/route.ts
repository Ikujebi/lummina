import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ Case Number Generator
async function generateCaseNumber() {
  const year = new Date().getFullYear();
  const prefix = `LUM-${year}`;

  const lastCase = await prisma.matter.findFirst({
    where: {
      caseNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      caseNumber: "desc",
    },
  });

  let nextNumber = 1;

  if (lastCase?.caseNumber) {
    const lastSequence = parseInt(lastCase.caseNumber.split("-")[2]);
    nextNumber = lastSequence + 1;
  }

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

// ✅ GET ALL CASES
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
        caseNumber: m.caseNumber, // ✅ included
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

// ✅ CREATE NEW CASE
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, lawyer, client, status } = body;

    // Generate case number
    const caseNumber = await generateCaseNumber();

    // Generate emails for uniqueness
    const lawyerEmail = `${lawyer.replace(/\s+/g, "_").toLowerCase()}@example.com`;
    const clientEmail = `${client.replace(/\s+/g, "_").toLowerCase()}@example.com`;

    // Upsert lawyer
    const lawyerRecord = await prisma.user.upsert({
      where: { email: lawyerEmail }, // unique identifier
      update: {}, // no updates needed
      create: {
        name: lawyer,
        role: "LAWYER",
        email: lawyerEmail,
        password: "temporaryPassword123!",
      },
    });

    // Upsert client
    const clientRecord = await prisma.user.upsert({
      where: { email: clientEmail },
      update: {},
      create: {
        name: client,
        role: "CLIENT",
        email: clientEmail,
        password: "temporaryPassword123!",
      },
    });

    // Create the matter
    const matter = await prisma.matter.create({
      data: {
        caseNumber, // ✅ included
        title,
        status,
        lawyerId: lawyerRecord.id,
        clientId: clientRecord.id,
      },
      include: {
        client: true,
        lawyer: true,
      },
    });

    return NextResponse.json({
      id: matter.id,
      caseNumber: matter.caseNumber, // ✅ included
      title: matter.title,
      status: matter.status,
      client: matter.client.name,
      lawyer: matter.lawyer.name,
      createdAt: matter.createdAt,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
  }
}