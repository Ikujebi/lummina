"use client";

import { ReactNode } from "react";

type Variant = "primary" | "ghost" | "underline";

interface TabButtonProps {
  label: ReactNode;
  active?: boolean;
  onClick?: () => void;

  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;

  variant?: Variant;
  className?: string;
}

export default function TabButton({
  label,
  active = false,
  onClick,
  icon,
  loading = false,
  disabled = false,
  variant = "primary",
  className = "",
}: TabButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "flex items-center gap-2 text-sm font-medium transition whitespace-nowrap";

  const variants: Record<Variant, string> = {
    primary:
      "px-4 py-2 rounded-lg",
    ghost:
      "px-3 py-2 rounded-lg hover:bg-gray-100",
    underline:
      "px-2 py-2 border-b-2 rounded-none",
  };

  const activeStyles: Record<Variant, string> = {
    primary: "  shadow-sm",
    ghost: "bg-gray-100 text-[#5F021F]",
    underline: "border-[#FFA500] text-[#5F021F]",
  };

  const inactiveUnderline = "border-transparent text-gray-500";

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${base}
        ${variants[variant]}
        ${
          active
            ? activeStyles[variant]
            : variant === "underline"
            ? inactiveUnderline
            : "text-gray-600 hover:text-[#5F021F]"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {/* loading state */}
      {loading ? (
        <span className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}

      {label}
    </button>
  );
}