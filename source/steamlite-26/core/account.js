'use strict';
// "Sign in with Steam" through the SteamLite server. Steam's own page confirms who you are; SteamLite never sees a password.
//   1. the app opens  <server>/auth/start?n=<one-time code>  in the browser, which goes to Steam's sign-in page
//   2. the app asks  <server>/auth/poll?n=<code>  until the server says it is done, and gets a token and the Steam ID
//   3. the Steam Web API key (which the library needs) comes from this PC, from the server (saved there for your account), or you type it once
const crypto = require('crypto'), { execFile } = require('child_process');
const steam = require('./steam'), store = require('./store');

const DEFAULT_BASE = 'https://steamlite-online.bayxturtle.workers.dev';       // used when the address list on GitHub cannot be reached
const URL_OK = /^https:\/\/[\w.-]+(:\d+)?$/i;
const MOCK = () => process.env.SL_MOCK === '1';
let baseCache = { url: '', at: 0 }, attempt = null, pending = null;

async function base() {
  if (baseCache.url && Date.now() - baseCache.at < 600000) return baseCache.url;
  let url = DEFAULT_BASE;
  try { const d = await steam.getJson('https://raw.githubusercontent.com/imnotfisy/SteamLite/main/online.json?t=' + Date.now(), { cache: false, timeout: 6000 }); const u = d && String(d.url || '').replace(/\/+$/, ''); if (u && URL_OK.test(u)) url = u; } catch (e) { }
  baseCache = { url, at: Date.now() }; return url;
}
async function srv(method, path, body, token, timeout = 8000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch((await base()) + path, { method, signal: ctl.signal, headers: Object.assign({ 'Content-Type': 'application/json', 'X-SL-Client': 'SteamLite/' + (process.env.SL_VERSION || '') }, token ? { Authorization: 'Bearer ' + token } : {}), body: body ? JSON.stringify(body) : undefined });
    let j = null; try { j = await r.json(); } catch (e) { }
    if (!r.ok) return { ok: false, error: (j && j.error) || 'HTTP ' + r.status, code: r.status };
    return Object.assign({ ok: true }, j || {});
  } catch (e) { return { ok: false, error: 'offline' }; } finally { clearTimeout(t); }
}

// the sign-in token is kept encrypted for this Windows user (DPAPI); on Linux it stays in the settings file (see platform.js)
const plat = require('./platform');
async function protect(plain) { if (MOCK()) return { plain }; return plat.protect(plain); }
const unprotect = (v) => plat.unprotect(v);

// ---- step 1: open Steam's sign-in page ----
async function loginStart(open, keep) {
  attempt = { n: crypto.randomBytes(16).toString('hex'), at: Date.now(), keep: !!keep, mockAt: Date.now() }; pending = null;
  if (MOCK()) return { ok: true };
  const b = await base();
  const h = await srv('GET', '/health', null, null, 6000);
  if (!h.ok) return { ok: false, error: 'Could not reach SteamLite Online. Check your connection and try again.', unreachable: true };
  try { await open(b + '/auth/start?n=' + attempt.n); } catch (e) { return { ok: false, error: 'Could not open your browser.' }; }
  return { ok: true, url: b + '/auth/start?n=' + attempt.n };
}
const reopenUrl = async () => (attempt ? (await base()) + '/auth/start?n=' + attempt.n : '');
function loginCancel() { attempt = null; pending = null; return true; }

// ---- step 2: has Steam confirmed it yet? ----
async function loginCheck() {
  if (!attempt || Date.now() - attempt.at > 600000) { attempt = null; return { done: false, expired: true }; }
  let r;
  if (MOCK()) { if (Date.now() - attempt.mockAt < 1800) return { done: false }; r = { ok: true, done: true, token: 'mock-token', steamid: attempt.keep ? '76561190000000002' : '76561190000000001', name: attempt.keep ? 'Test Player Two' : 'Test Player' }; }
  else { r = await srv('GET', '/auth/poll?n=' + attempt.n, null, null, 6000); if (!r.ok || !r.done) return { done: false }; }
  const keep = attempt.keep; attempt = null;
  const sid = String(r.steamid || ''); if (!/^7656119\d{10}$/.test(sid)) return { done: true, failed: true, error: 'Steam did not return a valid account. Try again.' };
  pending = { sid, name: String(r.name || sid), token: String(r.token || ''), keep };
  return finish();
}

// ---- step 3: the Steam Web API key, then the account is set up ----
async function haveKey(sid) {
  const p = steam.getProfile(sid); if (p && p.apiKey) return p.apiKey;                    // this account was here before
  const any = steam.anyApiKey(); if (any) return any;                                     // the key is the same for every Steam account
  if (MOCK()) return '00000000000000000000000000000000';
  const k = await srv('GET', '/me/key', null, pending.token, 8000);                       // saved on the server for your account
  return k.ok && /^[A-Fa-f0-9]{32}$/.test(k.key || '') ? String(k.key) : '';
}
async function finish(typedKey) {
  if (!pending) return { done: true, failed: true, error: 'Sign in again.' };
  const key = typedKey || await haveKey(pending.sid);
  if (!key) return { done: true, needKey: true, name: pending.name };
  const tok = await protect(pending.token);
  const r = await steam.signIn(pending.sid, key, { tok, name: pending.name });
  if (!r.ok) { if (typedKey) return { done: true, needKey: true, error: r.error, name: pending.name }; pending = null; return { done: true, failed: true, error: r.error }; }
  const out = { done: true, name: pending.name, steamId: pending.sid, added: pending.keep };
  if (!MOCK()) srv('PUT', '/me/key', { key }, pending.token, 8000).catch(() => { });      // so the key follows you to another PC
  store.set('steamLoginMigrated', true);                                                  // everyone signs in with Steam once; this remembers that it happened
  pending = null; return out;
}
const saveKey = (key) => { key = String(key || '').trim(); if (!/^[A-Fa-f0-9]{32}$/.test(key)) return { done: true, needKey: true, error: 'A Steam Web API key is 32 letters and numbers.', name: pending ? pending.name : '' }; return finish(key.toUpperCase()); };

module.exports = { loginStart, loginCheck, loginCancel, saveKey, reopenUrl, base, unprotect };
