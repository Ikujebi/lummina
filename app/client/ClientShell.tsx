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
    <div className="min-h-screen bg-[#F7e7ce] flex lg:grid lg:grid-cols-[260px_1fr]">

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content Area */}
      <div className="flex flex-col w-full">

        {/* Topbar */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page Content */}
        <main className="flex-1 pt-20 px-6 md:px-10 flex flex-col gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}