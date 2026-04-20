"use client";

import { useEffect, useState } from "react";

import StatsWidgets from "@/app/components/lawyer-dashboard/StatsWidgets";
import CasesGrid from "@/app/components/lawyer-dashboard/CasesGrid";
import ChartsSection from "@/app/components/lawyer-dashboard/ChartsSection";
import ProcessHistory from "@/app/components/lawyer-dashboard/ProcessHistory";
import AlertsPanel from "@/app/components/lawyer-dashboard/AlertsPanel";

import type { LawyerMatter, LawyerStats } from "@/types/lawyer";

export default function LawyerDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // ✅ FIX 1: No nullable stats (prevents TS + runtime issues)
  const [stats, setStats] = useState<LawyerStats>({
    activeMatters: 0,
    completedMatters: 0,
    totalMatters: 0,
  });

  const [matters, setMatters] = useState<LawyerMatter[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/lawyer/dashboard");
        const data = await res.json();

        // ✅ safe assignments
        setMatters(data.matters || []);
        setStats(data.stats || {
          activeMatters: 0,
          completedMatters: 0,
          totalMatters: 0,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }

    load();
  }, []);

  // 🔍 filter matters safely
  const filteredMatters = matters
    .filter((m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.caseNumber.toLowerCase().includes(search.toLowerCase())
    )
    .filter((m) =>
      statusFilter === "All Status" || m.status === statusFilter
    );

  // 📊 widgets from stats
  const widgetsData = [
    { label: "Active Matters", value: String(stats.activeMatters) },
    { label: "Completed Matters", value: String(stats.completedMatters) },
    { label: "Total Matters", value: String(stats.totalMatters) },
  ];

  return (
    <div className="flex flex-col gap-10">

      {/* HERO */}
      <section className="flex flex-col lg:flex-row justify-between gap-6">
        <div>
          <p className="text-xs text-[#FFA500] uppercase">
            Active Matters
          </p>
          <h1 className="text-3xl font-semibold text-[#5F021F]">
            Welcome back, here are your matters.
          </h1>
        </div>

        <div className="flex gap-3">
          <input
            type="search"
            placeholder="Search matter"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#FFF4E0]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#FFF4E0]"
          >
            {["All Status", "OPEN", "IN_PROGRESS", "PENDING", "CLOSED"].map(
              (s) => (
                <option key={s}>{s}</option>
              )
            )}
          </select>
        </div>
      </section>

      {/* STATS */}
      <StatsWidgets widgets={widgetsData} />

      {/* CASES */}
      <CasesGrid cases={filteredMatters} />

      {/* CHARTS + HISTORY */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartsSection />
        <ProcessHistory />
      </div>

      {/* ALERTS */}
      <AlertsPanel alerts={[]} />
    </div>
  );
}