interface Activity {
  id: string;
  title: string;
  caseId: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    title: "Filed affidavit for Ibrahim Musa",
    caseId: "LXT-NG-1873",
    time: "2 hours ago",
  },
  {
    id: "2",
    title: "Prepared court brief for Emeka Nwosu",
    caseId: "LXT-NG-1998",
    time: "Yesterday",
  },
  {
    id: "3",
    title: "Reviewed documentation for Aisha Bello",
    caseId: "LXT-NG-2041",
    time: "3 days ago",
  },
];

export default function ProcessHistory() {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-[#5F021F] mb-6">
        Process History
      </h3>

      <ul className="flex flex-col gap-6">
        {activities.map((activity) => (
          <li key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="w-3 h-3 rounded-full bg-[#FFA500]" />
              <span className="flex-1 w-[2px] bg-[#F7E7CE]" />
            </div>

            <div>
              <p className="font-semibold text-[#5F021F]">
                {activity.title}
              </p>
              <p className="text-sm text-[#5F021F]/70">
                Case ID: {activity.caseId}
              </p>
              <p className="text-xs text-[#5F021F]/50">
                {activity.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}