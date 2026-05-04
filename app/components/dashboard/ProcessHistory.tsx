"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  title: string;
  caseId: string;
  caseNumber?: string;
  time: string;
};

type ApiResponse = {
  timeline: {
    id: string;
    action: string;
    details?: string;
    createdAt: string;
    matter?: {
      id: string;
      caseNumber?: string;
    };
  }[];
};

function formatTime(date?: string) {
  if (!date) return "Unknown";

  const diff = Date.now() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(diff / 86400000);
  return `${days} day(s) ago`;
}

export default function ClientProcessHistory() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/clients/dashboard", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load");

        const data: ApiResponse = await res.json();

        const mapped: Activity[] = (data.timeline ?? []).map((a) => ({
          id: a.id,
          title: a.details ? `${a.action}: ${a.details}` : a.action,
          caseId: a.matter?.id ?? "N/A",
          caseNumber: a.matter?.caseNumber,
          time: formatTime(a.createdAt),
        }));

        setActivities(mapped);
      } catch (err) {
        console.error("Process history error:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#5F021F]">
          Case Process History
        </h3>

        <span className="text-xs text-gray-500">
          Live updates
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-500">Loading activities...</p>
      )}

      {/* EMPTY STATE */}
      {!loading && activities.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          No case activity recorded yet.
        </div>
      )}

      {/* TIMELINE */}
      <div className="space-y-6 relative">

        {/* vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />

        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-8">

            {/* DOT */}
            <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-[#FFA500]" />

            {/* CONTENT CARD */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white hover:shadow-sm transition">

              <p className="text-sm font-semibold text-[#5F021F]">
                {activity.title}
              </p>

              <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">

                <span>
                  Case:{" "}
                  <span className="font-medium text-gray-800">
                    {activity.caseNumber || activity.caseId}
                  </span>
                </span>

                <span className="text-gray-400">•</span>

                <span>{activity.time}</span>

              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
}