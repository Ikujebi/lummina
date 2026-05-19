"use client";

import { useState } from "react";

export default function CreateInsightPage() {
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Insight published");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#5F021F]/10 shadow-xl overflow-hidden">

        <div className="bg-[#5F021F] px-8 py-8 text-white">
          <h1 className="text-3xl font-bold">
            Create Insight
          </h1>

          <p className="text-white/70 mt-2">
            Draft and distribute professional legal publications.
          </p>
        </div>

        <div className="p-8 space-y-8">

          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Title
            </label>

            <input
              type="text"
              placeholder="October Insights"
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Slug
            </label>

            <input
              type="text"
              placeholder="october-insights"
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Summary
            </label>

            <textarea
              rows={4}
              placeholder="Brief overview..."
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Full Content
            </label>

            <textarea
              rows={14}
              placeholder="Write your full insight..."
              className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>

          <div>
            <label className="block mb-3 font-semibold text-[#5F021F]">
              Cover Image
            </label>

            <input
              type="file"
              className="w-full rounded-2xl border border-gray-300 px-5 py-4"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-4">

            <button
              className="px-6 py-4 rounded-2xl border border-[#5F021F]/20 text-[#5F021F] font-semibold hover:bg-[#FFF4E0]"
            >
              Save Draft
            </button>

            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-6 py-4 rounded-2xl bg-[#5F021F] text-white font-semibold hover:bg-[#4A0118]"
            >
              {loading ? "Publishing..." : "Publish Insight"}
            </button>

            <button
              className="px-6 py-4 rounded-2xl bg-[#F4C430] text-[#5F021F] font-semibold hover:bg-[#ffd95c]"
            >
              Publish & Send
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}