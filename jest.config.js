// jest.config.js
module.exports = {
  verbose: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    "<rootDir>/packages/artgl/src/",
    "<rootDir>/packages/math/src/",
    "<rootDir>/packages/shared/src/",
    "<rootDir>/packages/shader-graph/src/",
  ],
  collectCoverage: true,
  coverageReporters: [
    // "html", "lcov", "clover", "json",
    //  "text", 
  ],
  collectCoverageFrom: [
    "<rootDir>/packages/artgl/src/**/*.ts",
    "<rootDir>/packages/math/src/**/*.ts",
    "<rootDir>/packages/shared/src/**/*.ts",
    "<rootDir>/packages/shader-graph/src/**/*.ts",
    "!<rootDir>/packages/artgl/src/wasm-scene/**",
  ]
};