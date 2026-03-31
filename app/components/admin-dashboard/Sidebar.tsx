"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: "📊", href: "/admin" },
    { label: "Lawyers", icon: "👨‍⚖️", href: "/admin/lawyers" },
    { label: "Clients", icon: "👥", href: "/admin/clients" },
    { label: "Cases", icon: "📁", href: "/admin/cases" },
    { label: "Reports", icon: "📄", href: "/admin/reports" },
    { label: "Settings", icon: "⚙️", href: "/admin/settings" },
  ];

  const renderLink = (item: typeof menuItems[0]) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold ${
          isActive
            ? "bg-[#FFD6A5] text-[#5F021F]"
            : "text-[#5F021F]/80 hover:bg-[#FFE8B2]"
        }`}
        onClick={() => setOpen(false)}
      >
        {item.icon} {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* MOBILE */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-[#FFF4E0] p-6 shadow-xl">
            <button className="mb-6 text-xl" onClick={() => setOpen(false)}>✕</button>
            <nav className="flex flex-col gap-3">{menuItems.map(renderLink)}</nav>
          </aside>
        </div>
      )}

      {/* DESKTOP */}
      <aside className="hidden lg:flex flex-col p-6 bg-[#FFF4E0] border-r border-[#5F021F]/10 min-w-[260px]">
        <nav className="flex flex-col gap-3">{menuItems.map(renderLink)}</nav>
      </aside>
    </>
  );
}