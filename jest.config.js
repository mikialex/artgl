// jest.config.js
module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: [
    "<rootDir>/src/"
  ],
  collectCoverage: true,
  coverageReporters: [
    "html"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/wasm-scene/**",
  ]
};