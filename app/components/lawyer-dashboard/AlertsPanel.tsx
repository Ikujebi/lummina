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
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow-lg">
      <header className="flex justify-between items-baseline mb-4">
        <h2 className="text-lg font-semibold text-[#5F021F]">Alerts & Reminders</h2>
        <span className="text-sm text-[#5F021F]/70">Automated by LexTrust Nigeria</span>
      </header>

      <ul className="grid gap-4">
        {alerts.map((a, idx) => (
          <li key={idx} className="border-b last:border-none border-[#5F021F]/10 pb-3">
            <p className="font-semibold text-[#5F021F]">{a.title}</p>
            <p className="text-sm text-[#5F021F]/70 mb-2">{a.meta}</p>
            <button className="text-[#FFA500] font-semibold text-sm">{a.actionText}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}