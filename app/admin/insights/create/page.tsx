"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { message } from "antd";

type ActionState = "idle" | "saving" | "publishing" | "sending";

export default function CreateInsightPage() {
  const [action, setAction] = useState<ActionState>("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [insightId, setInsightId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: null as File | null,
  });

  const isLoading = action !== "idle";

  // ✅ CLEANUP OBJECT URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImage: null,
    });

    setPreviewUrl(null);
    setInsightId(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const sigRes = await fetch("/api/cloudinary/sign");
      const sig = await sigRes.json();

      if (!sigRes.ok) {
        console.error("SIGNATURE ERROR:", sig);
        return null;
      }

      const formData = new FormData();

      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", "profile_pictures");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await uploadRes.json();

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

      message.success("Insight sent successfully");
      resetForm();
    } catch (err) {
      console.error(err);
      message.error("Error sending insight");
    } finally {
      setAction("idle");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      coverImage: file,
    }));

    setPreviewUrl(URL.createObjectURL(file));
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

          {/* DROPZONE */}
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              w-full rounded-2xl border-2 border-dashed px-6 py-12
              text-center cursor-pointer transition-all duration-200
              flex flex-col items-center justify-center gap-3
              ${
                isDragging
                  ? "border-[#5F021F] bg-[#5F021F]/5 scale-[1.01]"
                  : "border-gray-300 hover:border-[#5F021F]/60 hover:bg-gray-50"
              }
            `}
          >
            <div className="p-3 rounded-full bg-[#5F021F]/10">
              <UploadCloud className="w-7 h-7 text-[#5F021F]" />
            </div>

            <p className="text-sm font-medium text-gray-700">
              Drag & drop your image here
            </p>

            <p className="text-xs text-gray-500">or click to browse files</p>

            {/* ✅ IMAGE PREVIEW */}
            {previewUrl && (
              <div className="mt-3">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={120}
                  height={120}
                  className="rounded-xl object-cover border"
                />

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <ImageIcon className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">
                    {form.coverImage?.name}
                  </span>
                </div>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              onChange={handleFile}
              className="hidden"
              accept="image/*"
            />
          </div>
          
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full rounded-2xl border px-5 py-4"
          />

          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Slug"
            className="w-full rounded-2xl border px-5 py-4"
          />

          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="Summary"
            className="w-full rounded-2xl border px-5 py-4"
          />

          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Full Content"
            className="w-full rounded-2xl border px-5 py-4"
          />

        

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={saveDraft}
              disabled={isLoading}
              className="px-6 py-4 rounded-2xl bg-yellow-400 font-semibold"
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

            <button
              onClick={sendInsight}
              disabled={!insightId || isLoading}
              className="px-6 py-4 rounded-2xl bg-green-600 text-white"
            >
              Send Insight
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
