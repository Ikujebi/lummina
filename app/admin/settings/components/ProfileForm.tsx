"use client";

import { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";

import type { AdminProfile } from "@/types/adminProfile";

type ProfileFormProps = {
  profile: AdminProfile;
  setProfile: Dispatch<SetStateAction<AdminProfile>>;
  onSave: () => void;
  saving: boolean;
};

export default function ProfileForm({
  profile,
  setProfile,
  onSave,
  saving,
}: ProfileFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* NAME */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#5F021F]">
          Full Name
        </label>

        <input
          type="text"
          value={profile.name}
          onChange={(e) =>
            setProfile({
              ...profile,
              name: e.target.value,
            })
          }
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
        />
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#5F021F]">
          Email Address
        </label>

        <input
          type="email"
          value={profile.email}
          onChange={(e) =>
            setProfile({
              ...profile,
              email: e.target.value,
            })
          }
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
        />
      </div>

      {/* BUTTON */}
      <div className="md:col-span-2 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="h-12 px-6 rounded-2xl bg-[#5F021F] hover:bg-[#430116] text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
            <Loader2
              className="animate-spin"
              size={18}
            />
          )}

          {saving
            ? "Saving Changes..."
            : "Save Profile"}
        </button>
      </div>
    </div>
  );
}