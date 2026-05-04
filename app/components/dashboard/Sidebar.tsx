"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  const links = [
    { label: "Home", href: "/client/dashboard" },
    { label: "Documents", href: "/client/documents" },
    { label: "Chat", href: "/client/chat" },
    { label: "Glossary", href: "/client/glossary" },
    { label: "Settings", href: "/client/settings" },
  ];

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white border-r border-gray-100 shadow-xl
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Sidebar Navigation"
      >
        {/* HEADER */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h2 className="text-[#5F021F] font-bold text-lg tracking-tight">
            Client Portal
          </h2>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-1 p-4 mt-2">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`
                  px-4 py-3 rounded-xl font-medium transition-all
                  flex items-center gap-3
                  ${
                    isActive
                      ? "bg-[#FFA500] text-white shadow-md"
                      : "text-gray-700 hover:bg-[#F7e7ce] hover:text-[#5F021F]"
                  }
                `}
              >
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 text-xs text-gray-400">
          Secure Legal Dashboard
        </div>
      </aside>
    </>
  );
}