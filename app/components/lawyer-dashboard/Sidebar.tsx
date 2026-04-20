"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/lawyer/dashboard" },
  { label: "My Matters", href: "/lawyer/matters" },
  { label: "Profile", href: "/lawyer/settings" },
  { label: "Documents", href: "/lawyer/documents" },
  { label: "Clients", href: "/lawyer/clients" },
];

type SidebarProps = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[260px] bg-[#FFF4E0] border-r p-6 gap-2">

      {/* mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden mb-4 text-left font-bold text-[#5F021F]"
        >
          ✕ Close
        </button>
      )}

      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose} // optional: auto-close on mobile
            className={`px-4 py-3 rounded-xl font-semibold transition ${
              active
                ? "bg-[#FFD6A5] text-[#5F021F]"
                : "text-[#5F021F]/70 hover:bg-[#FFE8B2]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}