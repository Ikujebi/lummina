"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, Button, Spin } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartDataPoint {
  date: string;
  newCases: number;
  closedCases: number;
}

interface UserOption {
  id: string;
  name: string;
}

interface Analytics {
  newClients: number;
  newCases: number;
  closedCases: number;
  openCases: number;
  chartData: ChartDataPoint[];
  lawyers: UserOption[];
  clients: UserOption[];
}

type Period = "week" | "month" | "year";

export default function ReportsSection() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period>("month");
  const [selectedLawyer, setSelectedLawyer] = useState<string | undefined>();
  const [selectedClient, setSelectedClient] = useState<string | undefined>();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("period", period);
      if (selectedLawyer) params.append("lawyerId", selectedLawyer);
      if (selectedClient) params.append("clientId", selectedClient);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      const data: Analytics = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [period, selectedLawyer, selectedClient]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const downloadCSV = () => {
    if (!analytics) return;
    const rows = [
      ["Date", "New Cases", "Closed Cases"],
      ...analytics.chartData.map((d) => [d.date, d.newCases, d.closedCases]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Spin spinning={loading} description="Loading Analytics..." size="large">
      <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow-sm border border-[#5F021F]/10 w-full">
        {/* Header & Filters */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 className="text-lg font-semibold text-[#5F021F]">
            Dashboard Analytics
          </h2>

          <div className="flex gap-2 flex-wrap">
            {/* Period Filter */}
            <Select
              value={period}
              onChange={(value) => setPeriod(value)}
              style={{ width: 140, color: "#5F021F", borderColor: "#5F021F" }}
              options={[
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "year", label: "This Year" },
              ]}
              className="!border-[#5F021F] !text-[#5F021F]"
              styles={{
                popup: {
                  root: {
                    color: "#5F021F",
                  },
                },
              }}
            />

            {/* Lawyer Filter */}
            <Select
              value={selectedLawyer}
              onChange={(value) => {
                setSelectedLawyer(value || undefined);
                fetchAnalytics(); // auto fetch
              }}
              placeholder="All Lawyers"
              allowClear
              style={{ width: 180, color: "#5F021F", borderColor: "#5F021F" }}
              className="!border-[#5F021F] !text-[#5F021F]"
              options={analytics?.lawyers.map((l) => ({
                value: l.id,
                label: l.name,
              }))}
              styles={{
                popup: {
                  root: {
                    color: "#5F021F",
                  },
                },
              }}
            />

            {/* Client Filter */}
            <Select
              value={selectedClient}
              onChange={(value) => {
                setSelectedClient(value || undefined);
                fetchAnalytics(); // auto fetch
              }}
              placeholder="All Clients"
              allowClear
              style={{ width: 180, color: "#5F021F", borderColor: "#5F021F" }}
              className="!border-[#5F021F] !text-[#5F021F]"
              options={analytics?.clients.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              styles={{
                popup: {
                  root: {
                    color: "#5F021F",
                  },
                },
              }}
            />

            {/* Buttons */}
            <Button
              type="primary"
              onClick={fetchAnalytics}
              style={{
                backgroundColor: "#FFA500",
                borderColor: "#FFA500",
                color: "#5F021F",
              }}
            >
              Refresh Data
            </Button>

            <Button
              type="primary"
              onClick={downloadCSV}
              style={{
                backgroundColor: "#5F021F",
                borderColor: "#5F021F",
                color: "#FFF",
              }}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistic Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="New Clients"
            value={analytics?.newClients || 0}
            color="#5F021F"
          />
          <StatCard
            title="New Cases"
            value={analytics?.newCases || 0}
            color="#FFA500"
          />
          <StatCard
            title="Closed Cases"
            value={analytics?.closedCases || 0}
            color="#5F021F"
          />
          <StatCard
            title="Open / Ongoing Cases"
            value={analytics?.openCases || 0}
            color="#FFA500"
          />
        </div>

        {/* Chart */}
        {analytics?.chartData.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newCases" fill="#5F021F" name="New Cases" />
              <Bar dataKey="closedCases" fill="#FFA500" name="Closed Cases" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-[#5F021F]/70">
            No data available for the selected filters.
          </p>
        )}
      </section>
    </Spin>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  color?: string;
}

function StatCard({ title, value, color }: StatCardProps) {
  return (
    <div
      className="bg-white p-4 rounded-xl border shadow flex flex-col justify-between"
      style={{ borderColor: color || "#ccc" }}
    >
      <p className="text-sm text-[#5F021F]/70">{title}</p>
      <h3
        className="text-2xl font-semibold mt-2"
        style={{ color: color || "#000" }}
      >
        {value}
      </h3>
    </div>
  );
}
