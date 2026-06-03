"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";
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
      const res = await fetch("/api/lawyers/documents");
      const data = await res.json();

      setDocs(data.documents || []);
      setLoading(false);
    }

    load();
  }, []);

  const handleDownload = async (
  url: string,
  filename: string
) => {
  const response = await fetch(url);
  const blob = await response.blob();

  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  a.remove();
  window.URL.revokeObjectURL(blobUrl);
};

  if (loading) {
  return (
    <div className="flex min-h-screen text-[#5F021F] items-center justify-center py-10">
      <Spin size="large" style={{ color: "#5F021F" }} description="Loading documents..."/>
    
    </div>
  );
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

           <div className="flex gap-2">
  <a
    href={d.fileUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="px-3 py-2 bg-[#FFA500] text-[#5F021F] rounded-lg text-sm"
  >
    View
  </a>

  <button
  onClick={() =>
    handleDownload(d.fileUrl, `${d.name}.pdf`)
  }
  className="px-3 py-2 bg-[#5F021F] text-white rounded-lg text-sm"
>
  Download
</button>
</div>

            
          </div>
        ))}
      </div>
    </div>
  );
}