import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: {
      matters: true,
    },
  });

  return Response.json(
    clients.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      casesCount: c.matters.length,
    }))
  );
}