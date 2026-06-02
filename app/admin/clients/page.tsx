"use client";

import { useEffect, useState } from "react";
import UsersTable from "../../components/admin-dashboard/users/UsersTable";
import { User } from "@/types/admin";
import { approveUser, deleteUser, updateUser } from "@/lib/api/users";
import { message, Modal } from "antd";
export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // invite modal state
  const [openInvite, setOpenInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExpiry, setInviteExpiry] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      const usersArray: User[] = Array.isArray(data)
        ? data
        : (data.users ?? []);

      setClients(usersArray.filter((u) => u.role === "CLIENT"));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter((u) =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

async function sendInvite() {
  setError("");

  if (!inviteEmail) {
    setError("Email is required.");
    return;
  }

  if (!inviteExpiry) {
    setError("Please select an invitation expiry date.");
    return;
  }

  setSending(true);

  try {
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        role: "CLIENT",
        expiresAt: inviteExpiry,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to send invitation");
    }

    setInviteEmail("");
    setInviteExpiry("");
    setError("");
    setOpenInvite(false);

    message.success("Invitation sent successfully");

    await fetchClients();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to send invitation"
    );

    console.error("Invite failed:", err);
  } finally {
    setSending(false);
  }
}

  return (
    <div className="flex flex-col gap-6 text-[#5F021F]/70">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold ">Clients</h1>

        <button
          onClick={() => setOpenInvite(true)}
          className="bg-[#5F021F] text-white px-4 py-2 rounded-xl hover:bg-[#430116] transition"
        >
          Invite Client
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="search"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64 text-[#5F021F]"
      />

      {/* TABLE */}
      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <UsersTable
          users={filteredClients}
          // ✅ FIXED HERE
         onApprove={async (user) => {
  try {
    await approveUser(user.id);

    setClients((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, isApproved: true }
          : u
      )
    );

    message.success("Client approved");
  } catch {
    message.error("Failed to approve client");
  }
}}
         onSave={async (updatedUser) => {
  try {
    await updateUser(updatedUser);

    setClients((prev) =>
      prev.map((u) =>
        u.id === updatedUser.id
          ? updatedUser
          : u
      )
    );

    message.success("Client updated");
  } catch {
    message.error("Failed to update client");
  }
}}
          // ✅ FIXED HERE
          onDelete={async (user) => {
  Modal.confirm({
    title: "Delete Client",
    content: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",

    async onOk() {
      try {
        await deleteUser(user.id);

        setClients((prev) =>
          prev.filter((u) => u.id !== user.id)
        );

        message.success("Client deleted successfully");
      } catch {
        message.error("Failed to delete client");
      }
    },
  });
}}
        />
      )}

      {/* ================= INVITE MODAL ================= */}
      {openInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-[#5F021F]">
          <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold ">
              Invite Client
            </h2>

            <input
              type="email"
              placeholder="Client email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F021F]"
            />

            <div>
              <label className="block text-sm font-medium  mb-1">
                Invitation Expiry Date
              </label>

              <input
                type="datetime-local"
                value={inviteExpiry}
                onChange={(e) => setInviteExpiry(e.target.value)}
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F021F]"
              />
            </div>
            {error && (
  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
    {error}
  </p>
)}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenInvite(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={sendInvite}
                disabled={sending}
                className="bg-[#5F021F] text-white px-4 py-2 rounded-lg"
              >
                {sending ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
