import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  await prisma.websiteActivity.create({
    data: {
      event: body.event,
      path: body.path,
      ipAddress: null,
      userAgent: req.headers.get("user-agent"),
    },
  });

  return Response.json({ success: true });
}