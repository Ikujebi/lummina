import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { logAudit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { createNotification } from "@/lib/notifications/notifications.helper";

/**
 * GET - Get single user with client profile data
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
  where: { id },
  include: {
    clients: {
      include: {
        matters: {
          select: {
            id: true,
            _count: {
              select: {
                documents: true,
                activities: true,
              },
            },
          },
        },
      },
    },
  },
});

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    

    const primaryClient = user.clients?.[0];

    const mattersCount = primaryClient?.matters.length ?? 0;

const documentsCount =
  primaryClient?.matters.reduce(
    (sum, matter) => sum + matter._count.documents,
    0
  ) ?? 0;

const timelineCount =
  primaryClient?.matters.reduce(
    (sum, matter) => sum + matter._count.activities,
    0
  ) ?? 0;
    

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        isApproved: user.isApproved,
        profilePicture: user.profilePicture,

        // flattened client fields for frontend convenience
        phone: primaryClient?.phone ?? "",
        address: primaryClient?.address ?? "",

        clients: user.clients,
      },
       counts: {
    matters: mattersCount,
    documents: documentsCount,
    timeline: timelineCount,
  },
    });
  } catch (error) {
    console.error("GET error:", error);

    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

/**
 * PATCH - Update user + client profile data
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing user id" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        clients: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    /**
     * 1. Update USER fields (role, approval only)
     */
    const userData: Prisma.UserUpdateInput = {};

    if (typeof body.role === "string") {
      userData.role = body.role;
    }

    if (typeof body.isApproved === "boolean") {
      userData.isApproved = body.isApproved;
    }

    await prisma.user.update({
      where: { id },
      data: userData,
    });

    /**
     * 2. Update CLIENT fields (phone, address)
     */
    if (body.phone !== undefined || body.address !== undefined) {
      await prisma.client.updateMany({
        where: { userId: id },
        data: {
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.address !== undefined && { address: body.address }),
        },
      });
    }

    /**
     * 3. Refetch updated record
     */
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        clients: true,
      },
    });

    const primaryClient = updatedUser?.clients?.[0];

    /**
     * 4. Audit + notifications
     */
    const currentUser = await getCurrentUser();

    if (currentUser) {
      await logAudit(currentUser.id, "UPDATE", "User", id);

      const changes: string[] = [];

      if (body.role && body.role !== existingUser.role) {
        changes.push(`role changed to ${body.role}`);
      }

      if (
        typeof body.isApproved === "boolean" &&
        body.isApproved !== existingUser.isApproved
      ) {
        changes.push(
          body.isApproved ? "approved" : "approval revoked"
        );
      }

      if (body.phone && body.phone !== existingUser.clients?.[0]?.phone) {
        changes.push("phone updated");
      }

      if (body.address && body.address !== existingUser.clients?.[0]?.address) {
        changes.push("address updated");
      }

      if (changes.length > 0) {
        await createNotification({
          userId: currentUser.id,
          title: "User Updated",
          message: `${existingUser.name ?? existingUser.email}: ${changes.join(
            ", "
          )}`,
          type: "INFO",
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser?.id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        createdAt: updatedUser?.createdAt,
        isApproved: updatedUser?.isApproved,
        profilePicture: updatedUser?.profilePicture,

        phone: primaryClient?.phone ?? "",
        address: primaryClient?.address ?? "",
      },
    });
  } catch (error) {
    console.error("PATCH error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete user
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;

    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    const currentUser = await getCurrentUser();

    if (currentUser) {
      await logAudit(currentUser.id, "DELETE", "User", id);

      await createNotification({
        userId: currentUser.id,
        title: "User Deleted",
        message: `${userToDelete.name ?? userToDelete.email} was deleted`,
        type: "WARNING",
      });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}