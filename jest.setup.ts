import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// ======================
// MSW SERVER (lazy-loaded safely)
// ======================

import type { SetupServer } from "msw/node";

let server: SetupServer;

beforeAll(async () => {
  const mod = await import(
    "@/app/admin/cases/__tests__/mocks/server"
  );

  server = mod.server;

  server.listen({
    onUnhandledRequest: "warn",
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// ======================
// POLYFILLS
// ======================


Object.defineProperty(global, "TextDecoder", {
  value: TextDecoder,
});

// ======================
// BASE URL
// ======================

Object.defineProperty(window, "location", {
  value: {
    origin: "http://legal.lumminalaw.com",
  },
  writable: true,
});

// ======================
// FETCH PATCH
// ======================

const originalFetch = global.fetch;

global.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === "string" && input.startsWith("/")) {
    return originalFetch(
      `http://legal.lumminalaw.com${input}`,
      init
    );
  }

  return originalFetch(input, init);
};

// ======================
// BroadcastChannel POLYFILL
// ======================

if (typeof global.BroadcastChannel === "undefined") {
  class MockBroadcastChannel implements BroadcastChannel {
    name: string;

    onmessage:
      | ((this: BroadcastChannel, ev: MessageEvent) => void)
      | null = null;

    onmessageerror:
      | ((this: BroadcastChannel, ev: MessageEvent) => void)
      | null = null;

    constructor(name: string) {
      this.name = name;
    }

    postMessage(): void {}
    close(): void {}
    addEventListener(): void {}
    removeEventListener(): void {}

    dispatchEvent(): boolean {
      return true;
    }
  }

  Object.defineProperty(global, "BroadcastChannel", {
    value: MockBroadcastChannel,
  });
}