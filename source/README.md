# SteamLite source code (stable 9.3.2)

This folder is the source of the stable release **9.3.2**.

| Folder | What it is |
|---|---|
| `app/` | The Electron app: `main.dev.js` (main process), `index.dev.html` (the interface), the extra feature scripts (`features*.js`, `perf.js`, `shell.js`, `icons.js`, `settings_page.js`, `couch.js`, `media*.js`, `discord_presence.js`), the Glass styling (`ui9.css`), themes and `package.json` |
| `updater/` | The stand-alone SteamLite Updater (C#, WinForms). `build.ps1` compiles it with the compiler that ships with Windows |
| `nsis/` | The installer script (NSIS) |
| `server/` | The SteamLite Online server for a PC (Node.js, no dependencies). Kept for reference: players use the Cloudflare version |
| `server/` | The SteamLite Online server for a PC (Node.js, no dependencies). Kept for reference: players use the Cloudflare version |
| `cloudflare/` | SteamLite Online as a Cloudflare Worker with a D1 database (accounts, backups, leaderboard, themes, votes). This is the server players use |
| `tools/` | `pack_asar.js` and `extract_asar.js`, small dependency-free tools to pack and unpack `app.asar` |

## Run it from source
Needs Node.js 18+ and the Electron version listed below.
```
cd app
npm install            # discord-rpc and electron-store
npx electron@42 .      # runs main.dev.js
```
Set `SL_NO_USERDATA_PIN=1` and pass `--user-data-dir=<folder>` to keep a test run away from your real settings.

## Build the installer (Windows)
1. Get the Electron 42 Windows build, rename `electron.exe` to `SteamLite.exe`, and copy the folder to a staging directory.
2. `npm install` inside `app/`, then pack the app into the staging directory: `node tools/pack_asar.js app <staging>/resources/app.asar`
3. Build the updater: `powershell -File updater/build.ps1`
4. Build the installer: `makensis /DAPP_VERSION=9.3.2 "/DAPP_DIR=<staging>" /DOUT_FILE=SteamLite.Setup.9.3.2.exe nsis/SteamLite.nsi`

## Notes
- Releases and update information live in the repository root (`version.json`, `news.json`, `themes/`). Betas are published as pre-releases and use `version-beta.json` / `news-beta.json`.
- The app stores its settings in `%APPDATA%\SteamLite-DEV` (kept under that name so updates from older versions keep working).
- No keys or credentials are in the source. You add your own Steam Web API key and SteamID inside the app.