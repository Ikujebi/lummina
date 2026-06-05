import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/notifications.helper";

type NotifyMatterRequestInput = {
  clientUserId: string;
  clientName?: string | null;
  title: string;
};

export async function notifyMatterRequestCreated({
  clientUserId,
  clientName,
  title,
}: NotifyMatterRequestInput) {
  // Verify the user still exists
  const client = await prisma.user.findUnique({
    where: { id: clientUserId },
    select: { id: true },
  });

  if (!client) {
    throw new Error("Client user not found");
  }

  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
    },
  });

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title: "New Matter Request",
        message: `${clientName || "A client"} submitted a new matter request: ${title}`,
      })
    )
  );
}