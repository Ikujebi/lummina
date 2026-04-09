"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // --- Logout handler ---
  const handleLogout = async () => {
    try {
     const res = await fetch("/api/auth/logout", { method: "POST" }); // Calls app/logout/route.ts
      if (!res.ok) throw new Error("Logout failed");
      router.push("/"); // Redirect to login after logout
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { label: "Dashboard", icon: "📊", href: "/admin/dashboard" },
    { label: "Lawyers", icon: "👨‍⚖️", href: "/admin/lawyers" },
    { label: "Clients", icon: "👥", href: "/admin/clients" },
    { label: "Cases", icon: "📁", href: "/admin/cases" },
    { label: "Reports", icon: "📄", href: "/admin/reports" },
    { label: "Documents", icon: "📄", href: "/admin/documents" },
    { label: "Chat", icon: "💬", href: "/chat" },
    { label: "Notifications", icon: "🔔", href: "/admin/notifications" },
    { label: "Logout", icon: "🚪", action: handleLogout }, // Logout button
  ];

  const renderLink = (item: typeof menuItems[0]) => {
    const isActive = pathname === item.href;

    // If item has an action (like logout), render a button instead of Link
    if (item.action) {
      return (
        <button
          key={item.label}
          onClick={() => {
            item.action?.();
            setOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-[#5F021F]/80 hover:bg-[#FFE8B2]"
        >
          {item.icon} {item.label}
        </button>
      );
    }

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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-64 bg-[#FFF4E0] p-6 shadow-xl">
            <button
              className="mb-6 text-xl"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
            <nav className="flex flex-col gap-3">
              {menuItems.map(renderLink)}
            </nav>
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