'use strict';
// Talking to Steam: the Web API (with a saved copy for when you are offline) and the sign-in profiles.
const https = require('https'), http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const store = require('./store');

const cacheDir = path.join(store.userData, 'apicache');
const cacheFile = (url) => path.join(cacheDir, crypto.createHash('sha1').update(url.replace(/key=[^&]+/, 'key=')).digest('hex') + '.json');

function raw(url, headers = {}, timeout = 12000) {
  return new Promise((resolve, reject) => {
    const req = (url.startsWith('http://') ? http : https).get(url, { headers: Object.assign({ 'User-Agent': 'SteamLite' }, headers), timeout }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      let s = ''; res.setEncoding('utf8'); res.on('data', (c) => { s += c; });
      res.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } });
    });
    req.on('timeout', () => req.destroy(new Error('Timed out')));
    req.on('error', reject);
  });
}

// the answer, or the last good answer when Steam cannot be reached (offline, down); a rejected key (4xx) is never papered over
async function getJson(url, { headers, timeout, cache = true } = {}) {
  try {
    const d = await raw(url, headers, timeout);
    if (cache) { try { fs.mkdirSync(cacheDir, { recursive: true }); const t = JSON.stringify(d); if (t.length < 3e6) fs.writeFileSync(cacheFile(url), t); } catch (e) { } }
    return d;
  } catch (err) {
    const code = /HTTP (\d+)/.exec(err.message);
    if (cache && (!code || Number(code[1]) >= 500)) { try { return JSON.parse(fs.readFileSync(cacheFile(url), 'utf8')); } catch (e) { } }
    throw err;
  }
}

const API = 'https://api.steampowered.com/';
const q = (o) => Object.entries(o).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
const api = (p, params, opt) => getJson(API + p + '?' + q(params), opt);

function current() { return { steamId: store.get('steamId', ''), apiKey: store.get('apiKey', '') }; }
const signedIn = () => { const c = current(); return !!(c.steamId && c.apiKey); };

// ---- profiles: several sign-ins saved side by side, switched instantly ----
function profiles() {
  const p = store.get('profiles');
  const out = p && Array.isArray(p.list) ? p : { list: [], activeId: null, data: {} };
  if (!out.data) out.data = {};
  const c = current();
  if (c.apiKey && c.steamId && !out.list.some((x) => x.steamId === c.steamId)) { out.list.push({ steamId: c.steamId, apiKey: c.apiKey, name: '', avatar: '', addedAt: Date.now() }); out.activeId = c.steamId; store.set('profiles', out); }
  return out;
}
// play time belongs to a person: park the live copy under the old profile, load the new one's
function swapUserData(newId, prevId) {
  const p = profiles();
  if (prevId && prevId !== newId) { p.data[prevId] = Object.assign(p.data[prevId] || {}, { telemetry: store.get('telemetry', {}), sessionHistory: store.get('sessionHistory', []) }); }
  const next = p.data[newId] || {};
  store.set('telemetry', next.telemetry || {}); store.set('sessionHistory', next.sessionHistory || []);
  store.set('profiles', p);
}
async function listProfiles() {
  const p = profiles();
  await Promise.all(p.list.filter((x) => !x.name).map(async (x) => {
    if (process.env.SL_MOCK === '1') { x.name = 'Test Player ' + x.steamId.slice(-1); return; }
    try { const u = (await api('ISteamUser/GetPlayerSummaries/v2/', { key: x.apiKey, steamids: x.steamId }, { timeout: 6000 })).response.players[0]; x.name = u ? u.personaname : x.steamId; x.avatar = u ? u.avatarfull : ''; } catch (e) { x.name = x.steamId; }
  }));
  store.set('profiles', p);
  return { profiles: p.list.map((x) => ({ steamId: x.steamId, name: x.name, avatar: x.avatar })), activeId: p.activeId };
}
async function signIn(steamId, apiKey, extra = {}) {
  steamId = String(steamId || '').trim(); apiKey = String(apiKey || '').trim();
  if (!/^7656119\d{10}$/.test(steamId)) return { ok: false, error: 'That does not look like a SteamID64 (17 digits, starting with 7656119).' };
  if (!/^[0-9A-Fa-f]{32}$/.test(apiKey)) return { ok: false, error: 'A Steam Web API key is 32 letters and numbers.' };
  let u;
  if (MOCK) u = { personaname: 'Test Player', avatarfull: '' }; else
  try { u = (await api('ISteamUser/GetPlayerSummaries/v2/', { key: apiKey, steamids: steamId }, { cache: false, timeout: 9000 })).response.players[0]; }
  catch (e) { return { ok: false, error: /HTTP 40[13]/.test(e.message) ? 'Steam did not accept that API key.' : 'Could not reach Steam. Check your connection and try again.' }; }
  if (!u) return { ok: false, error: 'No Steam account has that SteamID64.' };
  const p = profiles(), prev = p.activeId && p.activeId !== steamId ? p.activeId : null;
  const have = p.list.find((x) => x.steamId === steamId);
  const fields = { apiKey, name: u.personaname || extra.name || steamId, avatar: u.avatarfull || '' }; if (extra.tok) fields.tok = extra.tok;      // tok: the Steam sign-in token, already encrypted
  if (have) Object.assign(have, fields); else p.list.push(Object.assign({ steamId, addedAt: Date.now() }, fields));
  p.activeId = steamId; store.set('profiles', p); store.set('apiKey', apiKey); store.set('steamId', steamId);
  swapUserData(steamId, prev);
  return { ok: true };
}
const getProfile = (steamId) => profiles().list.find((x) => x.steamId === String(steamId)) || null;
const anyApiKey = () => { const c = current(); if (c.apiKey) return c.apiKey; const x = profiles().list.find((y) => y.apiKey); return x ? x.apiKey : ''; };
function switchTo(steamId) {
  const p = profiles(), x = p.list.find((y) => y.steamId === steamId);
  if (!x || p.activeId === steamId) return false;
  const prev = p.activeId; p.activeId = steamId; store.set('profiles', p); store.set('apiKey', x.apiKey); store.set('steamId', steamId); swapUserData(steamId, prev); return true;
}
function removeProfile(steamId) {
  const p = profiles(); if (steamId === p.activeId) return false;
  p.list = p.list.filter((x) => x.steamId !== steamId); delete p.data[steamId]; store.set('profiles', p); return true;
}
function signOut() {
  const p = profiles(); if (p.activeId) swapUserData('', p.activeId);
  p.activeId = null; store.set('profiles', p); store.set('apiKey', ''); store.set('steamId', ''); return true;
}

// ---- what the app needs from Steam ----
const NON_GAME_IDS = new Set(['228980', '228985', '243750', '243730', '17510', '17515', '17520', '17530', '427520', '43110', '211', '218', '250820', '705', '480']);
const NON_GAME_NAME = /(?:original\s+)?soundtrack|\(ost\)|redistributable|steamworks|dedicated server$|\bsdk\b|proton\s+\w+\s+runtime|steam linux runtime|steam input configurator/i;
// demos, playtests, benchmarks, servers and tools are hidden too, unless "Show everything" is on in Settings
const NON_GAME_EXTRA = /\bplaytest\b|\bbenchmark\b|\bdedicated server\b|\bauthoring tools\b|\bmod tools\b|\bworkshop tools\b|\(demo\)|\bdemo$|\btest server\b|\bcompanion app\b|\bsdk\b/i;
const isGame = (g) => store.get('pref.showAllApps', false) || (!NON_GAME_IDS.has(String(g.appid)) && !NON_GAME_NAME.test(g.name || '') && !NON_GAME_EXTRA.test(g.name || ''));

// SL_MOCK=1 (testing only): a made-up account, so every screen can be looked at without signing in to anything
const MOCK = process.env.SL_MOCK === '1';
const MOCK_GAMES = [[730, 'Counter-Strike 2', 5400], [570, 'Dota 2', 2100], [1245620, 'ELDEN RING', 3900], [1091500, 'Cyberpunk 2077', 2600], [292030, 'The Witcher 3: Wild Hunt', 4800], [105600, 'Terraria', 1500], [413150, 'Stardew Valley', 3300], [1174180, 'Red Dead Redemption 2', 900], [322330, "Don't Starve Together", 600], [252490, 'Rust', 0], [367520, 'Hollow Knight', 1200], [1086940, "Baldur's Gate 3", 7200], [1145360, 'Hades', 1700], [892970, 'Valheim', 800], [3764200, 'Resident Evil Requiem', 300], [4164420, 'My Winter Car', 200], [4249110, 'Resident Evil 2 (1998)', 100], [527710, 'Crown Champion: Legends of the Arena', 50]]
  .map(([appid, name, playtime_forever], i) => ({ appid, name, playtime_forever, rtime_last_played: Math.floor(Date.now() / 1000) - (i * 3 + 1) * 86400 }));
// the saved copy of the owned games, at once (null when there is none yet); used to show the library before Steam has answered
function cachedJson(url) { try { return JSON.parse(fs.readFileSync(cacheFile(url), 'utf8')); } catch (e) { return null; } }
async function ownedGames(opt = {}) {
  const c = current(); if (!signedIn()) return [];
  if (MOCK) return MOCK_GAMES;
  const params = { key: c.apiKey, steamid: c.steamId, format: 'json', include_appinfo: 'true' };
  if (opt.cached) { const d0 = cachedJson(API + 'IPlayerService/GetOwnedGames/v0001/?' + q(params)); return d0 ? ((d0.response && d0.response.games) || []).filter(isGame) : null; }
  const d = await api('IPlayerService/GetOwnedGames/v0001/', params);
  return ((d.response && d.response.games) || []).filter(isGame);
}
async function profileInfo() {
  const c = current(); if (!signedIn()) return null;
  if (MOCK) return { summary: { personaname: 'Test Player', avatarfull: '', profileurl: 'https://steamcommunity.com/' }, bans: null, level: 42 };
  const [s, b, l] = await Promise.all([
    api('ISteamUser/GetPlayerSummaries/v2/', { key: c.apiKey, steamids: c.steamId }).catch(() => null),
    api('ISteamUser/GetPlayerBans/v1/', { key: c.apiKey, steamids: c.steamId }).catch(() => null),
    api('IPlayerService/GetSteamLevel/v1/', { key: c.apiKey, steamid: c.steamId }).catch(() => null)]);
  return { summary: s && s.response.players[0] || null, bans: b && b.players[0] || null, level: l && l.response.player_level || 0 };
}
async function achievements(appId) {
  const c = current();
  try {
    const [pl, sc] = await Promise.all([api('ISteamUserStats/GetPlayerAchievements/v1/', { key: c.apiKey, steamid: c.steamId, appid: appId }), api('ISteamUserStats/GetSchemaForGame/v2/', { key: c.apiKey, appid: appId })]);
    const map = {}; ((sc.game && sc.game.availableGameStats && sc.game.availableGameStats.achievements) || []).forEach((s) => { map[s.name] = s; });
    return (pl.playerstats.achievements || []).map((a) => { const i = map[a.apiname]; return { name: i ? i.displayName : a.apiname, description: i ? i.description || '' : '', icon: i ? i.icon : '', achieved: !!a.achieved }; });
  } catch (e) { return []; }
}
function cleanSnippet(t) {
  return String(t || '').replace(/\{STEAM_CLAN_IMAGE\}\S*/g, ' ').replace(/\[\/?[a-z0-9*]+(?:=[^\]]*)?\]/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/\\+/g, ' ')
    .replace(/&nbsp;|&amp;|&quot;|&#39;/g, (m) => ({ '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'" }[m])).replace(/\s+/g, ' ').trim();
}
async function news(appId, count = 3, len = 600) {
  try {
    const d = await getJson(API + 'ISteamNews/GetNewsForApp/v2/?' + q({ appid: appId, count, maxlength: len, feeds: 'steam_community_announcements' }), { timeout: 8000 });
    return ((d.appnews && d.appnews.newsitems) || []).map((n) => ({ appId: String(appId), gid: String(n.gid || ''), title: String(n.title || '').slice(0, 160), url: /^https:\/\//i.test(n.url || '') ? n.url : '', date: n.date || 0, text: cleanSnippet(n.contents).slice(0, 400) }));
  } catch (e) { return []; }
}

module.exports = { getProfile, anyApiKey, getJson, api, current, signedIn, listProfiles, signIn, switchTo, removeProfile, signOut, ownedGames, profileInfo, achievements, news, isGame };
