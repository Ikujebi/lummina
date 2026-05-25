"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import type { StaticImageData } from "next/image";

interface Props {
  image: string | StaticImageData;
  uploading: boolean;
  progress: number;
  onFile: (file: File) => void;
}

export default function AvatarUploader({
  image,
  uploading,
  progress,
  onFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    onFile(file);
  }

  return (
    <div
      className={`relative w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden ${
        dragOver ? "ring-2 ring-[#5F021F]" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <Image src={image} alt="avatar" fill className="object-cover" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
        {uploading ? (
          <Loader2 className="text-white animate-spin" />
        ) : (
          <Camera className="text-white" />
        )}
      </div>

      {/* progress bar */}
      {uploading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
          <div
            className="h-full bg-[#5F021F] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}