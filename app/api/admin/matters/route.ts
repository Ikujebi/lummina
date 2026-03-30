import { prisma } from "@/lib/prisma";

export async function GET() {
  const matters = await prisma.matter.findMany({
    include: {
      client: true,
      lawyer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(
    matters.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      client: m.client.name,
      lawyer: m.lawyer.name,
      createdAt: m.createdAt,
    }))
  );
}