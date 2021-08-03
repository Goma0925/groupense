module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // Set up for dotenv to work with Jest.
    setupFiles: ["dotenv/config"],
}