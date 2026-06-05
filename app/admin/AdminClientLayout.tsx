"use client";

import { useState } from "react";
import Sidebar from "../components/admin-dashboard/Sidebar";
import AdminHeader from "../components/admin-dashboard/AdminHeader";
import { Spin } from "antd";
import type { MenuProps } from "antd";
import { Montserrat } from "@/app/fonts";
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

  const {
    notifications,
    unreadCount,
    loadingNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  useAuthRedirect();

  // ✅ FIX: prevent runtime crash if API returns non-array
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const notificationMenu: MenuProps = {
    items: loadingNotifications
      ? [
          {
            key: "loading",
            label: (
              <div className="flex items-center gap-2">
                <Spin size="small" style={{ color: "#5F021F" }} />
                Loading...
              </div>
            ),
            disabled: true,
          },
        ]
      : [
          ...(notifications.length > 0
            ? [
                {
                  key: "read-all",
                  label: (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="w-full text-left font-semibold text-[#5F021F]"
                    >
                      Mark all as read
                    </button>
                  ),
                },
              ]
            : []),

          ...(notifications.length === 0
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
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                    className={`text-sm cursor-pointer ${
                      notification.read ? "text-gray-400" : "font-medium"
                    }`}
                  >
                    {notification.message}

                    <div className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                ),
              }))),
        ],
  };

  return (
    <>
      <div className={`${Montserrat.className} min-h-screen flex flex-col bg-[#F7E7CE]`}>
        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          admin={admin}
          notifications={safeNotifications}
          unreadCount={unreadCount}
          notificationMenu={notificationMenu}
        />

        <div className="flex flex-1">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

          <div className="flex flex-col flex-1 lg:ml-[16.25rem] min-w-0">
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6">
              <div className="w-full max-w-7xl mx-auto">{children}</div>
            </main>

            <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0] border-t border-[#5F021F]/10">
              © 2026 Lummina Law Management System. All rights reserved.
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
