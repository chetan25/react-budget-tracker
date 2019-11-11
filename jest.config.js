module.exports = {
    setupFiles: ['<rootDir>/jest.setup.js'],
    preset: 'ts-jest/presets/js-with-babel',
    transform: {
        "^.+\\.tsx?$": "babel-jest",
    },
    // globals: {
    //     "babel-jest": {
    //         babelConfig: true
    //     }
    // },
    testMatch: [
        '<rootDir>/__tests__/**.tsx',
        '<rootDir>/__tests_/**/*.tsx'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/node_modules/',
        '<rootDir>/__tests__/common/'
    ],
    moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
    moduleNameMapper: {
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff2)$': 'jest-transform-stub',
        'Components/(.*)': '<rootDir>/components/$1',
        'Pages/(.*)': '<rootDir>/pages/$1',
        'Assets/(.*)': '<rootDir>/assets/$1',
        'Test/(.*)': '<rootDir>/__tests__/$1'
    },
    testResultsProcessor: '<rootDir>/node_modules/jest-bamboo-formatter',
    collectCoverageFrom: [
        '<rootDir>/pages/**/*.tsx',
        '<rootDir>/components/**/*.tsx',
        '<rootDir>/assets/**/*.js',
    ],
};
