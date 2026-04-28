"use client";

interface Alert {
  title: string;
  meta: string;
  actionText: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-4 sm:p-6 shadow-lg w-full">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-[#5F021F]">
          Alerts & Reminders
        </h2>

        <span className="text-xs sm:text-sm text-[#5F021F]/70">
          Automated by LumminaLaw Nigeria
        </span>
      </header>

      {/* LIST */}
      <ul className="grid gap-4">
        {alerts.length === 0 ? (
          <li className="text-sm text-[#5F021F]/60">
            No alerts at the moment.
          </li>
        ) : (
          alerts.map((a, idx) => (
            <li
              key={idx}
              className="border-b last:border-none border-[#5F021F]/10 pb-3"
            >
              <p className="font-semibold text-sm sm:text-base text-[#5F021F]">
                {a.title}
              </p>

              <p className="text-xs sm:text-sm text-[#5F021F]/70 mb-2 leading-relaxed">
                {a.meta}
              </p>

              <button className="text-[#FFA500] font-semibold text-xs sm:text-sm hover:underline">
                {a.actionText}
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}