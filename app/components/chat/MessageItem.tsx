"use client";

import { Message } from "@/types/chat";
import { formatChatTime } from "@/lib/chat/timeUtils";
import AttachmentRenderer from "./AttachmentRenderer";

type Props = {
  msg: Message;
  userId: string;
  onPreview: (url: string, type: string) => void;
};

export default function MessageItem({ msg, userId, onPreview }: Props) {
  const isMe = msg.senderId === userId;

  return (
    <div
      className={`flex flex-col max-w-[75%] ${
        isMe ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      <div
        className={`px-3 py-2 rounded-2xl ${
          isMe ? "bg-[#FFD6A5]" : "bg-white"
        }`}
      >
        {msg.content && (
          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
        )}

        {/* ---------------- ATTACHMENTS ---------------- */}
        {msg.attachments?.length ? (
          <div className="mt-2 flex flex-col gap-2">
            {msg.attachments.map((att) => (
              <AttachmentRenderer
                key={att.fileUrl}
                attachment={att}
                onPreview={onPreview}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="text-[10px] opacity-60 mt-1">
        {formatChatTime(msg.createdAt)}
      </div>
    </div>
  );
}