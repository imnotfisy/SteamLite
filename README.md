SteamLite

A lightweight, modern Steam companion that brings your friends, games, and activity into one fast desktop hub.

Overview

SteamLite is a desktop application designed to enhance your Steam experience by providing a clean, fast, and modern interface for:

Friends tracking & live status
Game library browsing
Instant game launching
Steam messaging integration
Lightweight performance-first design

It connects directly to your local Steam installation and Steam Web API to provide real-time data in a simplified UI.

Features

Friends System

Live Steam friend list integration
Real-time status display (Online / In-game / Away / Offline)
Friend avatars with caching system
One-click Steam messaging
“Currently playing” detection

Game Library

Automatic detection of installed Steam games
Instant game launching via Steam protocol
Game artwork loading from Steam CDN
Favorites system for quick access
Cached library for fast startup

Performance

Lightweight startup and execution
Local caching system for images and data
Optimized Steam API handling
Reduced load times with smart refresh logic

UI / UX

Modern dark-themed interface
Accent color customization
Clean sidebar navigation
Steam-inspired layout design
Responsive friend & library cards

Installation

Option 1 — Installer (Recommended)
Download and run SteamLiteInstaller.exe
Follow the setup wizard and launch from desktop or start menu.

Option 2 — Run from Source

Requirements:

Python 3.10+
pip

Install dependencies:
pip install customtkinter pillow

Run:
python launcher.py

Steam API Setup (Friends Feature)

Go to https://steamcommunity.com/dev/apikey
Log in with Steam
Generate API key
Paste it into SteamLite settings

How It Works

SteamLite uses:

Local Steam installation files
Steam VDF config parsing
Steam Web API for friends and profiles
Steam CDN for game artwork

All data is cached locally for performance.

Notes

Requires Steam installed on Windows
Some features depend on Steam Web API
Friend visibility depends on Steam privacy settings
SteamLite does not modify Steam itself

Version

1.3-pre-release

Roadmap

Real-time friend status streaming
In-app chat improvements
Game search & categories
Animated UI transitions
Notification system
Offline mode support

Philosophy

Speed over complexity
Gaming-first experience
Clean, distraction-free UI

License

Educational / personal use project.

Disclaimer

SteamLite is not affiliated with Valve or Steam. Steam is a trademark of Valve Corporation.
