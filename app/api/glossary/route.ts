import { NextResponse } from "next/server";

// Hardcoded glossary terms
const terms = [
  { 
    id: "inheritance", 
    title: "Inheritance", 
    emoji: "📦", 
    shortDesc: "Set of assets you receive.", 
    detailDesc: "Set of assets, rights, and obligations transferred to your heirs when you pass away.", 
    example: "If a parent dies, their children inherit the family home as part of the inheritance." 
  },
  { 
    id: "will", 
    title: "Will", 
    emoji: "📄", 
    shortDesc: "Document specifying how you leave your assets.", 
    detailDesc: "Legal document defining how your assets are distributed and who will execute your wishes.", 
    example: "A will allows you to leave a specific percentage of your assets to each child and appoint a guardian." 
  },
  { 
    id: "notary", 
    title: "Notary Office", 
    emoji: "🏛️", 
    shortDesc: "Place where legal acts are certified.", 
    detailDesc: "Public office where a notary certifies legal acts such as wills or powers of attorney.", 
    example: "To validate a will, go to the notary, sign the document, and register it with the notary." 
  },
  { 
    id: "executor", 
    title: "Executor", 
    emoji: "👤", 
    shortDesc: "Person responsible for executing your will.", 
    detailDesc: "Trusted person responsible for managing and distributing your inheritance as you indicated.", 
    example: "You can appoint a sister or friend as executor to oversee the distribution of your assets." 
  },
  { 
    id: "intestate", 
    title: "Intestate Succession", 
    emoji: "⚖️", 
    shortDesc: "Process when there is no will.", 
    detailDesc: "Legal process for distributing assets when the deceased did not leave a will.", 
    example: "If a person dies without a will, their children inherit equal shares according to the law." 
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("term")?.toLowerCase();

  if (!query) {
    return NextResponse.json({ error: "Term query is required" }, { status: 400 });
  }

  // Step 1: Check hardcoded terms first
  const localTerm = terms.find(term => term.title.toLowerCase() === query || term.id.toLowerCase() === query);
  if (localTerm) {
    return NextResponse.json(localTerm);
  }

  // Step 2: Query RapidAPI Law Dictionary if not found
  try {
    const response = await fetch(`https://law-dictionary1.p.rapidapi.com/define?term=${query}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
        "X-RapidAPI-Host": "law-dictionary1.p.rapidapi.com"
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "External API failed" }, { status: 502 });
    }

    const data = await response.json();

    // Step 3: Map API response to your frontend format
    const termFromApi = {
      id: query,
      title: data.term || query,
      emoji: "📚",
      shortDesc: data.definition ? data.definition.slice(0, 60) + "..." : "Definition not found.",
      detailDesc: data.definition || "No detailed description available.",
      example: data.example || "No example available.",
    };

    return NextResponse.json(termFromApi);

  } catch (err) {
    console.error("Glossary API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}