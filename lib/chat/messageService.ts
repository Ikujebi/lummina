import { Message, Attachment } from "@/types/chat";

export async function fetchMessages(matterId: string): Promise<Message[]> {
  const res = await fetch(`/api/messages?matterId=${matterId}`);
  const data = await res.json();

  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function sendMessage(payload: {
  content: string;
  matterId: string;
  attachments: Attachment[];
}) {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return data.data;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok || !data.fileUrl) {
    throw new Error(data?.error || "Upload failed");
  }

  return {
    fileUrl: data.fileUrl,
    fileName: data.fileName || file.name,
    fileType: file.type,
  };
}