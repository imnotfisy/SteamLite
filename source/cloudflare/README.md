# SteamLite Online on Cloudflare

The same server as `../server`, but running as a Cloudflare Worker with a D1 (SQLite) database. It is always on, has a
permanent `*.workers.dev` address, and needs no PC or tunnel. The free plan is plenty.

Live address: https://steamlite-online.bayxturtle.workers.dev

## Admin page
Open `<address>/admin` and paste the admin token. The token is the `ADMIN_TOKEN` secret; a copy is kept in `admin-token.txt`
(never uploaded). The page works from anywhere, and nothing on it works without the token.
It has the same forms as the PC server: review themes, post announcements, send gifts, message from the team, polls.

## Deploying changes
```
npm install
node build.js                 # embeds src/admin_html.txt into src/worker.js
npx wrangler login            # once
npx wrangler deploy
```

## First-time setup
```
npx wrangler d1 create steamlite-online        # copy the database_id into wrangler.toml
npx wrangler d1 execute steamlite-online --remote --file=schema.sql
npx wrangler secret put ADMIN_TOKEN            # type the token, no extra line break
npx wrangler deploy
```
Then put the address in `online.json` at the root of the repository; the apps read it from there.

## Verified and owner ticks
On the admin page, Players: **Verify** gives the blue tick, **Make owner** gives the gold crown, **Remove tick** takes it away. An owner account has everything unlocked in the app (themes, frames, titles, shop and trophy items, level rewards). The app checks one function, `isOwner()` in `main.dev.js`, wherever something is locked, so anything added in a future update should check it too.

## Stored Steam API keys
Players' Steam Web API keys are saved encrypted (AES-GCM). The encryption key is derived from the `KEY_SECRET` secret:
```
npx wrangler secret put KEY_SECRET            # a long random string; keep a copy in key-secret.txt (never uploaded)
```
If KEY_SECRET is lost, saved keys can not be read and players are asked for their key once more. Never set `DEV_SKIP_KEY_CHECK` in production: it is only for local tests.

## Migrations for an existing database
Add these once, in order, if your database is older: `migrate_avatar.sql`, `migrate_themes.sql`, `migrate_verified.sql`, `migrate_social2.sql`, then run `schema.sql` again.

## Local testing
`npx wrangler dev --local --port 8788` (put `ADMIN_TOKEN=...` in `.dev.vars`).
