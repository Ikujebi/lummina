export function getFilePreview(file: File | null) {
  if (!file) return null;

  return {
    url: URL.createObjectURL(file),
    type: file.type || "",
  };
}

export function getAttachmentType(url: string, fileType?: string) {
  const type = (fileType || "").toLowerCase();
  const lower = url.toLowerCase();

  const isImage =
    type.startsWith("image") ||
    /\.(jpg|jpeg|png|gif|webp)$/.test(lower);

  const isVideo =
    type.startsWith("video") ||
    /\.(mp4|mov|webm)$/.test(lower);

  const isPDF = type.includes("pdf") || lower.endsWith(".pdf");

  const isDoc =
    type.includes("word") || /\.(doc|docx)$/.test(lower);

  return { isImage, isVideo, isPDF, isDoc };
}