"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  ActivityItem,
  DashboardStats,
} from "@/types/ActivityMetadata";

/* ================= TYPES FROM BACKEND ================= */
type ApiResponse = {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  dailyViews: {
    date: string;
    count: number;
  }[];
  insights: {
    topPages: {
      path: string | null;
      _count: { path: number };
    }[];
    mostActivePage: string | null;
  };
  metrics: {
    visitorGrowthPercent: number;
  };
};

export default function ActivityPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    pageViews: 0,
    uniqueVisitors: 0,
    newsletterOpens: 0,
    subscribers: 0,
    downloads: 0,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const [dailyViews, setDailyViews] = useState<
    { date: string; count: number }[]
  >([]);

  const [insights, setInsights] = useState<{
    topPages: {
      path: string | null;
      _count: { path: number };
    }[];
    mostActivePage: string | null;
  } | null>(null);

  /* ================= NEW METRICS ================= */
  const [metrics, setMetrics] = useState<{
    visitorGrowthPercent: number;
  } | null>(null);

  /* ================= FETCH ANALYTICS ================= */
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/activity");
      const data: ApiResponse = await response.json();

      setStats(data.stats);
      setRecentActivity(data.recentActivity);
      setDailyViews(data.dailyViews);
      setInsights(data.insights);

      /* ✅ NEW */
      setMetrics(data.metrics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnalytics();
  }, [fetchAnalytics]);

  /* ================= HELPERS ================= */
  const formatEvent = (event: string) =>
    event
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const formatTimeAgo = (date: string) => {
    const now = new Date().getTime();
    const activityDate = new Date(date).getTime();
    const diff = now - activityDate;

    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} mins ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const statCards = [
    {
      label: "Page Views",
      value: stats.pageViews.toLocaleString(),
      icon: "👁️",
    },
    {
      label: "Visitors",
      value: stats.uniqueVisitors.toLocaleString(),
      icon: "🌍",
    },
    {
      label: "Newsletter Opens",
      value: stats.newsletterOpens.toLocaleString(),
      icon: "📨",
    },
    {
      label: "Subscribers",
      value: stats.subscribers.toLocaleString(),
      icon: "👥",
    },
    {
      label: "Downloads",
      value: stats.downloads.toLocaleString(),
      icon: "📄",
    },
  ];

 

  return (
    <div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10">
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#5F021F]">
          Activity Intelligence
        </h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
        {statCards.map((item) => (
          <div
            key={item.label}
            className="bg-white border border-[#5F021F]/10 rounded-[28px] p-6"
          >
            <div className="text-2xl">{item.icon}</div>
            <p className="text-sm text-[#5F021F]/60 mt-3">
              {item.label}
            </p>
            <h2 className="text-3xl font-bold text-[#5F021F] mt-2">
              {loading ? "..." : item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* RECENT ACTIVITY */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-[#5F021F]/10 shadow-sm overflow-hidden">
          <div className="px-8 py-7 border-b border-[#5F021F]/10 bg-[#5F021F]">
            <h2 className="text-2xl font-bold text-white">
              Recent Activity
            </h2>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">📭</div>

                <h3 className="text-lg font-semibold text-[#5F021F]">
                  No Activity Yet
                </h3>

                <p className="text-sm text-[#5F021F]/60 mt-2">
                  When users interact with the system, activity will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border p-4 rounded-xl"
                  >
                    <div>
                      <p className="font-semibold text-[#5F021F]">
                        {formatEvent(item.event)}
                      </p>

                      {item.path && (
                        <p className="text-sm text-[#5F021F]/60">
                          {item.path}
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-[#5F021F]/50">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          {/* PERFORMANCE */}
          <div className="bg-white rounded-[32px] border border-[#5F021F]/10 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-[#5F021F] mb-6">
              Performance
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#5F021F]/70">
                    Visitor Growth
                  </span>

                  <span className="text-sm font-semibold">
                    {metrics?.visitorGrowthPercent !== undefined
                      ? `${metrics.visitorGrowthPercent.toFixed(0)}%`
                      : "0%"}
                  </span>
                </div>

                <div className="h-3 bg-[#FFF4E0] rounded-full">
                  <div
                    className="h-full bg-[#5F021F] rounded-full"
                    style={{
                      width: `${Math.min(
                        Math.max(metrics?.visitorGrowthPercent ?? 0, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DAILY VIEWS - WORLD CLASS VERSION */}
{/* DAILY VIEWS - WORLD CLASS VERSION */}
<div className="bg-white rounded-[32px] border border-[#5F021F]/10 shadow-sm p-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-[#5F021F]">
      Page Views (Last 7 Days)
    </h2>

    <span className="text-sm text-[#5F021F]/60">
      Real user activity
    </span>
  </div>

  {loading ? (
    <div className="h-40 bg-gray-100 animate-pulse rounded-xl" />
  ) : dailyViews.every(d => d.count === 0) ? (
    <div className="text-center py-10">
      <div className="text-4xl mb-2">📭</div>
      <p className="text-[#5F021F] font-semibold">
        No page views yet
      </p>
      <p className="text-sm text-[#5F021F]/60 mt-1">
        Track starts when users visit your pages.
      </p>
    </div>
  ) : (
    <>
      {/* SUMMARY */}
      <div className="flex justify-between mb-6">
        <div>
          <p className="text-sm text-[#5F021F]/60">Total Views</p>
          <p className="text-xl font-bold text-[#5F021F]">
            {dailyViews.reduce((sum, d) => sum + d.count, 0)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-[#5F021F]/60">Daily Avg</p>
          <p className="text-xl font-bold text-[#5F021F]">
            {Math.round(
              dailyViews.reduce((sum, d) => sum + d.count, 0) / 7
            )}
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="flex items-end gap-3 h-40">
        {dailyViews.map((day) => {
          const max = Math.max(...dailyViews.map(d => d.count), 1);

          const height =
            max === 0
              ? 4
              : (day.count / max) * 100;

          const label = new Date(day.date).toLocaleDateString("en-US", {
            weekday: "short",
          });

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div className="h-32 flex items-end">
                <div
                  className="w-4 rounded-full bg-[#5F021F] transition-all"
                  style={{ height: `${height}%` }}
                />
              </div>

              <p className="text-[11px] text-[#5F021F]/60 mt-2">
                {label}
              </p>

              <p className="text-[10px] text-[#5F021F]/40">
                {day.count}
              </p>
            </div>
          );
        })}
      </div>
    </>
  )}
</div>

{/* TOP PAGES */}
<div className="bg-white rounded-[32px] border border-[#5F021F]/10 shadow-sm p-8">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-[#5F021F]">
      Top Pages
    </h2>

    <span className="text-sm text-[#5F021F]/60">
      Most visited
    </span>
  </div>

  {insights?.topPages?.length ? (
    <div className="space-y-4">
      {insights.topPages.map((page, index) => {
        const count = page._count.path;

        return (
          <div
            key={page.path ?? index}
            className="flex items-center justify-between p-3 rounded-xl border border-[#5F021F]/5 hover:bg-[#FFF7E7]"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-[#5F021F] rounded-full">
                {index + 1}
              </div>

              <p className="text-sm text-[#5F021F] font-medium truncate max-w-[140px]">
                {page.path || "Unknown"}
              </p>
            </div>

            {/* RIGHT */}
            <div className="text-sm font-semibold text-[#5F021F]">
              {count}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-sm text-[#5F021F]/60">
      No page data yet
    </p>
  )}
</div>

          {/* INSIGHTS */}
          {insights && (
            <div className="bg-white rounded-[32px] border border-[#5F021F]/10 shadow-sm p-8">
              <h2 className="text-xl font-bold text-[#5F021F] mb-4">
                Insights
              </h2>

              <p className="text-sm text-[#5F021F]/60">
                Most Active Page
              </p>

              <p className="font-semibold text-[#5F021F]">
                {insights.mostActivePage ?? "N/A"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}