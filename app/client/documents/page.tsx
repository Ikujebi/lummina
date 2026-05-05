"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  FolderOpen,
} from "lucide-react";

import { ClientDocument } from "@/types/document";
import DocumentCard from "@/app/components/client/documents/DocumentCard";

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

 useEffect(() => {
  async function fetchDocuments() {
    try {
      const res = await fetch("/api/clients/documents", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API ERROR:", data);

        throw new Error(
          data.message || "Failed to fetch documents"
        );
      }

      setDocuments(data);
    } catch (error) {
      console.error("DOCUMENT_FETCH_ERROR", error);
    } finally {
      setLoading(false);
    }
  }

  fetchDocuments();
}, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const value = search.toLowerCase();

      return (
        doc.title.toLowerCase().includes(value) ||
        doc.matter?.caseNumber
          ?.toLowerCase()
          .includes(value) ||
        doc.fileType.toLowerCase().includes(value)
      );
    });
  }, [documents, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Documents
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Access your legal documents and case files.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search documents"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-black"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <FolderOpen className="mb-4 h-14 w-14 text-gray-300" />

          <h2 className="text-lg font-semibold text-gray-900">
            No documents found
          </h2>

          <p className="mt-2 max-w-md text-sm text-gray-500">
            Your uploaded case documents will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
            />
          ))}
        </div>
      )}
    </div>
  );
}