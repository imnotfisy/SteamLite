# SteamLite

A fast, free desktop companion for your Steam library: browse and launch your games, follow achievements and friends, chat with other SteamLite users, and make it look the way you want.

![SteamLite Version](https://img.shields.io/badge/version-10.0.0-blue)
![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB)
![License](https://img.shields.io/badge/license-MIT-green)
[![Discord](https://img.shields.io/badge/Discord-join%20the%20server-5865F2?logo=discord&logoColor=white)](https://discord.gg/2VP6x6Rvak)

**Website:** https://imnotfisy.github.io/SteamLite/

## What is new in 10.0.0

SteamLite 10.0.0 is a new engine and a completely rebuilt interface.

- **A new engine.** SteamLite now runs on Tauri 2 (Rust and the system web view) instead of Electron. The installer is about 25 MB instead of about 103 MB, and the app itself is a few megabytes. Everything behind the interface (your library, settings, Steam and Discord connections, play tracking, hotkeys, tray and updates) is the same proven backend as before, so your settings and data carry over.
- **A new interface.** Spring animations on every press and hover, pages that scroll up and down as you move between them, a floating dock, and a soft glow that takes the colour of the game you are looking at.
- **Messages are back.** Chat with your SteamLite friends, with photos, GIFs and notifications.
- **A News page** you can open from anywhere, and update notices that appear on any page.

### Not in 10.0.0 yet

Drops, the shop, the trophy room, events, wishlist and sales, inventory and the tools hub from 9.x are not in this version yet and will return in the new design. If you rely on them, you can keep using [9.4.1](https://github.com/imnotfisy/SteamLite/releases/tag/v9.4.1) and skip the update.

## Features

### Library
- **Fast library** - Grid or list, smooth even with thousands of games, with an A to Z jump strip
- **Filters and sorting** - All, Installed, Not installed, Unplayed and Hidden, sorted by recently played, name, playtime or size on disk
- **Collections** - Filter your library by your collections
- **Favourites and hiding** - One click to favourite or hide a game, with undo
- **Play, Stop and install** - The Play button shows Loading..., Stop and Stopping... while a game starts and closes, with play time tracked per session

### Game pages
- Play time, last played, achievements and size on disk at a glance
- **Achievements**, **News**, **Screenshots** and **Notes** tabs
- **Launch** tab: launch options, a different program to start the game with, and run as administrator
- Cover art that morphs into the game's hero picture, and an ambient glow in the game's colours

### Friends and Messages
- See who is online or playing, which games you share, and open their Steam profile
- **Messages** - Chats with your SteamLite friends, and the group chats you are in. Reply, react, edit and delete your messages, pin, and mute a chat. Photos and GIFs show in the chat and open full size. Chats sync with [SteamLite Messages](https://github.com/imnotfisy/SteamLite-Messages) on your phone
- **Notifications** - A pop-up, a sound and a Windows notification for new messages and friend requests, a note in your notification history, and a badge on the Messages button. Streaks that end tonight are announced too
- **Block and unblock** - Block someone from a chat, and unblock them from the chat or from the Blocked players list
- Add friends with a friend code and accept or decline requests

### Profile
- Your stats, most played games, play streak and SteamLite level
- **Customisation** - Banner (a picture, a GIF, a gradient or a solid colour), tagline, title, avatar frame, accent colour, showcase games and pinned achievements. It also shows on your phone and to your friends

### Themes
- All 56 existing themes work, with a live preview before you apply one
- Pick any accent colour, import themes, and browse the community themes

### News and updates
- **News page** - What is new in SteamLite, news from the games you play, and your notification history
- **Update notices** on any page, with Update, Later and Skip, and a download progress bar
- Works with the **SteamLite Updater**, a small separate app that downloads and installs updates

### Everything else
- **Command palette** - Press `Ctrl + K` anywhere to find a game, friend, page or setting
- **Introduction tour** - A short tour after you first sign in, which you can replay from Settings
- **Discord Rich Presence**, start with Windows, start minimised to the tray, and close to the tray
- **Settings** - Sound and alerts, rebindable global shortcuts, accent and interface size, Potato mode and Reduce animations for older PCs, backup and restore, and Steam library drive usage

## Installation

### Windows

Download the latest installer from the [Releases](https://github.com/imnotfisy/SteamLite/releases) page and run `SteamLite.Setup.<version>.exe` (for example `SteamLite.Setup.10.0.0.exe`).

- It installs over an existing SteamLite in the same folder, keeping your settings
- It also installs the SteamLite Updater
- Silent installs are supported with the `/S` switch, plus `/AllUsers` or `/CurrentUser`

## Getting started

1. Launch SteamLite
2. Sign in with Steam, and enter your Steam Web API key (get one for free from [Steam Community](https://steamcommunity.com/dev/apikey))
3. Follow the short introduction tour

Your key is stored on your PC.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + K` | Command palette (rebindable) |
| `Ctrl + Alt + G` | Quick launch (rebindable) |
| `Ctrl + Alt + X` | Stop the running game (rebindable) |
| `Alt + Left` | Go back |
| `Esc` | Close the top panel or window |

The global shortcuts work even while a game is in front. Rebind them in Settings > Shortcuts.

## Updates

- SteamLite checks for updates automatically and shows a notice on any page. You can turn automatic checks off, check by hand, or skip a version, all in Settings > Updates
- The SteamLite Updater (started from the update notice) downloads the installer, runs it and restarts SteamLite

## Requirements

- Windows 10 or later
- A Steam account with games
- A free Steam Web API key

## SteamLite on your phone

- [SteamLite Mobile](https://github.com/imnotfisy/SteamLite-Mobile) - your library, profile and friends on Android
- [SteamLite Messages](https://github.com/imnotfisy/SteamLite-Messages) - chats and voice calls with other SteamLite users

## License

MIT - see [LICENSE](LICENSE).

## Credits

Developed by imnotfisy

Community themes by:
- Castiel
- Alex

## Support

For issues, feature requests, or questions, use the [support page](https://imnotfisy.github.io/SteamLite/support.html) or open an issue on [GitHub](https://github.com/imnotfisy/SteamLite/issues).

SteamLite is an independent project and is not affiliated with Valve Corporation. Steam and the Steam logo are trademarks of Valve Corporation.
