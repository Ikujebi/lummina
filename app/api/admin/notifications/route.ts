import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    const nextCursor =
      notifications.length === limit
        ? notifications[notifications.length - 1].id
        : null;

    return Response.json({
      notifications,
      unreadCount,
      nextCursor,
    });
  } catch (err) {
    console.error("Notifications GET error:", err);

    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}