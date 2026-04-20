"use client";

import { useEffect, useState } from "react";
import type { LawyerMatter } from "@/types/lawyer";

export default function MattersPage() {
  const [matters, setMatters] = useState<LawyerMatter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/lawyer/dashboard");

        if (!res.ok) {
          throw new Error("Failed to fetch matters");
        }

        const data = await res.json();

        setMatters(data.matters || []);
      } catch (err) {
        console.error("Error loading matters:", err);
        setMatters([]); // safe fallback
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="text-[#5F021F]">
        Loading matters...
      </div>
    );
  }

  /* =========================
     EMPTY STATE (IMPORTANT FIX)
  ========================= */
  if (matters.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#5F021F]">
          My Matters
        </h1>

        <div className="bg-[#FFF4E0] p-6 rounded-xl text-center text-[#5F021F]/70">
          <p className="font-semibold">No matters assigned yet</p>
          <p className="text-sm mt-2">
            Once a case is assigned to you, it will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     DATA STATE
  ========================= */
  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold text-[#5F021F]">
        My Matters
      </h1>

      <div className="grid gap-4">

        {matters.map((m) => (
          <div
            key={m.id}
            className="bg-[#FFF4E0] p-5 rounded-xl shadow"
          >

            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-[#5F021F]">
                  {m.title}
                </p>

                <p className="text-sm text-[#5F021F]/70">
                  Case: {m.caseNumber}
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-[#FFA500]/30 text-[#5F021F]">
                {m.status}
              </span>
            </div>

            <p className="text-sm mt-3 text-[#5F021F]/70">
              Client: {m.client?.name || "Unknown"}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}