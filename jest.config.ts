import type { JestConfigWithTsJest } from "ts-jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const config: JestConfigWithTsJest = {
  testEnvironment: "@quramy/jest-prisma/environment",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  setupFilesAfterEnv: [
    "<rootDir>/src/tests/jestSetup.ts",
    "<rootDir>/src/tests/config/singleton.ts",
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: "<rootDir>/src/",
  }),
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
