"use client";

import { Menu } from "lucide-react";

export default function Topbar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[260px] bg-white shadow z-30 h-16 flex items-center px-6">
      
      <button
        className="lg:hidden mr-4"
        onClick={onToggleSidebar}
      >
        <Menu />
      </button>

      <h1 className="font-semibold text-[#5F021F]">
        Client Dashboard
      </h1>

      <div className="ml-auto">
        {/* future: profile / notifications */}
      </div>
    </header>
  );
}