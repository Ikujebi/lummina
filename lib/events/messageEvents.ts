import { createNotification } from "@/lib/notifications/notifications.helper";
import type { User } from "@prisma/client";

type MessageEvent = "CREATED" | "UPDATED" | "DELETED";

interface MessageWithRelations {
  id: string;
  content: string;
  matterId: string;
  senderId: string;
  matter: {
    clientId: string;
    lawyerId: string;
    title?: string;
  };
}

interface NotifyMessageEventParams {
  message: MessageWithRelations;
  actorId: string;
  event: MessageEvent;
  actorRole?: User["role"];
}

type NotificationPromise = ReturnType<typeof createNotification>;

export async function notifyMessageEvent({
  message,
  actorId,
  event,
  actorRole,
}: NotifyMessageEventParams) {
  try {
    const notifications: NotificationPromise[] = [];

    const isAdmin = actorRole === "ADMIN";
    const isLawyer = actorRole === "LAWYER";
    const isClient = actorRole === "CLIENT";

    const notify = (
      userId: string,
      title: string,
      messageText: string,
      allowSelf = false
    ) => {
      if (!userId) return;
      if (!allowSelf && userId === actorId) return;

      notifications.push(
        createNotification({
          userId,
          title,
          message: messageText,
          type: "INFO",
        })
      );
    };

    // =========================
    // CREATED
    // =========================
    if (event === "CREATED") {
      notify(
        message.matter.lawyerId,
        "New Message",
        message.content?.slice(0, 80) || "You received a new message"
      );

      notify(
        message.matter.clientId,
        "New Message",
        message.content?.slice(0, 80) || "You received a new message"
      );

      // role-aware differentiation
      if (isAdmin) {
        notify(
          actorId,
          "Admin Activity Logged",
          "You sent a message in a matter",
          true
        );
      }

      if (isLawyer) {
        notify(
          message.matter.clientId,
          "Update from Your Lawyer",
          message.content?.slice(0, 80) || "New message from your lawyer"
        );
      }

      if (isClient) {
        notify(
          message.matter.lawyerId,
          "Client Message",
          message.content?.slice(0, 80) || "New message from client"
        );
      }

      return Promise.all(notifications);
    }

    // =========================
    // UPDATED
    // =========================
    if (event === "UPDATED") {
      notify(
        message.matter.clientId,
        "Message Updated",
        "A message was edited in your matter"
      );

      notify(
        message.matter.lawyerId,
        "Message Updated",
        "A message was edited in your matter"
      );

      return Promise.all(notifications);
    }

    // =========================
    // DELETED
    // =========================
    if (event === "DELETED") {
      notify(
        message.matter.clientId,
        "Message Deleted",
        "A message was removed from your matter"
      );

      notify(
        message.matter.lawyerId,
        "Message Deleted",
        "A message was removed from your matter"
      );

      if (isAdmin) {
        notify(actorId, "Admin Deletion Logged", "You deleted a message", true);
      }

      return Promise.all(notifications);
    }

    return [];
  } catch (error) {
    console.error("notifyMessageEvent failed:", error);
  }
}