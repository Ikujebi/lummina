"use client";

import { useState } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Topbar from "@/app/components/dashboard/Topbar";

import { ClientUserProvider } from "@/context/ClientUserContext";
import type { User } from "@/types/user";

export default function ClientShell({
  children,
  user: initialUser,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ClientUserProvider initialUser={initialUser}>
      <div className="min-h-screen bg-[#F7e7ce] flex">
        {/* FIXED SIDEBAR */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content Area */}
        <div className="flex flex-col w-full min-h-screen lg:ml-[260px]">
          {/* Topbar */}
          <Topbar
            onToggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
          />

          {/* Page Content */}
          <main className="flex-1 pt-20 px-6 md:px-10 flex flex-col gap-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0]">
            © 2026 Lummina Law Management System. All rights reserved.
          </footer>
        </div>
      </div>
    </ClientUserProvider>
  );
}