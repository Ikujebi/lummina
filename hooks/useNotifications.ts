"use client";

import { useEffect, useState } from "react";

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      setLoadingNotifications(true);

      try {
        const res = await fetch("/api/admin/notifications");
        const data: Notification[] = await res.json();

        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoadingNotifications(false);
      }
    }

    fetchNotifications();
  }, []);

  return {
    notifications,
    loadingNotifications,
  };
}