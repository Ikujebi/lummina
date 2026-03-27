"use client";

import { useState, useEffect } from "react";
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
// Hardcoded placeholder terms
// ----------------------------
const placeholderTerms: Term[] = [
  { id: "inheritance", title: "Inheritance", emoji: "📦", shortDesc: "Set of assets you receive.", detailDesc: "Set of assets, rights, and obligations transferred to your heirs when you pass away.", example: "If a parent dies, their children inherit the family home as part of the inheritance." },
  { id: "will", title: "Will", emoji: "📄", shortDesc: "Document specifying how you leave your assets.", detailDesc: "Legal document defining how your assets are distributed and who will execute your wishes.", example: "A will allows you to leave a specific percentage of your assets to each child and appoint a guardian." },
  { id: "notary", title: "Notary Office", emoji: "🏛️", shortDesc: "Place where legal acts are certified.", detailDesc: "Public office where a notary certifies legal acts such as wills or powers of attorney.", example: "To validate a will, go to the notary, sign the document, and register it with the notary." },
  { id: "executor", title: "Executor", emoji: "👤", shortDesc: "Person responsible for executing your will.", detailDesc: "Trusted person responsible for managing and distributing your inheritance as you indicated.", example: "You can appoint a sister or friend as executor to oversee the distribution of your assets." },
  { id: "intestate", title: "Intestate Succession", emoji: "⚖️", shortDesc: "Process when there is no will.", detailDesc: "Legal process for distributing assets when the deceased did not leave a will.", example: "If a person dies without a will, their children inherit equal shares according to the law." },
];

export default function GlossaryPage() {
  const [selectedTerm, setSelectedTerm] = useState("inheritance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [terms, setTerms] = useState<Term[]>(placeholderTerms);
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // Fetch external data when search changes
  // ----------------------------
  useEffect(() => {
    if (!search.trim()) {
      setTerms(placeholderTerms);
      return;
    }

    setLoading(true);

    async function fetchTerms() {
      try {
        const res = await fetch(`/api/glossary/search?query=${encodeURIComponent(search)}`);
        if (!res.ok) throw new Error("Failed to fetch glossary terms");

        const data: Term[] = await res.json();

        // Merge placeholder + external results (or replace if you want)
        setTerms(data.length ? data : placeholderTerms);
      } catch (err) {
        console.error(err);
        setTerms(placeholderTerms); // fallback
      } finally {
        setLoading(false);
      }
    }

    fetchTerms();
  }, [search]);

  return (
    <div className="flex min-h-screen font-inter text-[#5F021F] bg-[#F7e7ce] relative">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        className={`
          fixed top-16 left-0 z-50 w-64 h-[calc(100%-4rem)] bg-white shadow-lg rounded-r-xl
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:shadow-none md:rounded-none
        `}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-60 flex items-center gap-4 px-6 py-4 bg-white shadow-md">
          <button
            className="w-11 h-11 text-2xl flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 "
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <div className="flex items-center gap-2 font-poppins font-semibold text-[#FFA500] text-xl">
            <span className="inline-flex">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2l8 3v7c0 5.523-3.08 9.41-8 11-4.92-1.59-8-5.477-8-11V5l8-3z" fill="currentColor" opacity="0.12" />
                <path d="M22 5v7c0 4.971-2.593 8.22-8 10-5.407-1.78-8-5.029-8-10V5l8-3 8 3z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 13.5l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <Link href="/" className="ml-1">LexTrust</Link>
          </div>

          <label className="relative flex-1 flex items-center bg-gray-100 rounded-xl px-4 py-2 ml-4">
            <span className="absolute left-3 text-gray-500 text-lg">🔍</span>
            <input
              type="search"
              placeholder="Search legal term…"
              className="w-full bg-transparent pl-10 text-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </header>

        {/* Main grid */}
        <main className="flex-1 grid md:grid-cols-[minmax(240px,320px)_1fr] gap-6 p-6 md:p-8">

          {/* Terms list */}
          <section className="bg-white rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Terms A-Z</h2>
            {loading && <p className="text-gray-500">Searching…</p>}
            {terms.map(term => (
              <button
                key={term.id}
                className={`flex items-center gap-3 p-4 rounded-lg mb-3 text-left transition transform hover:translate-x-1 hover:shadow-md ${
                  selectedTerm === term.id ? "bg-[#FFE5B4] shadow-inner scale-105" : ""
                }`}
                onClick={() => setSelectedTerm(term.id)}
              >
                <span className="text-2xl">{term.emoji}</span>
                <div>
                  <p className="font-semibold">{term.title}</p>
                  <p className="text-sm text-gray-600">{term.shortDesc}</p>
                </div>
              </button>
            ))}
          </section>

          {/* Term details */}
          <section className="bg-white rounded-xl p-6 md:p-8 shadow-md flex flex-col gap-6">
            {terms.map(term =>
              selectedTerm === term.id && (
                <article key={term.id} className="flex flex-col gap-6">
                  <header>
                    <h1 className="text-2xl md:text-3xl font-semibold">{term.title}</h1>
                    <p className="text-gray-700 mt-2">{term.detailDesc}</p>
                  </header>

                  <div className="grid grid-cols-[auto_1fr] gap-4 items-center bg-gray-50 p-4 rounded-lg shadow-inner">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg shadow flex items-center justify-center text-3xl">
                      {term.emoji}
                    </div>
                    <p>{term.detailDesc}</p>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold mb-2">Practical example</h3>
                    <p>{term.example}</p>
                  </div>

                  <div>
                    <Link
                      href="/chat"
                      className="bg-[#FFA500] text-white font-semibold px-6 py-3 rounded-lg w-max hover:brightness-105 hover:scale-105 transition-all"
                    >
                      See more related terms
                    </Link>
                  </div>
                </article>
              )
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-gray-700">
          © LexTrust — Educational Legal Glossary.
        </footer>
      </div>
    </div>
  );
}