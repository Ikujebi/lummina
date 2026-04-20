"use client";

import { useEffect, useState } from "react";
import UsersTable from "../../components/admin-dashboard/UsersTable";
import { approveUser } from "@/lib/api/users";

interface User {
  id: string;
  name: string;
  email: string;
  role: "LAWYER" | "CLIENT" | "ADMIN";
  isApproved: boolean;
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
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
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
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4 md:p-4">
      {/* Inline message */}
      {message && (
        <div className="flex flex-col gap-2 border rounded bg-[#F7E7CE] w-full max-w-[16rem] md:max-w-[600px] mx-auto p-4 text-sm sm:text-base overflow-x-auto">
          {message}
        </div>
      )}

      {/* Header */}
      <section className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="w-full sm:max-w-[70%] break-words">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#5F021F]">
            Lawyers
          </h1>
          <p className="text-xs md:text-sm text-[#5F021F]/70">
            Manage all lawyers in the system, add new ones or send Invite.
          </p>
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="text-2xl sm:text-3xl font-bold text-[#5F021F] hover:text-[#7a0230]"
          >
            +
          </button>

          <button
            onClick={() => setShowInviteForm((prev) => !prev)}
            className="bg-[#021F5F]/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#03287a]"
          >
            Invite Lawyer
          </button>
        </div>
      </section>

      {/* Add Lawyer Form */}
      {showForm && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end w-full">
          <div className="flex flex-col gap-2 w-[54%] sm:w-auto">
            <input
              type="text"
              placeholder="Name"
              value={newLawyerName}
              onChange={(e) => setNewLawyerName(e.target.value)}
              className="px-3 py-2 border rounded"
            />

            <input
              type="email"
              placeholder="Email"
              value={newLawyerEmail}
              onChange={(e) => setNewLawyerEmail(e.target.value)}
              className="px-3 py-2 border rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={newLawyerPassword}
              onChange={(e) => setNewLawyerPassword(e.target.value)}
              className="px-3 py-2 border rounded"
            />

            <button
              onClick={addLawyer}
              className="bg-[#5F021F] text-white px-4 py-2 rounded"
            >
              Add Lawyer
            </button>
          </div>
        </div>
      )}

      {/* Invite Form */}
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
              className="bg-[#5F021F] text-white px-4 py-2 rounded"
            >
              Send Invite
            </button>

            <button
              onClick={() => setShowInviteForm(false)}
              className="bg-gray-300 px-4 py-2 rounded"
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
        className="px-4 py-2 border rounded-xl"
      />

      {/* Table */}
      {loading ? (
        <p>Loading lawyers...</p>
      ) : (
        <UsersTable
          users={filteredLawyers}

          /* =======================
             APPROVE (UNCHANGED)
          ======================= */
          onApprove={async (id) => {
            try {
              await approveUser(id);

              setLawyers((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, isApproved: true } : u,
                ),
              );

              setMessage("User approved successfully");
            } catch (err) {
              console.error(err);
              setMessage("Failed to approve user");
            }
          }}

          /* =======================
             EDIT (NOW REAL BACKEND)
          ======================= */
          onSave={async (updatedUser) => {
            try {
              const res = await fetch(`/api/admin/users/${updatedUser.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: updatedUser.name,
                  email: updatedUser.email,
                  role: updatedUser.role,
                  isApproved: updatedUser.isApproved,
                }),
              });

              const data = await res.json();

              if (!res.ok) {
                setMessage(data.error || "Failed to update user");
                return;
              }

              setLawyers((prev) =>
                prev.map((u) =>
                  u.id === updatedUser.id ? data.user : u
                )
              );

              setMessage("User updated successfully");
            } catch (err) {
              console.error(err);
              setMessage("Failed to update user");
            }
          }}

          /* =======================
             DELETE (NOW REAL BACKEND)
          ======================= */
          onDelete={async (id) => {
            try {
              const res = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
              });

              const data = await res.json();

              if (!res.ok) {
                setMessage(data.error || "Failed to delete user");
                return;
              }

              setLawyers((prev) =>
                prev.filter((u) => u.id !== id),
              );

              setMessage("User deleted successfully");
            } catch (err) {
              console.error(err);
              setMessage("Failed to delete user");
            }
          }}
        />
      )}
    </div>
  );
}