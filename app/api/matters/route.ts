// /pages/api/matters/routes.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessMatter } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyMatterEvent } from "@/lib/notifications/notifyMatterEvent";

interface MatterBody {
  id?: string;
  title?: string;
  description?: string;
  status?:
    | "OPEN"
    | "IN_PROGRESS"
    | "PENDING"
    | "PENDING_CLOSURE"
    | "CLOSED";
  clientId?: string;
  lawyerId?: string;
}

// ===============================
// STATUS FLOW RULES (SOURCE OF TRUTH)
// ===============================
const allowedTransitions: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "PENDING"],
  IN_PROGRESS: ["PENDING", "PENDING_CLOSURE"],
  PENDING: ["IN_PROGRESS", "PENDING_CLOSURE"],
  PENDING_CLOSURE: ["CLOSED"],
  CLOSED: [],
};

// ===============================
// GET ALL MATTERS
// ===============================
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matters = await prisma.matter.findMany({
    where: {
      OR: [{ clientId: user.id }, { lawyerId: user.id }],
    },
    include: {
      client: true,
      lawyer: true,
      documents: true,
      tasks: true,
      appointments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(matters);
}

// ===============================
// CREATE MATTER
// ===============================
export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MatterBody = await req.json();
    const { title, description, status, clientId, lawyerId } = body;

    if (!title || !status || !clientId || !lawyerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "LAWYER"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const caseNumber = `CASE-${Date.now()}`;

    const matter = await prisma.matter.create({
      data: {
        caseNumber,
        title,
        description,
        status,
        clientId,
        lawyerId,
      },
      include: {
        client: true,
        lawyer: true,
        documents: true,
        tasks: true,
        appointments: true,
      },
    });
    await logAudit(
  user.id,
  "CREATE",
  "Matter",
  matter.id
);
await notifyMatterEvent({
  matter,
  actorId: user.id,
  event: "CREATED",
  actorRole: user.role,
});

    return NextResponse.json({
      message: "Matter created",
      matter,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to create matter" },
      { status: 500 }
    );
  }
}

// ===============================
// UPDATE MATTER (WORKFLOW CONTROLLED)
// ===============================
export async function PATCH(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: MatterBody = await req.json();
    const { id, title, description, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing matter ID" },
        { status: 400 }
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

    const userOwnsMatter =
      matter.lawyerId === user.id || matter.clientId === user.id;

    if (!canAccessMatter(user.role, userOwnsMatter)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const currentStatus = matter.status;

    // ===============================
    // CLIENT RESTRICTION
    // ===============================
    if (user.role === "CLIENT") {
      return NextResponse.json(
        { error: "Clients cannot change matter status" },
        { status: 403 }
      );
    }

    let nextStatus = status ?? currentStatus;

    // ===============================
    // LAWYER RULE: cannot directly close
    // ===============================
    if (user.role === "LAWYER" && status === "CLOSED") {
      nextStatus = "PENDING_CLOSURE";
    }

    // ===============================
    // ADMIN RULE: only admin can close
    // ===============================
    if (status === "CLOSED") {
      if (currentStatus !== "PENDING_CLOSURE") {
        return NextResponse.json(
          {
            error:
              "Matter must be pending closure before it can be closed",
          },
          { status: 400 }
        );
      }

      if (user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only admin can close matters" },
          { status: 403 }
        );
      }

      nextStatus = "CLOSED";
    }

    // ===============================
    // VALIDATE TRANSITION
    // ===============================
    if (
      nextStatus &&
      !allowedTransitions[currentStatus]?.includes(nextStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      );
    }

    let message = "Matter updated";

    if (nextStatus === "PENDING_CLOSURE") {
      message = "Closure request submitted for admin approval";
    }

    if (nextStatus === "CLOSED") {
      message = "Matter successfully closed by admin";
    }

    const updatedMatter = await prisma.matter.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        status: nextStatus,
      },
      include: {
        client: true,
        lawyer: true,
        documents: true,
        tasks: true,
        appointments: true,
      },
    });
    if (status && status !== currentStatus) {
  await logAudit(
    user.id,
    "STATUS_CHANGE",
    "Matter",
    updatedMatter.id
  );
  await notifyMatterEvent({
  matter: updatedMatter,
  actorId: user.id,
  event: "STATUS_CHANGED",
  actorRole: user.role,
});
} else {
  await logAudit(
    user.id,
    "UPDATE",
    "Matter",
    updatedMatter.id
  );
}

    return NextResponse.json({
      message,
      matter: updatedMatter,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to update matter" },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE MATTER
// ===============================
export async function DELETE(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing matter ID" },
        { status: 400 }
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

    const userOwnsMatter =
      matter.lawyerId === user.id || matter.clientId === user.id;

    if (!canAccessMatter(user.role, userOwnsMatter)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.matter.delete({
      where: { id },
    });
    await logAudit(
  user.id,
  "DELETE",
  "Matter",
  matter.id
);
await notifyMatterEvent({
  matter,
  actorId: user.id,
  event: "DELETED",
  actorRole: user.role,
});

    return NextResponse.json({
      message: "Matter deleted",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to delete matter" },
      { status: 500 }
    );
  }
}