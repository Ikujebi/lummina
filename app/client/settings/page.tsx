"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { useClientImageUpload } from "@/hooks/useClientImageUpload";

type User = {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
};

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

export default function ClientSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  // PASSWORD STATE
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // TOGGLE VISIBILITY
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(newPassword);
  const {
    uploadImage,
    uploading,
    preview,
    setPreview,
    uploadProgress,
    message,
  } = useClientImageUpload();
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) throw new Error("Failed to load user");

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

  useEffect(() => {
    if (user?.profilePicture) {
      setPreview(user.profilePicture);
    }
  }, [user, setPreview]);
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
     IMAGE UPLOAD
  ======================= */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file || !user) return;

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
          email: user.email,
          profilePicture: user.profilePicture,
        }),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }

      const data = await res.json();

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
  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
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
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed");
      }

      alert("Password updated successfully. Please log in again.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // redirect to login after logout
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Password update failed");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return <p className="text-[#5F021F] font-medium">Loading settings...</p>;
  }

  if (!user) {
    return <p className="text-red-600">Failed to load user</p>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#5F021F]">
          Account Settings
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your account information and security settings.
        </p>
      </div>

      {/* ================= PROFILE ================= */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-[#5F021F]">
            Profile Information
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* PROFILE IMAGE */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#FFA500]/20 shadow-md bg-[#5F021F]">
                {preview || user.profilePicture ? (
                  <Image
                    src={preview || user.profilePicture || ""}
                    alt={user.name}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-[#FFA500] text-[#5F021F] flex items-center justify-center shadow-lg hover:scale-105 transition"
              >
                {uploading ? (
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
                onChange={handleImageUpload}
              />
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#5F021F]">{user.name}</h3>

              <p className="text-sm text-gray-500">{user.email}</p>

              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG or WEBP supported
              </p>
              {message.text && (
                <p
                  className={`mt-2 text-sm ${
                    message.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message.text}
                </p>
              )}
              {uploading && (
  <div className="mt-3 w-56">
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#FFA500] transition-all"
        style={{ width: `${uploadProgress}%` }}
      />
    </div>

    <p className="text-xs text-gray-500 mt-1">
      Uploading... {uploadProgress}%
    </p>
  </div>
)}
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <p className="text-sm font-medium text-[#5F021F]/70 mb-2">
              Email Address
            </p>

            <input
              value={user.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="
                w-full
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                outline-none
                focus:border-[#FFA500]
                focus:ring-4
                focus:ring-[#FFA500]/10
                transition
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
              hover:scale-[1.02]
              transition
              disabled:opacity-50
            "
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ================= PASSWORD ================= */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-[#5F021F]">Change Password</h2>

          <p className="text-sm text-gray-500 mt-1">
            After changing your password, you will be logged out automatically.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* CURRENT PASSWORD */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Current Password
            </p>

            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-3.5 text-gray-500"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              New Password
            </p>

            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
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
              Use at least 8 characters including uppercase, number and symbol.
            </p>
          </div>

          {/* CONFIRM */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">
              Confirm Password
            </p>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-3.5 text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleChangePassword}
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
              hover:scale-[1.02]
              transition
              disabled:opacity-50
            "
          >
            {changingPassword ? "Updating Password..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
