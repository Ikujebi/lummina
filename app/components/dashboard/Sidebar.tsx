"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { LogOut, Home, FileText, FolderOpen, BookOpen, Settings } from "lucide-react";
import LogoutButton from "../LogoutButton";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  const links = [
    { label: "Home", href: "/client/dashboard", icon: Home },
    { label: "Documents", href: "/client/documents", icon: FileText },
    { label: "Matters", href: "/client/cases", icon: FolderOpen },
    { label: "Glossary", href: "/glossary", icon: BookOpen },
    { label: "Request New Matter", href: "/client/matters/request", icon: FolderOpen },
    { label: "Settings", href: "/client/settings", icon: Settings },
  ];

  // ===== PARENT (CASCADE CONTROL) =====
  const sidebarVariants: Variants = {
    closed: {
      x: -320,
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 28,
        when: "beforeChildren",
        staggerChildren: 0.07,
      },
    },
  };

  // ===== CHILD (BASE ENTRY ANIMATION) =====
  const itemVariants: Variants = {
    closed: {
      opacity: 0,
      x: -18,
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
      },
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* SIDEBAR */}
          <motion.aside
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="
              fixed inset-y-0 left-0 z-50
              w-[290px] max-w-[85vw]
              bg-white
              border-r border-gray-100
              shadow-2xl
              flex flex-col
              overflow-hidden
              lg:hidden
            "
          >
            {/* HEADER */}
            <motion.div
              variants={itemVariants}
              className="h-16 flex items-center px-6 border-b border-gray-100"
            >
              <div>
                <h2 className="text-[#5F021F] font-bold text-lg">
                  Client Portal
                </h2>
                <p className="text-xs text-gray-400">
                  Legal Dashboard
                </p>
              </div>
            </motion.div>

            {/* NAVIGATION */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;

                  return (
                    <motion.div
                      key={link.href}
                      variants={itemVariants}
                      whileHover={{ x: 6, scale: 1.01 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`
                          relative flex items-center gap-3
                          px-4 py-3 rounded-xl
                          text-sm font-medium
                          transition-colors duration-200
                          overflow-hidden
                          ${
                            isActive
                              ? "bg-[#5F021F] text-white shadow-lg"
                              : "text-gray-700 hover:bg-[#F7E7CE] hover:text-[#5F021F]"
                          }
                        `}
                      >
                        {/* ICON (micro motion) */}
                        <motion.span
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            rotate: isActive ? 5 : 0,
                          }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon size={18} />
                        </motion.span>

                        {/* LABEL (slight motion feel) */}
                        <motion.span
                          animate={{
                            x: isActive ? 2 : 0,
                          }}
                        >
                          {link.label}
                        </motion.span>

                        {/* ACTIVE INDICATOR (morphing pill) */}
                        {isActive && (
                          <motion.span
                            layoutId="active-indicator"
                            className="
                              absolute left-0 top-2 bottom-2
                              w-1 rounded-r-full bg-white
                            "
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* FOOTER */}
            <motion.div
              variants={itemVariants}
              className="border-t border-gray-100 p-4"
            >
              <LogoutButton
                icon={<LogOut size={16} />}
                label="Logout"
                onClose={onClose}
              />

              <p className="mt-3 text-xs text-gray-400">
                Your Legal Matters, Simplified
              </p>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}