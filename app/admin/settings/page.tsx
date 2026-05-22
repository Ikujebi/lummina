"use client";

import { useEffect, useState, ChangeEvent } from "react";

import Image from "next/image";

import { Eye, EyeOff, Camera, Loader2, ShieldCheck } from "lucide-react";

import adminPhoto from "@/public/img/careers.jpg";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

/* =========================
   PASSWORD STRENGTH
========================= */
function getStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile>({
    id: "",
    name: "",
    email: "",
    profilePicture: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const [preview, setPreview] = useState("");

  // PASSWORD STATE
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // TOGGLE PASSWORD VISIBILITY
  const [showCurrent, setShowCurrent] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getStrength(passwords.new);

  /* =========================
     FETCH PROFILE
  ========================= */
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/admin/profile");

        const data = await res.json();

        if (data.success && data.admin) {
          setProfile(data.admin);
        } else {
          setMessage({
            text: "Failed to load profile",
            type: "error",
          });
        }
      } catch (err) {
        console.error(err);

        setMessage({
          text: "Failed to load profile",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  /* =========================
     CLOUDINARY UPLOAD
  ========================= */
  async function handleImageUpload(file: File) {
    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "Upload failed");
      }

      // UPDATE PROFILE IN DB IMMEDIATELY
      const updatedProfile = {
        name: profile.name,
        email: profile.email,
        profilePicture: uploadData.fileUrl,
      };

      const saveRes = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      const saveData = await saveRes.json();

      if (!saveData.success) {
        throw new Error(saveData.error || "Failed to save profile");
      }

      setProfile(saveData.admin);

      setPreview(uploadData.fileUrl);

      setMessage({
        text: "Profile picture updated successfully",
        type: "success",
      });
    } catch (err) {
      console.error(err);

      setMessage({
        text: "Image upload failed",
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  }

  /* =========================
     FILE CHANGE
  ========================= */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    await handleImageUpload(file);
  };

  /* =========================
     UPDATE PROFILE
  ========================= */
  async function handleProfileUpdate() {
    try {
      setSaving(true);

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          profilePicture: profile.profilePicture,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.admin);

        setMessage({
          text: "Profile updated successfully",
          type: "success",
        });
      } else {
        setMessage({
          text: data.error || "Profile update failed",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);

      setMessage({
        text: "Profile update failed",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     CHANGE PASSWORD
  ========================= */
  async function handlePasswordChange() {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setMessage({
        text: "All password fields are required",
        type: "error",
      });

      return;
    }

    if (passwords.new !== passwords.confirm) {
      setMessage({
        text: "New passwords do not match",
        type: "error",
      });

      return;
    }

    if (strength < 3) {
      setMessage({
        text: "Password is too weak",
        type: "error",
      });

      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Password change failed");
      }

      setMessage({
        text: "Password changed successfully",
        type: "success",
      });

      setPasswords({
        current: "",
        new: "",
        confirm: "",
      });

      // OPTIONAL AUTO LOGOUT
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error(err);

      setMessage({
        text: err instanceof Error ? err.message : "Password change failed",
        type: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#5F021F]">
        <Loader2 className="animate-spin" />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#5F021F]">
          Account Settings
        </h1>

        <p className="text-sm text-[#5F021F]/70 mt-1">
          Manage your profile, security, and account preferences.
        </p>
      </div>

      {/* MESSAGE */}
      {message.text && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ================= PROFILE ================= */}
      <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        {/* TOP */}
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#FFF4E0] to-white">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* IMAGE */}
            <div className="relative w-28 h-28 group">
              <Image
                src={preview || profile.profilePicture || adminPhoto}
                alt="Admin profile"
                fill
                sizes="
    (max-width: 640px) 5.5rem,
    (max-width: 768px) 6.5rem,
    7rem
  "
                className="rounded-full object-cover border-4 border-white shadow-xl"
              />

              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                {uploading ? (
                  <Loader2 className="text-white animate-spin" />
                ) : (
                  <Camera className="text-white" />
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* INFO */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#5F021F]">
                {profile.name}
              </h2>

              <p className="text-[#5F021F]/70">{profile.email}</p>

              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[#5F021F]/5 border border-[#5F021F]/10">
                <ShieldCheck size={14} className="text-[#FFA500]" />

                <span className="text-xs font-semibold text-[#5F021F]">
                  Administrator Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              onClick={handleProfileUpdate}
              disabled={saving}
              className="h-12 px-6 rounded-2xl bg-[#5F021F] hover:bg-[#430116] text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={18} />}

              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </div>
      </section>

      {/* ================= PASSWORD ================= */}
      <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#5F021F]">Change Password</h2>

          <p className="text-sm text-[#5F021F]/70 mt-1">
            Use a strong password to keep your account secure.
          </p>
        </div>

        {/* CURRENT PASSWORD */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5F021F]">
            Current Password
          </label>

          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={passwords.current}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  current: e.target.value,
                })
              }
              className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
            />

            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* NEW PASSWORD */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5F021F]">
            New Password
          </label>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={passwords.new}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  new: e.target.value,
                })
              }
              className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
            />

            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* STRENGTH */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                strength === 1
                  ? "w-1/4 bg-red-500"
                  : strength === 2
                    ? "w-2/4 bg-orange-500"
                    : strength === 3
                      ? "w-3/4 bg-yellow-500"
                      : strength === 4
                        ? "w-full bg-green-500"
                        : "w-0"
              }`}
            />
          </div>

          <p className="text-xs text-gray-500">
            Use 8+ characters, uppercase, number, and symbol.
          </p>
        </div>

        {/* CONFIRM */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5F021F]">
            Confirm New Password
          </label>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirm: e.target.value,
                })
              }
              className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handlePasswordChange}
          disabled={changingPassword}
          className="h-12 px-6 rounded-2xl bg-[#5F021F] hover:bg-[#430116] text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {changingPassword && <Loader2 className="animate-spin" size={18} />}

          {changingPassword ? "Updating Password..." : "Change Password"}
        </button>
      </section>
    </div>
  );
}
