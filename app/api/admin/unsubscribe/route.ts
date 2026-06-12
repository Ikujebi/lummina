import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handles the background unsubscription from Gmail's "Unsubscribe" button
export async function POST(req: NextRequest) {
  try {
    // 1. Extract the subscriber's ID or email from the URL query params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing subscriber details" }, { status: 400 });
    }

    // 2. Remove or opt-out the user from your database
    // Option A: Hard Delete (Actually remove from DB)
  await prisma.newsletterSubscriber.update({
  where: { id },
  data: {
    active: false,
  },
});

    /* // Option B: Soft Delete (Highly recommended for legal compliance & keeping logs)
    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { active: false },
    });
    */

    return NextResponse.json({ message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("UNSUBSCRIBE_ERROR", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Optional: Fallback GET if they click a footer link manually
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return new NextResponse("Missing ID", { status: 400 });

  try {
await prisma.newsletterSubscriber.updateMany({
  where: {
    id,
    active: true,
  },
  data: {
    active: false,
  },
});    
    // Redirect them to a nice confirmation page on your website
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribed-success`);
  } catch (error) {
    return new NextResponse("Failed to unsubscribe", { status: 500 });
  }
}