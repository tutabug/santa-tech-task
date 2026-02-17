module.exports = {
  displayName: 'backend-template-e2e',
  preset: '../../jest.preset.js',
  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/src/support/test-setup.ts'],
  testEnvironment: 'node',
  testTimeout: 60000, // 60 seconds
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
    '^.+\\.m?js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'mjs'],
  coverageDirectory: '../../coverage/backend-template-e2e',
  transformIgnorePatterns: [
    'node_modules/(?!(better-auth|@better-auth|@noble|jose|rou3|better-call)/)',
  ],
};
