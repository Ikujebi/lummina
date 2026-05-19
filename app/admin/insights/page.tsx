"use client";

import Link from "next/link";

const insights = [
  {
    id: "1",
    title: "October Insights",
    status: "Published",
    date: "1 Oct 2025",
    views: 1240,
  },
  {
    id: "2",
    title: "November Insights",
    status: "Draft",
    date: "—",
    views: 0,
  },
];

export default function InsightsPage() {
  return (
    <div className="p-6 md:p-10 bg-[#FFF7E7] min-h-screen">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#5F021F]">
            Insights
          </h1>

          <p className="text-[#5F021F]/70 mt-2">
            Manage publications, drafts, and newsletter distribution.
          </p>
        </div>

        <Link
          href="/admin/insights/create"
          className="bg-[#5F021F] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#4A0118] transition"
        >
          + Create Insight
        </Link>
      </div>

      <div className="grid gap-6">
        {insights.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-[#5F021F]/10 p-6 shadow-sm hover:shadow-xl transition"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="text-sm text-[#5F021F]/60">
                    {item.date}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-[#5F021F]">
                  {item.title}
                </h2>

                <p className="text-[#5F021F]/60 mt-2">
                  {item.views.toLocaleString()} views
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/admin/insights/${item.id}`}
                  className="px-5 py-3 rounded-xl border border-[#5F021F]/20 text-[#5F021F] font-semibold hover:bg-[#FFF4E0]"
                >
                  Edit
                </Link>

                <button
                  className="px-5 py-3 rounded-xl bg-[#F4C430] text-[#5F021F] font-semibold hover:bg-[#ffd95c]"
                >
                  Send
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}