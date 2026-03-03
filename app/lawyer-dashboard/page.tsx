"use client";

import Image from "next/image";
import { useState } from "react";
import lawyerPhoto from "@/public/img/careers.jpg";

import StatsWidgets from "../components/lawyer-dashboard/StatsWidgets";
import CasesGrid from "../components/lawyer-dashboard/CasesGrid";
import ChartsSection from "../components/lawyer-dashboard/ChartsSection";
import ProcessHistory from "../components/lawyer-dashboard/ProcessHistory";
import AlertsPanel from "../components/lawyer-dashboard/AlertsPanel";

interface Case { id: string; client: string; stage: string; progress: number; update: string; }
interface Widget { label: string; value: string; trend?: string; trendUp?: boolean; }
interface Alert { title: string; meta: string; actionText: string; }

const casesData: Case[] = [
  { id: "LXT-NG-2041", client: "Aisha Bello", stage: "Review", progress: 65, update: "Last updated: 12 Sept 2025" },
  { id: "LXT-NG-1998", client: "Emeka Nwosu", stage: "Court Hearing", progress: 80, update: "Hearing scheduled: 18 Sept 2025 · Federal High Court, Lagos" },
  { id: "LXT-NG-1873", client: "Ibrahim Musa", stage: "Documentation", progress: 40, update: "Awaiting affidavit and sworn declaration." },
];

const widgetsData: Widget[] = [
  { label: "Cases in Progress", value: "14", trend: "+3 this week" },
  { label: "Cases Completed", value: "41", trend: "+6 last 30 days", trendUp: true },
  { label: "Pending Alerts", value: "2", trend: "-1 from yesterday", trendUp: false },
];

const alertsData: Alert[] = [
  { title: "Signature Pending — Aisha Bello", meta: "Due 15 Sept · Power of Attorney document", actionText: "Send Reminder" },
  { title: "Court Appearance — Emeka Nwosu", meta: "18 Sept · Federal High Court Lagos", actionText: "View Calendar" },
];

export default function LawyerDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredCases = casesData
    .filter(c => c.client.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
    .filter(c => statusFilter === "All Status" || c.stage === statusFilter);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">

      {/* Top Bar */}
      <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-4 bg-[#FFA500] shadow">
        <div className="flex items-center gap-2.5 font-semibold text-[#5F021F] text-lg">
          <span className="inline-flex w-6 h-6 bg-[#5F021F]/20 rounded-full" />
          LexTrust Nigeria
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#5F021F]/70">Lawyer Dashboard</p>
            <p className="font-semibold text-[#5F021F]">Barr. Chinedu Okafor</p>
          </div>

          <button className="relative w-11 h-11 rounded-lg bg-[#F7E7CE] text-[#5F021F] text-lg">
            🔔
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-[2px] rounded-full">3</span>
          </button>

          <div className="flex items-center gap-3">
            <Image src={lawyerPhoto} alt="Lawyer photo" width={48} height={48} className="rounded-full shadow-sm object-cover" />
            <div>
              <p className="font-semibold text-[#5F021F]">Barr. Chinedu Okafor</p>
              <p className="text-xs text-[#5F021F]/70">Barrister & Solicitor, Supreme Court of Nigeria</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row overflow-auto">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col p-6 lg:p-8 bg-[#FFF4E0] border-r border-[#5F021F]/10 min-w-[260px]">
          <nav className="flex flex-col gap-3">
            {["📁 My Cases", "💬 Client Chat", "📄 Documents", "📊 Progress Overview", "⚙️ Settings"].map((item, idx) => (
              <a
                key={idx}
                href="#"
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold ${idx === 0 ? "bg-[#FFD6A5] text-[#5F021F]" : "text-[#5F021F]/80 hover:bg-[#FFE8B2]"}`}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-10 flex flex-col gap-10">

          {/* Hero */}
          <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <p className="uppercase text-xs tracking-widest text-[#FFA500] mb-1">Active Case Summary</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#5F021F]">
                Welcome, Barr. Okafor. Here are your active matters.
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="relative flex items-center bg-[#FFF4E0] rounded-xl px-4 py-2 w-full sm:w-64">
                🔍
                <input
                  type="search"
                  placeholder="Search client or case ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-2 bg-transparent outline-none w-full text-[#5F021F]"
                />
              </label>
              <select
                className="border rounded-xl px-4 py-2 border-[#5F021F]/20 bg-[#FFF4E0] text-[#5F021F] w-full sm:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {["All Status", "New Filing", "Documentation", "Review", "Court Hearing", "Completed"].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Stats Widgets */}
          <StatsWidgets widgets={widgetsData} />

          {/* Cases Grid */}
          <CasesGrid cases={filteredCases} />

          {/* Charts & History */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartsSection />
            <ProcessHistory />
          </div>

          {/* Alerts Panel */}
          <AlertsPanel alerts={alertsData} />
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center p-4 text-sm text-[#5F021F]/70 bg-[#FFF4E0]">
        © 2025 LexTrust Nigeria — Trusted Digital Legal Services.
      </footer>
    </div>
  );
}