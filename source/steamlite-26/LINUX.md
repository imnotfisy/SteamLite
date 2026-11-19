# SteamLite on Linux (preview)

This is the source of SteamLite 26 (a Tauri window, a Svelte interface and a small Node core). This page is about building and running it on Linux.
The Linux version is a preview: it is built and tested on Ubuntu first.

## Build it

On Ubuntu (22.04 or newer), in this folder:

```bash
bash tools/linux-build.sh
```

The script installs what it needs (it asks for your password for apt), adds a swap file if the machine has little memory, builds the window and the app, and puts the
results in `linux-out/`:

- `SteamLite_<version>_amd64.deb` (install it with `sudo apt install ./linux-out/*.deb`)
- `SteamLite_<version>_amd64.AppImage` (if it can be made on your system)

The first build takes a while (about 20 to 40 minutes on 4 GB of RAM with swap, much less with 8 GB or more). Keep about 15 GB of disk free.

## Run it

```bash
sudo apt install ./linux-out/*.deb      # then open SteamLite from the app menu
# or the AppImage, when there is one:
chmod +x linux-out/*.AppImage && ./linux-out/*.AppImage
```

SteamLite finds Steam in `~/.local/share/Steam`, `~/.steam/steam` or the Flatpak install. Games start through Steam (`steam -applaunch`), and the game Steam says is
running is the one SteamLite follows.

## What is different on Linux

- Updates are not installed from inside the app yet: download the new AppImage from the releases page.
- "Start with Windows" becomes "Start with the system" (an autostart entry).
- The Steam sign-in token is stored in the settings file (`~/.config/SteamLite/config.json`, readable only by you) instead of Windows' encrypted store.
- Games added by hand can be any program file you can run.

## Where the platform differences live

`core/platform.js` holds everything that differs between Windows and Linux (Steam's location, listing and stopping programs, starting games and Steam, the clipboard,
secrets). The rest of the core does not care which system it is on. `src-tauri/tauri.linux.conf.json` is the Linux packaging setup.
