import type { User } from "@/types/admin";

export type Status = "OPEN" | "IN_PROGRESS" | "PENDING" | "CLOSED";

export type Widget = {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
};

export type Alert = {
  id: string;
  title: string;
  meta: string;
  actionText: string;
};

export type DashboardData = {
  widgets: Widget[];
  alerts: Alert[];
  users: User[]; // ✅ FIXED
  chartData: {
    doughnut: {
      labels: string[];
      values: number[];
    };
    line: {
      label: string;
      date: string;
      newCases: number;
      closedCases: number;
    }[];
    progress: number;
  };
};