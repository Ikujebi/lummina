"use client";

export default function ReportsSection() {
  return (
    <section className="bg-[#FFF4E0] rounded-2xl p-6 shadow-sm border border-[#5F021F]/10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#5F021F]">
          Reports & Analytics
        </h2>

        <button className="bg-[#FFA500] text-[#5F021F] px-4 py-2 rounded-lg font-semibold">
          Generate Report
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-[#5F021F]/70">Monthly Cases</p>
          <h3 className="text-2xl font-semibold text-[#5F021F] mt-2">
            120
          </h3>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-[#5F021F]/70">New Clients</p>
          <h3 className="text-2xl font-semibold text-[#5F021F] mt-2">
            35
          </h3>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-[#5F021F]/70">Closed Cases</p>
          <h3 className="text-2xl font-semibold text-[#5F021F] mt-2">
            89
          </h3>
        </div>
      </div>
    </section>
  );
}