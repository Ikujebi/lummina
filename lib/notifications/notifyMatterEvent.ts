import { createNotification } from "./notifications.helper";
import type { Matter, User } from "@prisma/client";

type MatterEvent =
  | "CREATED"
  | "UPDATED"
  | "STATUS_CHANGED"
  | "DELETED";

interface NotifyMatterEventParams {
  matter: Matter & {
    clientId: string;
    lawyerId: string;
    title: string;
    status?: string;
  };
  actorId: string;
  event: MatterEvent;
  actorRole?: User["role"];
}
type NotificationPromise = ReturnType<typeof createNotification>;


/**
 * Central notification engine for Matter lifecycle events
 */
export async function notifyMatterEvent({
  matter,
  actorId,
  event,
  actorRole,
}: NotifyMatterEventParams) {
  try {
    const notifications: NotificationPromise[] = [];

    const isAdmin = actorRole === "ADMIN";
    const isLawyer = actorRole === "LAWYER";
    const isClient = actorRole === "CLIENT";

    const notify = (
      userId: string,
      title: string,
      message: string,
      allowSelf = false
    ) => {
      if (!userId) return;
      if (!allowSelf && userId === actorId) return;

      notifications.push(
        createNotification({
          userId,
          title,
          message,
          type: "INFO",
        })
      );
    };

    // =========================
    // CREATED
    // =========================
    if (event === "CREATED") {
      notify(
        matter.lawyerId,
        "New Matter Assigned",
        `You were assigned to "${matter.title}"`
      );

      notify(
        matter.clientId,
        "Matter Created",
        `Your matter "${matter.title}" has been created`
      );

      if (isAdmin) {
        notify(
          actorId,
          "Admin Action",
          `You created matter "${matter.title}"`,
          true
        );
      }

      if (isLawyer) {
        notify(
          matter.clientId,
          "Matter Created by Lawyer",
          `A lawyer created your matter "${matter.title}"`
        );
      }

      if (isClient) {
        notify(
          matter.lawyerId,
          "Client Created Matter",
          `A client created matter "${matter.title}"`
        );
      }

      return Promise.all(notifications);
    }

    // =========================
    // STATUS CHANGED
    // =========================
    if (event === "STATUS_CHANGED") {
      notify(
        matter.clientId,
        "Matter Status Updated",
        `Status changed to ${matter.status}`
      );

      notify(
        matter.lawyerId,
        "Matter Status Updated",
        `Status changed to ${matter.status}`
      );

      if (isAdmin) {
        notify(
          actorId,
          "Admin Status Change Recorded",
          `You changed status to ${matter.status}`,
          true
        );
      }

      if (isLawyer) {
        notify(
          matter.clientId,
          "Update from Your Lawyer",
          `Your lawyer updated status to ${matter.status}`
        );
      }

      return Promise.all(notifications);
    }

    // =========================
    // UPDATED
    // =========================
    if (event === "UPDATED") {
      notify(
        matter.clientId,
        "Matter Updated",
        `Matter "${matter.title}" was updated`
      );

      notify(
        matter.lawyerId,
        "Matter Updated",
        `Matter "${matter.title}" was updated`
      );

      return Promise.all(notifications);
    }

    // =========================
    // DELETED
    // =========================
    if (event === "DELETED") {
      notify(
        matter.clientId,
        "Matter Removed",
        `Matter "${matter.title}" was deleted`
      );

      notify(
        matter.lawyerId,
        "Matter Removed",
        `Matter "${matter.title}" was deleted`
      );

      if (isAdmin) {
        notify(
          actorId,
          "Admin Deletion Logged",
          `You deleted matter "${matter.title}"`,
          true
        );
      }

      return Promise.all(notifications);
    }

    return [];
  } catch (error) {
    console.error("notifyMatterEvent failed:", error);
  }
}