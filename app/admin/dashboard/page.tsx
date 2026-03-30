"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import adminPhoto from "@/public/img/careers.jpg";

import StatsWidgets from "../../components/admin-dashboard/StatsWidgets";
import UsersTable from "../../components/admin-dashboard/UsersTable";
import ReportsSection from "../../components/admin-dashboard/ReportsSection";
import AlertsPanel from "../../components/admin-dashboard/AlertsPanel";
import ChartsSection from "../../components/dashboard/ChartsSection";

// ================= TYPES =================
interface Widget {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

interface Alert {
  title: string;
  meta: string;
  actionText: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "LAWYER" | "CLIENT";
}

// ================= DUMMY DATA =================
const widgetsData: Widget[] = [
  { label: "Total Lawyers", value: 12, trend: "+2 this month", trendUp: true },
  { label: "Total Clients", value: 48, trend: "+5 this week", trendUp: true },
  { label: "Active Cases", value: 31, trend: "+3 this week" },
  { label: "Pending Approvals", value: 4, trend: "Requires attention", trendUp: false },
];

const alertsData: Alert[] = [
  { title: "New Lawyer Registration", meta: "Awaiting admin approval", actionText: "Review" },
  { title: "System Report Ready", meta: "Monthly performance report", actionText: "View Report" },
];

const usersData: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "LAWYER" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "CLIENT" },
  { id: "3", name: "Admin User", email: "admin@lextrust.com", role: "ADMIN" },
];

// ================= COMPONENT =================
export default function AdminDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(widgetsData);
  const [alerts, setAlerts] = useState<Alert[]>(alertsData);
  const [users, setUsers] = useState<User[]>(usersData);
  const [search, setSearch] = useState("");

  // Fetch data with fallback to dummy
  useEffect(() => {
    async function fetchData<T>(url: string, fallback: T): Promise<T> {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Fetch failed");
        return await res.json();
      } catch {
        return fallback;
      }
    }

    fetchData("/api/admin/stats", widgetsData).then(setWidgets);
    fetchData("/api/admin/alerts", alertsData).then(setAlerts);
    fetchData("/api/admin/users", usersData).then(setUsers);
  }, []);

  // Filter users for search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">

      {/* ================= TOP BAR ================= */}
      <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-4 bg-[#FFA500] shadow">
        <div className="flex items-center gap-2.5 font-semibold text-[#5F021F] text-lg">
          <span className="inline-flex w-6 h-6 bg-[#5F021F]/20 rounded-full" />
          LexTrust Nigeria
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#5F021F]/70">
              Admin Dashboard
            </p>
            <p className="font-semibold text-[#5F021F]">
              System Administrator
            </p>
          </div>

          {/* Notification */}
          <button className="relative w-11 h-11 rounded-lg bg-[#F7E7CE] text-[#5F021F] text-lg">
            🔔
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-[2px] rounded-full">
              {alerts.length}
            </span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <Image
              src={adminPhoto}
              alt="Admin photo"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-[#5F021F]">Admin User</p>
              <p className="text-xs text-[#5F021F]/70">
                System Administrator
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-auto">

        {/* ================= SIDEBAR ================= */}
        <aside className="hidden lg:flex flex-col p-6 bg-[#FFF4E0] border-r border-[#5F021F]/10 min-w-[260px]">
          <nav className="flex flex-col gap-3">
            {[
              "📊 Dashboard",
              "👨‍⚖️ Lawyers",
              "👥 Clients",
              "📁 Cases",
              "📄 Reports",
              "⚙️ Settings",
            ].map((item, idx) => (
              <a
                key={idx}
                href="#"
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold ${
                  idx === 0
                    ? "bg-[#FFD6A5] text-[#5F021F]"
                    : "text-[#5F021F]/80 hover:bg-[#FFE8B2]"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="flex-1 p-6 sm:p-10 flex flex-col gap-10">

          {/* ===== HERO ===== */}
          <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <p className="uppercase text-xs tracking-widest text-[#FFA500] mb-1">
                System Overview
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#5F021F]">
                Admin Control Panel
              </h1>
            </div>

            {/* Search */}
            <div className="flex gap-3 w-full sm:w-auto">
              <label className="relative flex items-center bg-[#FFF4E0] rounded-xl px-4 py-2 w-full sm:w-64">
                🔍
                <input
                  type="search"
                  placeholder="Search users, cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-2 bg-transparent outline-none w-full text-[#5F021F]"
                />
              </label>
            </div>
          </section>

          {/* ===== STATS ===== */}
          <StatsWidgets widgets={widgets} />

          {/* ===== CHARTS ===== */}
          <ChartsSection />

          {/* ===== USERS TABLE ===== */}
          <UsersTable users={filteredUsers} />

          {/* ===== REPORTS ===== */}
          <ReportsSection />

          {/* ===== ALERTS ===== */}
          <AlertsPanel alerts={alerts} />

        </main>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="text-center p-4 text-sm text-[#5F021F]/70 bg-[#FFF4E0]">
        © LexTrust Nigeria — Admin Portal.
      </footer>
    </div>
  );
}