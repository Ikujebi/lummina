"use client";

import { useEffect, useState } from "react";

import HeroSection from "@/app/components/dashboard/HeroSection";
import ChartsSection from "@/app/components/dashboard/ChartsSection";
import TimelineSection from "@/app/components/dashboard/TimelineSection";
import ProcessHistory from "@/app/components/dashboard/ProcessHistory";
import { LinePoint,TimelineItem } from "@/types/types";
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
   DASHBOARD TYPE
======================= */
type DashboardData = {
  client: ClientDashboardData;
  timeline: TimelineItem[];
  charts: {
    doughnut: {
      labels: string[];
      values: number[];
    };
    line:LinePoint[];
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
        const res = await fetch("/api/clients/dashboard", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch dashboard");

        const data = await res.json();

        const client = data?.client;

        setClient(client ?? defaultClient);

        setTimeline(data?.timeline ?? []);
        setDashboard(data);

      } catch {
        // production-safe: no console noise
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  

  /* =======================
     UI
  ======================= */
  return (
    <div className="flex flex-col gap-10">

      <HeroSection client={client} />

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

      <TimelineSection timeline={timeline} />

    </div>
  );
}