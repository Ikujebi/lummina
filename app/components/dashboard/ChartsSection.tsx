"use client";

import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import * as d3 from "d3";
import { ProductivityPoint } from "./types";

export default function ChartsSection() {
  const casesChartRef = useRef<HTMLCanvasElement | null>(null);
  const sparklineRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!casesChartRef.current) return;

    const chart = new Chart(casesChartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Start", "Documentation", "Review", "Approval", "Completed"],
        datasets: [
          {
            data: [3, 4, 2, 2, 1],
            backgroundColor: [
              "#5F021F",
              "#FFA500",
              "#F7e7ce",
              "#d97706",
              "#7c2d12",
            ],
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
            labels: { color: "#5F021F", usePointStyle: true },
          },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  useEffect(() => {
    if (!sparklineRef.current) return;

    const data: ProductivityPoint[] = [
      { label: "Mon", value: 4 },
      { label: "Tue", value: 5 },
      { label: "Wed", value: 6 },
      { label: "Thu", value: 4 },
      { label: "Fri", value: 7 },
      { label: "Sat", value: 3 },
      { label: "Sun", value: 4 },
    ];

    const svg = d3.select<SVGSVGElement, unknown>(sparklineRef.current)
      .attr("viewBox", "0 0 320 140");

    svg.selectAll("*").remove();

    const width = 320;
    const height = 140;
    const margin = { top: 10, right: 10, bottom: 24, left: 10 };

    const x = d3.scalePoint<string>()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right]);

    const maxValue = d3.max(data, d => d.value) ?? 0;

    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<ProductivityPoint>()
      .x(d => x(d.label) ?? 0)
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.7));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#5F021F")
      .attr("stroke-width", 3)
      .attr("d", line);
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      <div className="bg-white p-6 rounded-2xl shadow h-[350px] flex flex-col justify-center">
        <h2 className="font-semibold text-[#5F021F] mb-4">Case Snapshot</h2>
        <div className="flex-1">
          <canvas ref={casesChartRef} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-center">
        <h2 className="font-semibold text-[#5F021F] mb-4">
          Weekly Productivity
        </h2>
        <svg ref={sparklineRef} className="w-full max-w-[320px] h-32" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-center">
        <h2 className="font-semibold text-[#5F021F] mb-2">
          Overall Progress
        </h2>
        <span className="text-4xl font-bold text-[#FFA500]">70%</span>
      </div>

    </section>
  );
}