// app/api/admin/users/[id]/route.ts
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Optionally: prevent admin from deleting themselves
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return new Response("User not found", { status: 404 });

  await prisma.user.delete({ where: { id } });
  return new Response("Deleted successfully");
}