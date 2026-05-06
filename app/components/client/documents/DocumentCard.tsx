"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Download, FileText, Scale } from "lucide-react";
import { ClientDocument } from "@/types/document";

interface Props {
  document: ClientDocument;
}

export default function DocumentCard({ document }: Props) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(document.fileUrl);
  const isPdf = /\.pdf$/i.test(document.fileUrl);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">

      {/* PREVIEW (SMALLER + TIGHTER) */}
      <div className="relative aspect-[6/2] w-[1/4] bg-gray-50">

        {document.previewUrl && isImage ? (
          <Image
            src={document.previewUrl}
            alt={document.name}
            fill
            className="object-cover"
          />
        ) : isImage ? (
          <Image
            src={document.fileUrl}
            alt={document.name}
            fill
            className="object-cover"
          />
        ) : isPdf ? (
          <iframe
            src={`${document.fileUrl}#toolbar=0`}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
            No preview available
          </div>
        )}

      </div>

      {/* CONTENT */}
      <div className="space-y-2 p-2.5">

        {/* TITLE ROW */}
        <div className="flex items-start gap-2">

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFF4E0]">
            <FileText className="h-3.5 w-3.5 text-[#5F021F]" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xs font-semibold text-gray-900">
              {document.name}
            </h2>

            <p className="text-[10px] font-medium text-[#5F021F] uppercase">
              {document.status}
            </p>
          </div>

        </div>

        {/* META */}
        <div className="space-y-1 text-[11px] text-gray-600">

          <div className="flex items-center gap-2">
            <Scale className="h-3 w-3 text-[#FFA500]" />
            <span className="truncate">
              {document.matter?.caseNumber || "No case number"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-[#FFA500]" />
            <span>
              {new Date(document.createdAt).toLocaleDateString()}
            </span>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 pt-1">

          <a
            href={document.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md bg-[#5F021F] text-[10px] font-medium text-white hover:opacity-90"
          >
            <Download className="h-3 w-3" />
            Download
          </a>

          <Link
            href={`/client/documents/${document.id}`}
            className="flex h-7 flex-1 items-center justify-center rounded-md border border-gray-200 text-[10px] font-medium text-gray-700 hover:bg-[#FFF4E0]"
          >
            Details
          </Link>

        </div>

      </div>
    </div>
  );
}