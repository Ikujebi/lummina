"use client";

interface Alert {
  title: string;
  meta: string;
  actionText: string;
}

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow-sm border border-[#5F021F]/10">
      <h2 className="text-lg font-semibold text-[#5F021F] mb-4">
        Alerts & Notifications
      </h2>

      <div className="flex flex-col gap-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-white p-4 rounded-xl border"
          >
            <div>
              <p className="font-semibold text-[#5F021F]">
                {alert.title}
              </p>
              <p className="text-sm text-[#5F021F]/70">
                {alert.meta}
              </p>
            </div>

            <button className="bg-[#FFA500] text-[#5F021F] px-4 py-2 rounded-lg font-semibold">
              {alert.actionText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}