"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function EditInsightPage() {
  const params = useParams();

  const [loading, setLoading] = useState(false);

  // TEMP MOCK DATA
  const [title, setTitle] = useState("October Insights");
  const [slug, setSlug] = useState("october-insights");
  const [summary, setSummary] = useState(
    "This edition covers recent developments in corporate governance and compliance."
  );

  const [content, setContent] = useState(`
Corporate governance continues to evolve across Nigeria’s regulatory landscape.

This edition examines:
• key compliance updates
• governance obligations
• commercial risk trends
• regulatory enforcement patterns
  `);

  const [published, setPublished] = useState(true);

  const handleSave = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Insight updated successfully");
    }, 1500);
  };

  const handleSend = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Insight sent to subscribers");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#5F021F]/10 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#5F021F] px-8 py-8 text-white">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <p className="uppercase tracking-widest text-[#F4C430] text-xs font-semibold">
                Lummina Insights
              </p>

              <h1 className="text-3xl font-bold mt-3">
                Edit Insight
              </h1>

              <p className="text-white/70 mt-2">
                Insight ID: {params.id}
              </p>
            </div>

            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${
                published
                  ? "bg-green-500/20 text-green-200"
                  : "bg-yellow-500/20 text-yellow-200"
              }`}
            >
              {published ? "Published" : "Draft"}
            </div>

          </div>

        </div>

        {/* BODY */}
        <div className="p-8 space-y-8">

          {/* TITLE */}
          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Insight Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          {/* SLUG */}
          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              URL Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          {/* SUMMARY */}
          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Summary
            </label>

            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          {/* CONTENT */}
          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Full Content
            </label>

            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Cover Image
            </label>

            <input
              type="file"
              className="w-full rounded-2xl border border-gray-300 px-5 py-4"
            />
          </div>

          {/* TOGGLE */}
          <div className="flex items-center gap-4 bg-[#FFF4E0] rounded-2xl p-5 border border-[#5F021F]/10">

            <input
              type="checkbox"
              checked={published}
              onChange={() => setPublished(!published)}
              className="h-5 w-5 accent-[#5F021F]"
            />

            <div>
              <p className="font-semibold text-[#5F021F]">
                Published
              </p>

              <p className="text-sm text-[#5F021F]/60">
                Toggle whether this insight is publicly visible.
              </p>
            </div>

          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-4 pt-6">

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-4 rounded-2xl bg-[#5F021F] text-white font-semibold hover:bg-[#4A0118] transition"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleSend}
              disabled={loading}
              className="px-6 py-4 rounded-2xl bg-[#F4C430] text-[#5F021F] font-semibold hover:bg-[#ffd95c] transition"
            >
              Send To Subscribers
            </button>

            <button
              className="px-6 py-4 rounded-2xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
            >
              Delete Insight
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}