"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CaseItem = {
  id: string;
  title: string;
  caseNumber: string;
  status: string;
  lawyer?: {
    name: string;
  };
};

export default function ClientCasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/matters");

        if (!res.ok) throw new Error("Failed to fetch cases");

        const data = await res.json();
        setCases(data.cases || []);
      } catch (err) {
        console.error(err);
        setCases([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="text-[#5F021F]">Loading cases...</div>;
  }

  if (cases.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#5F021F]">My Cases</h1>
        <p>No cases yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#5F021F]">My Cases</h1>

      <div>
        {cases.map((c) => (
          <Link key={c.id} href={`/client/cases/${c.id}`}>
            <div>
              <p>{c.title}</p>
              <p>{c.caseNumber}</p>
              <p>{c.status}</p>
              <p>{c.lawyer?.name || "Not assigned"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}