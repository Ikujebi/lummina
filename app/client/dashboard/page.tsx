"use client";

import { useEffect, useState } from "react";

import HeroSection from "@/app/components/dashboard/HeroSection";
import ChartsSection from "@/app/components/dashboard/ChartsSection";
import TimelineSection from "@/app/components/dashboard/TimelineSection";
import ProcessHistory from "@/app/components/lawyer-dashboard/ProcessHistory";
import { TimelineItem } from "@/types/types";
import type { ClientDashboardData } from "@/types/client";

const defaultClient: ClientDashboardData = {
  name: "",
  caseId: "",
  lawyer: "",
  status: "OPEN",
};

export default function ClientDashboard() {
  const [client, setClient] =
    useState<ClientDashboardData>(defaultClient);

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client/dashboard");
        const data = await res.json();

        setClient(data.client ?? defaultClient);
        setTimeline(data.timeline ?? []);
      } catch (err) {
        console.error("Client dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-[#5F021F]/60">
        Loading dashboard...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">

      {/* HERO */}
      <HeroSection client={client} />

      {/* CHARTS + HISTORY */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartsSection />
        <ProcessHistory />
      </div>

      {/* TIMELINE */}
      <TimelineSection timeline={timeline} />

    </div>
  );
}