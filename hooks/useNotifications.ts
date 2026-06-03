"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const mountedRef = useRef(true);

  const computeUnread = (list: Notification[]) =>
    list.reduce((acc, n) => acc + (n.read ? 0 : 1), 0);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true);

    try {
      const res = await fetch("/api/admin/notifications", {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();

      const list: Notification[] =
        Array.isArray(data) ? data : data?.notifications ?? [];

      if (!mountedRef.current) return;

      setNotifications(list);
      setUnreadCount(data?.unreadCount ?? computeUnread(list));
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      if (mountedRef.current) {
        setLoadingNotifications(false);
      }
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
      });

      if (!res.ok) return;

      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/notifications/read-all`, {
        method: "PATCH",
      });

      if (!res.ok) return;

      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    mountedRef.current = true;

    const id = setTimeout(() => {
      fetchNotifications();
    }, 0); // 👈 IMPORTANT: defers state update to next tick

    return () => {
      mountedRef.current = false;
      clearTimeout(id);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loadingNotifications,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}