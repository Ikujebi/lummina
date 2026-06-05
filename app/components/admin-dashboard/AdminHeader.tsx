"use client";

import Image from "next/image";
import Link from "next/link";
import { BellOutlined } from "@ant-design/icons";
import { Dropdown, Badge } from "antd";
import type { MenuProps } from "antd";
import Lummina2 from "@/public/img/Lummina2.png";
import adminPhoto from "@/public/img/careers.jpg";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface Props {
  setSidebarOpen: (open: boolean) => void;
  admin: AdminProfile | null;

  notifications: {
    id: string;
    message: string;
    createdAt: string;
    read: boolean;
  }[];

  unreadCount: number;
  notificationMenu: MenuProps;
}

export default function AdminHeader({
  setSidebarOpen,
  admin,
  unreadCount,
  notificationMenu,
}: Props) {
  return (
    <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-4 bg-[#5F021F] shadow">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-[#F7E7CE] text-2xl"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <div className="font-semibold bg-[#F7E7CE]/40 shadow-xl text-lg rounded-xl">
          <Link href="/admin/dashboard" onClick={() => setSidebarOpen(false)}>
            <Image
              src={Lummina2}
              alt="Lummina Logo"
              width={100}
              height={50}
              loading="eager"
              sizes="(max-width: 640px) 3.2rem, 4rem"
              className="h-13 w-[4.5rem] object-contain"
            />
          </Link>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* NOTIFICATIONS */}
        <Dropdown
          menu={notificationMenu}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Badge count={unreadCount} size="small">
            <BellOutlined
              style={{
                fontSize: 22,
                color: "#F7E7CE",
                cursor: "pointer",
              }}
            />
          </Badge>
        </Dropdown>

        {/* ADMIN AVATAR */}
        <Image
          src={admin?.profilePicture || adminPhoto}
          alt="Admin photo"
          width={40}
          height={40}
          className="rounded-full object-cover border border-[#F7E7CE] w-[3rem] h-[3rem]"
        />

        <div className="text-[#F7E7CE]">
          <p className="font-semibold">{admin?.name || "Admin User"}</p>
          <p className="text-xs opacity-80">System Administrator</p>
        </div>
      </div>
    </header>
  );
}
