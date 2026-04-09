"use client";

import { useEffect, useState } from "react";
import { Spin } from "antd";

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  status: "DRAFT" | "FINAL" | "SIGNED";
  matter?: {
    title: string;
  };
  uploader?: {
    name: string;
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ================= FETCH DOCUMENTS =================
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/documents");
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // ================= FILTER =================
  const filteredDocs = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.matter?.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.uploader?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= UI =================
  return (
    <Spin spinning={loading} size="large">
      <div className="p-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <p className="uppercase text-xs tracking-widest text-[#FFA500] mb-1">
              Legal Files
            </p>
            <h1 className="text-3xl font-semibold text-[#5F021F]">
              Documents
            </h1>
          </div>

          {/* SEARCH */}
          <div className="mt-4 lg:mt-0">
            <label className="relative flex items-center bg-[#FFF4E0] rounded-xl px-4 py-2 w-full sm:w-64">
              🔍
              <input
                type="search"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 bg-transparent outline-none w-full text-[#5F021F]"
              />
            </label>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-[#5F021F]">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Matter</th>
                <th className="p-3 font-medium">Uploaded By</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">File</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-400">
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b last:border-none hover:bg-[#FFF4E0]/40 transition"
                  >
                    <td className="p-3 text-[#5F021F]">
                      {doc.name}
                    </td>

                    <td className="p-3 text-gray-600">
                      {doc.matter?.title || "-"}
                    </td>

                    <td className="p-3 text-gray-600">
                      {doc.uploader?.name || "-"}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          doc.status === "SIGNED"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "FINAL"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        className="text-[#FFA500] hover:underline font-medium"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Spin>
  );
}