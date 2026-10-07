# SteamLite Online server

A small Node.js server (no dependencies) for the online features of SteamLite 9.1+: live poll votes, the global leaderboard,
the community theme gallery and live announcements / special gifts. A free Cloudflare tunnel (`tunnel.js` + `cloudflared.exe`)
carries the public traffic to it.

## It starts by itself
- A shortcut called **SteamLite Server** in your Windows Startup folder runs `start-hidden.vbs` at login. That starts the server
  (`server.js`, port 8787, this PC only) and the tunnel (`tunnel.js`), both with no window.
- Each time the tunnel starts it gets a new address. `tunnel.js` writes it to `online.json` in the SteamLite GitHub repo, and the apps read it from there.
- Logs: `data\server.log` and `data\tunnel.log`. Your data (votes, leaderboard, themes) is in `data\*.json`.

## Running the server day to day: the admin page
1. Open **http://localhost:8787/admin** in your browser (it only works from this PC, never through the tunnel).
2. Paste the **admin token**: it is the `adminToken` line in `config.json` in this folder. Keep it private. The page remembers it until you close the tab.
3. What you can do there:
   - **Themes waiting for review:** players' shared themes show up with their colours and CSS. **Approve** puts a theme in the Community themes gallery, **Reject** throws it away. Nothing is public until you approve it.
   - **Post an announcement:** a title, a message and how many days to show it. Every player gets a pop-up, and it appears at the top of their dashboard news.
   - **Send a special gift:** a name, an amount of XP (max 100,000) and how many hours it stays available. It appears in the Drops window, once per player.
   - **Message from the team:** one line shown at the top of the news. Leave it empty for none.
   - **Live right now:** everything currently live, each with a **Remove** button.
   - **Polls:** the "What should we add next?" list (JSON). Add or change ideas; each needs a short unique `id`. Votes are kept per idea id.

## Checking it works
- http://localhost:8787/health should answer `{"ok":true,...}`.
- The current public address is in `data\tunnel-url.txt`. Open `<address>/health` from your phone (on mobile data) to test it from outside.

## Stopping, restarting
- Restart everything: sign out and in again, or double-click `start-hidden.vbs` (the server and tunnel only start if they are not already running).
- Stop it: Task Manager > find the `node.exe` and `cloudflared.exe` entries and end them. Delete the Startup shortcut to stop it starting at login.

## Good to know
- Players can only reach the server while this PC is on and logged in. When it is off the apps say "SteamLite Online is not available" and everything else works as normal.
- Back up the `data` folder now and then if the votes and leaderboard matter to you.
