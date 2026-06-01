"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "DEADLINE" | "MESSAGE";
  read: boolean;
  createdAt: string;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch("/api/notifications");

        if (!res.ok) return;

        const data = await res.json();

        if (!isMounted) return;

        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
  };
}