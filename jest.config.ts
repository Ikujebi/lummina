// jest.config.ts
import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  
  // Natively provisions MessagePort, TextDecoder, and streams globally
  testEnvironment: "jest-fixed-jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    
    // Explicitly point Jest to the correct MSW environment targets
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
    "^msw/browser$": "<rootDir>/node_modules/msw/lib/browser/index.js",
  },

  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

const jestConfigProvider = async () => {
  const resolvedConfig = await createJestConfig(customJestConfig)();
  
  // 1. Let the MSW ecosystem bypass node_modules ignore rules
  resolvedConfig.transformIgnorePatterns = [
    "node_modules/(?!(.*msw.*|.*open-draft.*|rettime|until-async)/)",
  ];
  
  // 2. Properly inject mock folders to be completely ignored as standalone test suites
  resolvedConfig.testPathIgnorePatterns = [
    "/node_modules/", 
    "/.next/",
    "/__tests__/mocks/"
  ];
  
  return resolvedConfig;
};

export default jestConfigProvider;