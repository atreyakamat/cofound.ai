/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Relax strict mode for test files so we can use jest mocking patterns
          strict: false,
        },
      },
    ],
  },
  // Don't try to transform node_modules
  transformIgnorePatterns: ["node_modules/(?!(openai)/)"],
  // Collect coverage from lib/ files
  collectCoverageFrom: [
    "lib/**/*.ts",
    "!lib/prisma.ts",
    "!lib/ai.ts",
  ],
};
