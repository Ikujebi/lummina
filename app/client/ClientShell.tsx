"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Topbar from "@/app/components/dashboard/Topbar";
import { ClientUserProvider } from "@/context/ClientUserContext";
import type { User } from "@/types/user";
import { Spin } from "antd";

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
      // silent fail
    }
  })();

  return () => {
    mounted = false;
  };
}, []);


  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F7e7ce]">
        <Spin size="large" />
      </div>
    );
  }



  return (
    <ClientUserProvider initialUser={user!}>
      <div className="min-h-screen bg-[#F7e7ce] flex">
        {/* SIDEBAR */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* CONTENT */}
        <div className="flex flex-col w-full h-screen lg:ml-[260px] overflow-hidden">

          <Topbar
          notifications={unreadCount}
            onToggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
          />

          <main className="flex-1 overflow-y-auto no-scrollbar pt-20 px-6 md:px-10 flex flex-col gap-8">
            {children}
          </main>

          <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0]">
            © 2026 Lummina Law Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </ClientUserProvider>
  );
}