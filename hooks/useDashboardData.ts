"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/admin";

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

interface ChartPoint {
  date: string;
  newCases: number;
  closedCases: number;
}

interface StatusCount {
  status: "OPEN" | "IN_PROGRESS" | "PENDING" | "CLOSED";
  _count: number;
}

export function useDashboardData() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [chartData, setChartData] = useState({
    doughnut: { labels: [] as string[], values: [] as number[] },
    line: [] as { label: string; value: number }[],
    progress: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const [statsRes, alertsRes, usersRes, reportsRes] =
          await Promise.all([
            fetch("/api/admin/stats"),
            fetch("/api/admin/alerts"),
            fetch("/api/admin/users"),
            fetch("/api/admin/reports?period=year"),
          ]);

        const statsData: Widget[] = await statsRes.json();
        const alertsData: Alert[] = await alertsRes.json();

        const usersData: {
          success: boolean;
          users: User[];
        } = await usersRes.json();

        const reportsData: {
          newCases: number;
          closedCases: number;
          chartData: ChartPoint[];
          statusCounts: StatusCount[];
        } = await reportsRes.json();

        setWidgets(statsData);
        setAlerts(alertsData);
        setUsers(usersData.users);

        const getStatusValue = (
          status: StatusCount["status"]
        ) =>
          reportsData.statusCounts.find(
            (s) => s.status === status
          )?._count ?? 0;

        setChartData({
          doughnut: {
            labels: [
              "Open",
              "In Progress",
              "Pending",
              "Closed",
            ],
            values: [
              getStatusValue("OPEN"),
              getStatusValue("IN_PROGRESS"),
              getStatusValue("PENDING"),
              getStatusValue("CLOSED"),
            ],
          },
          line: reportsData.chartData.map((item) => ({
            label: item.date,
            value: item.newCases,
          })),
          progress:
            reportsData.newCases === 0
              ? 0
              : Math.round(
                  (reportsData.closedCases /
                    reportsData.newCases) *
                    100
                ),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return {
    widgets,
    alerts,
    users,
    setUsers,
    chartData,
    loading,
  };
}