"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Topbar from "@/app/components/dashboard/Topbar";
import { ClientUserProvider } from "@/context/ClientUserContext";
import type { User } from "@/types/user";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/notifications", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!mounted) return;

        setUnreadCount(data.unreadCount ?? 0);
      } catch {
        // Silent fail
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7E7CE]">
<Spin size="large" style={{ color: "#5F021F" }} description="Loading ..."/>      </div>
    );
  }

  return (
    <ClientUserProvider initialUser={user!}>
      <div className="min-h-screen bg-[#F7E7CE]">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-screen flex-col lg:ml-[260px]">
          <Topbar
            notifications={unreadCount}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />

          <main className="flex-1 pt-20 px-4 sm:px-6 md:px-8 lg:px-10 pb-8">
            {children}
          </main>

          <footer className="border-t border-[#5F021F]/10 bg-white px-4 py-4 text-center text-xs text-[#5F021F]/70 sm:text-sm">
            © 2026 Lummina Law Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </ClientUserProvider>
  );
}