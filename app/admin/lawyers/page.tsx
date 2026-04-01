"use client";

import { useEffect, useState } from "react";
import UsersTable from "../../components/admin-dashboard/UsersTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: "LAWYER" | "CLIENT" | "ADMIN";
}

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const [newLawyerName, setNewLawyerName] = useState("");
  const [newLawyerEmail, setNewLawyerEmail] = useState("");
  const [newLawyerPassword, setNewLawyerPassword] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLawyers();
  }, []);

  async function fetchLawyers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setLawyers(data.users.filter((u: User) => u.role === "LAWYER"));
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch lawyers");
    } finally {
      setLoading(false);
    }
  }

  const addLawyer = async () => {
    if (!newLawyerName || !newLawyerEmail || !newLawyerPassword) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLawyerName,
          email: newLawyerEmail,
          password: newLawyerPassword,
          role: "LAWYER",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLawyers((prev) => [...prev, data.user]);
        setNewLawyerName("");
        setNewLawyerEmail("");
        setNewLawyerPassword("");
        setShowForm(false);
        setMessage("Lawyer added successfully");
      } else {
        setMessage(data.error || "Failed to add lawyer");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to add lawyer");
    }
  };

  const inviteLawyer = async () => {
    if (!inviteEmail) {
      setMessage("Please enter an email");
      return;
    }

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: "LAWYER",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.invitation) {
        setMessage("Invitation sent successfully");
        setInviteEmail("");
        setShowInviteForm(false);
      } else {
        setMessage(data.error || "Failed to send invitation");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to send invitation");
    }
  };

  const filteredLawyers = lawyers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Inline message */}
      {message && (
        <div className="p-3 bg-yellow-100 text-yellow-900 rounded">
          {message}
        </div>
      )}

      <section className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#5F021F]">Lawyers</h1>
          <p className="text-sm text-[#5F021F]/70">
            Manage all lawyers in the system, add new ones or send invitations.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="text-3xl font-bold text-[#5F021F] hover:text-[#7a0230] transition"
          >
            +
          </button>
          <button
            onClick={() => setShowInviteForm((prev) => !prev)}
            className="bg-[#021F5F]/90 text-white px-4 py-2 rounded hover:bg-[#03287a]"
          >
            Invite Lawyer
          </button>
        </div>
      </section>

      {/* Add Lawyer Form */}
      {showForm && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Name"
              value={newLawyerName}
              onChange={(e) => setNewLawyerName(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newLawyerEmail}
              onChange={(e) => setNewLawyerEmail(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={newLawyerPassword}
              onChange={(e) => setNewLawyerPassword(e.target.value)}
              className="px-4 py-2 border rounded"
            />
            <button
              onClick={addLawyer}
              className="bg-[#5F021F] text-white px-4 py-2 rounded hover:bg-[#7a0230]"
            >
              Add Lawyer
            </button>
          </div>
        </div>
      )}

      {/* Invite Lawyer Form */}
      {showInviteForm && (
        <div className="flex flex-col gap-2 p-4 border rounded bg-[#F7E7CE] w-full sm:w-96">
          <input
            type="email"
            placeholder="Lawyer's Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={inviteLawyer}
              className="bg-[#5F021F] text-white px-4 py-2 rounded hover:bg-[#7a0230]"
            >
              Send Invite
            </button>
            <button
              onClick={() => setShowInviteForm(false)}
              className="bg-gray-300 text-[#5F021F] px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="search"
        placeholder="Search lawyers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64"
      />

      {/* Table */}
      {loading ? <p>Loading lawyers...</p> : <UsersTable users={filteredLawyers} />}
    </div>
  );
}