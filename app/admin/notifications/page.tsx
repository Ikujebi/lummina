"use client";

import { Spin, Button, List, Tag } from "antd";
import { useNotifications } from "@/hooks/useNotifications";

export default function AdminNotificationsPage() {
  const {
    notifications,
    loadingNotifications,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          Notifications
        </h1>

        <Button
          type="primary"
          onClick={markAllAsRead}
          disabled={notifications.length === 0}
        >
          Mark all as read
        </Button>
      </div>

      {/* LIST */}
      <Spin spinning={loadingNotifications}>
        <List
          dataSource={notifications}
          locale={{ emptyText: "No notifications" }}
          renderItem={(item) => (
            <List.Item
              onClick={() => {
                if (!item.read) {
                  markAsRead(item.id);
                }
              }}
              className="cursor-pointer hover:bg-gray-50 px-3 rounded-md"
            >
              <List.Item.Meta
                title={
                  <div className="flex items-center gap-2">
                    <span>{item.message}</span>

                    {!item.read && (
                      <Tag color="red">New</Tag>
                    )}
                  </div>
                }
                description={new Date(
                  item.createdAt
                ).toLocaleString()}
              />
            </List.Item>
          )}
        />
      </Spin>

      {/* optional refresh */}
      <div className="mt-4">
        <Button onClick={refetch}>
          Refresh
        </Button>
      </div>
    </div>
  );
}