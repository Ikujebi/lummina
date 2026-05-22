import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Better jsdom environment
  testEnvironment: "jest-fixed-jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",

    "\\.(css|less|scss|sass)$":
      "identity-obj-proxy",
  },

  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/__tests__/mocks/",
  ],

  // Important for MSW v2
 transformIgnorePatterns: [
  "node_modules/(?!(msw|@mswjs|until-async|headers-polyfill|is-node-process|strict-event-emitter|open-draft|rettime)/)",
],
};

export default createJestConfig(customJestConfig);