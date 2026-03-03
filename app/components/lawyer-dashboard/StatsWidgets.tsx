"use client";

interface Widget {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

interface StatsWidgetsProps {
  widgets: Widget[];
}

export default function StatsWidgets({ widgets }: StatsWidgetsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.map((w) => (
        <div
          key={w.label}
          className="bg-[#FFF4E0] p-5 rounded-xl shadow flex flex-col gap-2"
        >
          <p className="uppercase text-xs tracking-wide text-[#5F021F]/70">
            {w.label}
          </p>
          <p className="text-2xl font-semibold text-[#5F021F]">{w.value}</p>
          {w.trend && (
            <span
              className={`text-xs ${
                w.trendUp ? "text-[#FFA500]" : "text-[#5F021F]"
              }`}
            >
              {w.trend}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}