import { prisma } from "@/lib/prisma";

async function fetchWidgets() {
  const res = await fetch("http://localhost:3000/api/admin/stats", {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

async function fetchAlerts() {
  const res = await fetch("http://localhost:3000/api/admin/alerts", {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export async function GET() {
  const now = new Date();

  const [users, reports, widgets, alerts] = await Promise.all([
    prisma.user.findMany(),
    prisma.matter.findMany({
      where: { createdAt: { gte: now } },
      select: { createdAt: true, status: true },
    }),
    fetchWidgets(),
    fetchAlerts(),
  ]);

  return Response.json({
    users,
    widgets,
    alerts,
    reports,
  });
}