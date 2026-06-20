---

# SteamLite

SteamLite is a custom, ultra-lightweight, high-performance alternative to the official Steam client launcher. Built with Electron, it focuses on speed, a clean glassmorphic UI, and power-user features like ghost launching, local playtime tracking, and custom launch parameters—all while remaining incredibly light on system resources.

> **Note:** SteamLite is a closed-source application. The source code is not publicly available, but the application is free to download and use.

## Download

Ready to ditch the heavy Steam client? Download the latest compiled release of SteamLite below.

### [⬇️ Download Latest Release (v3.2.5)](https://github.com/imnotfisy/SteamLite/releases/latest)

*(Requires Windows 10/11. Steam must be installed and logged in at least once for local file scanning and protocol hooks to function properly.)*

---

## Features

### Library & Game Management
*   **Split Library View:** Cleanly separates installed and uninstalled games for instant access.
*   **Multi-Drive Scanning:** Automatically detects and scans game installs across all connected Steam library folders (e.g., `D:\SteamLibrary`).
*   **Smart App Filtering:** Non-game tools and utilities (like Steamworks Common Redistributables, SteamVR, and Source SDKs) are strictly filtered out and hidden.
*   **Advanced Sorting:** Sort your library by A-Z, Z-A, Last Played, or Playtime. Includes a toggle to hide family-shared games.
*   **Custom Launch Parameters:** Set custom launch arguments (e.g., `-novid -windowed`) and optionally select a direct `.exe` path to bypass the Steam protocol entirely.
*   **Game News & Patch Notes:** Fetch and read the latest news for any game directly inside the game details modal.

### Performance & Tracking
*   **Advanced Ghost Launching:** Steam popups are instantly force-closed in the background when a game launches, fully preserving immersion without breaking Steam's background tasks.
*   **Accurate Play/Stop Engine:** The game modal dynamically tracks real-time process states. A red "Stop" button allows you to instantly kill the game process right from the UI.
*   **Local Telemetry Tracking:** Tracks your local launch counts, session lengths, and last played timestamps independently of Steam's API.
*   **System Tray Minimization:** Closing the window minimizes SteamLite to the system tray, keeping playtime tracking and status polling active in the background.

### UI & Visuals
*   **Statistics Dashboard:** The Home page features a dynamic dashboard displaying total games owned, total hours played, local tracked sessions, a bar chart of your top 5 most played games, and a recently played carousel.
*   **Ambient Background Lighting:** The UI dynamically extracts the dominant color from a game's banner image when hovered over or opened, smoothly fading the background glow to match.
*   **Real-time Status Polling:** Profile and friends statuses automatically refresh every 5 seconds.
*   **Discord-Style Playing Status:** See exactly what your friends are playing right under their names with dynamic, real-time status updates.
*   **Local Screenshot Viewer:** Dynamically locates and displays your locally saved Steam screenshots for each game directly on their respective game pages.
*   **Resilient Offline Mode:** Automatic network detection with a persistent watermark, keeping your local library accessible even without an internet connection.

---

## First-Time Setup

Once you launch SteamLite for the first time, click on the **Settings** tab in the sidebar to configure your profile:

1.  **Steam Web API Key:** Required for fetching friends lists, profiles, and owned games. You can get one for free from [Steam API Key Registration](https://steamcommunity.com/dev/apikey).
2.  **SteamID64:** Your 17-digit Steam ID. (You can find this using sites like [SteamID.io](https://steamid.io/)).
3.  **Family Sharing IDs:** A comma-separated or newline-separated list of 17-digit Steam IDs belonging to friends or family members whose libraries you want to merge into your own.
4.  **Accent Color:** Choose a custom highlight color for the entire application UI.

Click **Save Configuration**, and SteamLite will immediately sync your library and go online.

## Credits

*   **Imnotfisy** - *Lead Developer*
*   **Alex** - *UI/UX Designer*
*   **HayXwireX** - *Backend Engineer*

## Support & Bug Reports

Encountering a bug or have a feature idea? Please open an issue on the [Issues Page](https://github.com/imnotfisy/SteamLite/issues).
