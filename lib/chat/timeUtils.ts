export function formatChatTime(date?: string | Date) {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();

  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}