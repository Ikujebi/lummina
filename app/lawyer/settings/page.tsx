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

  // PASSWORD VISIBILITY
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(passwords.new);

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

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      updateField("profilePicture", data.fileUrl);

      alert("Profile picture uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
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

      alert(
        "Password updated successfully. Please log in again."
      );

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

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#5F021F]">
            Profile Information
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Update your personal details and profile photo.
          </p>
        </div>

        {/* BODY */}
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
                className="
                  absolute
                  bottom-1
                  right-1
                  w-10
                  h-10
                  rounded-full
                  bg-[#FFA500]
                  text-[#5F021F]
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  hover:scale-105
                  transition
                "
              >
                {uploading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
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

                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />

            </div>

            <div className="space-y-2">

              <div>
                <h3 className="text-xl font-bold text-[#5F021F]">
                  {user.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFA500]/10 text-[#5F021F] text-xs font-semibold">
                <ShieldCheck size={14} />
                Secure account
              </div>

              <p className="text-xs text-gray-400">
                Recommended: square image, JPG or PNG
              </p>

            </div>

          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-[#5F021F]/70 mb-2">
              Full Name
            </label>

            <input
              value={user.name || ""}
              onChange={(e) =>
                updateField("name", e.target.value)
              }
              className="
                w-full
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                outline-none
                transition
                focus:border-[#FFA500]
                focus:ring-4
                focus:ring-[#FFA500]/10
              "
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-[#5F021F]/70 mb-2">
              Email Address
            </label>

            <input
              value={user.email}
              onChange={(e) =>
                updateField("email", e.target.value)
              }
              className="
                w-full
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                outline-none
                transition
                focus:border-[#FFA500]
                focus:ring-4
                focus:ring-[#FFA500]/10
              "
            />
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="
              inline-flex
              items-center
              justify-center
              px-6
              py-3
              rounded-2xl
              bg-[#FFA500]
              text-[#5F021F]
              font-bold
              shadow-sm
              hover:scale-[1.02]
              transition
              disabled:opacity-50
            "
          >
            {saving ? "Saving changes..." : "Save Profile"}
          </button>

        </div>
      </div>

      {/* ================= PASSWORD CARD ================= */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

        {/* TOP */}
        <div className="px-6 py-5 border-b border-gray-100">

          <h2 className="text-lg font-bold text-[#5F021F]">
            Change Password
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Use a strong password to keep your account secure.
          </p>

        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* CURRENT PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Current Password
            </label>

            <div className="relative">

              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter current password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    current: e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-3
                  pr-12
                  outline-none
                  focus:border-[#5F021F]
                  focus:ring-4
                  focus:ring-[#5F021F]/10
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(!showCurrent)
                }
                className="absolute right-4 top-3.5 text-gray-500"
              >
                {showCurrent ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              New Password
            </label>

            <div className="relative">

              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    new: e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-3
                  pr-12
                  outline-none
                  focus:border-[#5F021F]
                  focus:ring-4
                  focus:ring-[#5F021F]/10
                "
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-3.5 text-gray-500"
              >
                {showNew ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* STRENGTH */}
            <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">

              <div
                className={`
                  h-full
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    strength === 1
                      ? "w-1/4 bg-red-500"
                      : strength === 2
                      ? "w-2/4 bg-orange-500"
                      : strength === 3
                      ? "w-3/4 bg-yellow-500"
                      : strength === 4
                      ? "w-full bg-green-500"
                      : "w-0"
                  }
                `}
              />

            </div>

            <p className="text-xs text-gray-500 mt-2">
              Use 8+ characters with uppercase letters,
              numbers and symbols.
            </p>

          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Confirm Password
            </label>

            <div className="relative">

              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirm: e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-3
                  pr-12
                  outline-none
                  focus:border-[#5F021F]
                  focus:ring-4
                  focus:ring-[#5F021F]/10
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(!showConfirm)
                }
                className="absolute right-4 top-3.5 text-gray-500"
              >
                {showConfirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handlePasswordChange}
            disabled={changingPassword}
            className="
              inline-flex
              items-center
              justify-center
              px-6
              py-3
              rounded-2xl
              bg-[#5F021F]
              text-white
              font-bold
              shadow-sm
              hover:scale-[1.02]
              transition
              disabled:opacity-50
            "
          >
            {changingPassword
              ? "Updating password..."
              : "Change Password"}
          </button>

        </div>
      </div>

    </div>
  );
}