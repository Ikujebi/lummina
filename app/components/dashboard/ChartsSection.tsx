"use client";

import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { ChartsSectionProps } from "@/types/types";

export default function ChartsSection({
  doughnutData,
  lineData,
  progress,
  loading = false,
}: ChartsSectionProps) {
  const doughnutRef = useRef<Chart | null>(null);
  const lineRef = useRef<Chart | null>(null);

  const doughnutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lineCanvasRef = useRef<HTMLCanvasElement | null>(null);

  /* ================= DOUGHNUT ================= */
  useEffect(() => {
    if (loading) return;
    if (!doughnutCanvasRef.current || !doughnutData) return;

    doughnutRef.current?.destroy();

    doughnutRef.current = new Chart(doughnutCanvasRef.current, {
      type: "doughnut",
      data: {
        labels: doughnutData.labels,
        datasets: [
          {
            data: doughnutData.values,
            backgroundColor: ["#22C55E", "#FFA500", "#F7E7CE", "#5F021F"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });

    return () => doughnutRef.current?.destroy();
  }, [doughnutData, loading]);

  /* ================= LINE ================= */
  useEffect(() => {
    if (loading) return;
    if (!lineCanvasRef.current || !lineData?.length) return;

    lineRef.current?.destroy();

    lineRef.current = new Chart(lineCanvasRef.current, {
      type: "line",
      data: {
        labels: lineData.map((d) => d.date),
        datasets: [
          {
            label: "New Cases",
            data: lineData.map((d) => d.newCases),
            borderColor: "#5F021F",
            tension: 0.4,
          },
          {
            label: "Closed Cases",
            data: lineData.map((d) => d.closedCases),
            borderColor: "#22C55E",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            display: true,
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
            },
          },
        },
      },
    });

    return () => lineRef.current?.destroy();
  }, [lineData, loading]);

  /* ================= LOADING UI ================= */
  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow h-[350px] animate-pulse"
          />
        ))}
      </section>
    );
  }

  /* ================= UI ================= */
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 my-5">
      {/* Doughnut */}
      <div className="bg-white p-6 rounded-2xl shadow h-[350px] flex flex-col">
        <h2 className="font-semibold text-[#5F021F]">Case Distribution</h2>
        <div className="flex-1 relative">
          <canvas ref={doughnutCanvasRef} />
        </div>
      </div>

      {/* Line */}
      <div className="bg-white p-6 rounded-2xl shadow h-[350px] flex flex-col">
        <h2 className="font-semibold text-[#5F021F]">
          Case Intake vs Closure Trend
        </h2>
        <div className="flex-1 relative">
          <canvas ref={lineCanvasRef} />
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-center">
        <h2 className="font-semibold text-[#5F021F] mb-2">
          Matter Completion Rate
        </h2>

        <span className="text-4xl font-bold text-[#FFA500]">
          {progress}%
        </span>
      </div>
    </section>
  );
}