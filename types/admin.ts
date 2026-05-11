// types/admin.ts
export type Widget ={
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export type Alert ={
  title: string;
  meta: string;
  actionText: string;
}

export type User ={
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "LAWYER" | "CLIENT";
   isApproved: boolean;
}

export type Lawyer ={
  id: string;
  name: string;
  email: string;
  specialization: string;
}

export type Client ={
  id: string;
  name: string;
  email: string;
}

export type Matter ={
  id: string;
  title: string;
  status: string;
  lawyer: string;
  client: string;
}

export type Report ={
  id: string;
  title: string;
  createdAt: string;
}

export type AuditLog ={
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

// Breakdown of matters by status
export type MatterStatusBreakdown ={
  status: string; // "ACTIVE" | "PENDING" | "CLOSED" (match Prisma enum)
  _count: number;
}

// Monthly matters for trend charts
export type MonthlyMatter ={
  month: string; // e.g., "2026-03"
  count: number;
}

// Full report summary returned by backend /api/admin/reports
export type ReportSummary ={
  totalMatters: number;
  statusBreakdown: MatterStatusBreakdown[];
  monthlyMatters: MonthlyMatter[];
}
export type Case ={
  id: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  lawyer: string;
  client: string;
  caseNumber: string;
}

export type MatterRequest = {
  id: string;

  title: string;
  description?: string | null;

  status: "PENDING" | "OPEN" | "IN_PROGRESS" | "CLOSED";

  caseNumber: string;

  createdAt?: string;

  clientId: string;

  client?: {
    id: string;
    name: string;
  } | null;
};