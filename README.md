<div align="center">

<!-- Optional: drop a logo at docs/logo.png and uncomment this line
<img src="docs/logo.png" width="96" alt="SteamLite" />
-->

# SteamLite

**A fast, beautiful companion launcher for your Steam library.**

Instant local scanning · real playtime stats · themes · achievements · daily streaks

[![version](https://img.shields.io/badge/version-7.2.0-8b5cf6?style=flat-square)](https://github.com/imnotfisy/SteamLite/releases)
[![platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078d4?style=flat-square)](#)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

**[⬇ Download the latest release](https://github.com/imnotfisy/SteamLite/releases/latest)**

[Features](#features) · [Getting started](#getting-started) · [Theme Shop](#theme-shop) · [Achievements](#achievements-and-streaks) 



</div>

---

## Why SteamLite?

Steam's library works — but it's heavy, slow, and built around the store. SteamLite is a lightweight companion launcher that reads your **installed games straight off disk**, tracks your playtime locally, and otherwise stays out of the way.

- ⚡ **Instant local scanning** — reads Steam's `appmanifest` files directly; no waiting on the Steam client
- 📊 **Real stats** — per-game telemetry, session history, and a 30-day playtime chart
- 🎨 **Themeable** — 16 themes in the built-in Theme Shop, plus full custom theme support
- 🏆 **Achievements & streaks** — SteamLite meta-achievements with exclusive reward themes, and daily play streaks
- 🕶️ **Out of your way** — frameless UI, minimize to tray, silent Steam launching, offline-aware
- 🔒 **Your data stays yours** — everything stored locally; no servers, no accounts, no tracking

## Features

### 📚 Library
- Scans every Steam library folder automatically (extra drives included)
- Favorites, hidden games, collections, and custom cover images
- Grid and wide-grid layouts
- Add non-Steam games (any `.exe`) with their own covers
- Built-in game notes, per-game launch arguments, and custom exe support
- Browse your Steam screenshots
- Automatically filters out soundtracks, redistributables, SDKs, and other non-game clutter

### 🎮 Launching & tracking
- Games launch through Steam, so overlays, controllers, and achievements all work as normal
- Optional **silent launching** — Steam starts in the background, no window, no noise
- Playtime tracking with merged cloud + local hours
- Session history with a 30-day chart
- Stop the tracked game straight from SteamLite

### 👥 Social
- Friend list with **now-playing toasts**
- Discord Rich Presence
- **Multi-profile support** — switch Steam accounts instantly, each with its own stats

### 🔄 Updates & offline mode
- In-app auto-update with download progress and one-click restart
- What's New popup and news feed on every release
- Detects when you lose connectivity: streaks and achievements freeze (never punished), and everything else keeps working

## Getting Started

**Requirements:** Windows 10/11 · Steam installed and logged in · a free Steam Web API key

1. Download `SteamLite.Setup.<version>.exe` from the [Releases page](https://github.com/imnotfisy/SteamLite/releases) and run it.
2. Get a free API key at <https://steamcommunity.com/dev/apikey> (tied to your Steam account, takes 30 seconds).
3. In SteamLite's Settings, paste your **API key** and your **SteamID64** (the 17-digit number — visible in your Steam profile URL).
4. *(Optional)* Add family members' SteamIDs to browse their libraries alongside yours.
5. Done — your installed games appear instantly.

> 💡 To switch between multiple Steam accounts later, right-click the profile area at the bottom of the sidebar.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` + `Alt` + `G` | Quick launch (your top-played games) |
| `Ctrl` + `K` | Command palette |
| `Ctrl` + `Alt` + `X` | Stop the currently tracked game |

## Theme Shop

Open **Settings → Browse Themes** to preview and apply themes. New themes (and achievements) ship with **every release**.

**Free themes:** Dracula · Catppuccin Mocha · Nordic Frost · Solarized Dark · CRT Terminal · Ocean Deep · Gruvbox Dark · Synthwave · Midnight Ember

**Reward themes** (unlocked by earning achievements): Centurion Gold · 500 Club Platinum · Marathon Redline · Streak Inferno · Unstoppable Solar · Completionist Prism · Chrome Aurora

- Themes are bundled with the app, so the shop works offline; extra themes published to this repo merge in automatically
- Locked themes show which achievement unlocks them and your current progress
- You can also import custom themes (UI-Editor export JSON) from Settings

## Achievements and Streaks

SteamLite adds its own layer of meta-achievements on top of your games — playtime milestones, marathon sessions, library size, theming, and more. Several unlock **exclusive themes** in the Theme Shop.

**Streaks:** every day you launch a game through SteamLite extends your streak. From day 3 it appears in the sidebar and dashboard, with a full-screen celebration when it grows. Miss a day? If your streak was 3+, you get **5 days to earn any achievement** — in a Steam game or in SteamLite — to restore your streak to its full length. Your best streak is kept forever, and streaks freeze while you're offline so a dropped connection never costs you.

<details>
<summary><strong>📋 Full achievement list (16)</strong></summary>

| | Name | How to earn | Reward |
|---|---|---|---|
| 🎮 | First Steps | Launch a game through SteamLite | — |
| ⏰ | Hour One | Play for 1 hour in total | — |
| 🕐 | Hundred Club | Play for 100 hours in total | — |
| 💯 | Centurion | Launch games 100 times | Centurion Gold theme |
| 🏆 | 500 Club | Play 500 hours of a single game | 500 Club Platinum theme |
| 🏃 | Marathon | A single 5-hour session | Marathon Redline theme |
| 🦉 | Night Owl | Start a session between 02:00–05:00 | — |
| 🌅 | Early Bird | Start a session before 08:00 | — |
| 🔥 | Getting Warm | Reach a 3-day streak | — |
| 🔥 | On a Roll | Reach a 7-day streak | Streak Inferno theme |
| ☄️ | Unstoppable | Reach a 30-day streak | Unstoppable Solar theme |
| 📚 | Collector | Own 50+ games | — |
| 📖 | Bibliophile | Own 200+ games | — |
| ✅ | Completionist | 100% a game's achievements | Completionist Prism theme |
| 🎨 | Decorator | Apply a theme from the Theme Shop | — |
| 🖌️ | Theme Collector | Apply 5 themes from the Theme Shop | Chrome Aurora theme |

</details>

## Privacy

- All settings, stats, and telemetry are stored **locally** in `%APPDATA%\SteamLite-DEV` — delete that folder for a clean slate, or copy it to back everything up
- SteamLite only ever talks to: the official **Steam Web API** (your data), the **Steam CDN** (cover images), and **GitHub** (updates, news, themes)
- No analytics, no accounts, no servers of mine — and it never asks for your Steam password

## FAQ

**Do I still need Steam?**
Yes — SteamLite is a companion, not a replacement. Games launch through Steam (optionally silently), so everything works exactly as it should.

**Why does it need an API key?**
It's Steam's official way to read your profile, library, friends, and achievements. It's free and read-only.

**A game I own isn't showing up.**
SteamLite lists **installed** games, and filters out soundtracks, tools, and redistributables. Install the game (or remove it from hidden games) and it'll appear.

**How do I switch Steam accounts?**
Right-click the profile area in the sidebar — add and switch profiles instantly.


## Contributing a Theme

Themes are plain JSON files (`{ "canvas": {}, "vars": { ... }, "css": "..." }` — exportable from SteamLite's UI Editor):

1. Add `themes/your-theme.json` to the repo
2. Add an entry to `themes/themes.json` with `id`, `name`, `author`, `description`, `file`, and `colors`
3. Open a PR — the Theme Shop merges published themes automatically and dedupes by `id`

## License

[MIT](LICENSE)

---

Made with 💜 by **[@imnotfisy](https://github.com/imnotfisy)**

*SteamLite is not affiliated with, endorsed by, or connected to Valve Corporation. Steam and the Steam logo are trademarks of Valve Corporation.*
