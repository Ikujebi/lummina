"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  FolderOpen,
  AlertCircle,
} from "lucide-react";

import { ClientDocument } from "@/types/document";
import DocumentCard from "@/app/components/client/documents/DocumentCard";

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDocuments() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/clients/documents", {
          credentials: "include",
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message || "Failed to fetch documents"
          );
        }

        // ✅ FIXED: match backend response shape
        const docs: ClientDocument[] = data?.documents ?? [];

        setDocuments(docs);
      } catch (error) {
        if (error instanceof DOMException) return;

        console.error("DOCUMENT_FETCH_ERROR", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while fetching documents."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();

    return () => {
      controller.abort();
    };
  }, []);

  const filteredDocuments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return documents;

    return documents.filter((doc) => {
      const name = doc.name?.toLowerCase() || "";
      const caseNumber =
        doc.matter?.caseNumber?.toLowerCase() || "";
      const status = doc.status?.toLowerCase() || "";

      const fileType =
        doc.fileUrl?.split(".").pop()?.toLowerCase() || "";

      return (
        name.includes(value) ||
        caseNumber.includes(value) ||
        status.includes(value) ||
        fileType.includes(value)
      );
    });
  }, [documents, search]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Documents
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Access your legal documents and case files.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5"
          />
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-100 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
        </div>
      ) : error ? (
        /* ERROR STATE */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />

          <h2 className="text-lg font-semibold text-red-700">
            Failed to load documents
          </h2>

          <p className="mt-2 max-w-md text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        /* EMPTY STATE */
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
        /* DOCUMENT GRID */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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