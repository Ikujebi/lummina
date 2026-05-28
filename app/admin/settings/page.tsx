"use client";

import { ChangeEvent, useState } from "react";

import { useAdminProfile } from "./components/useAdminProfile";
import { usePassword } from "./components/usePassword";
import { useImageUpload } from "./components/useImageUpload";

import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import PasswordForm from "./components/PasswordForm";

export default function SettingsPage() {
  const { profile, setProfile, loading } = useAdminProfile();

  const {
    passwords,
    setPasswords,
    changePassword,
    loading: pwLoading,
    strength,
  } = usePassword();

  // ✅ FIX: include message here
  const {
    uploadImage,
    uploading,
    preview,
    message,
  } = useImageUpload();

  const [saving, setSaving] = useState(false);

  /* =========================
     PROFILE UPDATE
  ========================= */
  async function handleProfileSave() {
    try {
      setSaving(true);

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          profilePicture: profile.profilePicture,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.admin);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     IMAGE CHANGE
  ========================= */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      uploadImage(file, profile, setProfile);
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#5F021F]">
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* PROFILE */}
      <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#FFF4E0] to-white">
          <ProfileHeader
            profile={profile}
            preview={preview}
            uploading={uploading}
            onFileChange={handleFileChange}
            message={message}  
          />
        </div>

        <div className="p-8">
          <ProfileForm
            profile={profile}
            setProfile={setProfile}
            onSave={handleProfileSave}
            saving={saving}
          />
        </div>
      </section>

      {/* PASSWORD */}
      <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
        <PasswordForm
          passwords={passwords}
          setPasswords={setPasswords}
          onChangePassword={changePassword}
          loading={pwLoading}
          strength={strength}
        />
      </section>
    </div>
  );
}