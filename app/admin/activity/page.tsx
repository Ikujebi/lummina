"use client";

import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  event: string;
  path?: string;
  createdAt: string;
}

interface DashboardStats {
  pageViews: number;
  newsletterOpens: number;
  subscribers: number;
  downloads: number;
}

export default function ActivityPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    pageViews: 0,
    newsletterOpens: 0,
    subscribers: 0,
    downloads: 0,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  // FETCH ANALYTICS
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/activity");

      const data = await response.json();

      setStats(data.stats);

      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // LOAD ON PAGE OPEN
  useEffect(() => {
  const loadAnalytics = async () => {
    await fetchAnalytics();
  };

  loadAnalytics();
}, []);

  // FORMAT EVENT LABELS
  const formatEvent = (event: string) => {
    return event
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // FORMAT TIME AGO
  const formatTimeAgo = (date: string) => {
    const now = new Date().getTime();

    const activityDate = new Date(date).getTime();

    const diff = now - activityDate;

    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
      return `${minutes} mins ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hrs ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} days ago`;
  };

  // STATS CARDS
  const statCards = [
    {
      label: "Page Views",
      value: stats.pageViews.toLocaleString(),
      icon: "👁️",
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

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#5F021F]/50 text-xs font-semibold mb-3">
              Lummina Analytics
            </p>

            <h1 className="text-4xl font-bold text-[#5F021F]">
              Activity Intelligence
            </h1>

            <p className="text-[#5F021F]/70 mt-3 max-w-2xl leading-relaxed">
              Monitor platform engagement, subscriber growth,
              insight performance, and visitor behavior across
              the Lummina ecosystem.
            </p>

          </div>

          <div className="bg-white border border-[#5F021F]/10 rounded-3xl px-6 py-5 shadow-sm">

            <p className="text-sm text-[#5F021F]/60 mb-2">
              Live Monitoring
            </p>

            <div className="flex items-center gap-3">

              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

              <span className="font-semibold text-[#5F021F]">
                Analytics Active
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {statCards.map((item) => (
          <div
            key={item.label}
            className="
              relative overflow-hidden
              bg-white
              border border-[#5F021F]/10
              rounded-[28px]
              p-7
              shadow-sm
              hover:shadow-2xl
              transition-all duration-500
              group
            "
          >

            <div className="absolute top-0 right-0 h-28 w-28 bg-[#F4C430]/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

            <div className="relative z-10">

              <div className="flex items-center justify-between mb-8">

                <div
                  className="
                    h-14 w-14 rounded-2xl
                    bg-[#FFF4E0]
                    flex items-center justify-center
                    text-2xl
                  "
                >
                  {item.icon}
                </div>

                <div className="h-2 w-2 rounded-full bg-green-500" />

              </div>

              <p className="text-[#5F021F]/60 text-sm font-medium">
                {item.label}
              </p>

              {loading ? (
                <div className="h-10 w-28 rounded-xl bg-gray-200 animate-pulse mt-3" />
              ) : (
                <h2 className="text-4xl font-bold text-[#5F021F] mt-3 tracking-tight">
                  {item.value}
                </h2>
              )}

            </div>

          </div>
        ))}

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* RECENT ACTIVITY */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-[#5F021F]/10 shadow-sm overflow-hidden">

          <div className="px-8 py-7 border-b border-[#5F021F]/10 bg-[#5F021F]">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Recent Activity
                </h2>

                <p className="text-white/70 mt-2 text-sm">
                  Real-time engagement and platform actions
                </p>

              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-sm text-white">
                Live Feed
              </div>

            </div>

          </div>

          <div className="p-8">

            {loading ? (
              <div className="space-y-5">

                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-20 rounded-2xl bg-gray-100 animate-pulse"
                  />
                ))}

              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-20">

                <div className="text-6xl mb-5">
                  📈
                </div>

                <h3 className="text-2xl font-bold text-[#5F021F] mb-3">
                  No Activity Yet
                </h3>

                <p className="text-[#5F021F]/60">
                  Platform activity will appear here once users interact
                  with the system.
                </p>

              </div>
            ) : (
              <div className="space-y-5">

                {recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="
                      group
                      flex items-start justify-between gap-5
                      p-5
                      rounded-2xl
                      border border-[#5F021F]/10
                      hover:border-[#F4C430]/40
                      hover:bg-[#FFF9EC]
                      transition-all duration-300
                    "
                  >

                    <div className="flex items-start gap-4">

                      <div
                        className="
                          h-12 w-12 rounded-2xl
                          bg-[#FFF4E0]
                          flex items-center justify-center
                          text-xl
                        "
                      >
                        ⚡
                      </div>

                      <div>

                        <p className="font-semibold text-[#5F021F] text-lg">
                          {formatEvent(item.event)}
                        </p>

                        {item.path && (
                          <p className="text-[#5F021F]/55 text-sm mt-1">
                            {item.path}
                          </p>
                        )}

                      </div>

                    </div>

                    <div className="text-sm text-[#5F021F]/45 whitespace-nowrap">
                      {formatTimeAgo(item.createdAt)}
                    </div>

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

            <h2 className="text-2xl font-bold text-[#5F021F] mb-8">
              Performance
            </h2>

            <div className="space-y-7">

              <div>

                <div className="flex justify-between mb-3">

                  <span className="text-sm font-medium text-[#5F021F]/70">
                    Subscriber Growth
                  </span>

                  <span className="text-sm font-semibold text-[#5F021F]">
                    82%
                  </span>

                </div>

                <div className="h-3 rounded-full bg-[#FFF4E0] overflow-hidden">

                  <div className="h-full w-[82%] rounded-full bg-[#5F021F]" />

                </div>

              </div>

              <div>

                <div className="flex justify-between mb-3">

                  <span className="text-sm font-medium text-[#5F021F]/70">
                    Newsletter Engagement
                  </span>

                  <span className="text-sm font-semibold text-[#5F021F]">
                    67%
                  </span>

                </div>

                <div className="h-3 rounded-full bg-[#FFF4E0] overflow-hidden">

                  <div className="h-full w-[67%] rounded-full bg-[#F4C430]" />

                </div>

              </div>

            </div>

          </div>

          {/* SUMMARY */}
          <div className="bg-[#5F021F] rounded-[32px] p-8 text-white overflow-hidden relative">

            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">

              <p className="uppercase tracking-widest text-[#F4C430] text-xs font-semibold mb-4">
                Platform Summary
              </p>

              <h3 className="text-3xl font-bold leading-tight mb-5">
                Insights are actively driving engagement.
              </h3>

              <p className="text-white/75 leading-relaxed">
                Subscribers continue to interact with Lummina
                publications, compliance briefings, and governance
                insights across the platform.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}