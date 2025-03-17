module.exports = {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/tests/**',
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
}; 