"use client";

import { Card, Spin, Tag, Button } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    notifications,
    loadingNotifications,
    markAsRead,
  } = useNotifications();

  const notification = notifications.find(
    (n) => n.id === id
  );

  if (loadingNotifications) {
    return (
      <div className="flex justify-center py-10">
        <Spin />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="p-6">
        Notification not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <Tag
            color={notification.read ? "default" : "green"}
          >
            {notification.read ? "Read" : "Unread"}
          </Tag>

          <Button onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {/* MESSAGE */}
        <p className="text-lg font-semibold text-[#5F021F]">
          {notification.message}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          {new Date(
            notification.createdAt
          ).toLocaleString()}
        </p>

        {/* MARK AS READ */}
        {!notification.read && (
          <Button
            type="primary"
            className="mt-4"
            onClick={() =>
              markAsRead(notification.id)
            }
          >
            Mark as read
          </Button>
        )}
      </Card>
    </div>
  );
}