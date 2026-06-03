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

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications", {
      credentials: "include",
    });

    if (!res.ok) return;

    const data = await res.json();

    const list: Notification[] = Array.isArray(data)
      ? data
      : data?.notifications ?? [];

    setNotifications(list);

    setUnreadCount(
      list.reduce((acc, n) => acc + (n.read ? 0 : 1), 0)
    );
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await fetchNotifications();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
  };
}