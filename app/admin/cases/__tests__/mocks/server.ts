import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const server = setupServer(
  // ---------------- lawyers ----------------
  http.get("*/api/lawyers", () => {
    return HttpResponse.json({
      lawyers: [{ id: "l1", name: "Lawyer One" }],
    });
  }),

  // ---------------- matter requests ----------------
  http.get("*/api/admin/matter-requests", () => {
    return HttpResponse.json({
      requests: [
        {
          id: "r1",
          title: "Matter Request 1",
          description: "Test desc",
        },
      ],
    });
  }),

  // ---------------- cases ----------------
  http.get("*/api/cases", () => {
    return HttpResponse.json({
      matters: [
        {
          id: "c1",
          title: "Case A",
          status: "OPEN",
        },
        {
          id: "c2",
          title: "Case B",
          status: "PENDING",
        },
      ],
    });
  }),

  // ---------------- approve ----------------
  http.post("*/api/admin/matter-requests/:id/approve", () => {
    return HttpResponse.json({
      matter: {
        id: "m1",
        title: "Approved Case",
      },
    });
  }),

  // ---------------- reject ----------------
  http.post("*/api/admin/matter-requests/:id/reject", () => {
    return HttpResponse.json({ ok: true });
  }),

  // ---------------- fallback ----------------
  http.all("*", ({ request }) => {
    console.warn(
      `⚠️ [MSW] Unhandled ${request.method} request to: ${request.url}`
    );

    return new HttpResponse(null, {
      status: 404,
    });
  })
);