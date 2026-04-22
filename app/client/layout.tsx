import ClientShell from "./ClientShell";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientShell>{children}</ClientShell>;
}