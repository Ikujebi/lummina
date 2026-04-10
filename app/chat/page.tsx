"use client";

import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { Message, Attachment } from "@/types/chat";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const matterId = searchParams.get("matterId") || "";

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ✅ SCROLL REFS
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userId = user?.id;

  // =====================
  // AUTH GUARD
  // =====================
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!matterId) {
      router.push("/cases");
      return;
    }
  }, [user, loading, matterId, router]);

  // =====================
  // FETCH MESSAGES
  // =====================
  useEffect(() => {
    if (!matterId) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?matterId=${matterId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const normalized: Message[] = Array.isArray(data)
          ? data
          : data?.data ?? [];

        setMessages(normalized);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
      }
    }

    fetchMessages();
  }, [matterId]);

  // =====================
  // PUSHER REALTIME
  // =====================
  useEffect(() => {
    if (!matterId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "eu",
    });

    const channel = pusher.subscribe(`matter-${matterId}`);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    channel.bind("update-message", (updated: Message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updated.id ? updated : msg))
      );
    });

    channel.bind("delete-message", ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    return () => {
      pusher.unsubscribe(`matter-${matterId}`);
      pusher.disconnect();
    };
  }, [matterId]);

  // =====================
  // AUTO RESIZE TEXTAREA
  // =====================
  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "40px";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);

  // =====================
  // AUTO SCROLL TO BOTTOM (WHATSAPP STYLE)
  // =====================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // =====================
  // UPLOAD FILE
  // =====================
  async function uploadFile(file: File): Promise<Attachment> {
    setIsUploading(true);
    setUploadError(null);

    try {
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
        fileType: data.fileType,
        fileName: file.name,
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed";

      setUploadError(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }

  // =====================
  // SEND MESSAGE
  // =====================
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!input && !file) return;
    if (!userId || !matterId) return;

    try {
      let uploadedAttachment: Attachment | null = null;

      if (file) {
        uploadedAttachment = await uploadFile(file);
      }

      const attachments = uploadedAttachment ? [uploadedAttachment] : [];

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          matterId,
          attachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send message");
      }

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === data.data.id);
        if (exists) return prev;
        return [...prev, data.data];
      });

      setInput("");
      setFile(null);
      setUploadError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  // =====================
  // UI
  // =====================
  return (
    <div className="h-screen flex flex-col bg-[#F7e7ce] text-[#5F021F] overflow-hidden">

      {/* HEADER */}
      <div className="p-4 bg-white shadow font-semibold">
        Case Chat
      </div>

      {uploadError && (
        <div className="px-4 py-2 text-sm text-red-500">
          {uploadError}
        </div>
      )}

      {/* MESSAGES (SCROLL AREA) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded shadow max-w-[70%] ${
              msg.senderId === userId
                ? "ml-auto bg-[#FFD6A5]"
                : "mr-auto bg-white"
            }`}
          >
            <p>{msg.content}</p>

           {msg.attachments?.map((att, i) => {
  const type = att.fileType || "";
  const isImage = type.startsWith("image");
  const isPDF = type.includes("pdf");
  const isDoc = type.includes("word") || type.includes("officedocument");

  return (
    <div key={i} className="mt-2">
      {/* IMAGE */}
      {isImage && (
        <Image
          src={att.fileUrl}
          alt="attachment"
          width={200}
          height={200}
          className="rounded-lg"
        />
      )}

      {/* PDF */}
      {isPDF && (
        <iframe
          src={att.fileUrl}
          className="w-full h-[400px] rounded-lg border"
        />
      )}

      {/* DOCX */}
      {isDoc && (
        <a
          href={att.fileUrl}
          target="_blank"
          className="text-blue-600 underline"
        >
          📄 Download Document
        </a>
      )}

      {/* OTHER FILES */}
      {!isImage && !isPDF && !isDoc && (
        <a
          href={att.fileUrl}
          target="_blank"
          className="text-blue-600 underline"
        >
          Download File
        </a>
      )}
    </div>
  );
})}
          </div>
        ))}

        {/* 👇 IMPORTANT: scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white flex items-end gap-2 border-t"
      >
        <div className="relative flex items-end flex-1 bg-[#FFF4E0] rounded-2xl px-3 py-2 gap-2">

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) setFile(selected);
            }}
            className="hidden"
          />

          {file && (
            <div className="absolute bottom-14 left-2 bg-white shadow px-3 py-2 rounded-lg text-xs flex items-center gap-2">
              📎 {file.name}
              <button type="button" onClick={() => setFile(null)}>
                ✕
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none resize-none max-h-[120px]"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </button>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="bg-[#5F021F] text-white px-4 py-2 rounded-xl"
        >
          {isUploading ? "⏳" : "📤"}
        </button>
      </form>
    </div>
  );
}