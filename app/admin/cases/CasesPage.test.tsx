// app/admin/cases/CasesPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CasesPage from "./CasesPageClient";
import { server } from "./__tests__/mocks/server";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------- MOCK CHILD COMPONENTS ----------------
jest.mock("../../components/admin-dashboard/MattersTable", () => ({
  __esModule: true,
  default: ({ cases }: { cases: { id: string; title: string }[] }) => (
    <div>
      {cases.map((c) => (
        <p key={c.id}>{c.title}</p>
      ))}
    </div>
  ),
}));

jest.mock("../../components/admin-dashboard/MatterActionModal", () => ({
  __esModule: true,
  default: ({
    open,
    matter,
  }: {
    open: boolean;
    matter?: { title?: string } | null;
  }) => (open ? <div data-testid="modal">{matter?.title}</div> : null),
}));

// ---------------- HELPER WRAPPER FACTORY ----------------
// Creates a fresh, isolated query cache for every single test block
const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Stops Jest from stalling on failed requests
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

// ---------------- TESTS ----------------

describe("CasesPage (MSW)", () => {
  const user = userEvent.setup();

  it("renders requests and cases", async () => {
    renderWithClient(<CasesPage />);

    expect(await screen.findByText("Matter Request 1")).toBeInTheDocument();
    expect(screen.getByText("Case A")).toBeInTheDocument();
    expect(screen.getByText("Case B")).toBeInTheDocument();
  });

  it("approves request and opens modal", async () => {
    renderWithClient(<CasesPage />);

    const assignButton = await screen.findByRole("button", {
      name: /assign & open/i,
    });

    const select = screen.getByRole("combobox");

    await user.click(select);
    await user.click(screen.getByText("Lawyer One"));

    await user.click(assignButton);

    await waitFor(() => {
      expect(screen.getByTestId("modal")).toHaveTextContent(
        "Approved Case"
      );
    });
  });

  it("renders empty state override", async () => {
    server.use(
      http.get("/api/requests", () => {
        return HttpResponse.json({ requests: [] });
      })
    );

    renderWithClient(<CasesPage />);

    expect(
      await screen.findByText(/no pending requests/i)
    ).toBeInTheDocument();
  });

  it("rejects request", async () => {
    renderWithClient(<CasesPage />);

    const rejectButton = await screen.findByRole("button", {
      name: /reject/i,
    });

    await user.click(rejectButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Matter Request 1")
      ).not.toBeInTheDocument();
    });
  });
});