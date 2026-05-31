"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { LogOut } from "lucide-react";
import LogoutButton from "../LogoutButton";

type Props = {
  open: boolean;
  onClose: () => void;
};

const items = [
  { label: "Dashboard", href: "/lawyer/dashboard" },
  { label: "My Cases", href: "/lawyer/matters" },
  { label: "Profile", href: "/lawyer/settings" },
  { label: "Documents", href: "/lawyer/documents" },
  { label: "Clients", href: "/lawyer/clients" },
];

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  const sidebarVariants: Variants = {
    closed: { x: -320 },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 22,
        when: "beforeChildren",
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, x: -16 },
    open: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* SIDEBAR (IMPORTANT: STARTS BELOW HEADER) */}
          <motion.aside
            className="
              fixed left-0 top-[72px] bottom-0 z-50
              w-[260px]
              bg-[#FFF4E0]
              p-6
              flex flex-col
              gap-2
              shadow-xl
              lg:hidden
            "
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <motion.button
              variants={itemVariants}
              onClick={onClose}
              className="mb-4 font-bold text-[#5F021F]"
            >
              ✕ Close
            </motion.button>

            {/* NAV */}
            <nav className="flex flex-col gap-2 flex-1">
              {items.map((item) => {
                const active = pathname === item.href;

                return (
                  <motion.div key={item.href} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        px-4 py-3 rounded-xl font-semibold block
                        ${
                          active
                            ? "bg-[#FFD6A5] text-[#5F021F]"
                            : "text-[#5F021F]/70 hover:bg-[#FFE8B2]"
                        }
                      `}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* LOGOUT */}
            <motion.div variants={itemVariants} className="mt-auto">
              <LogoutButton
                icon={<LogOut size={16} />}
                label="Logout"
                onClose={onClose}
              />
            </motion.div>
          </motion.aside>

          {/* DESKTOP SIDEBAR */}
          <aside className="
            hidden lg:flex
            fixed left-0 top-[72px] bottom-0
            w-[260px]
            flex-col
            bg-[#FFF4E0]
            p-6
          ">
            <nav className="flex flex-col gap-2">
              {items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-4 py-3 rounded-xl font-semibold
                      ${
                        active
                          ? "bg-[#FFD6A5] text-[#5F021F]"
                          : "text-[#5F021F]/70 hover:bg-[#FFE8B2]"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </AnimatePresence>
  );
}