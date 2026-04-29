"use client";

import { useRouter } from "next/navigation";

type Props = {
  icon?: React.ReactNode;
  label?: string;
  onClose?: () => void;
};

export default function LogoutButton({
  icon,
  label = "Logout",
  onClose,
}: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Logout failed");

      if (onClose) onClose();

      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-[#5F021F]/80 hover:bg-[#FFE8B2]"
    >
      {icon} {label}
    </button>
  );
}