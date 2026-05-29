"use client";

import { useEffect, useState } from "react";
import UsersTable from "../../components/admin-dashboard/users/UsersTable";
import { User } from "@/types/admin";
import { approveUser, deleteUser, updateUser } from "@/lib/api/users";

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // invite modal state
  const [openInvite, setOpenInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteExpiry, setInviteExpiry] = useState("");
  const [sending, setSending] = useState(false);

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
        : data.users ?? [];

      setClients(usersArray.filter((u) => u.role === "CLIENT"));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter((u) =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function sendInvite() {
    if (!inviteEmail || !inviteExpiry) return;

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

      if (!res.ok) throw new Error(data.error || "Failed");

      setInviteEmail("");
      setInviteExpiry("");
      setOpenInvite(false);

      await fetchClients();
    } catch (err) {
      console.error("Invite failed:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#5F021F]">
          Clients
        </h1>

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
        className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64"
      />

      {/* TABLE */}
      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <UsersTable
          users={filteredClients}

          // ✅ FIXED HERE
          onApprove={async (user) => {
            await approveUser(user.id);

            setClients((prev) =>
              prev.map((u) =>
                u.id === user.id
                  ? { ...u, isApproved: true }
                  : u
              )
            );
          }}

          onSave={async (updatedUser) => {
            await updateUser(updatedUser);

            setClients((prev) =>
              prev.map((u) =>
                u.id === updatedUser.id
                  ? updatedUser
                  : u
              )
            );
          }}

          // ✅ FIXED HERE
          onDelete={async (user) => {
            await deleteUser(user.id);

            setClients((prev) =>
              prev.filter((u) => u.id !== user.id)
            );
          }}
        />
      )}

      {/* ================= INVITE MODAL ================= */}
      {openInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">

            <h2 className="text-lg font-semibold text-[#5F021F]">
              Invite Client
            </h2>

            <input
              type="email"
              placeholder="Client email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />

            <input
              type="datetime-local"
              value={inviteExpiry}
              onChange={(e) => setInviteExpiry(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />

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