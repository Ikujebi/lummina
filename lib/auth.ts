import { cookies } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = verifyToken(token) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Logout failed");

    const data = await res.json();
    console.log(data.message);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}