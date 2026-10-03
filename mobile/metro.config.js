const { getDefaultConfig } = require('expo/metro-config');

/**
 * - `.svg` files under assets/svg are imported as React components
 *   (react-native-svg-transformer) instead of static image assets.
 * - `.wasm` assets and the COOP/COEP headers are what expo-sqlite needs
 *   to run in the web build (`expo start --web`). Native ignores both.
 */
const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'wasm'],
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  },
};

module.exports = config;
