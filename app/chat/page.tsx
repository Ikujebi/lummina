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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: string;
  } | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!matterId) {
      router.push("/cases");
      return;
    }
  }, [user, loading, matterId, router]);

  useEffect(() => {
    if (!matterId) return;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?matterId=${matterId}`);
        const data = await res.json();

        const normalized: Message[] = Array.isArray(data)
          ? data
          : (data?.data ?? []);

        setMessages(normalized);
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    }

    fetchMessages();
  }, [matterId]);

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
        prev.map((m) => (m.id === updated.id ? updated : m)),
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "40px";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);

  function formatChatTime(date?: string | Date) {
    if (!date) return "";

    const d = new Date(date);
    const now = new Date();

    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return d.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!input && !file) return;
    if (!userId || !matterId) return;

    try {
      let uploadedAttachment: Attachment | null = null;

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
          fileType: data.fileType,
          fileName: file.name,
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

      setMessages((prev) => [...prev, data.data]);

      setInput("");
      setFile(null);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      return;
    } finally {
      setIsUploading(false);
    }
  }
  const filePreviewUrl = file ? URL.createObjectURL(file) : null;
  const filePreviewType = file?.type || "";

  return (
    <div className="h-screen flex flex-col bg-[#F7e7ce] text-[#5F021F] overflow-hidden">
      <div className="p-4 bg-white shadow font-semibold">Case Chat</div>

      {uploadError && (
        <div className="mx-4 my-2 text-sm text-red-500 bg-red-50 p-2 rounded-lg">
          {uploadError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === userId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[75%] ${
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-2xl shadow-sm ${
                  isMe
                    ? "bg-[#FFD6A5] rounded-br-none"
                    : "bg-white rounded-bl-none"
                }`}
              >
                {msg.content && (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                )}

                {(() => {
                  const attachments = msg.attachments ?? [];
                  if (attachments.length === 0) return null;

                  return (
                    <div className="mt-2 flex flex-col gap-2">
                      {attachments.map((att, i) => {
                        const url = att.fileUrl.toLowerCase();
                        const mime = (att.fileType || "").toLowerCase();

                        const isImage =
                          mime.startsWith("image") ||
                          /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(url);

                        const isVideo =
                          mime.startsWith("video") ||
                          /\.(mp4|mov|webm|avi)$/i.test(url);

                        const isPDF =
                          mime.includes("pdf") || url.endsWith(".pdf");

                        const isDoc =
                          mime.includes("word") ||
                          mime.includes("officedocument") ||
                          /\.(doc|docx)$/i.test(url);
                        return (
                          <div key={i}>
                            {isImage && (
                              <div
                                className="cursor-pointer"
                                onClick={() =>
                                  setSelectedMedia({
                                    url: att.fileUrl,
                                    type: att.fileType ?? "",
                                  })
                                }
                              >
                                <Image
                                  src={att.fileUrl}
                                  alt="attachment"
                                  width={250}
                                  height={250}
                                  className="rounded-xl object-cover"
                                />
                              </div>
                            )}

                            {isVideo && (
                              <video
                                src={att.fileUrl}
                                className="rounded-xl max-w-[250px] cursor-pointer"
                                onClick={() =>
                                  setSelectedMedia({
                                    url: att.fileUrl,
                                    type: att.fileType ?? "",
                                  })
                                }
                              />
                            )}

                            {isPDF && (
                              <iframe
                                src={att.fileUrl}
                                className="w-full h-[250px] rounded-lg border"
                              />
                            )}

                            {isDoc && (
                              <a
                                href={att.fileUrl}
                                target="_blank"
                                className="flex items-center gap-2 text-sm underline"
                              >
                                📄 {att.fileName || "Document"}
                              </a>
                            )}

                            {!isImage && !isPDF && !isDoc && !isVideo && (
                              <a
                                href={att.fileUrl}
                                target="_blank"
                                className="text-sm text-blue-600 underline"
                              >
                                📎 Download file
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="text-[10px] opacity-60 mt-1 px-1">
                {formatChatTime(msg.createdAt)}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 bg-white flex items-end gap-2 border-t"
      >
        <div className="flex-1 bg-[#FFF4E0] rounded-2xl px-3 py-2 flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {file && (
            <div className="mb-2 relative w-fit">
              {filePreviewType.includes("image") && filePreviewUrl && (
                <Image
                  src={filePreviewUrl}
                  alt="preview"
                  width={120}
                  height={120}
                  className="rounded-lg object-cover"
                />
              )}

              {filePreviewType.includes("video") && filePreviewUrl && (
                <video
                  src={filePreviewUrl}
                  className="w-[120px] rounded-lg"
                  controls
                />
              )}

              {!filePreviewType.includes("image") &&
                !filePreviewType.includes("video") && (
                  <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    📎 {file.name}
                  </div>
                )}

              {/* remove button */}
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
              >
                ×
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

          <button type="button" onClick={() => fileInputRef.current?.click()}>
            📎
          </button>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="bg-[#5F021F] text-white px-4 py-2 rounded-xl disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "📤"}
        </button>
      </form>

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          {selectedMedia.type?.includes("image") ? (
            <Image
              src={selectedMedia.url}
              alt="preview"
              width={900}
              height={900}
              className="max-h-[90vh] w-auto rounded-lg"
            />
          ) : selectedMedia.type?.includes("video") ? (
            <video
              src={selectedMedia.url}
              controls
              autoPlay
              className="max-h-[90vh] w-auto rounded-lg"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
