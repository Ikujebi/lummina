import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
};

export async function createNotification({
  userId,
  title,
  message,
  type = "INFO",
}: CreateNotificationInput) {
  if (!userId) {
    throw new Error("Notification must have a userId (recipient)");
  }

  if (!title || !message) {
    throw new Error("Notification must include title and message");
  }

  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      read: false,
    },
  });
}