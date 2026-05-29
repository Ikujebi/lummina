"use client";

import { useEffect, useState } from "react";
import UsersTable from "../../components/admin-dashboard/users/UsersTable";
import { approveUser } from "@/lib/api/users";
import { message } from "antd";

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

  useEffect(() => {
    const fetchLawyers = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();

        setLawyers(
          data.users.filter((u: User) => u.role === "LAWYER"),
        );
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch lawyers");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  const addLawyer = async () => {
    if (!newLawyerName || !newLawyerEmail || !newLawyerPassword) {
      message.warning("Please fill all fields");
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
        message.success("Lawyer added successfully");
      } else {
        message.error(data.error || "Failed to add lawyer");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to add lawyer");
    }
  };

  const inviteLawyer = async () => {
    if (!inviteEmail) {
      message.warning("Please enter an email");
      return;
    }

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: "LAWYER",
        }),
      });

      const data = await res.json();

      if (data.invitation) {
        message.success("Invitation sent successfully");
        setInviteEmail("");
        setShowInviteForm(false);
      } else {
        message.error(data.error || "Failed to send invitation");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to send invitation");
    }
  };

  const filteredLawyers = lawyers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4 md:p-4">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="w-full sm:max-w-[70%]">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#5F021F]">
            Lawyers
          </h1>
          <p className="text-xs md:text-sm text-[#5F021F]/70">
            Manage all lawyers in the system, add new ones or send invite.
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
            className="bg-[#021F5F]/90 text-white px-3 sm:px-4 py-2 rounded hover:bg-[#03287a]"
          >
            Invite Lawyer
          </button>
        </div>
      </section>

      {/* Add Lawyer Form */}
      {showForm && (
        <div className="flex flex-col gap-2 w-full sm:w-96 border p-4 rounded">
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
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <div className="flex flex-col gap-2 p-4 border rounded bg-[#F7E7CE] w-full sm:w-96">
          <input
            type="email"
            placeholder="Lawyer's Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="px-3 py-2 border rounded text-[#5F021F]  outline-none focus:outline-none focus:ring-0"
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
        className="px-4 py-2 border rounded-xl text-[#5F021F] outline-none focus:ring-0"
      />

      {/* Table */}
      {loading ? (
        <p>Loading lawyers...</p>
      ) : (
        <UsersTable
          users={filteredLawyers}
          onApprove={async (user) => {
            await approveUser(user.id);

            setLawyers((prev) =>
              prev.map((u) =>
                u.id === user.id ? { ...u, isApproved: true } : u,
              ),
            );

            message.success("User approved successfully");
          }}
          onSave={async (updatedUser) => {
            const res = await fetch(`/api/admin/users/${updatedUser.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedUser),
            });

            const data = await res.json();

            if (!res.ok) {
              message.error(data.error);
              return;
            }

            setLawyers((prev) =>
              prev.map((u) =>
                u.id === updatedUser.id ? data.user : u,
              ),
            );

            message.success("User updated successfully");
          }}
          onDelete={async (user) => {
            await fetch(`/api/admin/users/${user.id}`, {
              method: "DELETE",
            });

            setLawyers((prev) =>
              prev.filter((u) => u.id !== user.id),
            );

            message.success("User deleted successfully");
          }}
        />
      )}
    </div>
  );
}