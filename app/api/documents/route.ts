import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit"; // optional

interface DocumentBody {
  id?: string;       // For PATCH / DELETE
  name?: string;
  fileUrl?: string;
  status?: "DRAFT" | "FINAL" | "SIGNED";
  matterId?: string;
  uploadedBy?: string; // Optional override (default is current user)
}

// ================= GET: List all documents for current user =================
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const documents = await prisma.document.findMany({
      where: { uploadedBy: user.id },
      include: { matter: true, versions: true, signatures: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, documents });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 });
  }
}

// ================= POST: Create a new document =================
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body: DocumentBody = await req.json();
    const { name, fileUrl, status, matterId } = body;

    if (!name || !fileUrl || !status || !matterId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        name,
        fileUrl,
        status,
        matterId,
        uploadedBy: user.id,
      },
      include: { matter: true, versions: true, signatures: true },
    });

    // Optional: log creation
    await logAudit(user.id, "CREATE", "Document", document.id);

    return NextResponse.json({ success: true, document });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to create document" }, { status: 500 });
  }
}

// ================= PATCH: Update an existing document =================
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body: DocumentBody = await req.json();
    const { id, name, fileUrl, status } = body;

    if (!id) return NextResponse.json({ success: false, error: "Missing document ID" }, { status: 400 });

    const existing = await prisma.document.findFirst({ where: { id, uploadedBy: user.id } });
    if (!existing) return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        name: name ?? undefined,
        fileUrl: fileUrl ?? undefined,
        status: status ?? undefined,
      },
      include: { matter: true, versions: true, signatures: true },
    });

    // Optional: log update
    await logAudit(user.id, "UPDATE", "Document", id);

    return NextResponse.json({ success: true, document: updatedDocument });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to update document" }, { status: 500 });
  }
}

// ================= DELETE: Remove a document =================
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "Missing document ID" }, { status: 400 });

    const existing = await prisma.document.findFirst({ where: { id, uploadedBy: user.id } });
    if (!existing) return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });

    await prisma.document.delete({ where: { id } });

    // Optional: log deletion
    await logAudit(user.id, "DELETE", "Document", id);

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 });
  }
}