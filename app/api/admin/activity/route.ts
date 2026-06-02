import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ActivityMetadata } from "@/types/ActivityMetadata";

const allowedOrigins = [
  "https://lummina.com",
  "https://www.lumminalaw.com",
];

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin":
      origin && allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(req: Request) {
  return NextResponse.json(
    {},
    {
      headers: getCorsHeaders(req.headers.get("origin")),
    }
  );
}

/* ================= UTIL ================= */
const getDay = (d: Date) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .split("T")[0];

/* ================= GET ================= */
export async function GET(req: Request) {
  try {
    // ================= STATS =================
    const pageViews = await prisma.websiteActivity.count({
      where: { event: "page_view" },
    });

    const newsletterOpens = await prisma.websiteActivity.count({
      where: { event: "newsletter_open" },
    });

    const downloads = await prisma.websiteActivity.count({
      where: { event: "download" },
    });

    const subscribers =
  await prisma.newsletterSubscriber.count();

    // ================= RECENT =================
    const recentActivity = await prisma.websiteActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        event: true,
        path: true,
        createdAt: true,
        metadata: true,
      },
    });

    // ================= UNIQUE VISITORS =================
    const visitorIds = recentActivity
      .map((a) => (a.metadata as ActivityMetadata | null)?.visitorId)
      .filter(Boolean) as string[];

    const uniqueVisitors = new Set(visitorIds).size;

    // ================= DAILY VIEWS (14 DAYS FOR COMPARISON) =================
    const last14DaysRaw = await prisma.websiteActivity.findMany({
      where: {
        event: "page_view",
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true },
    });

    const grouped: Record<string, number> = {};

    for (const v of last14DaysRaw) {
      const day = getDay(v.createdAt);
      grouped[day] = (grouped[day] || 0) + 1;
    }

    const days = Array.from({ length: 14 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return getDay(date);
    });

    const currentWeekDays = days.slice(7);
    const previousWeekDays = days.slice(0, 7);

    const currentViews = currentWeekDays.reduce(
      (sum, d) => sum + (grouped[d] || 0),
      0
    );

    const previousViews = previousWeekDays.reduce(
      (sum, d) => sum + (grouped[d] || 0),
      0
    );

    // ================= FIXED GROWTH LOGIC =================
    let visitorGrowthPercent = 0;

    if (previousViews === 0 && currentViews === 0) {
      visitorGrowthPercent = 0;
    } else if (previousViews === 0 && currentViews > 0) {
      visitorGrowthPercent = 100;
    } else {
      visitorGrowthPercent =
        ((currentViews - previousViews) / previousViews) * 100;
    }

    // ================= DAILY VIEWS OUTPUT (LAST 7 DAYS) =================
    const dailyViews = days.slice(7).map((day) => ({
      date: day,
      count: grouped[day] || 0,
    }));

    // ================= TOP PAGES =================
    const topPages = await prisma.websiteActivity.groupBy({
      by: ["path"],
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    });

    return NextResponse.json(
      {
        stats: {
          pageViews,
          newsletterOpens,
          downloads,
          subscribers,
          uniqueVisitors,
        },

        metrics: {
          visitorGrowthPercent,
        },

        recentActivity,
        dailyViews,

        insights: {
          topPages,
          mostActivePage: topPages[0]?.path || null,
        },
      },
      {
        headers: getCorsHeaders(req.headers.get("origin")),
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

/* ================= POST TRACKING ================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { event, path, metadata, userId } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Event is required" },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "unknown";

    const forwardedFor = req.headers.get("x-forwarded-for");

    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : "unknown";

    const activity = await prisma.websiteActivity.create({
      data: {
        event,
        path,
        metadata,
        userId,
        ipAddress,
        userAgent,
        referrer: req.headers.get("referer") || undefined,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to track activity" },
      { status: 500 }
    );
  }
}