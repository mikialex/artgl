// jest.config.js
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ["<rootDir>/src/"],
  collectCoverage: true,
  coverageReporters: [
    // "html", "lcov", "clover", "json",
     "text", 
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/wasm-scene/**",
  ]
};