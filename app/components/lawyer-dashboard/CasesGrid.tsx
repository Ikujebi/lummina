"use client";

interface Case {
  id: string;
  client: string;
  stage: string;
  progress: number;
  update: string;
}

interface CasesGridProps {
  cases: Case[];
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
              <p className="font-semibold text-lg text-[#5F021F]">{c.client}</p>
              <p className="text-xs text-[#5F021F]/70">{`Case ID ${c.id}`}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                c.stage === "Review"
                  ? "bg-[#FFD6A5]/50 text-[#5F021F]"
                  : "bg-[#FFA500]/30 text-[#5F021F]"
              }`}
            >
              {c.stage}
            </span>
          </header>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#5F021F]/70">Progress {c.progress}%</span>
            <div className="w-full h-2 rounded-full bg-[#FFE8B2]/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFA500] to-[#5F021F]"
                style={{ width: `${c.progress}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-[#5F021F]/70">{c.update}</p>

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