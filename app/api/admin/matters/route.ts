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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, lawyer, client, status } = body;

    // Create lawyer if not exist
    let lawyerRecord = await prisma.user.findFirst({ where: { name: lawyer } });
if (!lawyerRecord) {
  lawyerRecord = await prisma.user.create({
    data: {
      name: lawyer,
      role: "LAWYER",
      email: `${lawyer.replace(/\s+/g, "_").toLowerCase()}@example.com`,
      password: "temporaryPassword123!", // hash if needed
    },
  });
}

let clientRecord = await prisma.user.findFirst({ where: { name: client } });
if (!clientRecord) {
  clientRecord = await prisma.user.create({
    data: {
      name: client,
      role: "CLIENT",
      email: `${client.replace(/\s+/g, "_").toLowerCase()}@example.com`,
      password: "temporaryPassword123!",
    },
  });
}

    // Create the matter
    const matter = await prisma.matter.create({
      data: {
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