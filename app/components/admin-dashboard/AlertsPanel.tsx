import { Alert } from "@/types/admin";

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow">
      <h2 className="font-semibold mb-4">Alerts</h2>
      <ul className="flex flex-col gap-3">
        {alerts.map((alert, idx) => (
          <li key={idx} className="flex justify-between items-center bg-[#FFE8B2] p-3 rounded-xl">
            <div>
              <p className="font-semibold">{alert.title}</p>
              <p className="text-xs text-[#5F021F]/70">{alert.meta}</p>
            </div>
            <button className="text-sm font-semibold text-[#5F021F]">{alert.actionText}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}