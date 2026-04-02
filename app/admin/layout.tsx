import { requireAdmin } from "@/lib/requireAdmin";
import AdminSidebarWrapper from "./AdminClientLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7E7CE]">
      <AdminSidebarWrapper>{children}</AdminSidebarWrapper>
    </div>
  );
}