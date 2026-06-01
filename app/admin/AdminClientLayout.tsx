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

  // ✅ FIX: prevent runtime crash if API returns non-array
  const safeNotifications = Array.isArray(notifications)
    ? notifications
    : [];

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
      : safeNotifications.length === 0
      ? [
          {
            key: "empty",
            label: "No notifications",
            disabled: true,
          },
        ]
      : safeNotifications.map((notification) => ({
          key: notification.id,
          label: (
            <div
              className={`text-sm ${
                notification.read ? "text-gray-400" : "font-medium"
              }`}
            >
              {notification.message}

              <div className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
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
        notifications={safeNotifications} // optional but safer
        notificationMenu={notificationMenu}
      />

      <div className="min-h-screen bg-[#F7E7CE] flex">
        {/* SIDEBAR */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* CONTENT AREA */}
        <div className="flex flex-col flex-1 lg:ml-[16.25rem]">
          <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-6">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0] border-t border-[#5F021F]/10">
            © 2026 Lummina Law Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </>
  );
}