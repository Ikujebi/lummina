"use client";

import { useEffect, useMemo, useState } from "react";
import { Spin } from "antd";

interface Document {
  id: string;
  name: string;
  fileUrl: string;
  status: "DRAFT" | "FINAL" | "SIGNED";
  matterId?: string;
  matter?: {
    title: string;
  };
  uploader?: {
    name: string;
  };
}

type TabType = "all" | "cases" | "status" | "mine";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabType>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<string>("all");

  // ================= FETCH =================
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

  // ================= CASE LIST =================
  const cases = useMemo(() => {
    return Array.from(
      new Map(
        documents.map((d) => [d.matterId, d.matter?.title])
      )
    ).filter(([id]) => id);
  }, [documents]);

  // ================= FILTERING ENGINE =================
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.matter?.title?.toLowerCase().includes(search.toLowerCase()) ||
        doc.uploader?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || doc.status === statusFilter;

      const matchesCase =
        selectedCase === "all" || doc.matterId === selectedCase;

      return matchesSearch && matchesStatus && matchesCase;
    });
  }, [documents, search, statusFilter, selectedCase]);

  // ================= GROUP BY CASE (Drive-style) =================
  const groupedByCase = useMemo(() => {
    return filteredDocs.reduce((acc: Record<string, Document[]>, doc) => {
      const key = doc.matter?.title || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(doc);
      return acc;
    }, {});
  }, [filteredDocs]);

  // ================= UI =================
  return (
    <Spin spinning={loading} size="large">
      <div className="p-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between mb-4 gap-3">
          <div>
            <p className="text-xs tracking-widest text-[#FFA500] uppercase">
              Legal Drive
            </p>
            <h1 className="text-3xl font-semibold text-[#5F021F]">
              Documents
            </h1>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="px-4 py-2 rounded-xl bg-[#FFF4E0] outline-none w-full sm:w-64"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { key: "all", label: "All Files" },
            { key: "cases", label: "By Case" },
            { key: "status", label: "By Status" },
            { key: "mine", label: "My Uploads" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as TabType)}
              className={`px-3 py-1 rounded-full text-sm ${
                tab === t.key
                  ? "bg-[#5F021F] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFF4E0] rounded"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="FINAL">Final</option>
            <option value="SIGNED">Signed</option>
          </select>

          <select
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            className="px-3 py-2 bg-[#FFF4E0] rounded"
          >
            <option value="all">All Cases</option>
            {cases.map(([id, title]) => (
              <option key={id as string} value={id as string}>
                {title as string}
              </option>
            ))}
          </select>
        </div>

        {/* CONTENT */}
        {tab === "cases" ? (
          // ================= DRIVE STYLE GROUPED =================
          Object.entries(groupedByCase).map(([caseName, docs]) => (
            <div key={caseName} className="mb-8">
              <h2 className="text-lg font-semibold text-[#5F021F] mb-3">
                {caseName}
              </h2>

              <div className="grid gap-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white rounded-xl shadow flex justify-between"
                  >
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.uploader?.name}
                      </p>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      className="text-[#FFA500]"
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // ================= TABLE VIEW =================
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[#5F021F]">
                  <th className="p-3">Name</th>
                  <th className="p-3">Case</th>
                  <th className="p-3">Uploader</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">File</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-[#FFF4E0]/40">
                    <td className="p-3">{doc.name}</td>
                    <td className="p-3">{doc.matter?.title || "-"}</td>
                    <td className="p-3">{doc.uploader?.name || "-"}</td>
                    <td className="p-3">{doc.status}</td>
                    <td className="p-3">
                      <a
                        href={doc.fileUrl}
                        className="text-[#FFA500] underline"
                        target="_blank"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Spin>
  );
}