"use client";

import { useEffect, useState } from "react";

interface Case {
  id: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  lawyer: string;
  client: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Case["status"] | "ALL">("ALL");

  useEffect(() => {
    async function fetchCases() {
      const res = await fetch("/api/admin/matters");
      const data: Case[] = await res.json();
      setCases(data);
    }
    fetchCases();
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                          c.lawyer.toLowerCase().includes(search.toLowerCase()) ||
                          c.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[#5F021F]">Cases</h1>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="search"
          placeholder="Search cases, lawyer, client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Case["status"] | "ALL")}
          className="px-4 py-2 rounded-xl border border-[#5F021F]/30 outline-none w-full sm:w-48"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow border border-[#5F021F]/20">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#FFD6A5]">
            <tr>
              <th className="px-4 py-3 border">Title</th>
              <th className="px-4 py-3 border">Lawyer</th>
              <th className="px-4 py-3 border">Client</th>
              <th className="px-4 py-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(c => (
              <tr key={c.id} className="hover:bg-[#FFE8B2]">
                <td className="px-4 py-3 border">{c.title}</td>
                <td className="px-4 py-3 border">{c.lawyer}</td>
                <td className="px-4 py-3 border">{c.client}</td>
                <td className={`px-4 py-3 border font-semibold ${
                  c.status === "OPEN" ? "text-green-600" :
                  c.status === "IN_PROGRESS" ? "text-orange-600" :
                  "text-gray-600"
                }`}>{c.status.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCases.length === 0 && (
          <p className="text-center p-4 text-[#5F021F]/70">No cases found.</p>
        )}
      </div>
    </div>
  );
}