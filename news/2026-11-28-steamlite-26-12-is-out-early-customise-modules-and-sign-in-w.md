---
title: SteamLite 26.12 is out, early - Customise, modules and Sign in with Discord
date: 2026-11-28T10:00:00Z
tag: Release
release: v26.12.0
---

SteamLite 26.12 is out, early. It adds Customise and modules so you can make your own look, an Account page with Sign in with Discord, a library that stays quick with any number of games, and a first look at the next interface.

## Customise

Open **Customise** in the sidebar. It has three tabs: **Themes**, **My modules** and **Gallery**. A short tutorial plays the first time, and the **Tutorial** button plays it again. The Themes section of Settings moved here, and a theme is kept as soon as you pick it.

## Modules

A module changes how SteamLite looks: colours, corner shapes, a font, your own logo and background picture, which parts of the app show, and your own CSS. Press **Make a module** and the editor works out a whole theme from five colours, with every change shown on the real app while you work.

- **Get one:** pick one from the Gallery, paste a GitHub repository or a Gist link, or choose a file a friend sent you. SteamLite keeps exactly the version it downloaded and shows an Update button when it changes.
- **Share yours:** sign in to GitHub once with a short code and publish it as a public Gist in one click. SteamLite can only create and change Gists. You can also save a file or submit it to the Gallery.
- **A module replaces your theme.** While a module is in use your theme is switched off, so the two never fight. A module can include one of the ready-made themes, and then the colours are that theme's own.
- **Safe by design.** A module is only settings and CSS, never code. It cannot read your files or your Steam account or load anything from the internet, and unsafe CSS is removed. If one ever makes SteamLite hard to use, press **Ctrl+Alt+Shift+M** to switch every module off.

## Account, and Sign in with Discord

A new **Account** page (click your picture at the top right) has everything about you in one place: your Steam accounts, your friend code, who can see your profile, the services you linked, and your data folder.

**Sign in with Discord** now uses Discord's own sign-in page. SteamLite only learns your Discord name and picture, never your password or your messages, and the link shows as confirmed by Discord. If you choose to, your Discord name shows on your profile and a small Discord mark appears next to you in your friends' lists. It is off until you turn it on.

## A calmer, faster library

- The title and controls at the top of each page stay on screen while only the content scrolls.
- The library scrolls one row of games at a time.
- The library handles any number of games. It draws only the rows you can see and adds the next 500 games as you scroll, so even a library of hundreds of thousands of games stays quick.
- Changing a theme or a module shows the loading screen for a moment, so you never see it half done.

## A first look at 27.1

In **Settings, Appearance**, you can try the next interface before it is out: a floating dock instead of the sidebar, springs in every animation, and stretchy scrolling. It downloads from GitHub, your normal interface is not touched, and **Ctrl+Alt+Shift+U** takes you back at any time. A short tour plays the first time you open it.

## Christmas

The Christmas theme unlocks on December 1, with snow you can turn off.

## Update

SteamLite offers it by itself. You can also press **Check now** in Settings, under Updates.
