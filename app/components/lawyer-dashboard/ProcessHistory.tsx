"use client";

import { useEffect, useState } from "react";
import type { MatterActivity } from "@/types/lawyer";

interface Activity {
  id: string;
  title: string;
  caseId: string;
  time: string;
}

// 🔹 extend your existing type
interface ActivityWithMatter extends MatterActivity {
  matter?: {
    id: string;
    caseNumber?: string;
  } | null;
}

interface ActivitiesResponse {
  activities: ActivityWithMatter[];
}

// 🔹 fallback data (UI only)
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
        const res = await fetch("/api/activities");
        const data: ActivitiesResponse = await res.json();

        const backend = data?.activities ?? [];

        const mapped: Activity[] = backend.map((a) => ({
          id: a.id,
          title: a.details
            ? `${a.action} - ${a.details}`
            : a.action,
          caseId: a.matter?.caseNumber || a.matter?.id || "N/A",
          time: formatTime(a.createdAt),
        }));

        // ✅ safer fallback condition
        if (!backend.length) {
          setActivities(fallbackActivities);
        } else {
          setActivities(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        // ❗ fallback on error
        setActivities(fallbackActivities);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

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

  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-[#5F021F] mb-6">
        Process History
      </h3>

      {loading ? (
        <p className="text-sm text-[#5F021F]/60">Loading...</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-[#FFA500]" />
                <span className="flex-1 w-[2px] bg-[#F7E7CE]" />
              </div>

              <div>
                <p className="font-semibold text-[#5F021F]">
                  {activity.title}
                </p>
                <p className="text-sm text-[#5F021F]/70">
                  Case ID: {activity.caseId}
                </p>
                <p className="text-xs text-[#5F021F]/50">
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