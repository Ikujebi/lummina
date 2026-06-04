"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import LumminaLogo from "@/public/img/Lummina2.png";
import { useUser } from "@/context/UserContext";


interface Props {
  onOpenSidebar: () => void;
}

export default function LawyerHeader({ onOpenSidebar }: Props) {
  const { user } = useUser();

  return (
    <header
      className="
        sticky top-0 z-50
        h-[72px]
        flex items-center justify-between
        px-4 sm:px-8
        bg-[#5F021F]
        border-b border-white/10
        shadow-[0_8px_30px_rgba(0,0,0,0.15)]
      "
    >
      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-4">

        {/* MOBILE MENU */}
        <button
          className="
            lg:hidden
            text-[#F7E7CE]
            hover:scale-105 active:scale-95
            transition-transform duration-150
          "
          onClick={onOpenSidebar}
        >
          <Menu />
        </button>

        {/* LOGO */}
        <Link
          href="/dashboard"
          className="
            flex items-center justify-center
            px-3 py-2
            rounded-xl

            bg-white
            shadow-md
            border border-white/20

            hover:scale-105
            transition-transform duration-200
          "
        >
          <Image
            src={LumminaLogo}
            alt="Lummina Logo"
            width={120}
            height={60}
            className="h-10 sm:h-11 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-3 text-[#F7E7CE]">

        {/* USER BLOCK */}
        <div
          className="
            flex items-center gap-3
            px-3 py-1.5
            rounded-full
            bg-white/5
            border border-white/10
            hover:bg-white/10
            transition
          "
        >

          {/* AVATAR */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F7E7CE]/20 flex items-center justify-center border border-[#F7E7CE]/30">

            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt="Profile"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            )}

          </div>

          {/* NAME + ROLE */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold">
              {user?.name ?? "Unknown User"}
            </span>
            <span className="text-xs text-[#F7E7CE]/70">
              Lawyer
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}