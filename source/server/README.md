# SteamLite Online server

A small Node.js server (no dependencies) for the online features of SteamLite 9.1+: poll votes, the global leaderboard,
the community theme gallery and live announcements / special gifts.

- It listens on `127.0.0.1:8787` only. Players reach it through a tunnel (playit.gg or Tailscale Funnel) that points at that port.
- `start-hidden.vbs` starts it with no window. A shortcut to it in the Windows Startup folder runs it when you log in.
- Data lives in `data/` (JSON files). The admin token is in `config.json` (keep it private).
- Admin page: http://localhost:8787/admin (works only from this PC, never through the tunnel). Paste the token from `config.json`.
  Review shared themes, edit announcements / gifts / polls.
- Health check: http://localhost:8787/health

Special gift example (Live status box in the admin page):
`{"gifts":[{"id":"launch-day","title":"Launch day gift","xp":20000,"until":1792000000000}]}`  (`until` is a time in milliseconds)

Stop it: Task Manager > node.exe, or run `taskkill /IM node.exe` if you have no other Node apps open.
