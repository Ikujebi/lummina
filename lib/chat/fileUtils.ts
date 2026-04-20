export function getFilePreview(file: File | null) {
  if (!file) return null;

  return {
    url: URL.createObjectURL(file),
    type: file.type || "",
  };
}

export function getAttachmentType(url: string, fileType?: string) {
  const type = (fileType || "").toLowerCase();
  const lower = (url || "").toLowerCase();

  const isImage =
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/.test(lower);

  const isVideo =
    type.startsWith("video/") ||
    /\.(mp4|mov|webm|avi)$/.test(lower);

  const isPDF =
    type === "application/pdf" ||
    type.includes("pdf") ||
    lower.includes(".pdf");

  const isDoc =
  type.includes("word") ||
  type.includes("officedocument") ||
  type.includes("msword") ||
  /\.(doc|docx)$/i.test(lower);

  return { isImage, isVideo, isPDF, isDoc };
}