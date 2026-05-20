import CasesProviders from "./providers";
import CasesPage from "./CasesPageClient";

export default function Page() {
  return (
    <CasesProviders>
      <CasesPage />
    </CasesProviders>
  );
}