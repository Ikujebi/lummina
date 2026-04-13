"use client";

import { useEffect, useState } from "react";
import UsersTable from "../../components/admin-dashboard/UsersTable";
import { User } from "@/types/admin";
import {
  approveUser,
  deleteUser,
  updateUser,
} from "@/lib/api/users";

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-[#5F021F]">
        Clients
      </h1>

      {/* Search */}
      <input
        type="search"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64"
      />

      {/* Loading */}
      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <UsersTable
          users={filteredClients}
          onApprove={async (id) => {
            try {
              await approveUser(id);

              setClients((prev) =>
                prev.map((u) =>
                  u.id === id
                    ? { ...u, isApproved: true }
                    : u
                )
              );
            } catch (err) {
              console.error("Approve failed:", err);
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
            } catch (err) {
              console.error("Update failed:", err);
            }
          }}
          onDelete={async (id) => {
            try {
              await deleteUser(id);

              setClients((prev) =>
                prev.filter((u) => u.id !== id)
              );
            } catch (err) {
              console.error("Delete failed:", err);
            }
          }}
        />
      )}
    </div>
  );
}