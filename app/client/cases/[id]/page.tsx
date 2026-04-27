"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CaseActivity = {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
};

type ClientCaseDetail = {
  id: string;
  title: string;
  caseNumber: string;
  status: string;
  lawyer?: {
    name: string;
  };
  activities: CaseActivity[];
};

export default function ClientCaseDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [caseItem, setCaseItem] = useState<ClientCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "activity">("overview");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/matters/${id}`);

        if (!res.ok) {
          throw new Error("Failed to load case");
        }

        const data = await res.json();

        // supports both shapes: {case} or {matter}
        setCaseItem(data.case ?? data.matter ?? null);
      } catch (err) {
        console.error("Error loading case:", err);
        setCaseItem(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <p className="text-[#5F021F]">
        Loading case...
      </p>
    );
  }

  if (!caseItem) {
    return (
      <p className="text-red-600">
        Case not found
      </p>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#5F021F]">
          {caseItem.title}
        </h1>

        <p className="text-sm text-gray-600">
          Case Number: {caseItem.caseNumber}
        </p>

        <p className="text-sm text-gray-600">
          Status:{" "}
          <span className="font-semibold text-[#5F021F]">
            {caseItem.status}
          </span>
        </p>

        <p className="text-sm text-gray-600">
          Lawyer: {caseItem.lawyer?.name || "Not assigned"}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setTab("overview")}
          className={tab === "overview" ? "font-semibold text-[#5F021F]" : ""}
        >
          Overview
        </button>

        <button
          onClick={() => setTab("activity")}
          className={tab === "activity" ? "font-semibold text-[#5F021F]" : ""}
        >
          Updates
        </button>
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="bg-[#FFF4E0] p-4 rounded-xl text-sm text-gray-700">
          This is your case overview. Updates from your lawyer will appear under the activity tab.
        </div>
      )}

      {/* ACTIVITY */}
      {tab === "activity" && (
        <div className="space-y-3">

          {!caseItem.activities?.length ? (
            <p className="text-sm text-gray-500">
              No updates yet.
            </p>
          ) : (
            caseItem.activities.map((a) => (
              <div
                key={a.id}
                className="bg-white border p-4 rounded-xl"
              >
                <p className="font-semibold text-[#5F021F]">
                  {a.action}
                </p>

                {a.details && (
                  <p className="text-sm text-gray-600">
                    {a.details}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}

        </div>
      )}

    </div>
  );
}