"use client";

import Image from "next/image";
import { useState } from "react";
import Sidebar from "../components/admin-dashboard/Sidebar";
import adminPhoto from "@/public/img/careers.jpg";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">
      {/* ================= TOP BAR ================= */}
      <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-4 bg-[#5F021F] shadow">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-[#F7E7CE] text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="flex items-center gap-2.5 font-semibold text-[#F7E7CE] text-lg">
            Lummina Nigeria
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={adminPhoto}
            alt="Admin photo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="text-[#F7E7CE]">
            <p className="font-semibold">Admin User</p>
            <p className="text-xs opacity-80">System Administrator</p>
          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* MAIN CONTENT CHANGES HERE */}
        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>

      <footer className="text-center p-4 text-sm text-[#5F021F]/70 bg-[#FFF4E0]">
        © LexTrust Nigeria — Admin Portal.
      </footer>
    </div>
  );
}