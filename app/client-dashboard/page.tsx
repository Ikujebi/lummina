"use client";

import { useState } from "react";
import Topbar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import HeroSection from "../components/dashboard/HeroSection";
import ChartsSection from "../components/dashboard/ChartsSection";
import TimelineSection from "../components/dashboard/TimelineSection";
import { client, timelineData } from "../components/dashboard/mockData";

export default function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7e7ce] flex flex-col lg:grid lg:grid-cols-[260px_1fr]">

      <Topbar
        clientName={client.name}
        notifications={3}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar open={sidebarOpen} />

      <main className="flex-1 pt-24 px-6 md:px-10 flex flex-col gap-8">
        <HeroSection client={client} />
        <ChartsSection />
        <TimelineSection timeline={timelineData} />
      </main>

    </div>
  );
}