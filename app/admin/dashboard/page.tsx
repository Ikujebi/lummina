"use client";

import { useEffect, useState } from "react";
import StatsWidgets from "../../components/admin-dashboard/StatsWidgets";
import UsersTable from "../../components/admin-dashboard/UsersTable";
import ReportsSection from "../../components/admin-dashboard/ReportsSection";
import AlertsPanel from "../../components/admin-dashboard/AlertsPanel";
import ChartsSection from "../../components/dashboard/ChartsSection";
import { Spin } from "antd";

// ================= TYPES =================
interface Widget {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

interface Alert {
  id: string;
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

interface ChartPoint {
  date: string;
  newCases: number;
  closedCases: number;
}

interface StatusCount {
  status: "OPEN" | "IN_PROGRESS" | "PENDING" | "CLOSED";
  _count: number;
}

// ================= COMPONENT =================
export default function AdminDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [chartData, setChartData] = useState({
    doughnut: { labels: [] as string[], values: [] as number[] },
    line: [] as { label: string; value: number }[],
    progress: 0,
  });

  const [loading, setLoading] = useState(true);

  // ================= FETCH ALL DATA =================
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, alertsRes, usersRes, reportsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/alerts"),
          fetch("/api/admin/users"),
          fetch("/api/admin/reports?period=month"),
        ]);

        // ===== STATS =====
        if (!statsRes.ok) throw new Error("Stats failed");
        const statsData: Widget[] = await statsRes.json();
        setWidgets(statsData);

        // ===== ALERTS =====
        if (!alertsRes.ok) throw new Error("Alerts failed");
        const alertsData: Alert[] = await alertsRes.json();
        setAlerts(alertsData);

        // ===== USERS =====
        if (!usersRes.ok) throw new Error("Users failed");
        const usersData: { success: boolean; users: User[] } =
          await usersRes.json();
        if (!usersData.success) throw new Error("Invalid users response");
        setUsers(usersData.users);

        // ===== REPORTS =====
        if (!reportsRes.ok) throw new Error("Reports failed");

        const data: {
          newCases: number;
          closedCases: number;
          chartData: ChartPoint[];
          statusCounts: StatusCount[];
        } = await reportsRes.json();

        // 🚫 STRICT: require statusCounts from backend
        if (!data.statusCounts) {
          throw new Error("Missing statusCounts from backend");
        }

        const getStatusValue = (status: StatusCount["status"]) =>
          data.statusCounts.find((s) => s.status === status)?._count ?? 0;

        // ===== Doughnut =====
        const doughnut = {
          labels: ["Open", "In Progress", "Pending", "Closed"],
          values: [
            getStatusValue("OPEN"),
            getStatusValue("IN_PROGRESS"),
            getStatusValue("PENDING"),
            getStatusValue("CLOSED"),
          ],
        };

        // ===== Line =====
        const line = data.chartData.map((d) => ({
          label: d.date,
          value: d.newCases,
        }));
console.log("Line chart data:", line);
        // ===== Progress (NO FAKE DIVISION) =====
        const progress =
          data.newCases === 0
            ? 0
            : Math.round((data.closedCases / data.newCases) * 100);

        setChartData({ doughnut, line, progress });
      } catch (err) {
        console.error("Dashboard fetch error:", err);

        // 🚫 DO NOT inject fake data
        // just keep state empty
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ================= FILTER USERS =================
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  // ================= UI =================
  return (
    <Spin spinning={loading} size="large">
      <>
        {/* ===== HERO ===== */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
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
        <ChartsSection
          doughnutData={chartData.doughnut}
          lineData={chartData.line}
          progress={chartData.progress}
        />

        {/* ===== USERS ===== */}
        <UsersTable users={filteredUsers} />

        {/* ===== REPORTS ===== */}
        <ReportsSection />

        {/* ===== ALERTS ===== */}
        <AlertsPanel alerts={alerts} />
      </>
    </Spin>
  );
}