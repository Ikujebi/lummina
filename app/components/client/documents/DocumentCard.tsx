"use client";

import Link from "next/link";
import {
  Calendar,
  Download,
  FileText,
  Scale,
} from "lucide-react";

import { ClientDocument } from "@/types/document";

interface Props {
  document: ClientDocument;
}

export default function DocumentCard({ document }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <FileText className="h-6 w-6 text-black" />
          </div>

          <div>
            <h2 className="line-clamp-1 text-sm font-semibold text-gray-900">
              {document.title}
            </h2>

            <p className="mt-1 text-xs text-gray-500 uppercase">
              {document.fileType}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Scale className="h-4 w-4" />

          <span>
            {document.matter?.caseNumber || "No case number"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />

          <span>
            {new Date(document.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-black text-sm font-medium text-white transition hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Download
        </a>

        <Link
          href={`/client/documents/${document.id}`}
          className="flex h-10 flex-1 items-center justify-center rounded-xl border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Details
        </Link>
      </div>
    </div>
  );
}