"use client";

import Image from "next/image";
import { optimizeCloudinary, forceCloudinaryDownload } from "@/lib/chat/cloudinary";
import { getAttachmentType } from "@/lib/chat/fileUtils";
import {  Attachment } from "@/types/chat";

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
        <div className="bg-gray-100 p-3 rounded flex gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">{attachment.fileName}</p>

            <div className="flex gap-2 mt-2">
              <a href={url} target="_blank" className="text-xs px-2 py-1 bg-white border rounded">
                Open
              </a>

              <a
                href={forceCloudinaryDownload(url)}
                target="_blank"
                className="text-xs px-2 py-1 bg-[#5F021F] text-white rounded"
              >
                Download
              </a>
            </div>
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