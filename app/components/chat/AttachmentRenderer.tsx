"use client";

import Image from "next/image";
import { optimizeCloudinary, forceCloudinaryDownload } from "@/lib/chat/cloudinary";
import { getAttachmentType } from "@/lib/chat/fileUtils";
import {  Attachment } from "@/types/chat";
import { FileIcon } from "./FileIcon";
import "@/lib/chat/pdfWorker";
import {  Document, Page } from "react-pdf";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIC8+";

type Props = {
  attachment: Attachment;
  onPreview: (url: string, type: string) => void;
};

export default function AttachmentRenderer({ attachment, onPreview }: Props) {
  const { isImage, isVideo, isPDF, isDoc } = getAttachmentType(
    attachment.fileUrl,
    attachment.fileType
  );

  const url = attachment.fileUrl;

  return (
    <div>
      {isImage && (
        <div onClick={() => onPreview(url, attachment.fileType || "")}>
          <Image
            src={optimizeCloudinary(url)}
            alt="image"
            width={250}
            height={250}
            className="rounded-xl object-cover"
            placeholder="blur"
            blurDataURL={BLUR}
          />
        </div>
      )}

      {isVideo && (
        <video src={url} controls className="max-w-[250px] rounded-xl" />
      )}

     {isPDF && (
  <div
    className="bg-white border rounded-xl p-3 w-[260px] shadow-sm cursor-zoom-in"
    onClick={() => onPreview(url, attachment.fileType || "pdf")}
  >
    {/* PDF thumbnail */}
    <div className="rounded-md bg-gray-100 flex justify-center overflow-hidden">
      <Document file={url} loading={<p className="text-xs p-3">Loading...</p>}>
        <Page pageNumber={1} width={240} />
      </Document>
    </div>

    {/* file info */}
    <div className="flex items-center gap-2 mt-2">
      <FileIcon type="pdf" />
      <p className="text-sm font-medium truncate">
        {attachment.fileName}
      </p>
    </div>

    <p className="text-[11px] text-gray-500 mt-1">
      PDF Document
    </p>

    {/* actions */}
    <div className="flex gap-2 mt-3">
      <a
        href={url}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        className="text-xs px-3 py-1 bg-gray-100 rounded"
      >
        Open
      </a>

      <a
        href={url}
        download
        onClick={(e) => e.stopPropagation()}
        className="text-xs px-3 py-1 bg-[#5F021F] text-white rounded"
      >
        Download
      </a>
    </div>
  </div>
)}

      {isDoc && (
        <a href={forceCloudinaryDownload(url)} className="text-sm underline">
          📄 {attachment.fileName}
        </a>
      )}

      {!isImage && !isVideo && !isPDF && !isDoc && (
        <a href={forceCloudinaryDownload(url)} className="text-sm underline text-blue-600">
          📎 Download file
        </a>
      )}
    </div>
  );
}