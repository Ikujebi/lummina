"use client";

import { useRouter } from "next/navigation";
import { Case } from "@/types/admin";

export default function MattersTable({ cases }: { cases: Case[] }) {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Table wrapper */}
      <div className="overflow-x-auto rounded-xl shadow border border-[#5F021F]/20">

        {/* Desktop table */}
        <table className="w-full text-left border-collapse hidden sm:table">
          <thead className="bg-[#FFD6A5]">
            <tr>
              <th className="px-4 py-3 border text-sm sm:text-base">Title</th>
              <th className="px-4 py-3 border text-sm sm:text-base">Lawyer</th>
              <th className="px-4 py-3 border text-sm sm:text-base">Client</th>
              <th className="px-4 py-3 border text-sm sm:text-base">Case Number</th>
              <th className="px-4 py-3 border text-sm sm:text-base">Status</th>
              <th className="px-4 py-3 border text-sm sm:text-base">Chat</th>
            </tr>
          </thead>

          <tbody>
            {cases.map((c) => (
              <tr
                key={c.id ?? crypto.randomUUID()}
                className="hover:bg-[#FFE8B2]"
              >
                <td className="px-2 py-2 sm:px-4 sm:py-3 border text-sm sm:text-base">
                  {c.title}
                </td>

                <td className="px-2 py-2 sm:px-4 sm:py-3 border text-sm sm:text-base">
                  {c.lawyer}
                </td>

                <td className="px-2 py-2 sm:px-4 sm:py-3 border text-sm sm:text-base">
                  {c.client}
                </td>

                <td className="px-2 py-2 sm:px-4 sm:py-3 border text-sm sm:text-base">
                  {c.caseNumber ?? "—"}
                </td>

                <td className="px-2 py-2 sm:px-4 sm:py-3 border font-semibold text-sm sm:text-base">
                  {typeof c.status === "string"
                    ? c.status.replace("_", " ")
                    : "—"}
                </td>

                {/* CHAT ACTION */}
                <td className="px-2 py-2 sm:px-4 sm:py-3 border">
                  <button
                    onClick={() =>
                      router.push(`/chat?matterId=${c.id}`)
                    }
                    className="text-[#5F021F] font-semibold hover:underline"
                  >
                    Open Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="flex flex-col gap-4 sm:hidden p-2">
          {cases.map((c) => (
            <div
              key={c.id ?? crypto.randomUUID()}
              className="border rounded-lg p-3 shadow hover:bg-[#FFE8B2]"
            >
              <p className="text-sm font-semibold text-[#5F021F]">
                Title: <span className="font-normal">{c.title}</span>
              </p>

              <p className="text-sm font-semibold text-[#5F021F]">
                Lawyer: <span className="font-normal">{c.lawyer}</span>
              </p>

              <p className="text-sm font-semibold text-[#5F021F]">
                Client: <span className="font-normal">{c.client}</span>
              </p>

              <p className="text-sm font-semibold text-[#5F021F]">
                Case #: <span className="font-normal">{c.caseNumber ?? "—"}</span>
              </p>

              <p className="text-sm font-semibold text-[#5F021F]">
                Status:{" "}
                <span className="font-normal">
                  {typeof c.status === "string"
                    ? c.status.replace("_", " ")
                    : "—"}
                </span>
              </p>

              {/* CHAT BUTTON (mobile) */}
              <button
                onClick={() =>
                  router.push(`/chat?matterId=${c.id}`)
                }
                className="mt-2 text-sm font-semibold text-[#5F021F] underline"
              >
                Open Chat
              </button>
            </div>
          ))}

          {cases.length === 0 && (
            <p className="text-center p-4 text-[#5F021F]/70">
              No cases found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}