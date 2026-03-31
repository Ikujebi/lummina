"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/admin-dashboard/Sidebar";
import Image from "next/image";
import adminPhoto from "@/public/img/careers.jpg";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>({ id: "", name: "", email: "", profilePicture: "" });
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/admin/profile");
        const data = await res.json();
        setProfile(data);
      } catch {}
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: profile.name, email: profile.email, profilePicture: profile.profilePicture }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setMessage(data.success ? "Profile updated!" : "Update failed");
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match");
      return;
    }

    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setMessage(data.success ? "Password changed!" : data.error || "Update failed");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="flex-1 p-6 sm:p-10">
        <h1 className="text-2xl font-semibold text-[#5F021F] mb-6">Settings</h1>

        {/* Profile Section */}
        <section className="bg-[#FFF4E0] p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex gap-4 items-center mb-4">
            <Image src={profile.profilePicture || adminPhoto} alt="Profile" width={64} height={64} className="rounded-full object-cover" />
            <input
              type="text"
              placeholder="Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="p-2 rounded border border-gray-300 w-full"
            />
            <input
              type="email"
              placeholder="Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="p-2 rounded border border-gray-300 w-full"
            />
          </div>
          <button onClick={handleProfileUpdate} className="bg-[#5F021F] text-[#F7E7CE] px-4 py-2 rounded">Save Profile</button>
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
              className="p-2 rounded border border-gray-300 w-full"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="p-2 rounded border border-gray-300 w-full"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="p-2 rounded border border-gray-300 w-full"
            />
          </div>
          <button onClick={handlePasswordChange} className="mt-4 bg-[#5F021F] text-[#F7E7CE] px-4 py-2 rounded">Change Password</button>
        </section>

        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      </main>
    </div>
  );
}