import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/lawyer-dashboard/Sidebar";

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "LAWYER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">

      {/* Header */}
      <header className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 bg-[#FFA500] shadow">
        <div className="font-bold text-[#5F021F]">
          ⚖️ LexTrust Lawyer Portal
        </div>

        <div className="text-[#5F021F] font-semibold">
          {user.name}
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10">
          {children}
        </main>

      </div>
    </div>
  );
}