module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Must be last for Reanimated (skip during tests to avoid worklets plugin load)
      ...(process.env.NODE_ENV === 'test' ? [] : ['react-native-reanimated/plugin']),
    ],
  };
};
