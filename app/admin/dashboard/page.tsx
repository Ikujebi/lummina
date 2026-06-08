import AdminDashboardClient from "./AdminDashboardClient";
import { getDashboardData } from "@/lib/server/dashboard";

export default async function Page() {
  const data = await getDashboardData();

  return <AdminDashboardClient initialData={data} />;
}