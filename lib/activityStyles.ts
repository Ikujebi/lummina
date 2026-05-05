// /lib/activityStyles.ts

import type { ActivityType } from "@/types/lawyer";

export const activityStyles: Record<
  ActivityType,
  {
    dot: string;        // tailwind ONLY
    color: string;      // ant design compatible HEX
    badgeClass: string; // tailwind ONLY
  }
> = {
  FILING: {
    dot: "bg-[#5F021F]",
    color: "#5F021F",
    badgeClass: "bg-[#FFF4E0] text-[#5F021F]",
  },
  COURT: {
    dot: "bg-[#7A001A]",
    color: "#7A001A",
    badgeClass: "bg-[#FFF4E0] text-[#5F021F]",
  },
  CLIENT: {
    dot: "bg-[#B45309]",
    color: "#B45309",
    badgeClass: "bg-[#FFF4E0] text-[#5F021F]",
  },
  INTERNAL: {
    dot: "bg-gray-500",
    color: "#6B7280",
    badgeClass: "bg-gray-100 text-gray-600",
  },
};