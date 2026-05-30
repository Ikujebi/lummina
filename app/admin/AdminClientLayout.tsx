"use client";

import { useState } from "react";
import Sidebar from "../components/admin-dashboard/Sidebar";
import AdminHeader from "../components/admin-dashboard/AdminHeader";

import { Spin } from "antd";
import type { MenuProps } from "antd";

import { useAdminProfile } from "@/hooks/useAdminProfile";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const admin = useAdminProfile();

  const { notifications, loadingNotifications } = useNotifications();

  useAuthRedirect();

  const notificationMenu: MenuProps = {
    items: loadingNotifications
      ? [
          {
            key: "loading",
            label: (
              <div className="flex items-center gap-2">
                <Spin size="small" />
                Loading...
              </div>
            ),
            disabled: true,
          },
        ]
      : notifications.length === 0
        ? [
            {
              key: "empty",
              label: "No notifications",
              disabled: true,
            },
          ]
        : notifications.map((notification) => ({
            key: notification.id,
            label: (
              <div
                className={`text-sm ${
                  notification.read
                    ? "text-gray-400"
                    : "font-medium"
                }`}
              >
                {notification.message}

                <div className="text-xs text-gray-500">
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </div>
              </div>
            ),
          })),
  };

  return (
    <>
      <AdminHeader
        setSidebarOpen={setSidebarOpen}
        admin={admin}
        notifications={notifications}
        notificationMenu={notificationMenu}
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          {children}
        </main>
      </div>

      <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0]">
        © 2026 Lummina Law Management System. All rights reserved.
      </footer>
    </>
  );
}