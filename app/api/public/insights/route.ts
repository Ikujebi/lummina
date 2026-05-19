import { prisma } from "@/lib/prisma";

export async function GET() {
  const insights = await prisma.newsletter.findMany({
    where: {
      published: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return Response.json(insights);
}