# SteamLite

> CRITICAL NOTICE: PROJECT DISCONTINUATION
>
> Please be advised that SteamLite will be officially discontinued on November 7, 2026 (11/07/2026).
>
> What this means:
> - No further updates, features, or bug fixes will be released after this date.
> - The repository will be archived and made read-only.
> - All associated remote services (such as the GitHub-hosted news feeds and changelog system) will be shut down.
> - Official support channels will be closed.
>
> We encourage all users to export their custom themes and backup their configurations before this date. Thank you to everyone in the community for your support, feedback, and contributions over the lifespan of this project.

---

SteamLite is a custom, fully themable, and modular Steam library client built with Electron. It allows you to completely reskin your Steam experience, build custom UI layouts from scratch, and manage your local, cloud, and non-Steam games all in one cohesive, glassmorphic interface.

## Key Features

### SteamLite UI Editor (SUE)
- Visual Canvas Builder: Enter Edit Mode to spawn containers, buttons, text, game grids, friends lists, and news feeds onto a blank canvas.
- Total Control: Drag, drop, and morph any element. Right-click to edit inline CSS, change text, or assign built-in actions (like "Go to Library" or "Quit App").
- Import/Export Layouts: Save your custom desktop layouts as `.json` files and share them with the community.

### Advanced Theming
- Custom CSS Variables: A built-in color picker allows you to instantly change every aspect of the UI's glassmorphism, borders, text, and accents.
- Custom Backgrounds: Set custom images or videos as your background, complete with blur and opacity sliders.

### GitHub-Powered News and Changelogs
- Dynamic Home Page: The News and Announcements section fetches data directly from a `news.json` file hosted on our GitHub repository, allowing us to push updates without requiring you to download a new app version.
- One-Time Changelogs: A sleek modal appears the first time you launch a new version, detailing exactly what's new.

### Enhanced Library Management
- Floating Action Button: A sleek, square `+` button floats in the bottom right corner of your Library, allowing you to quickly add non-Steam games without reaching for the top menu.
- Complete Non-Steam Support: Fully add and remove non-Steam games (with custom names and covers) directly from the right-click context menu.
- Smart Sorting and Filters: Filter by playtime, achievements, or family sharing.

### Quality of Life
- Discord Rich Presence Toggle: Easily disable or enable Discord RPC in the Advanced Settings.
- Custom Smooth Scrolling: Native, refined scrolling behavior across all menus.
- Compact List Mode: A dense view for users with massive libraries.

## Installation

1. Navigate to the [Releases page](https://github.com/imnotfisy/SteamLite/releases).
2. Download the most recent release, `SteamLite-Setup-6.0.0.exe`, from the 6.0.0 version assets.
3. Run the installer and follow the on-screen instructions.
4. Launch SteamLite and enter your Steam Web API Key and SteamID64 in the settings.

## Configuration

To use SteamLite, you will need:
1. Steam Web API Key: You can get one from the [Steam API Key Registration page](https://steamcommunity.com/dev/apikey).
2. SteamID64: Your 17-digit Steam ID (e.g., `76561198000000000`). You can find this using sites like [SteamID.io](https://steamid.io/).

(Optional) You can also add Family Sharing IDs to aggregate shared libraries into your SteamLite view.

## License

This project is licensed under the ISC License - see the `package.json` file for details.

---

*Reminder: SteamLite will cease development and remote services on November 7, 2026.*
```
