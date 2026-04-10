"use client";

import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { Message, Attachment } from "@/types/chat";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const matterId = searchParams.get("matterId") || "";

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const userId = user?.id;
  const role = user?.role;

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
        setMessages(data);
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
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`matter-${matterId}`);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // =====================
  // UPLOAD FILE
  // =====================
  async function uploadFile(file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/messages/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();

    return {
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileName: file.name,
    };
  }

  // =====================
  // SEND MESSAGE
  // =====================
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!input && !file) return;

    try {
      const attachments: Attachment[] = [];

      if (file) {
        const uploaded = await uploadFile(file);
        attachments.push(uploaded);
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          matterId,
          attachments,
          senderId: userId,
          senderRole: role,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setInput("");
      setFile(null);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen flex flex-col bg-[#F7e7ce] text-[#5F021F]">

      <div className="p-4 bg-white shadow font-semibold">
        Case Chat
      </div>

      {/* MESSAGES */}
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

            {/* ATTACHMENTS */}
            {msg.attachments?.map((att, i) => (
              <a
                key={i}
                href={att.fileUrl}
                target="_blank"
                className="text-blue-500 underline block mt-2"
              >
                {att.fileName ?? "View attachment"}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white flex items-end gap-2 border-t"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-xl hover:bg-gray-100 rounded"
        >
          📎
        </button>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded resize-none overflow-hidden"
          rows={1}
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />

        <button
          type="submit"
          className="p-2 bg-[#5F021F] text-white rounded"
        >
          📤
        </button>
      </form>
    </div>
  );
}