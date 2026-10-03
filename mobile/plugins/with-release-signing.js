const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Signs release builds with the DoseCare upload key instead of the debug
 * key the Expo template uses. No secret lives in the repository: Gradle
 * reads them from these properties, which scripts/build-release-apk.sh
 * passes as ORG_GRADLE_PROJECT_* environment variables from a file kept
 * outside the repo.
 *
 *   DOSECARE_UPLOAD_STORE_FILE      absolute path to the .jks keystore
 *   DOSECARE_UPLOAD_STORE_PASSWORD
 *   DOSECARE_UPLOAD_KEY_ALIAS
 *   DOSECARE_UPLOAD_KEY_PASSWORD
 *
 * Without them a release build still compiles but is debug-signed, which
 * the release script refuses to publish.
 */
const RELEASE_SIGNING_CONFIG = `    signingConfigs {
        if (findProperty('DOSECARE_UPLOAD_STORE_FILE')) {
            release {
                storeFile file(findProperty('DOSECARE_UPLOAD_STORE_FILE'))
                storePassword findProperty('DOSECARE_UPLOAD_STORE_PASSWORD')
                keyAlias findProperty('DOSECARE_UPLOAD_KEY_ALIAS')
                keyPassword findProperty('DOSECARE_UPLOAD_KEY_PASSWORD')
            }
        }
        debug {`;

function addReleaseSigning(gradle) {
  if (gradle.includes('DOSECARE_UPLOAD_STORE_FILE')) return gradle;

  const withConfig = gradle.replace('    signingConfigs {\n        debug {', RELEASE_SIGNING_CONFIG);
  // Anchored on buildTypes: signingConfigs (above) now also has a
  // `release {` block, and matching that one would re-sign debug builds.
  const releaseBlock = /(buildTypes \{[\s\S]*?\n {8}release \{[\s\S]*?)signingConfig signingConfigs\.debug/;
  const withBuildType = withConfig.replace(
    releaseBlock,
    "$1signingConfig findProperty('DOSECARE_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug"
  );

  if (withConfig === gradle || withBuildType === withConfig) {
    throw new Error('with-release-signing: app/build.gradle no longer matches the expected template.');
  }
  return withBuildType;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    mod.modResults.contents = addReleaseSigning(mod.modResults.contents);
    return mod;
  });
};
