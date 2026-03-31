export async function fetchWithFallback<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Fetch failed");
    return await res.json();
  } catch {
    return fallback;
  }
}