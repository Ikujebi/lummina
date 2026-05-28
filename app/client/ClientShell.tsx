"use client";

import { useState } from "react";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Topbar from "@/app/components/dashboard/Topbar";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7e7ce] flex">

      {/* FIXED SIDEBAR */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:w-[260px]">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

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
  );
}