module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx|ts)?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}