#!/usr/bin/env bash
# Builds SteamLite for Linux (an AppImage and a .deb). Run it on Ubuntu, from the project folder:
#     bash tools/linux-build.sh
# It installs what it needs (it asks for your password for apt), so the first run takes a while. Later runs are quick.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"

echo "== 1/6  memory: a build wants about 8 GB, so a swap file is added on a small machine"
MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
SWAP_MB=$(awk '/SwapTotal/ {print int($2/1024)}' /proc/meminfo)
if [ $((MEM_MB + SWAP_MB)) -lt 7500 ]; then
  echo "   RAM ${MEM_MB} MB + swap ${SWAP_MB} MB is low: adding an 8 GB swap file at /swapfile-steamlite"
  sudo fallocate -l 8G /swapfile-steamlite && sudo chmod 600 /swapfile-steamlite && sudo mkswap /swapfile-steamlite >/dev/null && sudo swapon /swapfile-steamlite
fi

echo "== 2/6  system packages"
sudo apt-get update
sudo apt-get install -y build-essential curl wget file pkg-config libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev \
  libayatana-appindicator3-dev librsvg2-dev libxdo-dev patchelf xz-utils fuse3 || sudo apt-get install -y libfuse2

echo "== 3/6  Rust"
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
# shellcheck disable=SC1091
. "$HOME/.cargo/env"

echo "== 4/6  Node (used to build, and a copy is packed into the app: SteamLite's core runs on it)"
NODE_V=v22.12.0
NODE_DIR="$HOME/.steamlite-build/node-$NODE_V-linux-x64"
if [ ! -x "$NODE_DIR/bin/node" ]; then
  mkdir -p "$HOME/.steamlite-build"
  curl -fsSL "https://nodejs.org/dist/$NODE_V/node-$NODE_V-linux-x64.tar.xz" | tar -xJ -C "$HOME/.steamlite-build"
fi
export PATH="$NODE_DIR/bin:$PATH"
mkdir -p src-tauri/bin && cp "$NODE_DIR/bin/node" src-tauri/bin/node && chmod +x src-tauri/bin/node

echo "== 5/6  the window (Svelte) and the build tool"
( cd ui-src && npm install --no-audit --no-fund && npx vite build )
npm install --no-audit --no-fund

echo "== 6/6  the app (a few minutes the first time)"
# lighter settings than the Windows release build, so a small machine can manage it
export CARGO_PROFILE_RELEASE_LTO=off CARGO_PROFILE_RELEASE_CODEGEN_UNITS=8 CARGO_BUILD_JOBS=2
export APPIMAGE_EXTRACT_AND_RUN=1 NO_STRIP=true
# the .deb first (it always works); the AppImage is tried after and may fail on very new Ubuntu versions without stopping the build
npx tauri build --bundles deb
npx tauri build --bundles appimage || echo "(the AppImage could not be made here; the .deb is enough on Ubuntu)"

mkdir -p "$ROOT/linux-out"
cp -v src-tauri/target/release/bundle/deb/*.deb "$ROOT/linux-out/" || true
cp -v src-tauri/target/release/bundle/appimage/*.AppImage "$ROOT/linux-out/" 2>/dev/null || true
echo
echo "Done. The files are in: $ROOT/linux-out"
echo "Install it with:  sudo apt install ./linux-out/*.deb      (then open SteamLite from the app menu)"
