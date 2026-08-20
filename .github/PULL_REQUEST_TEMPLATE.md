<!--
  Thanks for the PR! 👋
  Fill in what applies and delete what doesn't — an honest half-filled
  checklist beats a fully-ticked one you winged.
-->

## What does this PR do?

<!-- One or two sentences: what changes, and why. -->

**Related issue:** Fixes #<!-- issue number --> *(or "n/a")*

## Type of change

- [ ] 🎨 New theme
- [ ] 🐛 Bug fix
- [ ] ✨ Feature or enhancement
- [ ] 📝 Documentation
- [ ] 🔧 Something else

## If this is a theme PR

- [ ] Added `themes/<theme-id>.json` to the **repo-root** `themes/` folder (not `src/themes/` — that's for themes bundled into the installer)
- [ ] Added an entry to `themes/themes.json` with `id`, `name`, `author`, `description`, `file`, and `colors`
- [ ] `id` is lowercase kebab-case and doesn't clash with any existing theme (bundled or published — the shop dedupes by `id`)
- [ ] `file` matches the JSON filename exactly
- [ ] `accent` is defined in **both** `vars` and the `css` `:root` block
- [ ] No `requires` field (reserved for achievement-reward themes that ship with the app)
- [ ] It's a dark theme with readable text — SteamLite is a dark app
- [ ] Tested it locally via **Settings → Import Theme**

## If this is a code PR

- [ ] Ran the app from source (`npx electron src`) and actually exercised the change
- [ ] UI changes were checked with a non-default theme applied (themes inject live CSS)
- [ ] Any button inside a horizontal flex row is width-scoped (the global `.action-btn` rule stretches unscoped buttons to 100% and squashes siblings)
- [ ] No hardcoded version strings — `app.getVersion()` only
- [ ] New renderer↔main communication goes through the `window.electronAPI` preload bridge
- [ ] Style matches the existing code (4-space indent, single quotes, semicolons)
- [ ] If I touched `src/themes/` (bundled themes) or build config, I've explained why below — these ship inside the installer

## Screenshots

<!-- Before/after for anything visual. UI changes especially. -->
<!-- 🔴 REDACT your Steam API key and SteamID from every screenshot first. -->

## How you tested it

<!-- What you did to verify this works, and anything you couldn't test yourself. -->

