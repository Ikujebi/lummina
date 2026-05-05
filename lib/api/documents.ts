import { ClientDocument } from "@/types/document";

export async function getClientDocuments(): Promise<ClientDocument[]> {
  const res = await fetch("/api/client/documents", {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch documents");
  }

  return res.json();
}