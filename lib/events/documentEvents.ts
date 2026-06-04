import { createNotification } from "@/lib/notifications/notifications.helper";
import { logAudit } from "@/lib/audit";
import type { Document, User } from "@prisma/client";

type DocumentEvent = "CREATED" | "UPDATED" | "DELETED";

interface DocumentEventParams {
  document: Document & {
    matter?: {
      clientId: string;
      lawyerId: string;
      title?: string;
    };
  };
  actor: User;
  event: DocumentEvent;
}

/**
 * Centralized document event handler.
 * Handles notifications + audit logging for document lifecycle.
 */
export async function notifyDocumentEvent({
  document,
  actor,
  event,
}: DocumentEventParams) {
  try {
    const tasks: Promise<unknown>[] = [];

    const actorId = actor.id;

    const clientId = document.matter?.clientId;
    const lawyerId = document.matter?.lawyerId;

    const notify = (
      userId?: string,
      title?: string,
      message?: string,
      allowSelf = false
    ) => {
      if (!userId) return;
      if (!allowSelf && userId === actorId) return;

      tasks.push(
        createNotification({
          userId,
          title: title ?? "Notification",
          message: message ?? "",
          type: "INFO",
        })
      );
    };

    // =========================
    // CREATED
    // =========================
    if (event === "CREATED") {
      notify(
        lawyerId,
        "New Document Uploaded",
        `A new document "${document.name}" was uploaded`
      );

      notify(
        clientId,
        "New Document Available",
        `A document "${document.name}" was added to your matter`
      );

      tasks.push(
        logAudit(actorId, "CREATE", "Document", document.id)
      );
    }

    // =========================
    // UPDATED
    // =========================
    if (event === "UPDATED") {
      notify(
        lawyerId,
        "Document Updated",
        `Document "${document.name}" was updated`
      );

      notify(
        clientId,
        "Document Updated",
        `Document "${document.name}" was updated`
      );

      tasks.push(
        logAudit(actorId, "UPDATE", "Document", document.id)
      );
    }

    // =========================
    // DELETED
    // =========================
    if (event === "DELETED") {
      notify(
        lawyerId,
        "Document Deleted",
        `Document "${document.name}" was deleted`
      );

      notify(
        clientId,
        "Document Deleted",
        `Document "${document.name}" was removed`
      );

      tasks.push(
        logAudit(actorId, "DELETE", "Document", document.id)
      );
    }

    return await Promise.all(tasks);
  } catch (error) {
    console.error("notifyDocumentEvent failed:", error);
  }
}