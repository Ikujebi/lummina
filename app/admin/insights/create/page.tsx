"use client";

import { useState, useRef } from "react";

type ActionState = "idle" | "saving" | "publishing" | "sending";

export default function CreateInsightPage() {
  const [action, setAction] = useState<ActionState>("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const [insightId, setInsightId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: null as File | null,
  });

  const isLoading = action !== "idle";

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImage: null,
    });

    setInsightId(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      coverImage: file,
    }));
  };

const uploadImage = async (file: File): Promise<string | null> => {
  try {
    // 1. Get signature from your API
    const sigRes = await fetch("/api/cloudinary/sign");
    const sig = await sigRes.json();

    if (!sigRes.ok) {
      console.error("SIGNATURE ERROR:", sig);
      return null;
    }

    const formData = new FormData();

    formData.append("file", file);

    // MUST match backend exactly
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", "profile_pictures");

    // 2. Upload to Cloudinary using signed request
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await uploadRes.json();

    console.log("CLOUDINARY UPLOAD RESPONSE:", data);

    if (!uploadRes.ok) {
      console.error("UPLOAD FAILED:", data);
      return null;
    }

    return data.secure_url ?? null;
  } catch (error) {
    console.error("UPLOAD_ERROR:", error);
    return null;
  }
};

  // ---------------- SAVE DRAFT ----------------
  const saveDraft = async () => {
    try {
      setAction("saving");

      let coverImageUrl: string | null = null;

      if (form.coverImage) {
        coverImageUrl = await uploadImage(form.coverImage);
      }

      const res = await fetch("/api/admin/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          summary: form.summary,
          content: form.content,
          coverImage: coverImageUrl,
          published: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save draft");
      }

      setInsightId(data.id);

      alert("Draft saved successfully");
    } catch (err) {
      console.error(err);
      alert("Error saving draft");
    } finally {
      setAction("idle");
    }
  };

  // ---------------- PUBLISH ----------------
  const publishInsight = async () => {
    try {
      setAction("publishing");

      let coverImageUrl: string | null = null;

      if (form.coverImage) {
        coverImageUrl = await uploadImage(form.coverImage);
      }

      const res = await fetch("/api/admin/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          summary: form.summary,
          content: form.content,
          coverImage: coverImageUrl,
          published: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to publish insight");
      }

      setInsightId(data.id);

      alert("Insight published successfully");
    } catch (err) {
      console.error(err);
      alert("Error publishing insight");
    } finally {
      setAction("idle");
    }
  };

  // ---------------- SEND ----------------
  const sendInsight = async () => {
    if (!insightId) {
      alert("Save or publish first before sending");
      return;
    }

    try {
      setAction("sending");

      const res = await fetch(`/api/admin/insights/send/${insightId}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send");
      }

      alert("Insight sent successfully");

      // ONLY SEND refreshes form
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error sending insight");
    } finally {
      setAction("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10 text-[#5F021F]/80">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#5F021F]/10 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#5F021F]/75 px-8 py-8 text-white">
          <h1 className="text-3xl font-bold">Create Insight</h1>
        </div>

        {/* FORM */}
        <div className="p-8 space-y-8">

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
className="w-full rounded-2xl border px-5 py-4 focus:outline-none "          />

          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug"
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none "
          />

          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="Summary"
className="w-full rounded-2xl border px-5 py-4 focus:outline-none "          />

          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Full Content"
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none "
          />

          <input
            ref={fileRef}
            type="file"
            onChange={handleFile}
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none focus:border-transparent"
          />

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-4 pt-4">

            <button
              onClick={saveDraft}
              disabled={isLoading}
              className="px-6 py-4 rounded-2xl bg-yellow-400 text-black font-semibold"
            >
              Save Draft
            </button>

            <button
              onClick={publishInsight}
              disabled={isLoading}
              className="px-6 py-4 rounded-2xl bg-[#5F021F]/75 text-white"
            >
              Publish
            </button>

            {/* SEND BUTTON */}
            <button
              onClick={sendInsight}
              disabled={!insightId || isLoading}
              className={`px-6 py-4 rounded-2xl font-semibold ${
                !insightId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white"
              }`}
            >
              Send Insight
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}