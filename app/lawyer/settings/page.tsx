"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import type { User } from "@/types/user";
import Profilepix from "@/public/img/default.png";
import { useLawyerImageUpload } from "@/hooks/useLawyerImageUpload";

/* =======================
   PASSWORD STRENGTH
======================= */
function getStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

const [user, setUser] = useState<User>(null as unknown as User);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // PASSWORD STATE
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  // PASSWORD VISIBILITY
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(passwords.new);

  /* =======================
     LAWYER UPLOAD HOOK
  ======================= */
  const {
    uploadImage,
    uploading: imageUploading,
  } = useLawyerImageUpload();

  /* =======================
     LOAD USER
  ======================= */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =======================
     UPDATE FIELD
  ======================= */
  function updateField(field: keyof User, value: string) {
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  /* =======================
     IMAGE UPLOAD (HOOK WRAPPER)
  ======================= */
  async function handleImageUpload(file: File) {
    if (!user) return;

    await uploadImage(file, user, setUser);
  }

  /* =======================
     SAVE PROFILE
  ======================= */
  async function handleSave() {
    if (!user) return;

    try {
      setSaving(true);

      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      setUser(data.user);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  /* =======================
     CHANGE PASSWORD
  ======================= */
  async function handlePasswordChange() {
    if (
      !passwords.current ||
      !passwords.new ||
      !passwords.confirm
    ) {
      alert("All password fields are required");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }

    if (strength < 3) {
      alert("Password is too weak");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed");
      }

      alert("Password updated successfully. Please log in again.");

      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });

      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Password update failed");
    } finally {
      setChangingPassword(false);
    }
  }

  /* =======================
     LOADING
  ======================= */
  if (loading) {
    return (
      <p className="text-[#5F021F] font-medium">
        Loading settings...
      </p>
    );
  }

  if (!user) {
    return (
      <p className="text-red-600">
        Failed to load user
      </p>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#5F021F]">
          Account Settings
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your profile information and account security.
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#5F021F]">
            Profile Information
          </h2>
        </div>

        <div className="p-6 space-y-8">

          {/* PROFILE IMAGE */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">

            <div className="relative w-fit">

              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#FFA500]/20 shadow-lg bg-[#5F021F]">

                <Image
                  src={user.profilePicture || Profilepix}
                  alt="Profile picture"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />

              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#FFA500] text-[#5F021F] flex items-center justify-center shadow-lg hover:scale-105 transition"
              >
                {imageUploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />

            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#5F021F]">
                {user.name}
              </h3>

              <p className="text-sm text-gray-500">
                {user.email}
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFA500]/10 text-[#5F021F] text-xs font-semibold">
                <ShieldCheck size={14} />
                Secure account
              </div>
            </div>

          </div>

          {/* NAME */}
          <input
            value={user.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-2xl border px-4 py-3 bg-gray-50"
          />

          {/* EMAIL */}
          <input
            value={user.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full rounded-2xl border px-4 py-3 bg-gray-50"
          />

          <button
            onClick={handleSave}
            disabled={saving || imageUploading}
            className="px-6 py-3 rounded-2xl bg-[#FFA500] text-[#5F021F] font-bold"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

        </div>
      </div>

      {/* PASSWORD CARD (UNCHANGED UI) */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#5F021F]">
            Change Password
          </h2>
        </div>

        <div className="p-6 space-y-5">

          {/* CURRENT */}
          <input
            type={showCurrent ? "text" : "password"}
            value={passwords.current}
            onChange={(e) =>
              setPasswords({ ...passwords, current: e.target.value })
            }
            placeholder="Current password"
          />

          {/* NEW */}
          <input
            type={showNew ? "text" : "password"}
            value={passwords.new}
            onChange={(e) =>
              setPasswords({ ...passwords, new: e.target.value })
            }
            placeholder="New password"
          />

          {/* CONFIRM */}
          <input
            type={showConfirm ? "text" : "password"}
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({ ...passwords, confirm: e.target.value })
            }
            placeholder="Confirm password"
          />

          <button
            onClick={handlePasswordChange}
            disabled={changingPassword}
            className="px-6 py-3 bg-[#5F021F] text-white rounded-2xl"
          >
            {changingPassword ? "Updating..." : "Change Password"}
          </button>

        </div>
      </div>

    </div>
  );
}