"use client";

import { useEffect, useState } from "react";
import type { MatterActivity } from "@/types/lawyer";

interface Activity {
  id: string;
  title: string;
  caseId: string;
  time: string;
}

interface ActivityWithMatter extends MatterActivity {
  matter?: {
    id: string;
    caseNumber?: string;
  } | null;
}

interface ActivitiesResponse {
  activities: ActivityWithMatter[];
}

function formatTime(date?: string) {
  if (!date) return "Unknown time";

  const diff = Date.now() - new Date(date).getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(diff / 86400000);
  return `${days} days ago`;
}

const fallbackActivities: Activity[] = [
  {
    id: "1",
    title: "Filed affidavit for Ibrahim Musa",
    caseId: "LXT-NG-1873",
    time: "2 hours ago",
  },
  {
    id: "2",
    title: "Prepared court brief for Emeka Nwosu",
    caseId: "LXT-NG-1998",
    time: "Yesterday",
  },
  {
    id: "3",
    title: "Reviewed documentation for Aisha Bello",
    caseId: "LXT-NG-2041",
    time: "3 days ago",
  },
];

export default function ProcessHistory() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch("/api/lawyers/matter-activity");
        const data: ActivitiesResponse = await res.json();

        const backend = data?.activities ?? [];

        const mapped: Activity[] = backend.map((a) => ({
          id: a.id,
          title: a.details ? `${a.action} - ${a.details}` : a.action,
          caseId: a.matter?.caseNumber || a.matter?.id || "N/A",
          time: formatTime(a.createdAt),
        }));

        setActivities(backend.length ? mapped : fallbackActivities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        setActivities(fallbackActivities);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-4 sm:p-6 shadow-md w-full">
      <h3 className="text-base sm:text-lg font-semibold text-[#5F021F] mb-4 sm:mb-6">
        Process History
      </h3>

      {loading ? (
        <p className="text-xs sm:text-sm text-[#5F021F]/60">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="text-xs sm:text-sm text-[#5F021F]/60">
          No recent activity found.
        </p>
      ) : (
        <ul className="flex flex-col gap-5 sm:gap-6">
          {activities.map((activity, idx) => (
            <li key={activity.id} className="flex gap-3 sm:gap-4">
              <div className="flex flex-col items-center">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FFA500]" />
                <span
                  className={`w-[2px] bg-[#F7E7CE] flex-1 ${
                    idx === activities.length - 1 ? "hidden" : ""
                  }`}
                />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base text-[#5F021F] break-words leading-snug">
                  {activity.title}
                </p>

                <p className="text-xs sm:text-sm text-[#5F021F]/70">
                  Case ID: {activity.caseId}
                </p>

                <p className="text-[11px] sm:text-xs text-[#5F021F]/50">
                  {activity.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}