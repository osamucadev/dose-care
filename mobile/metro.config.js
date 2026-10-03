const { getDefaultConfig } = require('expo/metro-config');

/**
 * `.svg` files under assets/svg are imported as React components
 * (react-native-svg-transformer) instead of static image assets.
 */
const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;
