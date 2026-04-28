"use client";

import { useRouter } from "next/navigation";
import type { LawyerMatter } from "@/types/lawyer";

interface CasesGridProps {
  cases: LawyerMatter[];
}

export default function CasesGrid({ cases }: CasesGridProps) {
  const router = useRouter();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
      {cases.map((c) => (
        <article
          key={c.id}
          className="bg-[#FFF4E0] rounded-xl p-4 sm:p-5 lg:p-6 shadow flex flex-col gap-4"
        >
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-base sm:text-lg text-[#5F021F]">
                {c.title}
              </p>

              <p className="text-[11px] sm:text-xs text-[#5F021F]/70">
                Case #{c.caseNumber}
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-xs bg-gray-200">
              {c.status}
            </span>
          </header>

          <p className="text-xs sm:text-sm text-[#5F021F]/70">
            Client: {c.client?.name}
          </p>

          <p className="text-[11px] sm:text-xs text-[#5F021F]/60">
            Last updated: {new Date(c.updatedAt).toLocaleDateString()}
          </p>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-2">

            <button
              onClick={() => router.push(`/lawyer/matters/${c.id}`)}
              className="px-3 py-2 border border-[#FFA500] rounded-lg text-sm"
            >
              View Details
            </button>

            {/* ✅ CHAT (FULL PAGE NAVIGATION) */}
            <button
              onClick={() => router.push(`/chat?matterId=${c.id}`)}
              className="px-3 py-2 bg-[#FFE8B2] rounded-lg text-sm"
            >
              Open Chat
            </button>

            <button
              onClick={() => router.push(`/lawyer/matters/${c.id}/documents`)}
              className="px-3 py-2 bg-[#FFE8B2] rounded-lg text-sm"
            >
              Documents
            </button>

          </div>
        </article>
      ))}
    </section>
  );
}