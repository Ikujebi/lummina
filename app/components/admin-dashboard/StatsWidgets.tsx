

interface Widget {
  label: string;
 value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsWidgets({ widgets }: { widgets: Widget[] }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {widgets.map((widget, index) => (
        <div
          key={index}
          className="bg-[#FFF4E0] rounded-2xl p-6 shadow-sm border border-[#5F021F]/10"
        >
          <p className="text-sm text-[#5F021F]/70">{widget.label}</p>
          <h2 className="text-3xl font-semibold text-[#5F021F] mt-2">
            {widget.value}
          </h2>

          {widget.trend && (
            <p
              className={`text-xs mt-2 ${
                widget.trendUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {widget.trend}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}