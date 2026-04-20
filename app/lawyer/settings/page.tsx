"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";
import Image from "next/image";
import Profilepix from "@/public/img/default.png";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // PASSWORD STATE
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

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
      return { ...prev, [field]: value };
    });
  }

  /* =======================
     CLOUDINARY UPLOAD
  ======================= */
  async function handleImageUpload(file: File) {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      updateField("profilePicture", data.fileUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Update failed");

      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  /* =======================
     CHANGE PASSWORD
  ======================= */
  async function handlePasswordChange() {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch("/api/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Password updated successfully");

      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setChangingPassword(false);
    }
  }

  /* =======================
     LOADING
  ======================= */
  if (loading) return <p className="text-[#5F021F]">Loading...</p>;
  if (!user) return <p className="text-red-600">Failed to load user</p>;

  return (
    <div className="max-w-xl space-y-6">

      <h1 className="text-2xl font-bold text-[#5F021F]">
        Account Settings
      </h1>

      {/* ================= PROFILE ================= */}
      <div className="bg-[#FFF4E0] p-6 rounded-xl space-y-4">

        {/* PROFILE IMAGE */}
        <div className="flex items-center gap-4">

          <Image
            src={user.profilePicture || Profilepix}
            alt="profile picture"
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover border"
          />

          <div className="flex flex-col gap-1">
            <p className="text-sm text-[#5F021F] font-semibold">
              Profile Picture
            </p>

            <p className="text-xs text-[#5F021F]/70">
              Upload a clear professional photo (JPG or PNG)
            </p>

            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />

            {uploading && (
              <span className="text-xs text-[#5F021F]">
                Uploading image to Cloudinary...
              </span>
            )}
          </div>
        </div>

        {/* NAME */}
        <div>
          <p className="text-sm text-[#5F021F]/60">Full Name</p>
          <input
            value={user.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-3 py-2 rounded bg-white"
          />
        </div>

        {/* EMAIL */}
        <div>
          <p className="text-sm text-[#5F021F]/60">Email Address</p>
          <input
            value={user.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-3 py-2 rounded bg-white"
          />
        </div>

        {/* SAVE PROFILE */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#FFA500] text-[#5F021F] rounded-lg"
        >
          {saving ? "Saving changes..." : "Save Profile"}
        </button>
      </div>

      {/* ================= PASSWORD ================= */}
      <div className="bg-[#FFF4E0] p-6 rounded-xl space-y-3">

        <h2 className="text-lg font-semibold text-[#5F021F]">
          Change Password
        </h2>

        <input
          type="password"
          placeholder="Current password"
          value={passwords.current}
          onChange={(e) =>
            setPasswords({ ...passwords, current: e.target.value })
          }
          className="w-full px-3 py-2 rounded bg-white"
        />

        <input
          type="password"
          placeholder="New password"
          value={passwords.new}
          onChange={(e) =>
            setPasswords({ ...passwords, new: e.target.value })
          }
          className="w-full px-3 py-2 rounded bg-white"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={passwords.confirm}
          onChange={(e) =>
            setPasswords({ ...passwords, confirm: e.target.value })
          }
          className="w-full px-3 py-2 rounded bg-white"
        />

        <button
          onClick={handlePasswordChange}
          disabled={changingPassword}
          className="px-4 py-2 bg-[#5F021F] text-white rounded-lg"
        >
          {changingPassword ? "Updating..." : "Change Password"}
        </button>
      </div>

    </div>
  );
}