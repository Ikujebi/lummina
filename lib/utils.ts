import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple Tailwind classes and merges conflicting ones.
 * Example: cn("px-2 py-2", "px-4") -> "py-2 px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}