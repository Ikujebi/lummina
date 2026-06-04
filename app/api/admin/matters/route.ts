// app/api/admin/matters/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications/notifications.helper";

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

// ================= GET ALL MATTERS =================
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
        lawyer: m.lawyer?.name ?? null,
        createdAt: m.createdAt,
      }))
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch matters" },
      { status: 500 }
    );
  }
}

// ================= CREATE / APPROVE / ASSIGN =================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, lawyerId, clientId, status, requestId } = body;

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /**
     * ================================
     * MODE 1: APPROVE CLIENT REQUEST
     * ================================
     */
    if (requestId) {
      const updatedRequest = await prisma.matter.update({
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

      await logAudit(
        currentUser.id,
        "APPROVE",
        "MatterRequest",
        requestId
      );

      // notify admin
      await createNotification({
        userId: currentUser.id,
        title: "Matter Request Approved",
        message: `You approved a matter request`,
        type: "INFO",
      });

      // notify lawyer
      if (lawyerId) {
        await createNotification({
          userId: lawyerId,
          title: "New Matter Assigned",
          message: `You have been assigned a matter`,
          type: "INFO",
        });
      }

      return NextResponse.json({
        message: "Matter request approved",
        matter: updatedRequest,
      });
    }

    /**
     * ================================
     * MODE 2: DIRECT CASE CREATION
     * ================================
     */

    if (!title || !clientId || !lawyerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const lawyer = await prisma.user.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer || lawyer.role !== "LAWYER") {
      return NextResponse.json(
        { error: "Invalid lawyer ID" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Invalid client ID" },
        { status: 400 }
      );
    }

    const caseNumber = await generateCaseNumber();

    const matter = await prisma.matter.create({
      data: {
        caseNumber,
        title,
        status: status ?? "OPEN",
        lawyerId,
        clientId,
      },
      include: {
        client: true,
        lawyer: true,
      },
    });

    await logAudit(currentUser.id, "CREATE", "Matter", matter.id);

    // notify admin
    await createNotification({
      userId: currentUser.id,
      title: "Matter Created",
      message: `Matter "${title}" was created successfully`,
      type: "INFO",
    });

    // notify lawyer
    await createNotification({
      userId: lawyerId,
      title: "New Matter Assigned",
      message: `You were assigned matter "${title}"`,
      type: "INFO",
    });

    // notify client
    await createNotification({
      userId: client.userId,
      title: "New Case Opened",
      message: `A new matter "${title}" has been opened for you`,
      type: "INFO",
    });

    return NextResponse.json({
      message: "Matter created",
      matter,
    });
  } catch (err) {
    console.error("Admin matters error:", err);

    return NextResponse.json(
      { error: "Failed to process matter" },
      { status: 500 }
    );
  }
}

// ================= UPDATE MATTER =================
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, lawyerId, clientId, status } = body;

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const matter = await prisma.matter.findUnique({
      where: { id },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404 }
      );
    }

    const updatedMatter = await prisma.matter.update({
      where: { id },
      data: {
        title,
        status,
        lawyerId,
        clientId,
      },
      include: {
        client: true,
        lawyer: true,
      },
    });

    await logAudit(
      currentUser.id,
      "UPDATE",
      "Matter",
      updatedMatter.id
    );

    // notify admin
    await createNotification({
      userId: currentUser.id,
      title: "Matter Updated",
      message: `Matter "${updatedMatter.title}" was updated`,
      type: "INFO",
    });

    // notify lawyer
    if (updatedMatter.lawyerId) {
      await createNotification({
        userId: updatedMatter.lawyerId,
        title: "Matter Updated",
        message: `Matter "${updatedMatter.title}" was updated`,
        type: "INFO",
      });
    }

    return NextResponse.json(updatedMatter);
  } catch (err) {
    console.error("Failed to update matter:", err);

    return NextResponse.json(
      { error: "Failed to update matter" },
      { status: 500 }
    );
  }
}

// ================= DELETE MATTER =================
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const matter = await prisma.matter.findUnique({
      where: { id },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404 }
      );
    }

    await prisma.matter.delete({
      where: { id },
    });

    await logAudit(currentUser.id, "DELETE", "Matter", id);

    // notify admin
    await createNotification({
      userId: currentUser.id,
      title: "Matter Deleted",
      message: `Matter was deleted successfully`,
      type: "WARNING",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete matter:", err);

    return NextResponse.json(
      { error: "Failed to delete matter" },
      { status: 500 }
    );
  }
}