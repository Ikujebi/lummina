import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",

    // optional but recommended if you use styles anywhere
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

export default createJestConfig(customJestConfig);