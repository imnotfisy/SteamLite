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

## Local testing
`npx wrangler dev --local --port 8788` (put `ADMIN_TOKEN=...` in `.dev.vars`).
