// types/admin.ts
export interface Widget {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export interface Alert {
  title: string;
  meta: string;
  actionText: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "LAWYER" | "CLIENT";
}

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
}

export interface Matter {
  id: string;
  title: string;
  status: string;
  lawyer: string;
  client: string;
}

export interface Report {
  id: string;
  title: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

// Breakdown of matters by status
export interface MatterStatusBreakdown {
  status: string; // "ACTIVE" | "PENDING" | "CLOSED" (match Prisma enum)
  _count: number;
}

// Monthly matters for trend charts
export interface MonthlyMatter {
  month: string; // e.g., "2026-03"
  count: number;
}

// Full report summary returned by backend /api/admin/reports
export interface ReportSummary {
  totalMatters: number;
  statusBreakdown: MatterStatusBreakdown[];
  monthlyMatters: MonthlyMatter[];
}