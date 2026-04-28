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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">

      {widgets.map((w) => (
        <div
          key={w.label}
          className="bg-[#FFF4E0] p-4 sm:p-5 rounded-xl shadow flex flex-col gap-2 min-h-[110px]"
        >
          {/* LABEL */}
          <p className="uppercase text-[11px] sm:text-xs tracking-wide text-[#5F021F]/70">
            {w.label}
          </p>

          {/* VALUE */}
          <p className="text-xl sm:text-2xl font-semibold text-[#5F021F] leading-tight">
            {w.value}
          </p>

          {/* TREND */}
          {w.trend && (
            <span
              className={`text-[11px] sm:text-xs break-words ${
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