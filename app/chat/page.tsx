"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Message } from "@/types/chat";
import {  useSearchParams } from "next/navigation";

export default function ChatPage() {
  
  const searchParams = useSearchParams();
  const matterId = searchParams.get("matterId") || ""; // dynamic from URL query

  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // =====================
  // Fetch initial messages
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
  // Pusher realtime
  // =====================
  useEffect(() => {
    if (!matterId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "eu",
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
  // Upload file
  // =====================
  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url as string;
  }

  // =====================
  // Send message
  // =====================
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input && !file) return;

    const attachmentUrls: string[] = [];
    if (file) {
      const url = await uploadFile(file);
      attachmentUrls.push(url);
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input, matterId, attachments: attachmentUrls }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error("Failed to send message:", err);
    }

    setInput("");
    setFile(null);
  }

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen flex flex-col bg-[#F7e7ce] text-[#5F021F]">
      {/* Header */}
      <div className="p-4 bg-white shadow font-semibold">Chat Room</div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-3 rounded shadow max-w-[70%]">
            <p>{msg.content}</p>
            {msg.attachments?.map((att, i) => (
              <a key={i} href={att.fileUrl} target="_blank" className="text-blue-500 underline block mt-2">
                View attachment
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white flex items-center gap-2 border-t">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded resize-none"
          rows={1}
        />
        <button type="submit" className="bg-[#FFA500] text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
  );
}