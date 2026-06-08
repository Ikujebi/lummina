import { prisma } from "@/lib/prisma";
import type { DashboardData, Status, Widget, Alert } from "@/types/dashboard";
import type { User } from "@/types/admin";

/* ================= TYPES ================= */

type MatterStatus = {
  createdAt: Date;
  status: Status;
};

type StatusCounts = Record<Status, number>;

type LineItem = {
  date: string;
  newCases: number;
  closedCases: number;
};

/* ================= SERVICE ================= */

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();

  const [users, matters] = await Promise.all([
    prisma.user.findMany(),
    prisma.matter.findMany({
      where: {
        createdAt: { gte: now },
      },
      select: {
        createdAt: true,
        status: true,
      },
    }),
  ]);

  const typed = matters as MatterStatus[];

  /* ================= STATUS COUNT ================= */

  const statusCounts: StatusCounts = {
    OPEN: 0,
    IN_PROGRESS: 0,
    PENDING: 0,
    CLOSED: 0,
  };

  typed.forEach((m) => {
    statusCounts[m.status]++;
  });

  /* ================= LINE DATA ================= */

  const grouped: Record<
    string,
    { newCases: number; closedCases: number }
  > = {};

  typed.forEach((m) => {
    const key = m.createdAt.toISOString().split("T")[0];

    if (!grouped[key]) {
      grouped[key] = { newCases: 0, closedCases: 0 };
    }

    grouped[key].newCases += 1;

    if (m.status === "CLOSED") {
      grouped[key].closedCases += 1;
    }
  });

  const line: LineItem[] = Object.entries(grouped).map(
    ([date, value]) => ({
      date,
      newCases: value.newCases,
      closedCases: value.closedCases,
    })
  );

  /* ================= WIDGETS ================= */

  const widgets: Widget[] = [
    {
      label: "Total Users",
      value: users.length,
    },
    {
      label: "Active Matters",
      value: statusCounts.OPEN + statusCounts.IN_PROGRESS,
    },
    {
      label: "Closed Cases",
      value: statusCounts.CLOSED,
    },
  ];

  /* ================= ALERTS ================= */

  const alerts: Alert[] = [
    {
      id: "1",
      title: "System Status",
      meta: "All systems operational",
      actionText: "View",
    },
  ];

  const total = typed.length;
  const closed = statusCounts.CLOSED;

  /* ================= RETURN ================= */

  return {
    widgets,
    alerts,
    users: users as User[], // 👈 properly typed as User[]

    chartData: {
      doughnut: {
        labels: ["OPEN", "IN_PROGRESS", "PENDING", "CLOSED"],
        values: [
          statusCounts.OPEN,
          statusCounts.IN_PROGRESS,
          statusCounts.PENDING,
          statusCounts.CLOSED,
        ],
      },

      line: line.map((item) => ({
        label: new Date(item.date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        date: item.date,
        newCases: item.newCases,
        closedCases: item.closedCases,
      })),

      progress:
        total === 0 ? 0 : Math.round((closed / total) * 100),
    },
  };
}