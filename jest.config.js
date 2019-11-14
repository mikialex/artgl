// jest.config.js
module.exports = {
  verbose: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    "<rootDir>/packages/artgl/src/"
  ],
  collectCoverage: true,
  coverageReporters: [
    // "html", "lcov", "clover", "json",
    //  "text", 
  ],
  collectCoverageFrom: [
    "<rootDir>/packages/artgl/src/**/*.ts",
    "<rootDir>/packages/artgl/src/**/*.d.ts",
    "!<rootDir>/packages/artgl/src/wasm-scene/**",
  ]
};