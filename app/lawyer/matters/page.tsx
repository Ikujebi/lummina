"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LawyerMatter } from "@/types/lawyer";

export default function MattersPage() {
  const [matters, setMatters] = useState<LawyerMatter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/lawyers/dashboard");

        if (!res.ok) throw new Error("Failed to fetch matters");

        const data = await res.json();
        setMatters(data.matters || []);
      } catch (err) {
        console.error("Error loading matters:", err);
        setMatters([]);
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
      <div className="space-y-4">
        <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  /* =========================
     EMPTY STATE
  ========================= */
  if (matters.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#5F021F]">
          My Matters
        </h1>

        <div className="bg-white border border-gray-100 p-8 rounded-2xl text-center shadow-sm">
          <div className="text-4xl mb-3">⚖️</div>

          <p className="font-semibold text-[#5F021F]">
            No matters assigned yet
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Once a case is assigned to you, it will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     STATUS STYLE
  ========================= */
  function getStatusStyle(status: string) {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-[#FFA500]/20 text-[#5F021F]";
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#5F021F]">
          My Matters
        </h1>

        <span className="text-sm text-gray-500">
          {matters.length} case{matters.length !== 1 && "s"}
        </span>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {matters.map((m) => (
          <Link
            key={m.id}
            href={`/lawyer/matters/${m.id}`}
            className="block bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >

            {/* Top Row */}
            <div className="flex justify-between items-start gap-3">

              <div>
                <p className="font-semibold text-[#5F021F] leading-snug">
                  {m.title}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Case No: {m.caseNumber}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(
                  m.status
                )}`}
              >
                {m.status}
              </span>
            </div>

            {/* Client */}
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <span className="font-medium text-[#5F021F]">
                  Client:
                </span>{" "}
                {m.client?.name || "Unknown"}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-between items-center">
              <span className="text-sm text-[#FFA500] font-medium">
                View details →
              </span>

              <span className="text-xs text-gray-400">
                Tap to open
              </span>
            </div>

          </Link>
        ))}

      </div>
    </div>
  );
}