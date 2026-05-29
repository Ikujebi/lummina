"use client";

import Image from "next/image";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import { ChangeEvent } from "react";
import type { AdminProfile } from "@/types/adminProfile";
import defaultAvatar from "@/public/img/default.png";

type UploadMessage = {
  type: "success" | "error" | "";
  text: string;
};

type ProfileHeaderProps = {
  profile: AdminProfile;
  preview: string | null;
  uploading: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  message?: UploadMessage;
};

export default function ProfileHeader({
  profile,
  preview,
  uploading,
  onFileChange,
  message,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      {/* IMAGE BLOCK */}
      <div className="space-y-2">
        <div className="relative w-28 h-28 rounded-full overflow-hidden group">
          <Image
            src={preview || profile.profilePicture || defaultAvatar}
            alt="profile"
            fill
            loading="lazy"
            sizes="(max-width: 640px) 5rem, (max-width: 1024px) 6rem, 7rem"
            className="rounded-full object-cover"
          />

          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer">
            {uploading ? <Loader2 /> : <Camera />}
            <input type="file" hidden onChange={onFileChange} />
          </label>
        </div>

        {/* 👇 MESSAGE UNDER IMAGE (UX FIX) */}
        {message?.text && (
          <p
            className={`text-xs font-medium ${
              message.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {/* INFO */}
      <div>
        <h2 className="text-xl font-bold">{profile.name}</h2>
        <p>{profile.email}</p>

        <div className="flex items-center gap-2 mt-2">
          <ShieldCheck size={14} />
          Admin Account
        </div>
      </div>
    </div>
  );
}
