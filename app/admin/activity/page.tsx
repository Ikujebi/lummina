"use client";

const stats = [
  {
    label: "Page Views",
    value: "14,290",
  },
  {
    label: "Newsletter Opens",
    value: "3,240",
  },
  {
    label: "Subscribers",
    value: "892",
  },
  {
    label: "Downloads",
    value: "418",
  },
];

const recentActivity = [
  {
    event: "Viewed October Insights",
    time: "2 mins ago",
  },
  {
    event: "Subscribed to newsletter",
    time: "12 mins ago",
  },
  {
    event: "Downloaded compliance report",
    time: "25 mins ago",
  },
];

export default function ActivityPage() {
  return (
    <div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10">

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#5F021F]">
          Activity Analytics
        </h1>

        <p className="text-[#5F021F]/70 mt-2">
          Monitor engagement, traffic, and insight performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-3xl border border-[#5F021F]/10 p-6 shadow-sm"
          >
            <p className="text-[#5F021F]/60 text-sm">
              {item.label}
            </p>

            <h2 className="text-4xl font-bold text-[#5F021F] mt-3">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[#5F021F]/10 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-[#5F021F] mb-6">
          Recent Activity
        </h2>

        <div className="space-y-5">
          {recentActivity.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-[#5F021F]/10 pb-4"
            >
              <p className="font-medium text-[#5F021F]">
                {item.event}
              </p>

              <span className="text-sm text-[#5F021F]/50">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}