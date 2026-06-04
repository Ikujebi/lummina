import { createNotification } from "@/lib/notifications/notifications.helper";

export const notifyDocumentEvent = async (params: {
  userId: string;
  title: string;
  message: string;
}) => {
  return createNotification({
    userId: params.userId,
    title: params.title,
    message: params.message,
    type: "INFO",
  });
};