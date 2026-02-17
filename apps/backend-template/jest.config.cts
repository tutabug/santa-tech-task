module.exports = {
  displayName: 'backend-template',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    '^.+\\.m?js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'mjs'],
  coverageDirectory: '../../coverage/apps/backend-template',
  transformIgnorePatterns: [
    'node_modules/(?!(better-auth|@better-auth|@noble|jose|rou3|better-call)/)',
  ],
};
