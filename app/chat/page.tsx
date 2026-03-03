// app/chat/page.tsx
"use client";

import { useState } from "react";

type Message = {
  id: string;
  text: string;
  time: string;
  sender: "user" | "partner";
};

const messages: Message[] = [
  { id: "1", text: "Hello Laura, I reviewed the latest attached documents. The updated inventory of assets is still missing.", time: "11:04 AM", sender: "partner" },
  { id: "2", text: "Perfect, I am consolidating it. Do you need me to sign it digitally?", time: "11:12 AM", sender: "user" },
  { id: "3", text: "Yes, ideally with an electronic signature and attaching the latest appraisal. You can use the \"Upload Document\" button.", time: "11:14 AM", sender: "partner" },
  { id: "4", text: "Thanks for the step summary. I confirm the power of attorney is scheduled for September 14.", time: "6:22 PM", sender: "user" },
  { id: "5", text: "Excellent, I will wait for the attendance confirmation. Let me know about any changes.", time: "6:29 PM", sender: "partner" },
];

export default function ChatPage() {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen bg-[#F7e7ce] font-inter text-[#5F021F] grid lg:grid-cols-[320px_1fr] grid-rows-[80px_1fr]">
      {/* Topbar */}
      <header className="col-span-full flex items-center gap-6 px-8 bg-white shadow-md">
        <a href="/dashboard" className="text-2xl p-2 rounded hover:bg-gray-100">⬅️</a>
        <div className="flex items-center gap-2 text-[#FFA500] font-poppins font-semibold text-xl">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <path d="M14 2l8 3v7c0 5.523-3.08 9.41-8 11-4.92-1.59-8-5.477-8-11V5l8-3z" fill="currentColor" opacity="0.15"/>
            <path d="M22 5v7c0 4.971-2.593 8.22-8 10-5.407-1.78-8-5.029-8-10V5l8-3 8 3z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 13.5l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          LexTrust
        </div>
        <div className="ml-auto flex flex-col text-sm">
          <span className="uppercase text-gray-500 text-xs">Active case</span>
          <span className="font-semibold">Gómez Family Succession</span>
        </div>
        <button className="ml-4 p-2 text-xl rounded hover:bg-gray-100">⋮</button>
      </header>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col gap-4 bg-white p-6 border-r border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Conversations</h2>
          <a href="/chat" className="bg-[#FFA500] text-white px-3 py-1 rounded">New Chat</a>
        </div>
        <ul className="flex flex-col gap-3">
          <li className="flex items-center gap-3 p-2 bg-[#FFE5B4] rounded shadow-sm">
            <img src="https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=80&q=80" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-semibold">Lawyer Juan Pérez</p>
              <p className="text-gray-500 text-sm">“I have reviewed the documents...”</p>
            </div>
            <span className="text-green-600 text-sm font-semibold">Online</span>
          </li>
          <li className="flex items-center gap-3 p-2 rounded shadow-sm hover:bg-gray-50">
            <img src="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=crop&w=80&q=80" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-semibold">LexTrust Support</p>
              <p className="text-gray-500 text-sm">“We are sharing the glossary with you...”</p>
            </div>
            <span className="text-gray-500 text-sm">1h ago</span>
          </li>
          <li className="flex items-center gap-3 p-2 rounded shadow-sm hover:bg-gray-50">
            <img src="https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=80&q=80" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-semibold">Lawyer María Ruiz</p>
              <p className="text-gray-500 text-sm">“I am waiting for the attachments...”</p>
            </div>
            <span className="text-gray-500 text-sm">Yesterday</span>
          </li>
        </ul>
      </aside>

      {/* Chat Panel */}
      <section className="flex flex-col gap-4 p-8 bg-white">
        <header className="flex justify-between items-center bg-[#FFE5B4] p-4 rounded shadow-sm">
          <div className="flex items-center gap-4">
            <img src="https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=120&q=80" className="w-16 h-16 rounded-lg object-cover shadow" />
            <div>
              <p className="font-semibold">Lawyer Juan Pérez</p>
              <p className="text-green-600 text-sm">Connected • replies in minutes</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a href="/glossary#docs" className="border border-[#FFA500] text-[#FFA500] px-3 py-1 rounded hover:bg-[#FFA500]/10">Upload case document</a>
            <div className="bg-white border p-2 rounded shadow text-sm text-[#5F021F]">
              <span className="uppercase text-[#FFA500] text-xs">Step 4</span>
              <p>Need context? Open the glossary and attach your files from here.</p>
            </div>
          </div>
        </header>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4 bg-[#F7e7ce] rounded-lg shadow-md">
          <div className="self-center text-gray-500 text-xs uppercase">Today — September 12</div>
          {messages.map((msg) => (
            <div key={msg.id} className={`max-w-[70%] p-3 rounded-2xl shadow ${msg.sender === "user" ? "self-end bg-[#FFA500]/20" : "self-start bg-white"}`}>
              <p className="text-[#5F021F]">{msg.text}</p>
              <span className="text-gray-500 text-xs">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Input */}
        <form className="flex items-center gap-2 mt-4 bg-white p-3 rounded shadow">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded border border-gray-300 resize-none focus:outline-[#FFA500]"
            rows={1}
          />
          <button type="button" className="p-2 bg-white rounded hover:bg-gray-100">📎</button>
          <button type="submit" className="p-2 bg-[#FFA500] text-white rounded">📤</button>
        </form>
      </section>
    </div>
  );
}