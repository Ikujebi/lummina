"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "@/public/img/Lummina2.png";
import Wordlo from "@/public/img/logo1.png";
import { Bell, Menu } from "lucide-react";

type User = {
  name: string;
  role: string;
  profilePicture?: string | null;
};

type TopbarProps = {
  notifications?: number;
  onToggleSidebar: () => void;
};

export default function Topbar({
  notifications = 0,
  onToggleSidebar,
}: TopbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const clientName = user?.name || "User";
  const userRole = user?.role || "Administrator";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex justify-between items-center px-4 md:px-8 lg:px-12 z-[100] transition-all duration-300 ">
      {/* BRAND SECTION */}
      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-transform group-hover:scale-105">
          <Image
            src={Logo}
            alt="Lummina official brand logo"
            className="object-contain"
            fill
            priority
            sizes="(max-width: 768px) 40px, 48px"
          />
        </div>

        <div className="flex flex-col">
          <div className="relative md:w-28 md:h-12">
            <Image
              src={Wordlo} // or Logo if that's your import name
              alt="Lummina"
              fill
              priority
              className="object-contain"
            />
          </div>

          <span className="text-[10px] font-medium text-[#FFA500] tracking-[0.2em] uppercase hidden md:block">
            Law Portal
          </span>
        </div>
      </div>

      {/* ACTION SECTION */}
      <div className="flex items-center gap-2 md:gap-5">
        {/* Notifications */}
        <button
          className="relative p-2.5 text-[#5F021F] hover:bg-[#5F021F]/5 rounded-xl transition-all group"
          aria-label={`${notifications} unread notifications`}
        >
          <Bell
            size={24}
            className="group-hover:rotate-12 transition-transform"
          />

          {notifications > 0 && (
            <span className="absolute top-2 right-2 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFA500] opacity-75"></span>

              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FFA500] text-[10px] font-bold text-white items-center justify-center ring-2 ring-white">
                {notifications > 9 ? "9+" : notifications}
              </span>
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="hidden md:block h-8 w-px bg-gray-200 mx-2" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-bold text-[#5F021F] truncate max-w-[150px]">
              {loading ? "Loading..." : clientName}
            </span>

            <span className="text-[11px] text-gray-500 font-medium">
              {userRole}
            </span>
          </div>

          <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-[#FFA500] p-0.5">
              <div className="w-full h-full rounded-full bg-[#5F021F] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={clientName}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  clientName.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </button>
        </div>

        {/* MOBILE MENU */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden ml-2 p-3 bg-[#5F021F] hover:bg-[#430116] text-white rounded-xl shadow-lg shadow-[#5F021F]/20 transition-all active:scale-90"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
