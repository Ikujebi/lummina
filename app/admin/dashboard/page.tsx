"use client";

import { useState } from "react";
import StatsWidgets from "../../components/admin-dashboard/StatsWidgets";
import UsersTable from "../../components/admin-dashboard/users/UsersTable";
import ReportsSection from "../../components/admin-dashboard/ReportsSection";
import AlertsPanel from "../../components/admin-dashboard/AlertsPanel";
import ChartsSection from "../../components/dashboard/ChartsSection";
import { Spin } from "antd";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useUserActions } from "@/hooks/useUserActions";

import type { User } from "@/types/admin";

// ================= COMPONENT =================
export default function AdminDashboard() {
  const [search, setSearch] = useState("");

  const {
    widgets,
    alerts,
    users,
    setUsers,
    chartData,
    loading,
  } = useDashboardData();

  const {
    handleApprove,
    handleSave,
    handleDelete,
  } = useUserActions(setUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Spin spinning={loading} size="large">
      <div>
        {/* ================= HEADER SECTION ================= */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 w-full">
          <div>
            <p className="uppercase text-xs tracking-widest text-[#FFA500] mb-1">
              System Overview
            </p>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#5F021F]">
              Admin Control Panel
            </h1>
          </div>

          <div className="flex gap-3 sm:w-auto">
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

        {/* ================= WIDGETS ================= */}
        <StatsWidgets widgets={widgets} />

        {/* ================= CHARTS ================= */}
        <ChartsSection
          doughnutData={chartData.doughnut}
          lineData={chartData.line}
          progress={chartData.progress}
        />

        {/* ================= USERS TABLE ================= */}
        <UsersTable
          users={filteredUsers}
          onApprove={handleApprove}
          onSave={handleSave}
          onDelete={handleDelete}
        />

        {/* ================= REPORTS ================= */}
        <ReportsSection />

        {/* ================= ALERTS ================= */}
        <AlertsPanel alerts={alerts} />
      </div>
    </Spin>
  );
}