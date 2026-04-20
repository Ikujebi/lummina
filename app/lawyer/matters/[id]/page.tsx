"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { LawyerMatterDetail, MatterActivity } from "@/types/lawyer";
import ChatPage from "@/app/chat/page"; // 👈 reuse your existing chat

export default function MatterPage() {
  const { id } = useParams();

  const [matter, setMatter] = useState<LawyerMatterDetail | null>(null);
  const [action, setAction] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"overview" | "activity" | "chat">("overview");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/lawyer/matters/${id}`);

        if (!res.ok) throw new Error("Failed to load matter");

        const data = await res.json();
        setMatter(data.matter);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  async function addActivity() {
    if (!action || !matter) return;

    const res = await fetch(`/api/lawyer/matters/${id}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, details }),
    });

    const data: { activity: MatterActivity } = await res.json();

    setMatter((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        activities: [data.activity, ...prev.activities],
      };
    });

    setAction("");
    setDetails("");
  }

  if (loading) return <p>Loading...</p>;
  if (!matter) return <p>Not found</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#5F021F]">
          {matter.title}
        </h1>

        <p className="text-sm text-gray-600">
          Case: {matter.caseNumber}
        </p>

        <p className="text-sm">
          Client: {matter.client.name}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-3 border-b pb-2">
        <button onClick={() => setTab("overview")}>Overview</button>
        <button onClick={() => setTab("activity")}>Activities</button>
        <button onClick={() => setTab("chat")}>Chat</button>
      </div>

      {/* ===================== */}
      {/* OVERVIEW */}
      {/* ===================== */}
      {tab === "overview" && (
        <div className="text-sm text-gray-600">
          Select a tab to view case details.
        </div>
      )}

      {/* ===================== */}
      {/* ACTIVITIES */}
      {/* ===================== */}
      {tab === "activity" && (
        <div className="space-y-6">

          {/* ADD ACTIVITY */}
          <div className="bg-[#FFF4E0] p-4 rounded-xl space-y-3">

            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Filed affidavit"
              className="w-full p-2 rounded"
            />

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Optional details..."
              className="w-full p-2 rounded"
            />

            <button
              onClick={addActivity}
              className="bg-[#5F021F] text-white px-4 py-2 rounded"
            >
              Add Update
            </button>
          </div>

          {/* TIMELINE */}
          <div className="space-y-3">
            {matter.activities.map((a) => (
              <div key={a.id} className="bg-white border p-4 rounded-xl">
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
            ))}
          </div>
        </div>
      )}

      {/* ===================== */}
      {/* CHAT */}
      {/* ===================== */}
      {tab === "chat" && (
        <div className="h-[75vh] border rounded-xl overflow-hidden">
          <ChatPage />
        </div>
      )}

    </div>
  );
}