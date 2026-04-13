"use client";

import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { Message } from "@/types/chat";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import Image from "next/image";

import MessageItem from "@/app/components/chat/MessageItem";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const matterId = searchParams.get("matterId") || "";
  const userId = user?.id;

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: string;
  } | null>(null);

  // ---------------- AUTH GUARD ----------------
  useEffect(() => {
    if (loading) return;

    if (!user) router.push("/");
    if (!matterId) router.push("/cases");
  }, [user, loading, matterId, router]);

  // ---------------- FETCH MESSAGES ----------------
  useEffect(() => {
    if (!matterId) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?matterId=${matterId}`);
        const data = await res.json();

        const normalized: Message[] = Array.isArray(data)
          ? data
          : data?.data ?? [];

        setMessages(normalized);
      } catch {
        setMessages([]);
      }
    }

    fetchMessages();
  }, [matterId]);

  // ---------------- PUSHER ----------------
  useEffect(() => {
    if (!matterId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "eu",
    });

    const channel = pusher.subscribe(`matter-${matterId}`);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    channel.bind("update-message", (updated: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    });

    channel.bind("delete-message", ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    return () => {
      pusher.unsubscribe(`matter-${matterId}`);
      pusher.disconnect();
    };
  }, [matterId]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- TEXTAREA AUTO HEIGHT ----------------
  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "40px";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);

  // ---------------- SEND MESSAGE ----------------
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!input && !file) return;
    if (!userId || !matterId) return;

    try {
      let uploadedAttachment = null;

      if (file) {
        setIsUploading(true);
        setUploadError(null);

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

        uploadedAttachment = {
          fileUrl: data.fileUrl,
          fileName: data.fileName || file.name,
          fileType: file.type,
        };
      }

      const res = await fetch("/api/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: input,
    matterId,
    attachments: uploadedAttachment ? [uploadedAttachment] : [],
  }),
});

      const data = await res.json();

console.log("Message send response:", data);
      setInput("");
      setFile(null);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed"
      );
    } finally {
      setIsUploading(false);
    }
  }

  const filePreviewUrl = file ? URL.createObjectURL(file) : null;
  const filePreviewType = file?.type || "";

  return (
    <div className="h-screen flex flex-col bg-[#F7e7ce] text-[#5F021F]">
      <div className="p-4 bg-white shadow font-semibold">
        Case Chat
      </div>

      {uploadError && (
        <div className="mx-4 my-2 text-red-500 text-sm bg-red-50 p-2 rounded">
          {uploadError}
        </div>
      )}

      {/* ---------------- MESSAGES ---------------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            msg={msg}
            userId={userId || ""}
            onPreview={(url, type) =>
              setSelectedMedia({ url, type })
            }
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ---------------- INPUT ---------------- */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white flex items-end gap-2 border-t"
      >
        <div className="flex-1 bg-[#FFF4E0] rounded-2xl p-2 flex gap-2">
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {/* FILE PREVIEW */}
          {file && filePreviewUrl && (
            <div className="relative">
              {filePreviewType.startsWith("image") && (
                <Image
                  src={filePreviewUrl}
                  width={100}
                  height={100}
                  alt="preview"
                />
              )}

              {filePreviewType.startsWith("video") && (
                <video src={filePreviewUrl} controls />
              )}

              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full"
              >
                ×
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none resize-none"
            placeholder="Type a message..."
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            📎
          </button>
        </div>

        <button
          disabled={isUploading}
          className="bg-[#5F021F] text-white px-4 rounded-xl"
        >
          {isUploading ? "..." : "📤"}
        </button>
      </form>

      {/* ---------------- MEDIA MODAL ---------------- */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedMedia(null)}
        >
          {selectedMedia.type.startsWith("image") ? (
            <Image
              src={selectedMedia.url}
              width={1000}
              height={1000}
              alt="preview"
            />
          ) : (
            <video src={selectedMedia.url} controls />
          )}
        </div>
      )}
    </div>
  );
}