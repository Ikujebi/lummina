// Sidebar.tsx
import Link from "next/link";

interface Props {
  open: boolean;
  className?: string;
}

export default function Sidebar({ open, className }: Props) {
  if (!open) return null; // completely hide sidebar when not open

  // Map labels to actual paths
  const links = [
    { label: "Home", href: "/" },
    { label: "Documents", href: "/documents" },
    { label: "Chat", href: "/chat" },
    { label: "Glossary", href: "/glossary" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Overlay behind sidebar */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        aria-hidden="true"
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 
          bg-white w-64 h-full shadow-md transition-transform duration-300
          ${className ?? ""}
        `}
      >
        <nav className="flex flex-col gap-3 p-6">
          {links.map((link, idx) => (
            <Link key={link.label} href={link.href} passHref>
              <span
                className={`px-4 py-3 rounded-xl font-semibold ${
                  idx === 0
                    ? "bg-[#FFA500] text-white"
                    : "text-gray-700 hover:bg-[#F7e7ce] hover:text-[#5F021F]"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}