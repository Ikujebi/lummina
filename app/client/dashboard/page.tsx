"use client";

import { useEffect, useState } from "react";

import HeroSection from "@/app/components/dashboard/HeroSection";
import ChartsSection from "@/app/components/dashboard/ChartsSection";
import TimelineSection from "@/app/components/dashboard/TimelineSection";
import ProcessHistory from "@/app/components/lawyer-dashboard/ProcessHistory";

import { TimelineItem } from "@/types/types";
import type { ClientDashboardData } from "@/types/client";

/* =======================
   DEFAULT CLIENT STATE
======================= */
const defaultClient: ClientDashboardData = {
  name: "",
  caseId: "",
  lawyer: "",
  status: "OPEN",
};

/* =======================
   DASHBOARD TYPE (optional safety)
======================= */
type DashboardData = {
  client: ClientDashboardData;
  timeline: TimelineItem[];
  charts: {
    doughnut: {
      labels: string[];
      values: number[];
    };
    line: {
      label: string;
      value: number;
    }[];
    progress: number;
  };
};

export default function ClientDashboard() {
  const [client, setClient] =
    useState<ClientDashboardData>(defaultClient);

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH DASHBOARD DATA
  ======================= */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client/dashboard");
        const data = await res.json();

        setClient(data.client ?? defaultClient);
        setTimeline(data.timeline ?? []);
        setDashboard(data);
      } catch (err) {
        console.error("Client dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =======================
     LOADING STATE
  ======================= */
  if (loading) {
    return (
      <p className="text-sm text-[#5F021F]/60">
        Loading dashboard...
      </p>
    );
  }

  /* =======================
     UI
  ======================= */
  return (
    <div className="flex flex-col gap-10">

      {/* HERO */}
      <HeroSection client={client} />

      {/* CHARTS + HISTORY */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ChartsSection
          doughnutData={
            dashboard?.charts?.doughnut ?? {
              labels: [],
              values: [],
            }
          }
          lineData={dashboard?.charts?.line ?? []}
          progress={dashboard?.charts?.progress ?? 0}
          loading={loading}
        />

        <ProcessHistory />
      </div>

      {/* TIMELINE */}
      <TimelineSection timeline={timeline} />

    </div>
  );
}