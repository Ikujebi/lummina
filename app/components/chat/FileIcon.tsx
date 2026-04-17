// components/chat/FileIcon.tsx
import { FileText, Image, Video, File, FileSpreadsheet, Archive } from "lucide-react";

export function FileIcon({ type }: { type: string }) {
  if (type === "image") return <Image size={18} aria-label="Image file" />;
  if (type === "video") return <Video size={18} aria-label="Video file" />;
  if (type === "pdf") return <FileText size={18} aria-label="PDF file" />;
  if (type === "sheet") return <FileSpreadsheet size={18} aria-label="Spreadsheet file" />;
  if (type === "zip") return <Archive size={18} aria-label="Zip file" />;

  return  <File size={18} aria-hidden="true" />
}
