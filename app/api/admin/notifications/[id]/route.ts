import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!notification) {
      return Response.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });

    return Response.json(updated);
  } catch (err) {
    console.error("Notification update error:", err);

    return Response.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}