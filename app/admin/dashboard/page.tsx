"use client";

import { useEffect, useState } from "react";
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

export default function AdminDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(widgetsData);
  const [alerts, setAlerts] = useState<Alert[]>(alertsData);
  const [users, setUsers] = useState<User[]>(usersData);
  const [search, setSearch] = useState("");

  // Fetch data with fallback
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

    fetchData("/api/admin/stats", widgetsData).then((data) =>
      Array.isArray(data) ? setWidgets(data) : setWidgets(widgetsData)
    );
    fetchData("/api/admin/alerts", alertsData).then(setAlerts);
    fetchData("/api/admin/users", usersData).then(setUsers);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
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
    </>
  );
}