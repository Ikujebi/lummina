"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { message as antdMessage } from "antd";
import type { User } from "@/types/user";
import Profilepix from "@/public/img/default.png";
import { useLawyerImageUpload } from "@/hooks/useLawyerImageUpload";
import { useUser } from "@/context/UserContext";

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

/* =======================
   MAIN
======================= */
export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const { user, setUser } = useUser();
  const { uploadImage, uploading: imageUploading } = useLawyerImageUpload();

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const strength = getStrength(passwords.new);

  function updateField(field: keyof User, value: string) {
    setUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleImageUpload(file: File) {
    if (!user) return;
    await uploadImage(file, user, setUser);
  }

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

    if (!res.ok) {
      antdMessage.error(data.error || "Update failed");
      return;
    }

    setUser(data.user);
    antdMessage.success("Profile updated successfully");
  } catch (err) {
    console.error(err);
    antdMessage.error("Something went wrong");
  } finally {
    setSaving(false);
  }
}

  async function handlePasswordChange() {
    if (
      !passwords.current ||
      !passwords.new ||
      !passwords.confirm
    ) return;

    if (passwords.new !== passwords.confirm) return;
    if (strength < 3) return;

    try {
      setChangingPassword(true);

      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPasswords({ current: "", new: "", confirm: "" });
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
    } finally {
      setChangingPassword(false);
    }
  }

  if (!user) {
    return (
      <div className="p-6 text-red-600 font-medium">
        Failed to load user
      </div>
    );
  }

  const passwordsMatch =
    passwords.confirm.length > 0 &&
    passwords.new === passwords.confirm;

  return (
    <div className="w-full md:max-w-5xl mx-auto space-y-10 py-6 md:p-6 text-[#5F021F]">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black ">
          Account Settings
        </h1>
        <p className="text-gray-500 mt-2">
          Manage profile and security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================= PROFILE (UNCHANGED VISUAL) ================= */}
        <div className="lg:col-span-2 bg-white rounded-3xl  shadow-sm overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-lg font-bold ">
              Profile Information
            </h2>
          </div>

          <div className="p-6 space-y-6">

            {/* IMAGE SECTION — UNTOUCHED */}
            <div className="flex items-center gap-1 md:gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#5F021F]/10">
                  <Image
                    src={user.profilePicture || Profilepix}
                    alt="profile"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#FFA500] rounded-full flex items-center justify-center shadow-md"
                >
                  {imageUploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-xl font-bold truncate">
                  {user.name}
                </h3>

                <p className="text-gray-500 text-sm sm:text-base truncate">
                  {user.email}
                </p>

                <div className="mt-2 inline-flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  <ShieldCheck size={14} />
                  Verified account
                </div>
              </div>
            </div>

            <input
              value={user.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full p-3 rounded-xl border"
            />

            <input
              value={user.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full p-3 rounded-xl border"
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#FFA500] font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ================= PASSWORD (UPGRADED UX) ================= */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-lg font-bold">
              Security
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Strong password required
            </p>
          </div>

          <div className="p-6 space-y-5">

            {/* CURRENT */}
            <PasswordField
              label="Current Password"
              value={passwords.current}
              show={show.current}
              toggle={() =>
                setShow((v) => ({ ...v, current: !v.current }))
              }
              setValue={(v: string) =>
                setPasswords((p) => ({ ...p, current: v }))
              }
            />

            {/* NEW */}
            <PasswordField
              label="New Password"
              value={passwords.new}
              show={show.new}
              toggle={() =>
                setShow((v) => ({ ...v, new: !v.new }))
              }
              setValue={(v: string) =>
                setPasswords((p) => ({ ...p, new: v }))
              }
            />

            {/* STRENGTH */}
            {passwords.new && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5F021F] transition-all"
                    style={{ width: `${strength * 25}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {strength >= 3 ? (
                    <CheckCircle2 className="text-green-500" size={14} />
                  ) : (
                    <XCircle className="text-red-500" size={14} />
                  )}
                  {strength < 3 ? "Weak password" : "Strong enough"}
                </div>
              </div>
            )}

            {/* CONFIRM */}
            <PasswordField
              label="Confirm Password"
              value={passwords.confirm}
              show={show.confirm}
              toggle={() =>
                setShow((v) => ({ ...v, confirm: !v.confirm }))
              }
              setValue={(v: string) =>
                setPasswords((p) => ({ ...p, confirm: v }))
              }
            />

            {passwords.confirm.length > 0 && (
              <p
                className={`text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"
                  }`}
              >
                {passwordsMatch
                  ? "Passwords match"
                  : "Passwords do not match"}
              </p>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={
                changingPassword ||
                !passwords.current ||
                !passwords.new ||
                !passwords.confirm ||
                !passwordsMatch
              }
              className="w-full py-3 rounded-xl bg-[#5F021F] text-white font-semibold disabled:opacity-40"
            >
              {changingPassword
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* =======================
   TYPED INPUT COMPONENT (FIXES YOUR TS ERROR)
======================= */
function PasswordField({
  label,
  value,
  show,
  toggle,
  setValue,
}: {
  label: string;
  value: string;
  show: boolean;
  toggle: () => void;
  setValue: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>

      <div className="relative mt-1">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-3 rounded-xl border pr-10"
        />

        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-3 text-gray-500"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}