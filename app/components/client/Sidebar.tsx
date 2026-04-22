"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/client/dashboard" },
  { name: "Cases", href: "/client/cases" },
  { name: "Messages", href: "/client/messages" },
  { name: "Settings", href: "/client/settings" },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-[260px] bg-white shadow-lg p-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:block
        `}
      >
        <h2 className="text-xl font-bold mb-8 text-[#5F021F]">
          Client Panel
        </h2>

        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  ${active
                    ? "bg-[#5F021F] text-white"
                    : "text-[#5F021F] hover:bg-[#F7E7CE]"
                  }
                `}
                onClick={onClose}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}