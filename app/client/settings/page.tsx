"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
};

export default function ClientSettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  function updateField(field: keyof User, value: string) {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
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

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-[#5F021F]">Loading settings...</p>;
  }

  if (!user) {
    return <p className="text-red-600">Failed to load user</p>;
  }

  return (
    <div className="max-w-xl space-y-6">

      <h1 className="text-2xl font-bold text-[#5F021F]">
        Settings
      </h1>

      {/* PROFILE */}
      <div className="bg-[#FFF4E0] p-6 rounded-xl space-y-4">

        <div>
          <p className="text-sm text-[#5F021F]/60">Full Name</p>
          <input
            value={user.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-3 py-2 rounded bg-white"
          />
        </div>

        <div>
          <p className="text-sm text-[#5F021F]/60">Email</p>
          <input
            value={user.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-3 py-2 rounded bg-white"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#FFA500] text-[#5F021F] rounded-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  );
}