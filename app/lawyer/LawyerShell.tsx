"use client";

import { useState } from "react";
import Sidebar from "@/app/components/lawyer-dashboard/Sidebar";
import { Menu } from "lucide-react";
import type { User } from "@/types/user";
import Image from "next/image";
import LumminaLogo from "@/public/img/Lummina2.png";

export default function LawyerShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7E7CE] flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4 bg-[#5F021F] shadow">

        {/* LEFT */}
        <div className="flex items-center gap-3">

          {/* Hamburger */}
          <button
            className="lg:hidden text-[#F7E7CE]"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          {/* Logo */}
          <div className="bg-white rounded-full p-2 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src={LumminaLogo}
              alt="Lummina Logo"
              width={20}
              height={20}
              className="object-contain sm:w-6 sm:h-6"
            />
          </div>

          {/* Title */}
          <div className="hidden sm:block font-bold text-[#F7E7CE]">
            Lummina Lawyer Portal
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 text-[#F7E7CE] font-semibold ml-auto">

          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F7E7CE]/20 flex items-center justify-center border border-[#F7E7CE]/30">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt="Profile"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            )}
          </div>

          <div className="hidden sm:block">
            {user?.name ?? "Unknown User"}
          </div>

        </div>

      </header>

      {/* BODY */}
      <div className="flex flex-1 relative">

        {/* FIXED DESKTOP SIDEBAR */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:top-[72px] lg:flex lg:w-72 lg:flex-col bg-[#FFF4E0] ">
          <Sidebar />
        </aside>

        {/* MOBILE DRAWER */}
        {open && (
          <div className="fixed inset-0 z-30 flex lg:hidden">

            {/* overlay */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* drawer */}
            <div className="w-72 bg-[#FFF4E0] p-6 overflow-y-auto">
              <Sidebar onClose={() => setOpen(false)} />
            </div>

          </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex flex-col flex-1 lg:ml-72 min-h-[calc(100vh-72px)]">

          {/* PAGE CONTENT */}
          <main className="flex-1 p-6 sm:p-10 overflow-x-hidden">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0] border-t border-[#5F021F]/10">
            © 2026 Lummina Law Management System. All rights reserved.
          </footer>

        </div>

      </div>

    </div>
  );
}
