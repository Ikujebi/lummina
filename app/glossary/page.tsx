"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/dashboard/Sidebar";

type Term = {
  id: string;
  title: string;
  emoji: string;
  shortDesc: string;
  detailDesc: string;
  example: string;
};

// ----------------------------
// Base glossary
// ----------------------------
const placeholderTerms: Term[] = [
  {
    id: "inheritance",
    title: "Inheritance",
    emoji: "📦",
    shortDesc: "Set of assets you receive.",
    detailDesc:
      "Set of assets, rights, and obligations transferred to your heirs when you pass away.",
    example:
      "If a parent dies, their children inherit the family home as part of the inheritance.",
  },
  {
    id: "will",
    title: "Will",
    emoji: "📄",
    shortDesc: "Document specifying how you leave your assets.",
    detailDesc:
      "Legal document defining how your assets are distributed and who will execute your wishes.",
    example:
      "A will allows you to leave a specific percentage of your assets to each child and appoint a guardian.",
  },
  {
    id: "notary",
    title: "Notary Office",
    emoji: "🏛️",
    shortDesc: "Place where legal acts are certified.",
    detailDesc:
      "Public office where a notary certifies legal acts such as wills or powers of attorney.",
    example:
      "To validate a will, go to the notary, sign the document, and register it with the notary.",
  },
  {
    id: "executor",
    title: "Executor",
    emoji: "👤",
    shortDesc: "Person responsible for executing your will.",
    detailDesc:
      "Trusted person responsible for managing and distributing your inheritance as you indicated.",
    example:
      "You can appoint a sister or friend as executor to oversee the distribution of your assets.",
  },
  {
    id: "intestate",
    title: "Intestate Succession",
    emoji: "⚖️",
    shortDesc: "Process when there is no will.",
    detailDesc:
      "Legal process for distributing assets when the deceased did not leave a will.",
    example:
      "If a person dies without a will, their children inherit equal shares according to the law.",
  },
];

export default function GlossaryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [terms, setTerms] = useState<Term[]>(placeholderTerms);
  const [loading, setLoading] = useState(false);

  const [selectedTerm, setSelectedTerm] = useState<string>(
    placeholderTerms[0].id,
  );

  // ----------------------------
  // SEARCH
  // ----------------------------
  useEffect(() => {
    let ignore = false;

    const run = async () => {
      if (!search.trim()) {
        setTerms(placeholderTerms);
        setSelectedTerm(placeholderTerms[0].id);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `/api/glossary/search?query=${encodeURIComponent(search)}`,
        );

        if (!res.ok) throw new Error("Failed request");

        const data = await res.json();

        if (ignore) return;

        const normalized: Term[] = Array.isArray(data)
          ? data
          : data
            ? [data]
            : [];

        setTerms(normalized);

        if (normalized.length > 0) {
          setSelectedTerm(normalized[0].id);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setTerms([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [search]);

  // ----------------------------
  // ACTIVE TERM
  // ----------------------------
  const activeTerm = useMemo(() => {
    return terms.find((t) => t.id === selectedTerm) ?? null;
  }, [terms, selectedTerm]);

  return (
    <div className="flex min-h-screen bg-[#F7e7ce] text-[#5F021F]">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 bg-white shadow-md">
          {/* MENU */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-2xl md:text-xl p-2"
          >
            ☰
          </button>

          {/* BRAND */}
          <Link href="/" className="font-bold text-[#FFA500] whitespace-nowrap">
            LexTrust
          </Link>

          {/* SEARCH */}
          <input
            className="ml-2 md:ml-4 flex-1 bg-gray-100 px-3 md:px-4 py-2 rounded-xl text-sm outline-none focus:outline-none focus:ring-0"
            placeholder="Search legal term..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </header>

        {/* CONTENT */}
        <main className="flex flex-col md:grid md:grid-cols-[320px_1fr] gap-4 md:gap-6 p-4 md:p-6">
          {/* LIST */}
          <section className="bg-white p-3 md:p-4 rounded-xl">
            <h2 className="font-semibold mb-3 md:mb-4">Terms</h2>

            {loading && <p className="text-gray-500 text-sm">Searching...</p>}

            {terms.map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedTerm(term.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition ${
                  selectedTerm === term.id
                    ? "bg-[#FFE5B4]"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex gap-2 items-start">
                  <span className="text-lg">{term.emoji}</span>

                  <div>
                    <p className="font-medium text-sm md:text-base">
                      {term.title}
                    </p>
                    <p className="text-xs text-gray-500">{term.shortDesc}</p>
                  </div>
                </div>
              </button>
            ))}
          </section>

          {/* DETAIL */}
          <section className="bg-white p-4 md:p-6 rounded-xl">
            {activeTerm ? (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold">
                    {activeTerm.title}
                  </h1>
                  <p className="mt-2 text-gray-600 text-sm md:text-base">
                    {activeTerm.detailDesc}
                  </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg text-sm md:text-base">
                  <p>{activeTerm.example}</p>
                </div>

                <Link
                  href="/client/cases"
                  className="inline-block bg-[#FFA500] text-white px-5 py-3 rounded-lg text-sm md:text-base"
                >
                  See related cases
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">No term selected</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
