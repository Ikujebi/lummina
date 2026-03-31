"use client";

import { useState } from "react";
import { ReportSummary, MonthlyMatter } from "@/types/admin";

interface StatsReport {
  month: string;
  cases: number;
  newClients: number;
  closedCases: number;
}

export default function ReportsSection() {
  const [report, setReport] = useState<StatsReport[]>([]);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data: ReportSummary = await res.json();

      // Transform backend response to StatsReport[]
      const reports: StatsReport[] = data.monthlyMatters.map((m: MonthlyMatter) => ({
        month: m.month,
        cases: m.count,
        // Derive newClients and closedCases from statusBreakdown
        newClients: data.statusBreakdown.find(s => s.status === "NEW_CLIENT")?._count || 0,
        closedCases: data.statusBreakdown.find(s => s.status === "CLOSED")?._count || 0,
      }));

      setReport(reports);

      // Optional: Download CSV
      const csv = [
        ["Month", "Cases", "New Clients", "Closed Cases"],
        ...reports.map((r) => [r.month, r.cases, r.newClients, r.closedCases]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Report generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow-sm border border-[#5F021F]/10">
      <div className="flex justify-between items-center flex-wrap mb-4 w-full">
        <h2 className="text-lg font-semibold text-[#5F021F]">
          Reports & Analytics
        </h2>

        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-[#FFA500] text-[#5F021F] px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#FFB733] mt-2 sm:mt-0 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {report.length === 0 ? (
          <>
            <div className="bg-white p-4 rounded-xl ">
              <p className="text-sm text-[#5F021F]/70">Monthly Cases</p>
              <h3 className="text-2xl font-semibold text-[#5F021F] mt-2">0</h3>
            </div>
            <div className="bg-white p-4 rounded-xl ">
              <p className="text-sm text-[#5F021F]/70">New Clients</p>
              <h3 className="text-2xl font-semibold text-[#5F021F] mt-2">0</h3>
            </div>
            <div className="bg-white p-4 rounded-xl ">
              <p className="text-sm text-[#5F021F]/70">Closed Cases</p>
              <h3 className="text-2xl font-semibold text-[#5F021F] mt-2">0</h3>
            </div>
          </>
        ) : (
          report.map((r, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border">
              <p className="text-sm text-[#5F021F]/70">{r.month}</p>
              <h3 className="text-2xl font-semibold text-[#5F021F] mt-2">{r.cases}</h3>
              <p className="text-xs text-[#5F021F]/70 mt-1">
                New Clients: {r.newClients}, Closed Cases: {r.closedCases}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}