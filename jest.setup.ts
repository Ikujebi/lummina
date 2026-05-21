import "@testing-library/jest-dom";

// Polyfill only what MSW actually needs
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// BroadcastChannel polyfill (MSW uses it)
if (typeof global.BroadcastChannel === "undefined") {
  global.BroadcastChannel = class {
    onmessage = null;
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true;
    }
  } as any;
}