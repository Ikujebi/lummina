"use client";

import { X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Confirm Action",
  description = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmStyle =
    variant === "danger"
      ? "bg-[#5F021F] hover:bg-[#4A0118] text-white"
      : "bg-green-600 hover:bg-green-700 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* modal */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
        
        {/* header */}
        <div className="bg-[#5F021F] px-6 py-5 text-white relative">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-white/70 text-sm mt-1">
            This action requires confirmation
          </p>

          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="bg-white px-6 py-6">
          <p className="text-gray-700 text-sm leading-relaxed">
            {description}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm bg-gray-100 hover:bg-gray-200 transition"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-sm transition shadow-md ${confirmStyle}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}