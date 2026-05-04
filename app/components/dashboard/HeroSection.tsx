"use client";

import Image from "next/image";
import {
  BriefcaseBusiness,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import lawyerPhoto from "@/public/img/client.png";
import { Client } from "../../../types/types";

type Props = {
  client: Client;
};

export default function HeroSection({ client }: Props) {
  const clientName = client?.name || "Client";

  // 🔥 Sort matters (latest first)
  const sortedMatters = client?.matters
    ? [...client.matters].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
    : [];

  const latestMatter = sortedMatters[0];

  const caseId = latestMatter?.caseNumber || "Not Assigned";

  const lawyer =
    latestMatter?.lawyer?.name ||
    client?.lawyer ||
    "Pending Assignment";

  const status = latestMatter?.status || "OPEN";

  const statusStyles =
    status === "OPEN"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : status === "IN_PROGRESS"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : status === "PENDING"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : status === "CLOSED"
      ? "bg-gray-100 text-gray-700 border-gray-200"
      : "bg-[#FFF3E0] text-[#FFA500] border-[#FFD699]";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#5F021F]/10 bg-white shadow-xl">

      {/* BACKGROUND EFFECTS */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#FFA500]/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-[#5F021F]/10 blur-3xl" />

      <div className="relative grid grid-cols-1 lg:grid-cols-2">

        {/* IMAGE SIDE */}
        <div className="relative min-h-[320px] lg:min-h-[450px]">
          <Image
            src={lawyerPhoto}
            alt="Legal consultation"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/10 to-transparent" />

          {/* FLOATING CARD */}
          <div className="absolute left-6 bottom-6 z-10 max-w-sm rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl p-5 text-[#5F021F] shadow-2xl">

            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Client Dashboard
              </span>
            </div>

            <h3 className="text-2xl font-bold leading-tight">
              Track Your Legal Progress
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Stay informed about your case updates, legal process,
              and assigned counsel in real time.
            </p>

          </div>
        </div>

        {/* CONTENT SIDE */}
        <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">

          {/* LABEL */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#5F021F]/10 bg-[#5F021F]/5 px-4 py-2 text-sm font-medium text-[#5F021F] mb-6">
            <ShieldCheck size={16} />
            Secure Legal Portal
          </div>

          {/* TITLE */}
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-[#5F021F] leading-tight">
            Welcome back,
            <span className="block text-[#FFA500] mt-2">
              {clientName}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-600">
            Access your legal records, monitor your case progress,
            and communicate seamlessly with your legal team.
          </p>

          {/* INFO CARDS */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* CASE */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 hover:-translate-y-1 hover:shadow-lg transition">

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5F021F] text-white">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Case ID
                  </p>

                  <h3 className="text-lg font-bold text-[#5F021F]">
                    {caseId}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Your most recent legal matter reference.
              </p>
            </div>

            {/* LAWYER */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 hover:-translate-y-1 hover:shadow-lg transition">

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFA500] text-white">
                  <Scale size={20} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    Assigned Lawyer
                  </p>

                  <h3 className="text-lg font-bold text-[#5F021F] truncate">
                    {lawyer}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Your legal representative handling this matter.
              </p>
            </div>
          </div>

          {/* STATUS */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-500">
              Current Status:
            </span>

            <div className={`inline-flex items-center rounded-full border px-5 py-2 text-sm font-bold tracking-wide ${statusStyles}`}>
              {status}
            </div>
          </div>

          {/* ===================== */}
          {/* TIMELINE SECTION */}
          {/* ===================== */}

          <div className="mt-12 border-t border-gray-100 pt-8">

            <h2 className="text-xl font-bold text-[#5F021F] mb-6">
              Case Progression Timeline
            </h2>

            <div className="relative border-l-2 border-[#5F021F]/20 pl-6 space-y-8">

              {sortedMatters.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No case history available yet.
                </p>
              )}

              {sortedMatters.map((matter, index) => {
                const isLatest = index === 0;

                const statusColor =
                  matter.status === "OPEN"
                    ? "bg-emerald-500"
                    : matter.status === "IN_PROGRESS"
                    ? "bg-blue-500"
                    : matter.status === "PENDING"
                    ? "bg-yellow-500"
                    : "bg-gray-500";

                return (
                  <div key={matter.id} className="relative">

                    {/* DOT */}
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full ${statusColor}`} />

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">

                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-[#5F021F]">
                          {matter.caseNumber}

                          {isLatest && (
                            <span className="ml-2 text-xs bg-[#FFA500]/20 text-[#FFA500] px-2 py-1 rounded-full">
                              Latest
                            </span>
                          )}
                        </h3>

                        <span className="text-xs font-semibold text-gray-500">
                          {new Date(matter.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        Lawyer:{" "}
                        <span className="font-medium text-gray-800">
                          {matter.lawyer?.name || "Unassigned"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        Status:{" "}
                        <span className="font-semibold">
                          {matter.status}
                        </span>
                      </p>

                      {matter.title && (
                        <p className="text-sm text-gray-500 mt-2">
                          {matter.title}
                        </p>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}