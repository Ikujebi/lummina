import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Failed to mark all as read:", err);
    return Response.json(
      { error: "Failed to mark all as read" },
      { status: 500 }
    );
  }
}