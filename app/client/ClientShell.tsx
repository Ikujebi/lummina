"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Topbar from "@/app/components/dashboard/Topbar";
import { ClientUserProvider } from "@/context/ClientUserContext";
import type { User } from "@/types/user";
import { Spin } from "antd";

/* =========================
   ROUTE TRANSITION OVERLAY
========================= */
function RouteTransitionOverlay() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActive(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setActive(false);
    }, 150);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F7e7ce]/60 backdrop-blur-sm">
      <Spin size="large" />
    </div>
  );
}

/* =========================
   CLIENT SHELL
========================= */
export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     AUTH FETCH
  ========================= */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch user");

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

  /* =========================
     INITIAL LOADING
  ========================= */
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F7e7ce]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ClientUserProvider initialUser={user!}>
      {/* ROUTE TRANSITION LOADER */}
      <RouteTransitionOverlay />

      <div className="min-h-screen bg-[#F7e7ce] flex">
        {/* SIDEBAR */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* CONTENT AREA */}
        <div className="flex flex-col w-full h-screen lg:ml-[260px] overflow-hidden">

          {/* TOPBAR */}
          <Topbar
            onToggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
          />

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto no-scrollbar pt-20 px-6 md:px-10 flex flex-col gap-8">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0]">
            © 2026 Lummina Law Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </ClientUserProvider>
  );
}