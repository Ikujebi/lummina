"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/lawyer/dashboard" },
  { label: "My Matters", href: "/lawyer/matters" },
  { label: "Messages", href: "/lawyer/chat" },
  { label: "Documents", href: "/lawyer/documents" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#FFF4E0] border-r p-6 gap-2">

      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
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