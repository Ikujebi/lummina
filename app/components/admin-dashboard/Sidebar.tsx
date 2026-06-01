"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "../LogoutButton";
import { MenuItem } from "@/types/side";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { label: "Dashboard", icon: "📊", href: "/admin/dashboard" },
    { label: "Insights", icon: "📰", href: "/admin/insights" },
    { label: "Website Activity", icon: "📈", href: "/admin/activity" },
    { label: "Lawyers", icon: "👨‍⚖️", href: "/admin/lawyers" },
    { label: "Clients", icon: "👥", href: "/admin/clients" },
    { label: "Cases", icon: "📁", href: "/admin/cases" },
    { label: "Reports", icon: "📄", href: "/admin/reports" },
    { label: "Documents", icon: "📄", href: "/admin/documents" },
    { label: "Notifications", icon: "🔔", href: "/admin/notifications" },
    { label: "Settings", icon: "⚙️", href: "/admin/settings" },
    { label: "Logout", icon: "🚪", isLogout: true },
  ];

  const renderLink = (item: MenuItem, index: number) => {
    const isActive = item.href ? pathname === item.href : false;

    if (item.isLogout) {
      return (
        <motion.div
          key="logout"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <LogoutButton
            icon={item.icon}
            label={item.label}
            onClose={() => setOpen(false)}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key={item.href}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          href={item.href!}
          className={`flex items-center gap-2 px-4 py-[.56rem] md:py-3 rounded-xl font-semibold transition-all duration-200 ${isActive
            ? "bg-[#FFD6A5] text-[#5F021F]"
            : "text-[#5F021F]/80 hover:bg-[#FFE8B2]"
            }`}
          onClick={() => setOpen(false)}
        >
          {item.icon} {item.label}
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* MOBILE */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-64 bg-[#FFF4E0] p-6 shadow-xl"
            >
              <button
                className="mb-6 text-xl"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

              <nav className="flex flex-col gap-3">
                {menuItems.map(renderLink)}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* DESKTOP */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-[260px] p-6 bg-[#FFF4E0] border-r border-[#5F021F]/10 ">        
      <nav className="flex flex-col gap-3 pt-[4.25rem]">
        {menuItems.map(renderLink)}
      </nav>
      </aside>
    </>
  );
}