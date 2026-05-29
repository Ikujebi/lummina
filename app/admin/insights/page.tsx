"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";

import ConfirmModal from "@/app/components/ConfirmModal";

import type {
  InsightApiResponse,
  Insight,
} from "@/types/InsightApiResponse";

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Insight | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  // ✔️ DELETE MODAL STATE
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/insights");
        const data = await res.json();

        const formatted = (data as InsightApiResponse[]).map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          date: item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString()
            : new Date(item.createdAt).toLocaleDateString(),
          views: item.views ?? 0,
          status: (item.published ? "Published" : "Draft") as
            | "Published"
            | "Draft",
          sent: item.sent ?? false,
          published: item.published ?? false,
          coverImage: item.coverImage ?? null,
        }));

        setInsights(formatted);
      } catch (err) {
        console.error(err);
        setToast("Failed to load insights");
        setTimeout(() => setToast(null), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const handleSend = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/insights/send/${id}`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) setToast("Sent successfully");
      else setToast("Failed to send");

      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast("Error sending insight");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/insights/publish/${id}`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        setInsights((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, published: true, status: "Published" }
              : item
          )
        );

        setToast("Published successfully");
      } else {
        setToast("Failed to publish");
      }

      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast("Error publishing insight");
      setTimeout(() => setToast(null), 3000);
    }
  };

  // ✔️ OPEN MODAL INSTEAD OF CONFIRM
  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const res = await fetch(`/api/admin/insights/${pendingDeleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setInsights((prev) =>
          prev.filter((item) => item.id !== pendingDeleteId)
        );
        setToast("Deleted successfully");
      } else {
        setToast("Delete failed");
      }
    } catch (err) {
      console.error(err);
      setToast("Error deleting insight");
    } finally {
      setPendingDeleteId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-[#FFF7E7] min-h-screen">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-[#5F021F] text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#5F021F]">Insights</h1>
          <p className="text-[#5F021F]/70 mt-2">
            Preview exactly how clients see your newsletters
          </p>
        </div>

        <Link
          href="/admin/insights/create"
          className="bg-[#5F021F]/75 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#4A0118]"
        >
          + Create Insight
        </Link>
      </div>

      {/* GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white animate-pulse rounded-2xl" />
          ))
        ) : insights.length === 0 ? (
          <div className="text-center text-[#5F021F]/60 col-span-2">
            No insights found
          </div>
        ) : (
          insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="relative bg-[#5F021F]/90 text-white p-8 rounded-2xl shadow-xl"
            >
              {insight.coverImage && (
                <div className="mb-4 relative w-full h-48">
                  <Image
                    src={insight.coverImage}
                    alt={insight.title}
                    fill
                    className="object-cover rounded-xl"
                  />
                </div>
              )}

              <h3 className="text-2xl font-semibold mb-2">
                {insight.title}
              </h3>

              <p className="text-sm text-gray-300 mb-4">
                Published: {insight.date}
              </p>

              <p className="text-gray-200">{insight.summary}</p>

              <div className="absolute top-4 right-4 flex gap-2">
                {!insight.published && (
                  <button
                    onClick={() => handlePublish(insight.id)}
                    className="px-3 py-1 rounded text-sm bg-green-600 text-white"
                  >
                    Publish
                  </button>
                )}

                {!insight.sent && (
                  <button
                    onClick={() => handleSend(insight.id)}
                    className="px-3 py-1 rounded text-sm bg-white text-[#5F021F]"
                  >
                    Send
                  </button>
                )}

                <Link
                  href={`/admin/insights/${insight.id}`}
                  className="bg-[#F4C430] text-[#5F021F] px-3 py-1 rounded text-sm"
                >
                  Edit
                </Link>
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <p className="text-xs text-white/60">
                  {insight.views ?? 0} views
                </p>

                <button
                  onClick={() => handleDelete(insight.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* MODAL */}
      <ConfirmModal
        open={!!pendingDeleteId}
        title="Delete Insight"
        description="You are about to permanently delete this insight. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />

      {/* PREVIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div
            className="absolute inset-0"
            onClick={() => setSelected(null)}
          />

          <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden">
            <div className="bg-[#5F021F] text-white px-8 py-6 relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-bold">{selected.title}</h2>
            </div>

            <div className="p-8 text-gray-800">
              <p>{selected.summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}