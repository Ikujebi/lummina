"use client";

import { useState } from "react";
import Sidebar from "@/app/components/lawyer-dashboard/Sidebar";
import LawyerHeader from "@/app/components/lawyer-dashboard/LawyerHeader";
import type { User } from "@/types/user";
import { UserProvider } from "@/context/UserContext";

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
      <div className="h-screen flex flex-col bg-[#F7E7CE] overflow-hidden">

        <LawyerHeader onOpenSidebar={() => setOpen(true)} />

        <div className="flex flex-1 overflow-hidden">

          <Sidebar open={open} onClose={() => setOpen(false)} />

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>

        </div>
      </div>
    </UserProvider>
  );
}