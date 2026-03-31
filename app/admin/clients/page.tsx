"use client";

import { useEffect, useState } from "react";
import UsersTable from "../../components/admin-dashboard/UsersTable";

interface User { id: string; name: string; email: string; role: "LAWYER" | "CLIENT" | "ADMIN"; }

export default function ClientsPage() {
  const [clients, setClients] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then(res => res.json()).then((data: User[]) => {
      setClients(data.filter(u => u.role === "CLIENT"));
    });
  }, []);

  const filteredClients = clients.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[#5F021F]">Clients</h1>
      <input
        type="search"
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64"
      />
      <UsersTable users={filteredClients} />
    </div>
  );
}