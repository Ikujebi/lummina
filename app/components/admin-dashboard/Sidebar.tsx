"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "../LogoutButton";
import { MenuItem } from "@/types/side";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  Activity,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { label: "Dashboard", icon:<LayoutDashboard size={18} />, href: "/admin/dashboard" },
    { label: "Insights", icon: <Newspaper size={18} />, href: "/admin/insights" },
    { label: "Website Activity", icon: <Activity size={18} />, href: "/admin/activity" },
    { label: "Lawyers", icon: <Users size={18} />, href: "/admin/lawyers" },
    { label: "Clients", icon: <Users size={18} />, href: "/admin/clients" },
    { label: "Cases", icon: <FileText size={18} />, href: "/admin/cases" },
    { label: "Reports", icon: <FileText size={18} />, href: "/admin/reports" },
    { label: "Documents", icon: <FileText size={18} />, href: "/admin/documents" },
    { label: "Notifications", icon: <Bell size={18} />, href: "/admin/notifications" },
    { label: "Audit Logs", icon: <Activity size={18} />, href: "/admin/audit-log" },
    { label: "Settings", icon: <Settings size={18} />, href: "/admin/settings" },
    { label: "Logout", icon: <LogOut size={18} />, isLogout: true },
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
          <div className="fixed inset-0 z-50 flex xl:hidden">
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
     <aside className="hidden xl:flex flex-col fixed top-0 left-0 h-screen w-[260px] p-6 bg-[#FFF4E0] border-r border-[#5F021F]/10">
  <nav className="flex flex-col gap-3 pt-[4.25rem]">
    {menuItems
      .filter((item) => !item.isLogout)
      .map(renderLink)}
  </nav>

  <div className="mt-auto pb-4">
    {menuItems
      .filter((item) => item.isLogout)
      .map(renderLink)}
  </div>
</aside>
    </>
  );
}