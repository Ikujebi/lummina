import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";


export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
  redirect("/");
}

if (user.role !== "ADMIN") {
  redirect("/dashboard"); // or wherever lawyers/clients go
}

  return user;
}

export {};