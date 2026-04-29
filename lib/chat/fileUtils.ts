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

  // 🔥 FULL DOCUMENT SUPPORT (Word, Excel, PowerPoint, Text, RTF, CSV)
  const isDoc =
    // Word
    type.includes("wordprocessingml") ||
    type.includes("msword") ||
    /\.(doc|docx)$/i.test(lower) ||

    // Excel
    type.includes("spreadsheetml") ||
    type.includes("excel") ||
    /\.(xls|xlsx|csv)$/i.test(lower) ||

    // PowerPoint
    type.includes("presentationml") ||
    /\.(ppt|pptx)$/i.test(lower) ||

    // RTF + Text
    type.includes("rtf") ||
    type === "application/rtf" ||
    type === "text/rtf" ||
    /\.(rtf|txt)$/i.test(lower);

  return {
    isImage,
    isVideo,
    isPDF,
    isDoc,
  };
}