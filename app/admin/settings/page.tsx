"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import adminPhoto from "@/public/img/careers.jpg";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile>({
    id: "",
    name: "",
    email: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error'
  const [newPicture, setNewPicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // Fetch profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/admin/profile");
        const data = await res.json();
        if (data.success && data.admin) {
          setProfile(data.admin);
        } else {
          setMessage({ text: "Failed to load profile", type: "error" });
        }
      } catch (err) {
        console.error(err);
        setMessage({ text: "Failed to load profile", type: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Handle profile update including picture
  const handleProfileUpdate = async () => {
    try {
      let profilePictureData = profile.profilePicture || "";
      if (newPicture) {
        const reader = new FileReader();
        reader.readAsDataURL(newPicture);
        profilePictureData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject("Failed to read file");
        });
      }

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          profilePicture: profilePictureData,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.admin);
        setNewPicture(null);
        setPreview("");
        setMessage({ text: "Profile updated!", type: "success" });
      } else {
        setMessage({ text: data.error || "Update failed", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Update failed", type: "error" });
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Password changed!", type: "success" });
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setMessage({ text: data.error || "Password change failed", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Password change failed", type: "error" });
    }
  };

  // Handle file input
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPicture(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  if (loading) return <p className="p-6 text-[#5F021F]">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">
      <main className="flex-1 p-6 sm:p-10">
        <h1 className="text-2xl font-semibold text-[#5F021F] mb-6">Settings</h1>

        {/* Profile Section */}
        <section className="bg-[#FFF4E0] p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex gap-4 items-center mb-4 flex-wrap">
            <div className="relative w-16 h-16">
              <Image
                src={preview || profile.profilePicture || adminPhoto}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-[#5F021F]"
            />
          </div>
          <div className="flex gap-4 flex-wrap mb-4">
            <input
              type="text"
              placeholder="Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="p-2 rounded border border-[#5F021F] text-[#5F021F] w-full max-w-xs"
            />
            <input
              type="email"
              placeholder="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="p-2 rounded border border-[#5F021F] text-[#5F021F] w-full max-w-xs"
            />
          </div>
          <button
            onClick={handleProfileUpdate}
            className="bg-[#5F021F] text-[#F7E7CE] px-4 py-2 rounded mt-2"
          >
            Save Profile
          </button>
        </section>

        {/* Password Section */}
        <section className="bg-[#FFF4E0] p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="flex flex-col gap-3 max-w-md">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="p-2 rounded border border-[#5F021F] text-[#5F021F] w-full"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="p-2 rounded border border-[#5F021F] text-[#5F021F] w-full"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="p-2 rounded border border-[#5F021F] text-[#5F021F] w-full"
            />
          </div>
          <button
            onClick={handlePasswordChange}
            className="mt-4 bg-[#5F021F] text-[#F7E7CE] px-4 py-2 rounded"
          >
            Change Password
          </button>
        </section>

        {message.text && (
          <p
            className={`mt-4 text-sm ${
              message.type === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </main>
    </div>
  );
}