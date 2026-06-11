"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { message } from "antd";

type ActionState = "idle" | "saving";
export default function EditInsightPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();


  const fileRef = useRef<HTMLInputElement>(null);

  const [action, setAction] = useState<ActionState>("idle");
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isLoading = action !== "idle";

  // ---------------- FETCH INSIGHT ----------------
  const fetchInsight = async (insightId: string) => {
    try {
      setFetching(true);

      const res = await fetch(`/api/admin/insights/${insightId}`);
      const data = await res.json();

      if (!res.ok) throw new Error();

      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setSummary(data.summary ?? "");
      setContent(data.content ?? "");
      setPublished(data.published ?? false);
      setExistingImage(data.coverImage ?? null);
    } catch (err) {
      console.error(err);
      message.error("Failed to load insight");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (id) fetchInsight(id);
  }, [id]);

  // ---------------- CLEANUP ----------------
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ---------------- FILE HANDLER ----------------
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ---------------- CLOUDINARY UPLOAD ----------------
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const sigRes = await fetch("/api/cloudinary/sign");
      const sig = await sigRes.json();

      if (!sigRes.ok) return null;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", "insights");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await uploadRes.json();

      if (!uploadRes.ok) return null;

      return data.secure_url ?? null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    if (!title.trim()) {
      message.error("Title is required");
      return;
    }

    try {
      setAction("saving");

      let coverImageUrl: string | null = existingImage;

      // upload new image if selected
      if (coverFile) {
        const uploaded = await uploadImage(coverFile);
        if (uploaded) coverImageUrl = uploaded;
      }

      const res = await fetch(`/api/admin/insights/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          summary,
          content,
          published,
          coverImage: coverImageUrl,
        }),
      });

      if (!res.ok) throw new Error();

      message.success("Insight updated successfully");
    } catch (err) {
      console.error(err);
      message.error("Failed to update insight");
    } finally {
      setAction("idle");
    }
  };

  // ---------------- LOADING UI ----------------
  if (fetching) {
    return (
      <div className="min-h-screen bg-[#FFF7E7] p-10 text-[#5F021F]">
        Loading insight...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10 text-[#5F021F]/90">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#5F021F]/75 px-8 py-8 text-white">
          <h1 className="text-3xl font-bold">Edit Insight</h1>
          <p className="text-white/70 mt-2">ID: {id}</p>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6">

          {/* IMAGE SECTION */}
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="w-full border p-3 rounded-xl"
            />

            <div className="flex gap-4">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="preview"
                  width={120}
                  height={120}
                  className="rounded-xl object-cover"
                />
              ) : existingImage ? (
                <Image
                  src={existingImage}
                  alt="existing"
                  width={120}
                  height={120}
                  className="rounded-xl object-cover"
                />
              ) : null}
            </div>
          </div>

          {/* FIELDS */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border p-4 rounded-xl"
          />

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Slug"
            className="w-full border p-4 rounded-xl"
          />

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summary"
            className="w-full border p-4 rounded-xl"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={10}
            className="w-full border p-4 rounded-xl"
          />

          {/* PUBLISHED */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={() => setPublished(!published)}
            />
            Published
          </label>

          {/* ACTIONS */}
          {/* ACTIONS */}
<div className="flex flex-wrap gap-4 pt-6">

  {/* SAVE */}
  <button
    onClick={handleSave}
    disabled={isLoading}
    className="px-6 py-4 bg-[#5F021F] text-white rounded-xl font-semibold hover:bg-[#4A0118] disabled:opacity-50"
  >
    {isLoading ? "Saving..." : "Save Changes"}
  </button>

  {/* SEND */}
  <button
   onClick={async () => {
  try {
    setAction("saving");

    const res = await fetch(`/api/admin/insights/send/${id}`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok || data?.success === false) {
      throw new Error();
    }

    message.success("Insight sent successfully");

    // ✅ redirect after success
    router.push("/admin/insights");

  } catch (err) {
    console.error(err);
    message.error("Failed to send insight");
  } finally {
    setAction("idle");
  }
}}
    disabled={isLoading}
    className="px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
  >
    Send Insight
  </button>

</div>
        </div>
      </div>
    </div>
  );
}