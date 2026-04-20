"use client";

import type { LawyerMatter } from "@/types/lawyer";

interface CasesGridProps {
  cases: LawyerMatter[];
}

export default function CasesGrid({ cases }: CasesGridProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((c) => (
        <article
          key={c.id}
          className="bg-[#FFF4E0] rounded-xl p-6 shadow flex flex-col gap-4"
        >
          <header className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-lg text-[#5F021F]">
                {c.title}
              </p>

              <p className="text-xs text-[#5F021F]/70">
                Case #{c.caseNumber}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                c.status === "OPEN"
                  ? "bg-green-200 text-green-800"
                  : c.status === "IN_PROGRESS"
                  ? "bg-yellow-200 text-yellow-800"
                  : c.status === "PENDING"
                  ? "bg-orange-200 text-orange-800"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {c.status}
            </span>
          </header>

          <p className="text-sm text-[#5F021F]/70">
            Client: {c.client?.name}
          </p>

          <p className="text-xs text-[#5F021F]/60">
            Last updated: {new Date(c.updatedAt).toLocaleDateString()}
          </p>

          <div className="flex flex-wrap gap-2">
            <a
              href="#"
              className="px-3 py-2 border border-[#FFA500] text-[#5F021F] rounded-lg text-sm font-semibold"
            >
              View Details
            </a>

            <a
              href="#"
              className="px-3 py-2 bg-[#FFE8B2] text-[#5F021F] rounded-lg text-sm font-semibold"
            >
              Open Chat
            </a>

            <a
              href="#"
              className="px-3 py-2 bg-[#FFE8B2] text-[#5F021F] rounded-lg text-sm font-semibold"
            >
              Documents
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}