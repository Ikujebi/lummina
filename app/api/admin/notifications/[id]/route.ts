import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id, // important security check
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
        id: params.id,
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