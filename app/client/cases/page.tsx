// app/client/cases/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronRight,
  Loader2,
  Search,
  Scale,
} from "lucide-react";

type CaseItem = {
  id: string;
  title: string;
  caseNumber: string;
  status: string;
  lawyer?: {
    name: string;
  };
};

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "closed":
      return "bg-gray-100 text-gray-700 border border-gray-200";
    default:
      return "bg-[#FFF4E0] text-[#5F021F] border border-[#F3D5A4]";
  }
}

export default function ClientCasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/clients/dashboard", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const data = await res.json();

        // ✅ FIX: matters come from client object
        const matters = data.client?.matters || [];

        setCases(matters);
      } catch (err) {
        console.error(err);
        setCases([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.lawyer?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : c.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [cases, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#5F021F]">
        <Loader2 className="animate-spin" size={18} />
        <span>Loading cases...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#5F021F]">
            My Cases
          </h1>

          <p className="mt-2 text-sm text-[#5F021F]/70">
            Track your legal matters, updates, and lawyer activity.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#E7D3B0] bg-white px-5 py-4 shadow-sm">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4E0]">
            <BriefcaseBusiness className="text-[#5F021F]" size={22} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#5F021F]/60">
              Total Cases
            </p>

            <h3 className="text-2xl font-bold text-[#5F021F]">
              {cases.length}
            </h3>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#F1E1C6] bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">

        {/* SEARCH */}
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5F021F]/50"
          />

          <input
            type="text"
            placeholder="Search case title, number, lawyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-2xl border border-[#E8D8BE] bg-[#FFFCF7] pl-11 pr-4 text-sm outline-none transition focus:border-[#FFA500]"
          />
        </div>

        {/* STATUS */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-2xl border border-[#E8D8BE] bg-[#FFFCF7] px-4 text-sm outline-none focus:border-[#FFA500]"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* EMPTY */}
      {!filteredCases.length ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E2C99B] bg-[#FFF8EE] px-6 py-20 text-center">

          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFE7B8]">
            <Scale className="text-[#5F021F]" size={34} />
          </div>

          <h2 className="text-xl font-semibold text-[#5F021F]">
            No Cases Found
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#5F021F]/70">
            You currently do not have any matching legal matters in your dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredCases.map((c) => (
            <Link
              key={c.id}
              href={`/client/cases/${c.id}`}
              className="group"
            >
              <div className="rounded-3xl border border-[#F0DFC2] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FFC56D] hover:shadow-xl">

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* LEFT */}
                  <div className="space-y-4">

                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>

                      <span className="text-xs font-medium tracking-wide text-[#5F021F]/50">
                        {c.caseNumber}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-[#5F021F] transition group-hover:text-[#B86D00]">
                        {c.title}
                      </h2>

                      <p className="mt-2 text-sm text-[#5F021F]/70">
                        Assigned Lawyer:{" "}
                        <span className="font-medium text-[#5F021F]">
                          {c.lawyer?.name || "Not assigned"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-2 text-sm font-medium text-[#B86D00]">
                    View Details

                    <ChevronRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}