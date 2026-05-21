import "@testing-library/jest-dom";

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

global.MessageChannel = class {
  port1: MessagePort;
  port2: MessagePort;

  constructor() {
    const dummyPort = {
      postMessage: () => {},
      start: () => {},
      close: () => {},
      onmessage: null,
      onmessageerror: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MessagePort;

    this.port1 = dummyPort;
    this.port2 = dummyPort;
  }

  postMessage() {}
  start() {}
  close() {}
} as unknown as typeof MessageChannel;

beforeEach(() => {
  jest.clearAllMocks();
});