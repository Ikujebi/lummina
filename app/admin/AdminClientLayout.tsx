"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/admin-dashboard/Sidebar";
import Image from "next/image";
import Link from "next/link"; // ✅ FIX 1: added import
import adminPhoto from "@/public/img/careers.jpg";
import { BellOutlined } from "@ant-design/icons";
import { Dropdown, Badge, Spin } from "antd";
import type { MenuProps } from "antd";
import Lummina2 from "@/public/img/Lummina2.png";


interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function AdminSidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch("/api/admin/profile", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success && data.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile:", err);
      }
    }

    fetchAdmin();
  }, []);

  useEffect(() => {
    const handleProfileUpdate = async () => {
      try {
        const res = await fetch("/api/admin/profile", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success && data.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        console.error("Failed to refresh admin profile:", err);
      }
    };

    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

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

  useEffect(() => {
    const handleStorageChange = () => {
      if (!localStorage.getItem("isLoggedIn")) {
        router.replace("/");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  const notificationMenu: MenuProps = {
    items: loadingNotifications
      ? [
          {
            key: "loading",
            label: (
              <div className="flex items-center gap-2">
                <Spin size="small" /> Loading...
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
      : notifications.map((n) => ({
          key: n.id,
          label: (
            <div
              className={`text-sm ${
                n.read ? "text-gray-400" : "font-medium"
              }`}
            >
              {n.message}
              <div className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ),
        })),
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-4 bg-[#5F021F] shadow">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-[#F7E7CE] text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="font-semibold bg-[#F7E7CE]/40 shadow-xl text-lg rounded-xl">
            <Link href="/" onClick={() => setSidebarOpen(false)}> {/* ✅ FIX 2 */}
              <Image
                src={Lummina2}
                alt="Lummina Logo"
                width={100}
                height={50}
                className="h-13 object-contain"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Dropdown
            menu={notificationMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Badge
              count={notifications.filter((n) => !n.read).length}
              size="small"
            >
              <BellOutlined style={{ fontSize: 22, color: "#F7E7CE" }} />
            </Badge>
          </Dropdown>

          <Image
            src={admin?.profilePicture || adminPhoto}
            alt="Admin photo"
            width={40}
            height={40}
            className="rounded-full object-cover border border-[#F7E7CE] w-[3rem] h-[3rem]"
          />

          <div className="text-[#F7E7CE]">
            <p className="font-semibold">{admin?.name || "Admin User"}</p>
            <p className="text-xs opacity-80">System Administrator</p>
          </div>
        </div>
      </header>

      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

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