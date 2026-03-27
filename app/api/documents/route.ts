import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

interface DocumentBody {
  id?: string;       // For PATCH / DELETE
  name?: string;
  fileUrl?: string;
  status?: "DRAFT" | "FINAL" | "SIGNED";
  matterId?: string;
  uploadedBy?: string; // Optional override (default is current user)
}

// GET: List all documents for the current user
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { uploadedBy: user.id },
    include: {
      matter: true,
      versions: true,
      signatures: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

// POST: Create a new document
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: DocumentBody = await req.json();
    const { name, fileUrl, status, matterId } = body;

    if (!name || !fileUrl || !status || !matterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        name,
        fileUrl,
        status,
        matterId,
        uploadedBy: user.id,
      },
      include: {
        matter: true,
        versions: true,
        signatures: true,
      },
    });

    return NextResponse.json(document);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

// PATCH: Update an existing document
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: DocumentBody = await req.json();
    const { id, name, fileUrl, status } = body;

    if (!id) return NextResponse.json({ error: "Missing document ID" }, { status: 400 });

    const document = await prisma.document.updateMany({
      where: { id, uploadedBy: user.id },
      data: {
        name,
        fileUrl,
        status,
      },
    });

    return NextResponse.json({ message: "Document updated", document });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

// DELETE: Remove a document
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing document ID" }, { status: 400 });

    await prisma.document.deleteMany({
      where: { id, uploadedBy: user.id },
    });

    return NextResponse.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}