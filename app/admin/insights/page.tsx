"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Insight {
  id: string;
  title: string;
  date: string;
  summary: string;
  status: "Published" | "Draft";
  views: number;
  sent?: boolean;
  coverImage?: string | null;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Insight | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/insights");
        const data = await res.json();

        const formatted = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          date: item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString()
            : new Date(item.createdAt).toLocaleDateString(),
          views: item.views ?? 0,
          status: item.published ? "Published" : "Draft",
          sent: item.sent ?? false,
          coverImage: item.coverImage ?? null,
        }));

        setInsights(formatted);
      } catch (err) {
        console.error(err);
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

      alert(data.success ? "Sent successfully" : "Failed to send");
    } catch (err) {
      console.error(err);
      alert("Error sending insight");
    }
  };

  return (
    <div className="p-6 md:p-10 bg-[#FFF7E7] min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#5F021F]">
            Insights
          </h1>

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
          insights.map((insight, index) => {

            // ✅ DEBUG LOG (correct place)
            console.log("COVER IMAGE:", insight.coverImage);

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="relative bg-[#5F021F]/90 text-white p-8 rounded-2xl shadow-xl"
              >

                {/* IMAGE */}
                {insight.coverImage && (
                  <div className="mb-4 relative w-full h-48">
                    <Image
                      src={insight.coverImage}
                      alt={insight.title}
                      fill
                      className="object-cover rounded-xl"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                {/* CLIENT VIEW */}
                <h3 className="text-2xl font-semibold mb-2">
                  {insight.title}
                </h3>

                <p className="text-sm text-gray-300 mb-4">
                  Published: {insight.date}
                </p>

                <div className="h-[2px] w-12 bg-[#F4C430] my-4" />

                <p className="text-gray-200 leading-relaxed">
                  {insight.summary}
                </p>

                <button
                  onClick={() => setSelected(insight)}
                  className="mt-6 bg-[#F4C430] text-[#5F021F] px-5 py-2 rounded-lg"
                >
                  Preview Full →
                </button>

                {/* ADMIN OVERLAY */}
                <div className="absolute top-4 right-4 flex gap-2">

                  <button
                    onClick={() => handleSend(insight.id)}
                    className="px-3 py-1 rounded text-sm bg-white text-[#5F021F]"
                  >
                    Send
                  </button>

                  <Link
                    href={`/admin/insights/${insight.id}`}
                    className="bg-[#F4C430] text-[#5F021F] px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </Link>

                </div>

                {/* METRICS */}
                <p className="absolute bottom-4 right-4 text-xs text-white/60">
                  {insight.views ?? 0} views
                </p>

              </motion.div>
            );
          })
        )}

      </section>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">

          <div className="absolute inset-0" onClick={() => setSelected(null)} />

          <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-modalFade">

            <div className="bg-[#5F021F] text-white px-8 py-6 relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-white/80"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-bold">
                {selected.title}
              </h2>

              <p className="text-white/70 text-sm mt-1">
                {selected.date}
              </p>
            </div>

            <div className="p-8 space-y-6 text-gray-800">
              <p className="text-lg">{selected.summary}</p>

              <div className="text-sm text-gray-500 border-t pt-4">
                Admin preview mode — this is how users experience the content.
              </div>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalFade {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-modalFade {
          animation: modalFade 0.3s ease-out;
        }
      `}</style>

    </div>
  );
}