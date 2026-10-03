#!/usr/bin/env bash
# Builds a signed, installable release APK into mobile/dist/.
#
#   scripts/build-release-apk.sh
#
# Needs the Android SDK (ANDROID_HOME, default ~/Android/Sdk), JDK 17 and
# the signing file described in AGENTS.md, by default
# ~/.config/dosecare/release-signing.env (override with
# DOSECARE_SIGNING_ENV). That file and the keystore it points to never go
# into the repository.
set -euo pipefail

cd "$(dirname "$0")/.."

SIGNING_ENV="${DOSECARE_SIGNING_ENV:-$HOME/.config/dosecare/release-signing.env}"
if [[ ! -f "$SIGNING_ENV" ]]; then
  echo "Signing file not found: $SIGNING_ENV (see AGENTS.md, Release)." >&2
  exit 1
fi
# shellcheck source=/dev/null
source "$SIGNING_ENV"
for var in DOSECARE_UPLOAD_STORE_FILE DOSECARE_UPLOAD_STORE_PASSWORD DOSECARE_UPLOAD_KEY_ALIAS DOSECARE_UPLOAD_KEY_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "$var is missing from $SIGNING_ENV." >&2
    exit 1
  fi
  export "ORG_GRADLE_PROJECT_${var}=${!var}"
done

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
VERSION="$(node -p "require('./app.json').expo.version")"

# expo prebuild rewrites the package.json "android"/"ios" scripts to
# `expo run:*`; the project runs through `expo start`, so keep the file.
PKG_BACKUP="$(mktemp)"
cp package.json "$PKG_BACKUP"
trap 'cp "$PKG_BACKUP" package.json' EXIT

npx expo prebuild --platform android --clean --no-install
(cd android && ./gradlew :app:assembleRelease --console=plain)

APK="android/app/build/outputs/apk/release/app-release.apk"
mkdir -p dist
OUT="dist/dosecare-v${VERSION}.apk"
cp "$APK" "$OUT"

# Refuse an APK that ended up debug-signed.
APKSIGNER="$(ls -d "$ANDROID_HOME"/build-tools/*/ | sort -V | tail -1)apksigner"
if "$APKSIGNER" verify --print-certs "$OUT" | grep -q 'CN=Android Debug'; then
  echo "Release APK is debug-signed; refusing it." >&2
  rm -f "$OUT"
  exit 1
fi

echo "Release APK: mobile/$OUT"
