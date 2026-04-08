"use client";

import { useEffect, useRef } from "react";
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

interface ChartsSectionProps {
  doughnutData: DoughnutData;
  lineData: LinePoint[];
  progress: number;
}

export default function ChartsSection({
  doughnutData,
  lineData,
  progress,
}: ChartsSectionProps) {
  const casesChartRef = useRef<HTMLCanvasElement | null>(null);
  const sparklineRef = useRef<SVGSVGElement | null>(null);

  // ================= DOUGHNUT =================
  useEffect(() => {
    if (!casesChartRef.current) return;

    const chart = new Chart(casesChartRef.current, {
      type: "doughnut",
      data: {
        labels: doughnutData.labels,
        datasets: [
          {
            data: doughnutData.values,
            backgroundColor: [
              "#5F021F",
              "#FFA500",
              "#F7E7CE",
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
  }, [doughnutData]);

  // ================= LINE (D3) =================
  useEffect(() => {
    if (!sparklineRef.current || lineData.length === 0) return;

    const svg = d3.select(sparklineRef.current)
      .attr("viewBox", "0 0 320 140");

    svg.selectAll("*").remove();

    const width = 320;
    const height = 140;
    const margin = { top: 20, right: 10, bottom: 30, left: 30 };

    // X scale
    const x = d3.scalePoint<string>()
      .domain(lineData.map(d => d.label))
      .range([margin.left, width - margin.right]);

    // Y scale
    const maxValue = d3.max(lineData, d => d.value) ?? 1;
    const y = d3.scaleLinear()
      .domain([0, Math.max(maxValue, 1)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // X axis
    const xAxis = d3.axisBottom(x);
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", 10)
      .attr("fill", "#5F021F");

    // Y axis
    const yAxis = d3.axisLeft(y).ticks(3);
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", 10)
      .attr("fill", "#5F021F");

    // Line
    const line = d3.line<LinePoint>()
      .x(d => x(d.label) ?? 0)
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.7));

    svg.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#5F021F")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Points
    svg.selectAll("circle")
      .data(lineData)
      .join("circle")
      .attr("cx", d => x(d.label) ?? 0)
      .attr("cy", d => y(d.value))
      .attr("r", 4)
      .attr("fill", "#FFA500");

    // Labels
    svg.selectAll("text.point-label")
      .data(lineData)
      .join("text")
      .attr("class", "point-label")
      .attr("x", d => x(d.label) ?? 0)
      .attr("y", d => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#5F021F")
      .text(d => d.value);

  }, [lineData]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {/* Doughnut */}
      <div className="bg-white p-6 rounded-2xl shadow h-[350px]">
        <h2 className="font-semibold text-[#5F021F] mb-4">Case Distribution</h2>
        <div className="relative w-full h-[200px]">
          <canvas ref={casesChartRef} />
        </div>
      </div>

      {/* Line */}
      <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center">
        <h2 className="font-semibold text-[#5F021F] mb-[5rem]">
          Activity Trend
        </h2>
        <svg ref={sparklineRef} className="w-full max-w-[320px] h-32" />
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