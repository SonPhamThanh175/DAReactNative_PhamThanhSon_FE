module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            '@components': './components',
            '@screens': './app/(tabs)',
            '@services': './services',
            '@types': './types',
            '@assets': './assets',
          },
        },
      ],
      'expo-router/babel',
    ],
  };
};
