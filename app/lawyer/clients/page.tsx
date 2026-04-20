"use client";

import { useEffect, useState } from "react";

type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  matters: {
    id: string;
    title: string;
    status: string;
  }[];
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/lawyers/clients");

        if (!res.ok) {
          throw new Error("Failed to fetch clients");
        }

        const data = await res.json();

        setClients(data.clients || []);
      } catch (err) {
        console.error("CLIENTS ERROR:", err);
        setClients([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="text-[#5F021F]">
        Loading clients...
      </div>
    );
  }

  /* =========================
     EMPTY STATE
  ========================= */
  if (clients.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#5F021F]">
          My Clients
        </h1>

        <div className="bg-[#FFF4E0] p-6 rounded-xl text-center text-[#5F021F]/70">
          <p className="font-semibold">
            No clients assigned yet
          </p>
          <p className="text-sm mt-2">
            Clients will appear here when matters are assigned to you.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     DATA VIEW
  ========================= */
  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold text-[#5F021F]">
        My Clients
      </h1>

      <div className="grid gap-4">

        {clients.map((c) => (
          <div
            key={c.id}
            className="bg-[#FFF4E0] p-5 rounded-xl shadow"
          >

            <div className="flex justify-between items-start">

              <div>
                <p className="font-semibold text-[#5F021F]">
                  {c.name}
                </p>

                <p className="text-sm text-[#5F021F]/70">
                  {c.email || "No email provided"}
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-[#FFA500]/30 text-[#5F021F]">
                {c.matters.length} matters
              </span>
            </div>

            {/* MATTERS PREVIEW */}
            {c.matters.length > 0 && (
              <div className="mt-3 space-y-1">
                {c.matters.slice(0, 2).map((m) => (
                  <p
                    key={m.id}
                    className="text-xs text-[#5F021F]/70"
                  >
                    • {m.title} ({m.status})
                  </p>
                ))}
              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}