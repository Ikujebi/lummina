"use client";

import { useEffect, useState } from "react";

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  status: "DRAFT" | "FINAL" | "SIGNED";
  createdAt: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/lawyer/documents");
      const data = await res.json();

      setDocs(data.documents || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="text-[#5F021F]">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold text-[#5F021F]">
        Documents
      </h1>

      <div className="grid gap-4">
        {docs.map((d) => (
          <div
            key={d.id}
            className="bg-[#FFF4E0] p-5 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-[#5F021F]">
                {d.name}
              </p>
              <p className="text-sm text-[#5F021F]/60">
                {new Date(d.createdAt).toDateString()}
              </p>
            </div>

            <a
              href={d.fileUrl}
              target="_blank"
              className="px-3 py-2 bg-[#FFA500] text-[#5F021F] rounded-lg text-sm"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}