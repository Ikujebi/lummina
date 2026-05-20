"use client";

import { useState } from "react";

type ActionState = "idle" | "saving" | "publishing" | "sending";

export default function CreateInsightPage() {
  const [action, setAction] = useState<ActionState>("idle");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm({ ...form, coverImage: e.target.files[0] });
    }
  };

  // 🔹 SAVE DRAFT
  const saveDraft = async () => {
    try {
      setAction("saving");

      const res = await fetch("/api/admin/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          published: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to save draft");

      alert("Draft saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving draft");
    } finally {
      setAction("idle");
    }
  };

  // 🔹 PUBLISH
  const publishInsight = async () => {
    try {
      setAction("publishing");

      const res = await fetch("/api/admin/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          published: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to publish");

      alert("Insight published successfully");
    } catch (err) {
      console.error(err);
      alert("Error publishing insight");
    } finally {
      setAction("idle");
    }
  };

  // 🔹 PUBLISH + SEND EMAIL
  const publishAndSend = async () => {
    try {
      setAction("sending");

      const res = await fetch("/api/admin/insights/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send");

      alert("Insight published & sent to subscribers");
    } catch (err) {
      console.error(err);
      alert("Error sending insight");
    } finally {
      setAction("idle");
    }
  };

  const isLoading = action !== "idle";

  return (
    <div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#5F021F]/10 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#5F021F]/75 px-8 py-8 text-white">

          <h1 className="text-3xl font-bold">
            Create Insight
          </h1>

          <p className="text-white/70 mt-2">
            Draft and distribute professional legal publications.
          </p>

        </div>

        {/* FORM */}
        <div className="p-8 space-y-8">

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
          />

          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug (auto or manual)"
            className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
          />

          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            rows={4}
            placeholder="Summary"
            className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
          />

          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={12}
            placeholder="Full content"
            className="w-full rounded-2xl border border-gray-300 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
          />

          <input
            type="file"
            onChange={handleFile}
            className="w-full rounded-2xl border border-gray-300 px-5 py-4"
          />

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-4 pt-4">

            <button
              onClick={saveDraft}
              disabled={isLoading}
              className="px-6 py-4 rounded-2xl border border-[#5F021F]/20 text-[#5F021F] font-semibold hover:bg-[#FFF4E0]"
            >
              {action === "saving" ? "Saving..." : "Save Draft"}
            </button>

            <button
              onClick={publishInsight}
              disabled={isLoading}
              className="px-6 py-4 rounded-2xl bg-[#5F021F]/75 text-white font-semibold hover:bg-[#4A0118]"
            >
              {action === "publishing"
                ? "Publishing..."
                : "Publish Insight"}
            </button>

            <button
              onClick={publishAndSend}
              disabled={isLoading}
              className="px-6 py-4 rounded-2xl bg-[#F4C430] text-[#5F021F] font-semibold hover:bg-[#ffd95c]"
            >
              {action === "sending"
                ? "Sending..."
                : "Publish & Send"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}