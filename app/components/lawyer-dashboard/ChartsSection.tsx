"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface MonthlyCases {
  month: string;
  cases: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface StageData {
  stage: string;
  count: number;
}

const monthlyCases: MonthlyCases[] = [
  { month: "May", cases: 6 },
  { month: "Jun", cases: 9 },
  { month: "Jul", cases: 7 },
  { month: "Aug", cases: 11 },
  { month: "Sep", cases: 14 },
];

const revenueData: RevenueData[] = [
  { month: "May", revenue: 1200000 },
  { month: "Jun", revenue: 1500000 },
  { month: "Jul", revenue: 1000000 },
  { month: "Aug", revenue: 1800000 },
  { month: "Sep", revenue: 2100000 },
];

const stageData: StageData[] = [
  { stage: "Documentation", count: 4 },
  { stage: "Review", count: 3 },
  { stage: "Court", count: 5 },
  { stage: "Completed", count: 8 },
];

export default function ChartsSection() {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* Cases Trend */}
      <div className="bg-[#FFF4E0] rounded-2xl p-6 shadow-md h-[320px]">
        <h3 className="text-lg font-semibold text-[#5F021F] mb-4">
          Cases Trend
        </h3>

        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={monthlyCases}>
            <CartesianGrid stroke="#F7E7CE" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#5F021F" />
            <YAxis stroke="#5F021F" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="#FFA500"
              strokeWidth={3}
              dot={{ fill: "#5F021F" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue */}
      <div className="bg-[#FFF4E0] rounded-2xl p-6 shadow-md h-[320px]">
        <h3 className="text-lg font-semibold text-[#5F021F] mb-4">
          Revenue Overview
        </h3>

        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={revenueData}>
            <CartesianGrid stroke="#F7E7CE" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#5F021F" />
            <YAxis stroke="#5F021F" />
            <Tooltip />
            <Bar dataKey="revenue" fill="#FFA500" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stage Distribution */}
      <div className="bg-[#FFF4E0] rounded-2xl p-6 shadow-md h-[320px]">
        <h3 className="text-lg font-semibold text-[#5F021F] mb-4">
          Case Stage Distribution
        </h3>

        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={stageData}>
            <CartesianGrid stroke="#F7E7CE" strokeDasharray="3 3" />
            <XAxis dataKey="stage" stroke="#5F021F" />
            <YAxis stroke="#5F021F" />
            <Tooltip />
            <Bar dataKey="count" fill="#5F021F" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </section>
  );
}