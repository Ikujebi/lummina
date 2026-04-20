"use client";

import { useState } from "react";
import Sidebar from "@/app/components/lawyer-dashboard/Sidebar";
import { Menu } from "lucide-react";
import type { User } from "@/types/user";
import Image from "next/image";

export default function LawyerShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">

      {/* HEADER */}
      <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-4 bg-[#5F021F] shadow">

        {/* Hamburger */}
        <button
          className="lg:hidden text-[#F7E7CE]"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>

        {/* Title */}
        <div className="font-bold text-[#F7E7CE]">
          ⚖️ Lummina Lawyer Portal
        </div>

        {/* PROFILE SECTION */}
        <div className="flex items-center gap-3 text-[#F7E7CE] font-semibold">

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F7E7CE]/20 flex items-center justify-center border border-[#F7E7CE]/30">

            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                width={36}
                height={36}
              />
            ) : (
              <span className="text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            )}

          </div>

          {/* Name */}
          <div className="hidden sm:block">
            {user?.name ?? "Unknown User"}
          </div>

        </div>
      </header>

      <div className="flex flex-1">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* MOBILE DRAWER */}
        {open && (
          <div className="fixed inset-0 z-30 flex">

            {/* overlay */}
            <div
              className="flex-1 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* sidebar */}
            <div className="w-72 bg-[#FFF4E0] p-6">
              <Sidebar onClose={() => setOpen(false)} />
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 sm:p-10">
          {children}
        </main>

      </div>
    </div>
  );
}