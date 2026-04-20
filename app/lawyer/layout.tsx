import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LawyerShell from "./LawyerShell";

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "LAWYER") {
    redirect("/");
  }

  return (
    <LawyerShell user={user}>
      {children}
    </LawyerShell>
  );
}