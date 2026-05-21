import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CasesPage from "./CasesPageClient";
import type { Case } from "@/types/admin";

// ---------------- TYPES ----------------
type Lawyer = {
  id: string;
  name: string;
};

type MatterRequest = {
  id: string;
  title: string;
  description?: string;
};

// ---------------- MOCK REACT QUERY ----------------
const mutateMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
  useMutation: () => ({
    mutate: mutateMock,
  }),
}));

// ---------------- MOCK useCases ----------------
jest.mock("@/app/hooks/useCases", () => ({
  useCases: () => ({
    data: [
      { id: "c1", title: "Case A" } as Case,
      { id: "c2", title: "Case B" } as Case,
    ],
  }),
}));

// ---------------- MOCK CHILD COMPONENTS ----------------
jest.mock("../../components/admin-dashboard/MattersTable", () => ({
  __esModule: true,
  default: ({ cases }: { cases: Case[] }) => (
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

// ---------------- ROBUST FETCH MOCK ----------------
function mockFetch(data: {
  lawyers?: Lawyer[];
  requests?: MatterRequest[];
  approveMatter?: { id: string; title: string };
}) {
  global.fetch = jest.fn((url: string) => {
    if (url.includes("lawyers")) {
      return Promise.resolve({
        json: async () => ({ lawyers: data.lawyers ?? [] }),
      } as Response);
    }

    if (url.includes("requests")) {
      return Promise.resolve({
        json: async () => ({ requests: data.requests ?? [] }),
      } as Response);
    }

    if (url.includes("approve")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          matter: data.approveMatter,
        }),
      } as Response);
    }

    return Promise.reject(new Error("Unknown endpoint: " + url));
  }) as jest.Mock;
}

// ---------------- TEST SUITE ----------------
describe("CasesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutateMock.mockClear();
  });

  it("renders initial requests and cases", async () => {
    mockFetch({
      lawyers: [{ id: "l1", name: "Lawyer One" }],
      requests: [
        {
          id: "r1",
          title: "Matter Request 1",
          description: "Test desc",
        },
      ],
      approveMatter: { id: "m1", title: "Approved Case" },
    });

    render(<CasesPage />);

    await waitFor(() => {
      expect(screen.getByText("Matter Request 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Case A")).toBeInTheDocument();
    expect(screen.getByText("Case B")).toBeInTheDocument();
  });

  it("approves request and opens modal", async () => {
    mockFetch({
      lawyers: [{ id: "l1", name: "Lawyer One" }],
      requests: [
        {
          id: "r1",
          title: "Matter Request 1",
        },
      ],
      approveMatter: { id: "m1", title: "Approved Case" },
    });

    render(<CasesPage />);

    await waitFor(() => {
      expect(screen.getByText("Matter Request 1")).toBeInTheDocument();
    });

    // safer interaction (no AntD internal events)
    fireEvent.click(screen.getByText("Lawyer One"));
    fireEvent.click(screen.getByText(/assign & open/i));

    await waitFor(() => {
      expect(
        screen.queryByText("Matter Request 1")
      ).not.toBeInTheDocument();
    });

    expect(await screen.findByTestId("modal")).toHaveTextContent(
      "Approved Case"
    );
  });

  it("renders empty requests state", async () => {
    mockFetch({
      lawyers: [],
      requests: [],
    });

    render(<CasesPage />);

    expect(
      await screen.findByText(/no pending requests/i)
    ).toBeInTheDocument();
  });

  it("rejects a request", async () => {
    mockFetch({
      lawyers: [{ id: "l1", name: "Lawyer One" }],
      requests: [
        {
          id: "r1",
          title: "Request to Reject",
        },
      ],
    });

    render(<CasesPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Request to Reject")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /reject/i }));

    await waitFor(() => {
      expect(
        screen.queryByText("Request to Reject")
      ).not.toBeInTheDocument();
    });
  });
});