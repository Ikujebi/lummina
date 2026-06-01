"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditInsightPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  // FETCH INSIGHT
  const fetchInsight = async (insightId: string) => {
    try {
      setFetching(true);

      const res = await fetch(`/api/admin/insights/${insightId}`);
      const data = await res.json();

      setTitle(data.title);
      setSlug(data.slug);
      setSummary(data.summary);
      setContent(data.content);
      setPublished(data.published);
    } catch (err) {
      console.error(err);
      alert("Failed to load insight");
    } finally {
      setFetching(false);
    }
  };

  // ✅ SAFE useEffect PATTERN (your requested format)
  useEffect(() => {
    const load = async () => {
      if (!id) return;
      await fetchInsight(id);
    };

    load();
  }, [id]);

  // SAVE
  const handleSave = async () => {
    try {
      setLoading(true);

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
        }),
      });

      if (!res.ok) throw new Error();

      alert("Insight updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating insight");
    } finally {
      setLoading(false);
    }
  };

  // SEND
  const handleSend = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/insights/send/${id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();

      alert("Insight sent to subscribers");
    } catch (err) {
      console.error(err);
      alert("Error sending insight");
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this insight?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/insights/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      alert("Insight deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting insight");
    } finally {
      setLoading(false);
    }
  };

  // LOADING UI
  if (fetching) {
    return (
<div className="min-h-screen bg-[#FFF7E7] p-6 md:p-10 text-[#5F021F]/90">        <div className="text-[#5F021F] font-semibold">
          Loading insight...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-[#FFF7E7] p-6 md:p-10 text-[#5F021F]/90">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#5F021F]/10 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-[#5F021F]/75 px-8 py-8 text-white">
          <p className="uppercase tracking-widest text-[#F4C430] text-xs font-semibold">
            Lummina Insights
          </p>

          <h1 className="text-3xl font-bold mt-3">
            Edit Insight
          </h1>

          <p className="text-white/70 mt-2">
            Insight ID: {id}
          </p>

          <div className={`mt-4 px-4 py-2 rounded-full text-sm font-semibold w-fit ${
            published
              ? "bg-green-500/20 text-green-200"
              : "bg-yellow-500/20 text-yellow-200"
          }`}>
            {published ? "Published" : "Draft"}
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8">

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none "
          />

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none "
          />

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none "
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none"
          />

          <input
            type="file"
            className="w-full rounded-2xl border px-5 py-4 focus:outline-none"
          />

          {/* TOGGLE */}
          <div className="flex items-center gap-4 bg-[#FFF4E0] rounded-2xl p-5 border border-[#5F021F]/10">
            <input
              type="checkbox"
              checked={published}
              onChange={() => setPublished(!published)}
              className="h-5 w-5 accent-[#5F021F] focus:outline-none"
            />

            <div>
              <p className="font-semibold text-[#5F021F]">Published</p>
              <p className="text-sm text-[#5F021F]/60">
                Toggle visibility of this insight
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-4 pt-6">

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-4 rounded-2xl bg-[#5F021F]/75 text-white font-semibold hover:bg-[#4A0118]"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={handleSend}
              disabled={loading}
              className="px-6 py-4 rounded-2xl bg-[#F4C430] text-[#5F021F] font-semibold"
            >
              Send To Subscribers
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-4 rounded-2xl border border-red-200 text-red-600 font-semibold"
            >
              Delete Insight
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}