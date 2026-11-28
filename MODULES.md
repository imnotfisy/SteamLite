# SteamLite modules

A **module** changes how SteamLite looks: colours, shapes, a background, a logo, which parts of the app show, and (if you like) your own CSS. Modules are plain data, never code. A module cannot run anything, read your files, reach your Steam account or load anything from the internet.

Open **Customise** in the sidebar to make one, install one from the **Gallery**, or install one from any GitHub repository.

## Using modules

- **Use** turns a module on. One module is active at a time, on top of the theme you picked in Settings.
- **Use modules** (top right of Customise) switches every module off at once.
- If a module ever makes SteamLite hard to use, press **Ctrl + Alt + Shift + M**. It turns all modules off, and pressing it again turns them back on.
- Modules with their own CSS ask before they are used, because CSS can restyle or hide anything.

## Making one in the app

**Make a module** opens the editor. Everything you change shows on the real app straight away, and nothing is kept until you press **Save**.

- **Theme:** a module replaces the theme you picked in Customise, and your theme is switched off while it is in use. A module can include one of the ready-made themes, and then the colours are the theme's own: a module that includes a theme only sets corners, font, pictures and layout, and its CSS may not set colours, backgrounds, borders, shadows or filters (those are removed).
- **Colours:** five colours (background, text, accent, second accent, Play button). The panels, lines, sidebar and hover colours are worked out from them. A light background gives a light theme. You can fade the background into a second colour.
- **Shape and text:** how round the corners are, and a font from a short list of fonts every Windows PC has.
- **Pictures:** your own logo (replaces the SteamLite logo everywhere it shows) and a background picture, with darken and blur. PNG, JPEG or WebP under 1.5 MB.
- **What shows:** turn off Home, Library, News or Stats in the sidebar, parts of the Home page, and set the Library's cover size. Customise and Settings are always there.
- **Advanced:** your own CSS (see below).

## Sharing

- **Save as a file** puts `<id>.slmod` in your Downloads folder. Anyone can use **Import a file** to install it.
- **Publish to GitHub:** the publish button on a module signs you in to GitHub once (SteamLite shows a short code, you type it on github.com/login/device) and makes a public Gist with your module and its pictures. You get a link; anyone pastes it into **Install from GitHub**. Publishing again updates the same Gist. SteamLite only asks for permission to create and change Gists, keeps the sign-in encrypted for your Windows user, and **Sign out** forgets it.
- **Install from GitHub:** put your module in a GitHub repository and others type `owner/repository`, or paste a Gist link. SteamLite saves exactly the version it downloaded (a commit), shows an **Update** button when the repository changes, and never runs anything from it. The repository needs a `steamlite-module.json` at the top, and its pictures in `assets/`.
- **Submit to the gallery:** the button opens a GitHub issue in the SteamLite repository with your file ready to attach. Modules that pass review are added to the `modules/` folder, and appear in everyone's Gallery.

## The module file

`module.json` (or `steamlite-module.json` in a repository):

```json
{
  "schema": 1,
  "id": "neon-night",
  "name": "Neon Night",
  "version": "1.0.0",
  "author": "you",
  "description": "Deep midnight with hot pink and cyan neon.",
  "tokens": { "--bg": "#0a0a14", "--accent": "#ff2bd6", "--play": "#00e5ff" },
  "base": "purple",
  "logo": "assets/logo.png",
  "background": { "image": "assets/bg.jpg", "dim": 30, "blur": 0 },
  "layout": {
    "sidebar": { "hide": ["news", "stats"], "order": ["library", "home"] },
    "home": { "hide": ["stats", "news"] },
    "library": { "coverSize": 214 }
  },
  "css": ".btn { letter-spacing: .03em; }"
}
```

- **id:** 2 to 39 letters, numbers or dashes.
- **tokens**, the settings a module can change. Anything else is ignored.
  - Colours: `--bg --bg-raise --text --muted --faint --glow --accent --accent2 --accent-ink --play --play-ink --good --bad --warn --s1 --s2 --s3 --line --line2` (hex, `rgb()`, `rgba()`, `hsl()` or `hsla()`).
  - Fills (a colour, a gradient, or `none`): `--page --slab --face --face-hi --rail`. Gradients may use only colours, never pictures or addresses.
  - Corners: `--r-xl --r-lg --r --r-sm` (0 to 40 px).
  - `--font`: font names only, like `Georgia, serif`.
- **base:** optional. `default`, `purple`, `discord`, `xmas` or `gta6`: the ready-made theme the module includes. Leave it out for none. A theme that has ended is not shown.
- **logo**, **background.image:** paths inside `assets/`. PNG, JPEG or WebP. SVG is not accepted, because it can carry scripts.
- **layout.sidebar.hide / order:** `home`, `library`, `news`, `stats`. **layout.home.hide:** `hero`, `stats`, `recent`, `most`, `favorites`, `news`. **layout.library.coverSize:** 130 to 260.
- **css:** up to 60 KB.

### What is removed from CSS

SteamLite cleans your CSS every time it is used. These are removed:

- `@import`, `@font-face` and every at-rule except `@media`, `@supports` and `@keyframes`
- every `url()`, except `asset(name)`, which is replaced with one of the module's own pictures
- `position: fixed` and `position: sticky`
- `content` other than empty
- `z-index` above 50
- `expression()`, `behavior`, `-moz-binding`, `image-set()`, `javascript:` and backslash escapes
- custom properties (use `tokens` instead)
- when the module includes a theme: colours, backgrounds, borders, outlines, shadows, fills and filters, because the colours are the theme's

`node tools/modules.js check <folder>` checks a module folder with the same rules the app uses, and says what it would remove.

## For the gallery

`modules/<id>/module.json` plus `modules/<id>/assets/`. `node tools/modules.js build` checks every module and writes `modules/index.json`.
