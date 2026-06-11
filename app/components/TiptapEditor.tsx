"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2], // Restrict to H2 for clean layout consistency
        },
      }),
    ],
    content: value,
    // Trigger state changes whenever the user types or formats text
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // Style the input workspace area using Tailwind
        class: "prose max-w-none focus:outline-none min-h-[250px] p-5 text-black",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="w-full rounded-2xl border border-gray-200 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#5F021F]/20">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 bg-gray-50 border-b border-gray-200 p-2 text-gray-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-[#5F021F]/10 hover:text-[#5F021F] transition ${editor.isActive("bold") ? "bg-[#5F021F]/10 text-[#5F021F] font-bold" : ""}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-[#5F021F]/10 hover:text-[#5F021F] transition ${editor.isActive("italic") ? "bg-[#5F021F]/10 text-[#5F021F] font-bold" : ""}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-[#5F021F]/10 hover:text-[#5F021F] transition ${editor.isActive("heading", { level: 2 }) ? "bg-[#5F021F]/10 text-[#5F021F] font-bold" : ""}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-[#5F021F]/10 hover:text-[#5F021F] transition ${editor.isActive("bulletList") ? "bg-[#5F021F]/10 text-[#5F021F] font-bold" : ""}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-[#5F021F]/10 hover:text-[#5F021F] transition ${editor.isActive("orderedList") ? "bg-[#5F021F]/10 text-[#5F021F] font-bold" : ""}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      {/* TEXT AREA WORKSPACE */}
      <EditorContent editor={editor} />
    </div>
  );
}