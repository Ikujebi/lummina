"use client";

import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import * as d3 from "d3";

interface DoughnutData {
  labels: string[];
  values: number[];
}

interface LinePoint {
  label: string;
  value: number;
}

export default function ChartsSection() {
  const casesChartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparklineRef = useRef<SVGSVGElement | null>(null);

  const [doughnutData, setDoughnutData] = useState<DoughnutData | null>(null);
  const [lineData, setLineData] = useState<LinePoint[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  // ================= FETCH BACKEND =================
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/client/dashboard");
        const data = await res.json();

        // EXPECTED backend shape:
        // data.charts = { doughnut, line, progress }

        const charts = data?.charts;

        if (charts) {
          setDoughnutData(charts.doughnut);
          setLineData(charts.line || []);
          setProgress(charts.progress || 0);
        }
      } catch (err) {
        console.error("Charts load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ================= DOUGHNUT =================
  useEffect(() => {
    if (!canvasRef.current || !doughnutData) return;

    casesChartRef.current?.destroy();

    casesChartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: doughnutData.labels,
        datasets: [
          {
            data: doughnutData.values,
            backgroundColor: ["#5F021F", "#FFA500", "#F7E7CE"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#5F021F",
              usePointStyle: true,
            },
          },
        },
      },
    });

    return () => {
      casesChartRef.current?.destroy();
    };
  }, [doughnutData]);

  // ================= LINE =================
  useEffect(() => {
    if (!sparklineRef.current || lineData.length === 0) return;

    const svg = d3.select(sparklineRef.current);
    svg.selectAll("*").remove();

    const width = 320;
    const height = 140;
    const margin = { top: 20, right: 10, bottom: 30, left: 30 };

    const x = d3
      .scalePoint<string>()
      .domain(lineData.map((d) => d.label))
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(lineData, (d) => d.value) ?? 1])
      .range([height - margin.bottom, margin.top]);

    svg.attr("viewBox", "0 0 320 140");

    const line = d3
      .line<LinePoint>()
      .x((d) => x(d.label) as number)
      .y((d) => y(d.value));

    svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#5F021F")
      .attr("stroke-width", 3)
      .attr("d", line);
  }, [lineData]);

  // ================= UI =================
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">

      {/* Doughnut */}
      <div className="bg-white p-6 rounded-2xl shadow h-[350px]">
        <h2 className="font-semibold text-[#5F021F] mb-4">
          Case Distribution
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>

      {/* Line */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold text-[#5F021F] mb-4">
          Activity Trend
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <svg ref={sparklineRef} className="w-full h-32" />
        )}
      </div>

      {/* Progress */}
      <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-center">
        <h2 className="font-semibold text-[#5F021F] mb-2">
          Case Completion Rate
        </h2>

        <span className="text-4xl font-bold text-[#FFA500]">
          {progress}%
        </span>
      </div>

    </section>
  );
}