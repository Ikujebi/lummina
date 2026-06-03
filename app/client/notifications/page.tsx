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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();

        setNotifications(data.notifications ?? []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // =========================
  // MARK SINGLE AS READ
  // uses: PATCH /api/notifications/${id}
  // =========================
  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      credentials: "include",
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  // =========================
  // MARK ALL AS READ
  // uses: PATCH /api/notifications/read-all
  // =========================
  const markAllAsRead = async () => {
    await fetch("/api/notifications/read-all", {
      method: "PATCH",
      credentials: "include",
    });

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  if (loading) {
    return (
      <p className="p-6 text-sm text-gray-500">
        Loading notifications...
      </p>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#5F021F]">
          Notifications
        </h1>

        <button
          onClick={markAllAsRead}
          className="text-sm px-4 py-2 rounded-lg bg-[#FFA500] text-[#5F021F] font-semibold hover:opacity-90"
        >
          Mark all as read
        </button>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-3">
        {notifications.length === 0 && (
          <p className="text-sm text-gray-500">
            No notifications yet
          </p>
        )}

        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border flex justify-between items-start gap-4 ${
              n.read
                ? "bg-white border-gray-200"
                : "bg-[#FFF7E0] border-[#FFD580]"
            }`}
          >
            <div>
              <h3 className="font-semibold text-[#5F021F]">
                {n.title}
              </h3>

              <p className="text-sm text-gray-600">
                {n.message}
              </p>

              <span className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>

            {!n.read && (
              <button
                onClick={() => markAsRead(n.id)}
                className="text-xs px-3 py-1 rounded-md bg-[#5F021F] text-white"
              >
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}