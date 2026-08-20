# Contributing to SteamLite

Thanks for helping make SteamLite better! This guide covers everything from adding a theme (the easiest way to contribute — no code required) to submitting fixes and features.

## Ways to contribute

| Type | Effort | Notes |
|---|---|---|
| 🎨 Themes | Low | JSON only — no coding needed |
| 🐛 Bug reports | Low | Hugely valuable with clear repro steps |
| 🔧 Bug fixes | Medium | |
| ✨ Features | Varies | Please discuss first — see [Feature requests](#feature-requests) |

## Getting set up

**Prerequisites:** Windows 10/11 · Node.js 18+ (LTS) · Git · Steam installed

```bash
git clone https://github.com/imnotfisy/SteamLite.git
cd SteamLite
npm install              # toolchain (Electron, electron-builder)
npx electron src         # run the app in dev mode
```

If startup complains about a missing module (e.g. `electron-store`), run `npm install` inside `src/` as well — app modules live there.

To build the installer locally: `npx electron-builder --win nsis --x64`

### ⚠️ Dev data gotcha — read before your first run

Running from source uses the **same data folder** as an installed copy: `%APPDATA%\SteamLite-DEV`. Your API key, stats, streaks, and applied theme are shared between the two. Either be aware of that (back up `config.json` before poking at things), or run isolated:

```powershell
$env:SL_NO_USERDATA_PIN=1
npx electron src --user-data-dir="C:\temp\sl-test"
```

## Contributing a theme

Themes are plain JSON with three sections: `canvas`, `vars`, and `css`. The easiest way to make one is to tweak a look in SteamLite's UI Editor and export it — or copy an existing theme from `themes/` and edit it.

### File format

```json
{
  "canvas": {},
  "vars": {
    "accent": "#8b5cf6",
    "bg": "#05050a",
    "panel": "#12101a",
    "text": "#e8e6f0",
    "muted": "#9a96b0",
    "border": "rgba(139,92,246,0.25)"
  },
  "css": ":root{--accent:#8b5cf6;--bg:#05050a;--panel:#12101a;--text:#e8e6f0;--muted:#9a96b0;--border:rgba(139,92,246,0.25)}"
}
```

### Steps

1. Create `themes/<your-theme-id>.json` in the repo-root `themes/` folder (not `src/themes/` — that's for themes bundled into app releases).
2. Add an entry to `themes/themes.json`:

   ```json
   {
     "id": "your-theme-id",
     "name": "Your Theme Name",
     "author": "your-github-name",
     "description": "One sentence about the vibe.",
     "file": "your-theme-id.json",
     "colors": ["#8b5cf6", "#05050a"]
   }
   ```

3. Open a PR with both changes.

### Theme rules

- **IDs and filenames:** lowercase kebab-case, unique across the whole shop (bundled + published — the shop dedupes by `id`). The `file` field must match the JSON filename exactly.
- **Always define `accent`** in both `vars` and `css` — Settings syncs its accent picker from it.
- **Dark themes work best.** SteamLite is a dark app; keep text readable and avoid eye-searing brights.
- **No `requires` field** — that's reserved for achievement-reward themes that ship with the app.
- Put the key variables in the `css` string too (as `:root{...}`) — that's what guarantees the look applies regardless of which vars the UI reads.

### Testing locally

Your theme doesn't need to be merged to try it: run SteamLite and use **Settings → Import Theme** on your JSON file. Once merged, it appears in everyone's Theme Shop automatically (the shop merges published themes at runtime), and may get bundled into a later release so it works offline too.

## Contributing code

### Project layout

```
src/
├─ main.dev.js      # main process: IPC, Steam API, game tracking, achievements, streaks
├─ index.dev.html   # the entire renderer (HTML + CSS + JS in one file)
├─ themes/          # themes bundled into the installer (maintainer-managed)
└─ ...
themes/             # published themes, merged into the Theme Shop at runtime
```

Note: the preload bridge (`sl_preload.js`) is **generated at runtime** into your userData folder — don't hunt for it in the repo. New IPC goes through the `window.electronAPI` bridge it exposes.

### Conventions

- Match the existing style: 4-space indent, single quotes, semicolons.
- Renderer code goes in `index.dev.html`; main-process code in `main.dev.js`.
- Version strings come from `app.getVersion()` — never hardcode a version.
- Windows is the only supported platform; don't add macOS/Linux code paths.

### Known gotchas

- **CSS scoping:** there's a global `.action-btn` rule that stretches buttons to full width. If you add a button inside a horizontal flex row, scope it (e.g. `.my-card .my-btn { width: auto; }`) or it will stretch and squash its siblings. This has bitten us before.
- **Themes are live CSS:** theme `css` strings are injected at runtime — check new UI still looks right with a non-default theme applied.
- **Never paste `config.json` contents** into issues or PRs — it contains your Steam API key.

### Debugging

- Run `npx electron src` from a terminal to see main-process logs.
- The app is frameless, so for renderer DevTools run with `SL_CDP=1` and connect via `chrome://inspect` (CDP port 9222).

### Before you open a PR

- [ ] Ran the app from source and exercised the changed feature
- [ ] Checked it with a non-default theme applied (for UI changes)
- [ ] No hardcoded versions; new IPC goes through the preload bridge
- [ ] Before/after screenshots for anything visual

## Reporting bugs

Open an issue with:

- **SteamLite version** (shown in Settings)
- **Windows version**
- **Steps to reproduce**, expected vs. actual behavior
- Console output if available (run from a terminal, or use the `SL_CDP` trick above)

**Always redact your Steam API key and SteamID from screenshots.**

## Feature requests

SteamLite deliberately stays small and fast — features are chosen carefully, and big additions start as a conversation. Open an issue describing the *problem* you're trying to solve (not just a solution), and expect some back-and-forth. Small quality-of-life improvements and performance wins are the most likely to be accepted.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE) that covers this project.
