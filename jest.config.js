module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@expo|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo-.*|react-native-.*|@react-native-.*)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
