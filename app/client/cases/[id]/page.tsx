"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  Loader2,
  Scale,
} from "lucide-react";
import Link from "next/link";

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
  description?: string;
  lawyer?: {
    name: string;
    email?: string;
  };
  activities: CaseActivity[];
};

function getStatusStyles(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "closed":
      return "bg-gray-100 text-gray-700 border border-gray-200";
    default:
      return "bg-[#FFF4E0] text-[#5F021F] border border-[#F3D5A4]";
  }
}

export default function ClientCaseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [caseItem, setCaseItem] = useState<ClientCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"overview" | "activity">("overview");

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/clients/matters/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load case");
        }

        const data = await res.json();
        setCaseItem(data.matter);
      } catch (err) {
        console.error(err);
        setCaseItem(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const activityCount = useMemo(() => {
    return caseItem?.activities?.length || 0;
  }, [caseItem]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#5F021F]">
        <Loader2 className="animate-spin" size={18} />
        <span>Loading case...</span>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        Case not found
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* BACK */}
      <Link
        href="/client/cases"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5F021F]/70 transition hover:text-[#5F021F]"
      >
        <ChevronLeft size={16} />
        Back to Cases
      </Link>

      {/* HERO */}
      <div className="overflow-hidden rounded-[2rem] border border-[#F0DFC2] bg-gradient-to-br from-[#FFF6EA] to-white shadow-sm">
        <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-start lg:justify-between">

          {/* LEFT */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${getStatusStyles(
                  caseItem.status
                )}`}
              >
                {caseItem.status}
              </span>

              <span className="text-sm text-[#5F021F]/60">
                {caseItem.caseNumber}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#5F021F]">
                {caseItem.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5F021F]/70">
                Stay updated with the progress, legal activity,
                and lawyer communications related to this matter.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">

              <div className="flex items-center gap-3 rounded-2xl border border-[#F1E0C5] bg-white px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E0]">
                  <BriefcaseBusiness size={18} className="text-[#5F021F]" />
                </div>

                <div>
                  <p className="text-xs text-[#5F021F]/50">
                    Assigned Lawyer
                  </p>

                  <p className="text-sm font-semibold text-[#5F021F]">
                    {caseItem.lawyer?.name || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#F1E0C5] bg-white px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E0]">
                  <Activity size={18} className="text-[#5F021F]" />
                </div>

                <div>
                  <p className="text-xs text-[#5F021F]/50">Updates</p>
                  <p className="text-sm font-semibold text-[#5F021F]">
                    {activityCount}
                  </p>
                </div>
              </div>

            </div>

            {/* CHAT BUTTON (NEW PAGE ONLY) */}
            <button
              onClick={() => router.push(`/chat/${caseItem.id}`)}
              className="mt-4 px-5 py-2.5 rounded-2xl bg-[#5F021F] text-white text-sm font-medium"
            >
              Open Chat
            </button>

          </div>

          {/* ICON */}
          <div className="hidden lg:flex h-28 w-28 items-center justify-center rounded-3xl bg-[#FFE8BC]">
            <Scale className="text-[#5F021F]" size={46} />
          </div>

        </div>
      </div>

      {/* TABS (UNCHANGED STRUCTURE — CHAT NOT INCLUDED) */}
      <div className="flex gap-3 border-b border-[#E8D8BE] pb-4">

        <button
          onClick={() => setTab("overview")}
          className={`rounded-2xl px-5 py-2.5 text-sm font-medium transition ${
            tab === "overview"
              ? "bg-[#5F021F] text-white"
              : "bg-[#FFF4E0] text-[#5F021F]"
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setTab("activity")}
          className={`rounded-2xl px-5 py-2.5 text-sm font-medium transition ${
            tab === "activity"
              ? "bg-[#5F021F] text-white"
              : "bg-[#FFF4E0] text-[#5F021F]"
          }`}
        >
          Activity & Updates
        </button>

      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="rounded-3xl border border-[#F0DFC2] bg-white p-8 shadow-sm">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-[#5F021F]">
                Matter Overview
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#5F021F]/70">
                {caseItem.description ||
                  "Your lawyer will provide updates and legal progress information here as your matter evolves."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY */}
      {tab === "activity" && (
        <div className="space-y-5">
          {!caseItem.activities?.length ? (
            <div className="rounded-3xl border border-dashed border-[#E4CC9C] bg-[#FFF8EE] p-10 text-center">
              <h3 className="text-lg font-semibold text-[#5F021F]">
                No Updates Yet
              </h3>

              <p className="mt-2 text-sm text-[#5F021F]/70">
                Activity from your legal team will appear here.
              </p>
            </div>
          ) : (
            caseItem.activities.map((a) => (
              <div
                key={a.id}
                className="rounded-3xl border border-[#F0DFC2] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4E0]">
                    <CalendarDays size={20} className="text-[#5F021F]" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#5F021F]">
                      {a.action}
                    </h3>

                    <p className="text-xs text-[#5F021F]/50">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>

                    {a.details && (
                      <p className="mt-3 text-sm text-[#5F021F]/70">
                        {a.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}