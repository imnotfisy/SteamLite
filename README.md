# SteamLite

A modern, feature-rich Steam library client alternative built with Electron.

![SteamLite Version](https://img.shields.io/badge/version-9.2.1-blue)
![Electron](https://img.shields.io/badge/Electron-42.0.1-9FE349)
![License](https://img.shields.io/badge/license-MIT-green)
[![Discord](https://img.shields.io/badge/Discord-join%20the%20server-5865F2?logo=discord&logoColor=white)](https://discord.gg/2VP6x6Rvak)

## Features

### Library
- **Beautiful UI** - Modern glassmorphism design with customizable themes and accent colors
- **Game Library Management** - View, filter, sort and organize your Steam games. Your sort order and filters are remembered between launches
- **Custom Collections** - Create and manage game collections
- **Smart Collections** - *Recently Played*, *Unplayed Backlog* and *Most Played* build and update themselves
- **Multi-Select** - Pick several games at once (`Ctrl+Shift+S`) to add them to a collection, favorite them, or hide them
- **Smarter Play Next** - Pick a game from any installed game, unplayed games, your favorites, or the current collection (never the same game twice in a row)
- **Card Styles** - Standard, Wide, Compact list or Cover only, with adjustable card size and spacing
- **Non-Steam Games** - Add and manage non-Steam games. Drag a program (.exe) or shortcut (.lnk) onto the window, or import programs from your Start menu
- **Keyboard Navigation** - Move around the library with the arrow keys, Enter to open a game and `F` to favorite it
- **Undo** - Hiding games, removing a game from a collection, deleting a collection and removing a non-Steam game can all be undone from the toast that appears
- **Quick Links** - Right-click a game to open its Steam Store page, SteamDB, PCGamingWiki or HowLongToBeat
- **Game Notes** - Add custom notes to any game

### Profile & Friends
- **Profile Editor** - Tagline, a 5-game showcase, avatar frames (Glow, Ring, Pulse, Rainbow) and a per-profile accent color
- **Profile Banner** - Use any image or GIF (with drag-to-position, zoom, blur and dim), a two-color gradient, or a solid color
- **Badges** - Your unlocked SteamLite achievements and play streak, shown on your profile
- **Friends Tools** - Pin friends to the top, give them nicknames, keep private notes, hide or mute them, and search or sort your list by status, A-Z or last online
- **Compare with a Friend** - A head-to-head of games owned, total and average playtime, most played game and every game you share, plus games they love that you don't own
- **Friend Notifications** - Notifications show the friend's profile picture, and pinned friends notify you when they come online

### Dashboard & Stats
- **Dashboard** - Playtime for the last 30 days, top games, recent sessions, and rearrangeable, resizable widgets
- **This Week** - A Monday-to-Sunday playtime chart with a weekly goal you can set, plus a nudge for games gathering dust
- **Game News** - A feed of the latest announcements from the games you play most
- **Disk Usage** - See how much space your installed games use, free space on every Steam library drive, and your biggest games. Sort the library by size on disk
- **SteamLite Updater** - A small separate app with its own window that downloads and installs updates (progress bar, speed, resumable downloads) and restarts SteamLite. It works even when the in-app update check does not, from the Start menu or the command palette
- **Free Up Space** - Lists every installed game by size and flags big games you have not played in months, so you know what is worth uninstalling
- **Session History** - Per-game session count, average, longest and your latest sessions
- **Achievement Tracking** - Steam achievements with icons and progress, with search and animated lists
- **SteamLite Levels** - Every SteamLite achievement gives random XP (60-140), with a weekend boost and double XP during events (the bonus fades through the day), up to level 100. Your level shows beside your Steam level on your profile
- **Inventory** - See your SteamLite level, streak restores, play streak and the reward themes you have earned
- **Challenges** - Three daily and three weekly challenges for bonus XP
- **Level Rewards** - Profile titles, animated avatar frames and a few rare streak restores as you level up; streak restores (hold up to 5) can be spent to save a broken streak
- **Wishlist and Sales** - Your Steam wishlist with prices and discounts, plus sale alerts
- **Game Status and Rating** - Mark games as Playing, Backlog, Completed or Dropped and rate them out of 5, then filter your library by it
- **Year in Review** - A shareable picture of your year in games
- **Play-time Reminders** - Optional break reminders and a daily play limit
- **Friend Activity** - See who started playing what and who came online
- **Messages and friend streaks (9.2.1)** - Chat with friends who use SteamLite in private or group chats (up to 20), add friends with a code, keep daily friend streaks, block and report
- **Sign in with Steam and cloud backup (9.2)** - Signing in is required once; your progress backs up to your account and restores on any PC, with verified names on the leaderboard
- **Drops, Shop and Trophy room (9.1)** - Free XP every hour, 5 hours and day with streaks, rarities and a lucky wheel; spend coins on frames and titles; collect everything in the Trophy room
- **Dashboard widgets and recap (9.1)** - Continue playing, weekly hours, daily goal, theme of the week, a weekly recap and a stats card
- **Smart collections and tags (9.1)** - Collections that fill themselves from rules, game tags, links on every game and a pre-launch check
- **Accessibility and languages (9.1)** - High contrast, strong focus, larger targets and Spanish, French, German, Portuguese and Italian
- **Tidy header (9.0.1)** - Window buttons live in the header, the extras sit in one folder button, and the now-playing pill floats wherever you drag it
- **Achievements and themes** - 88 SteamLite achievements, 60 themes, and icons instead of emojis everywhere
- **Glass interface (9.0)** - A floating glass sidebar that opens when you point at it, one floating header, frosted-glass windows and a dashboard greeting. Classic is one switch away
- **Settings page** - A full page with a section list, search and a save bar
- **Couch mode** - A fullscreen, controller-first launcher with a game page (Overview, Achievements, Screenshots, News) for every game
- **Spotify now playing** - A top-bar player with album art and controls, no login needed
- **Discord Rich Presence** - Game art, timer, achievement progress, streak, buttons and privacy options
- **Full and Lite editions** - Pick everything or just the basics for launching games when you install, and switch any time in Settings > Advanced
- **Memory saver** (optional) - Software rendering and fewer processes for roughly 30% less memory, at the cost of smoothness
- **Tools & extras hub** - One grid button that opens every new tool (also in the command palette)
- **What should I play? / Up Next** - A mood-based picker and a drag-to-reorder queue of the games you plan to play
- **Closest to 100%** - Games with only a few Steam achievements left
- **Play Calendar and Library Stats** - A year heatmap, library value, cost per hour, genres, duplicates and CSV / JSON export
- **Game Journal** - Notes and sessions on one timeline
- **Wishlist Price Alerts and Free Games** - Target prices with history, free-to-keep promotions and a sale calendar
- **Game Mode, Session Widget and Shutdown Timer** - Mute pop-ups while playing, an always-on-top timer, and turn the PC off after a game
- **Launch Profiles and Save Backups** - Priority, power plan and programs to close per game, plus game save backups
- **Co-op Finder** - Games you and a friend both own, and alerts when a friend plays one you own
- **Import Epic and GOG, Library Health Check** - Bring other launchers in and clean up broken installs and leftover cache
- **Seasons, Weekly Bingo and Prestige** - A three-month reward track, a weekly card and a reset-with-a-star after level 100
- **Automatic Backups, Notification History and Diagnostics** - Safety nets and a help page
- **Theme Share Codes, Day / Night Themes, Profile Card** - Share and automate your look
- **Controller Navigation and Bulgarian** - Use a gamepad, and read the main screens in Bulgarian
- **Play Streaks** - Track consecutive days of play with a recovery system
- **Telemetry** - Track playtime, sessions and launch history

### Customization
- **Seasonal Events** - Yearly events with their own achievements, a countdown banner on the dashboard (with a Preview theme button) and a theme as a reward: Spring Bloom (March 20 - April 5), Summer Splash (June 21 - July 5), Halloween (October 1 - November 1) and Winter Holidays (December 1 - 31)
- **Theme Shop** - Apply bundled themes or create your own with the Theme Maker
- **Appearance** - Card style, card size and spacing, fonts (including any font installed on your PC) and UI scale from 80% to 140%
- **SteamLite Achievements** - Unlock exclusive achievements and rewards

### Quality of Life
- **First-Time Setup** - A short guided setup on first run (accent color, card style, startup options, shortcuts). Replay it any time with `Ctrl+K` then *Run Setup Again*
- **Potato Mode** - For older PCs and integrated graphics: removes blurs, looping animations and background effects, skips drawing off-screen cards, and checks for games and friends less often
- **Settings Backup & Restore** - Export your preferences, collections, favorites, friend nicknames and playtime history to a file. Your API key and login are never included
- **Start with Windows / Start Minimized** - Launch with Windows, optionally straight to the tray
- **Command Palette** - Jump anywhere, launch games and run actions with `Ctrl+K`
- **Sound Design** - 13 distinct UI sounds in three packs (Glass, Classic, Arcade), with a Preview button
- **Quiet Hours** - Mute notification sounds and friend pop-ups on a schedule
- **Rebindable Hotkeys** - Change the global shortcuts for Quick Launch, the Command Palette and Stop Game
- **Close Behaviour** - Choose whether closing the window hides SteamLite to the tray or quits it
- **Update Control** - Skip a version you do not want, or turn automatic update checks off
- **Discord RPC** - Display your Steam activity in Discord
- **Built-in Updater** - Update available, download and *Restart & Install* from inside the app

## Installation

### Windows

Download the latest installer from the [Releases](https://github.com/imnotfisy/SteamLite/releases) section and run `SteamLite.Setup.<version>.exe` (for example `SteamLite.Setup.8.3.6.exe`).

The installer lets you choose an install location and shortcuts, offers to upgrade an existing install, and can launch SteamLite when it finishes. Silent installs are supported with the `/S` switch.

## Configuration

### First-Time Setup

1. Launch SteamLite
2. Enter your Steam Web API Key (get one from [Steam Community](https://steamcommunity.com/dev/apikey))
3. Enter your SteamID64
4. (Optional) Add Family Sharing IDs for shared games
5. Follow the short setup: choose an accent color and card style, pick your startup options and see the shortcuts

You can run the setup again at any time from the command palette (`Ctrl+K`, then *Run Setup Again*).

### Settings

Access settings via the gear icon in the top-right corner. Available options:

- **API Key** - Your Steam Web API key
- **Steam ID** - Your SteamID64
- **Family IDs** - Comma-separated list of family sharing accounts
- **Accent Color** - Custom accent color in hex format
- **Sound Volume** - Adjust UI sound effects volume
- **Update Channel** - Choose stable or beta updates
- **Custom Background** - Set a custom background image or video, with blur, opacity and speed controls

### Advanced Settings

- **Appearance** - Card style, card size, card spacing, font and UI scale
- **Cinematic Wide Grid** - Use a wider game grid layout
- **Discord Rich Presence** - Enable or disable Discord activity
- **Launch to Library** - Open on the Library instead of the Dashboard
- **Start with Windows** and **Start Minimized to Tray**
- **Hide Offline Friends**
- **Potato Mode** - Lightweight mode for weak PCs
- **Reduce Animations**
- **Notification Sounds, Duration and Stack Size**
- **Sound Pack** - Glass (default), Classic or Arcade, with a Preview button
- **Quiet Hours** - Mute notification sounds and friend pop-ups between two times
- **Keep Running in Tray When Closed** - Turn off to make the close button quit SteamLite
- **Check for Updates Automatically**
- **Global Hotkeys** - Rebind Quick Launch, the Command Palette and Stop Game
- **Max Friends in Common Display**
- **Backup & Restore** - Export and import your settings

## Theme Shop

SteamLite includes a built-in Theme Shop with more than twenty bundled themes, including:

- Dracula
- Catppuccin Mocha
- Nordic Frost
- Solarized Dark
- CRT Terminal
- Ocean Deep
- Gruvbox Dark
- Synthwave
- Midnight Rose
- Cyber Lime
- And many more...

### Achievement Rewards

Some themes are unlocked by completing SteamLite achievements:

- **Centurion Gold** - Launch games 100 times
- **500 Club Platinum** - Play 500 hours of a single game
- **Marathon Redline** - Play a single 5+ hour session
- **Streak Inferno** - Reach a 7-day play streak
- **Unstoppable Solar** - Reach a 30-day play streak
- **Completionist Prism** - 100% complete any game
- **Chrome Aurora** - Apply 5 themes from the Theme Shop
- **Spring Bloom** - Unlock every Spring Bloom achievement from March 20 to April 5 (event only)
- **Winter Wonderland** - Unlock every Winter Holidays achievement in December (event only)
- **Summer Splash** - Unlock every Summer Splash achievement from June 21 to July 5 (event only)
- **Weekend Warrior** - Play on 8 different weekend days
- **Regular Teal** - Play on 14 different days
- **Calendar Sapphire** - Play on 60 different days
- **Long Haul Copper** - Play 10 sessions of 2+ hours
- **Launch Legend Onyx** - Launch games 500 times
- **Quarter K Jade** - Play 250 hours in total
- **Time Lord Amethyst** - Play 2500 hours in total
- **Devoted Rose** - Play 100 hours of a single game
- **Favourite Coral** - Add 10 games to your favorites
- **Organiser Slate** - Create 3 collections
- **Hunter Moss** - Unlock 10 SteamLite achievements
- **Trophy Bronze** - Unlock 25 SteamLite achievements
- **Level-Up Electric** - Reach SteamLite level 25
- **Hoarder Ice** - Hold 5 streak restores
- **Fortnight Ember** - Reach a 14-day play streak

### Halloween Event

Every year from October 1 to November 1, SteamLite runs a Halloween event. A banner on the dashboard shows the countdown and your progress, and the Achievements window has a Halloween section at the top. Event achievements, and the theme they unlock, are **limited-time**: they can only be earned until November 1, and only count play during the event. Once earned they stay unlocked.

You can **preview** the Haunted Harvest theme from the dashboard banner before unlocking it. Nothing is saved, and exiting (or pressing `Esc`) puts your own theme back.

- **Trick or Treat** - Play a game on Halloween (October 31)
- **Witching Hour** - Start a session between 3:00 and 4:00 AM
- **Night Stalker** - Start 5 sessions after 10 PM
- **Vampire Hours** - Play on 7 different days
- **Tangled Web** - Play 7 different games
- **Haunted Marathon** - Play a single session of 3 hours or more
- **Graveyard Shift** - Play 13 hours during the event
- **Spooky Season Survivor** - Unlock every other Halloween achievement. Unlocks the **Haunted Harvest** theme (yours forever) and rewards a streak restore

### Custom Themes

Create your own themes using the Theme Maker:

1. Open Settings → Theme Maker
2. Customize colors and CSS
3. Preview in real-time
4. Save and apply your theme

## SteamLite Achievements

Unlock exclusive achievements by using SteamLite. Open the trophy button to see them, and use the search box to find one by name or description.

- **First Steps** - Launch a game through SteamLite
- **Centurion** - Launch games 100 times
- **Hour One** - Play for 1 hour in total
- **Hundred Club** - Play for 100 hours in total
- **500 Club** - Play 500 hours of a single game
- **Marathon** - Play a single session of 5 hours or more
- **Night Owl** - Start a session between 02:00 and 05:00
- **Early Bird** - Start a session before 08:00
- **Getting Warm** - Reach a 3-day play streak
- **On a Roll** - Reach a 7-day play streak
- **Unstoppable** - Reach a 30-day play streak
- **Collector** - Own 50 or more games
- **Completionist** - Unlock every achievement in any game
- **Decorator** - Apply a theme from the Theme Shop
- **Theme Collector** - Apply themes 5 times
- **Bibliophile** - Own 200 or more games
- **Variety Player** - Play 25 different games
- **Century Sessions** - Complete 100 tracked sessions
- **Theme Author** - Create your own theme
- **Night Owl+** - Start 5 sessions between 2AM and 5AM
- **Sunrise Grind** - Start 5 sessions before 8AM
- **Session Veteran** - Complete 250 tracked sessions
- **Library Titan** - Own 500 or more games
- **Theme Master** - Apply themes 10 times
- **Legendary Collector** - Play 50 different games
- **Dedicated Gamer** - Play for 1000 hours in total
- **Game Master** - Play 100 different games
- **Session Pro** - Complete 500 tracked sessions
- **Streak Legend** - Reach a 60-day play streak
- **Theme Enthusiast** - Apply themes 20 times

## Play Streaks

Track your consecutive days of play with the streak system:

- Play at least once per day to maintain your streak
- Streaks of 3+ days include a recovery window
- Use streak restores (earned from achievements) to recover lost streaks
- View your current streak and best streak in the dashboard

## Friends

Open the friends panel from the top bar:

- **Pin** a friend to keep them at the top (hover and click the pin, or right-click)
- **Nickname and note** - give a friend a nickname and add a private note. Both are only visible to you
- **Hide or mute** - hidden friends disappear from the list (tick *Show hidden* to see them), and hidden or muted friends never trigger notifications
- **Search and sort** by status, A-Z or last online
- **Compare** - open a friend's profile and click *Compare* to see how your libraries and playtime stack up (needs their game list to be public on Steam)

Pins, nicknames, notes, showcases and badges are stored on your PC only. Other SteamLite users can't see them.

## Keyboard Shortcuts

Press `Ctrl + /` in the app to see this list.

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Command palette (rebindable) |
| `Ctrl/Cmd + Alt + G` | Quick launch (rebindable) |
| `Ctrl/Cmd + Alt + X` | Stop the running game (rebindable) |
| `Ctrl + 1` / `2` / `3` | Home / Library / Favorites |
| `Ctrl + ,` | Settings |
| `Ctrl + F` | Search your library |
| `Ctrl + Shift + F` | Search friends |
| `Ctrl + Shift + S` | Select multiple games |
| `F5` | Refresh library |
| Arrow keys | Move between games in the library |
| `Enter` / `F` | Open / favorite the highlighted game |
| `Esc` | Close the top window or panel |
| `Ctrl + /` | Show all shortcuts |

## Profile System

SteamLite supports multiple profiles:

- Add multiple Steam accounts
- Switch between profiles instantly
- Each profile has its own settings and telemetry
- Logout functionality for easy account management

## Non-Steam Games

Add non-Steam games to your library:

1. Click the "Add Non-Steam Game" button in the library, **or drag a program (.exe) or a shortcut (.lnk) onto the window**
2. Enter the game name
3. Select the game executable
4. (Optional) Add a custom cover image
5. Launch and track playtime like Steam games

To add several at once, use **Import from Start menu** in the same window (or `Ctrl+K`, then *Import Games from Start Menu*). Steam games, installers and Windows tools are left out.

## Game Notes

Add custom notes to any game:

1. Open the game modal
2. Click the Notes tab
3. Write and save your notes
4. Notes persist across sessions

## Discord RPC

SteamLite can display your Steam activity in Discord:

- Shows game you're currently playing
- Displays playtime timer
- Configurable in settings

## Updates

SteamLite checks for updates automatically:

- Stable channel receives stable releases
- Beta channel receives pre-release versions
- Manual update check available in settings
- A dedicated updater page shows the new version, its changelog and download progress, then *Restart & Install* closes SteamLite and opens the installer

## Performance

If SteamLite feels slow on an older PC or integrated graphics, turn on **Potato Mode** in Advanced Settings. It removes backdrop blurs, looping animations, the background glow and video backgrounds, skips drawing off-screen game cards, and checks for running games and friends less often. **Reduce Animations** is a lighter option that only shortens animations.

## Requirements

- Windows 10 or later
- Steam account with games
- Steam Web API key

## License

MIT - see [LICENSE](LICENSE).

## Credits

Developed by imnotfisy

Community themes by:
- Castiel
- Alex

## Support

For issues, feature requests, or questions, please open an issue on [GitHub](https://github.com/imnotfisy/SteamLite/issues).
