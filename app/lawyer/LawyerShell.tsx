"use client";

import { useState } from "react";
import Sidebar from "@/app/components/lawyer-dashboard/Sidebar";
import LawyerHeader from "@/app/components/lawyer-dashboard/LawyerHeader";
import type { User } from "@/types/user";
import { UserProvider } from "@/context/UserContext";
import { Montserrat } from "@/app/fonts";


export default function LawyerShell({
  children,
  user: initialUser,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [open, setOpen] = useState(false);

  return (
    <UserProvider initialUser={initialUser}>
      <div className={`${Montserrat.className} min-h-screen flex flex-col bg-[#F7E7CE]`}>
        <LawyerHeader onOpenSidebar={() => setOpen(true)} />

        <div className="flex flex-1">
          <Sidebar open={open} onClose={() => setOpen(false)} />

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>

        <footer className="text-center p-4 text-xs sm:text-sm text-[#5F021F]/70 bg-[#FFF4E0] border-t border-[#5F021F]/10">
          © 2026 Lummina Law Management System. All rights reserved.
        </footer>
      </div>
    </UserProvider>
  );
}