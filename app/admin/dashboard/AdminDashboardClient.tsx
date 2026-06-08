"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import StatsWidgets from "@/app/components/admin-dashboard/StatsWidgets";
import ReportsSection from "@/app/components/admin-dashboard/ReportsSection";
import AlertsPanel from "@/app/components/admin-dashboard/AlertsPanel";
import { Spin } from "antd";
import { useUserActions } from "@/hooks/useUserActions";
import type { User } from "@/types/admin";
import type { DashboardData } from "@/types/dashboard";

const ChartsSection = dynamic(
  () => import("@/app/components/dashboard/ChartsSection"),
  { ssr: false },
);

const UsersTable = dynamic(
  () => import("@/app/components/admin-dashboard/users/UsersTable"),
);

type Props = {
  initialData: DashboardData;
};

export default function AdminDashboardClient({ initialData }: Props) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>(initialData.users);

  const { handleApprove, handleSave, handleDelete } = useUserActions(setUsers);

  const filteredUsers = (users ?? []).filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Spin spinning={false}>
      <section className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#5F021F]">Admin Dashboard</h1>
      </section>

      <StatsWidgets widgets={initialData.widgets} />

      <ChartsSection
        doughnutData={initialData.chartData.doughnut}
        lineData={initialData.chartData.line}
        progress={initialData.chartData.progress}
      />
      {/* SEARCH BAR */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md w-full max-w-sm outline-none"
        />
      </div>
      <UsersTable
        users={filteredUsers}
        onApprove={handleApprove}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <ReportsSection />

      <AlertsPanel alerts={initialData.alerts} />
    </Spin>
  );
}
