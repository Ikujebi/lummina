import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, phone, address, userId } = await req.json();

    // Check if client with this email already exists
    const existing = await prisma.client.findFirst({
      where: { email },
    });
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Client already exists" }),
        { status: 400 }
      );
    }

    // Create new client
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,     
        userId,     // link to the existing User (lawyer/admin)
      },
    });

    return new Response(JSON.stringify(client), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}