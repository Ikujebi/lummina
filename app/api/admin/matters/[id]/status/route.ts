import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import type { MatterStatus } from "@/types/lawyer";

// =========================
// ALLOWED STATUS TRANSITIONS
// =========================
const LAWYER_ALLOWED_STATUSES: MatterStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "PENDING",
  "PENDING_CLOSURE",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // =========================
    // ROLE GUARD (IMPORTANT)
    // =========================
    if (user.role === "LAWYER") {
      if (!LAWYER_ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: "Lawyers cannot set this status" },
          { status: 403 }
        );
      }
    }

    // Optional stricter rule (recommended)
    if (status === "CLOSED" && user.role === "LAWYER") {
      return NextResponse.json(
        { error: "Lawyers cannot close matters" },
        { status: 403 }
      );
    }

    const matter = await prisma.matter.findUnique({
      where: { id: params.id },
    });

    if (!matter) {
      return NextResponse.json(
        { error: "Matter not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.matter.update({
      where: { id: params.id },
      data: { status },
      include: {
        client: true,
        lawyer: true,
      },
    });

    await logAudit(
      user.id,
      "STATUS_CHANGE",
      "Matter",
      `${matter.status} → ${status}`
    );

    return NextResponse.json({ matter: updated });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}