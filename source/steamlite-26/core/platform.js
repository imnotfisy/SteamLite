'use strict';
// Everything that is different between Windows and Linux lives here: where Steam is, how running programs are listed and stopped, how a program or Steam is
// started, the clipboard, and where secrets and settings are kept. The rest of the core calls these and does not care which system it is on.
const fs = require('fs'), path = require('path'), os = require('os'), { execFile, spawn } = require('child_process');

const WIN = process.platform === 'win32';
const home = os.homedir();
const sh = (cmd, args, timeout = 5000) => new Promise((res) => execFile(cmd, args, { windowsHide: true, timeout, maxBuffer: 16 * 1048576 }, (err, out) => res(err ? null : String(out))));
const exists = (p) => { try { return fs.existsSync(p); } catch (e) { return false; } };

// ---------------------------------------------------------------- settings folder
function userData() {
  if (process.env.SL_USERDATA) return process.env.SL_USERDATA;
  if (WIN) return path.join(process.env.APPDATA || home, 'SteamLite');
  return path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'SteamLite');
}

// ---------------------------------------------------------------- Steam
const reg = (key, value) => new Promise((resolve) => execFile('reg', ['query', key, '/v', value], { windowsHide: true, timeout: 4000 }, (err, out) => resolve(err ? '' : String(out))));

// Linux: Steam can be the normal install, the older ~/.steam link, or the Flatpak
const LINUX_STEAM = [path.join(home, '.local', 'share', 'Steam'), path.join(home, '.steam', 'steam'), path.join(home, '.steam', 'root'), path.join(home, '.var', 'app', 'com.valvesoftware.Steam', '.local', 'share', 'Steam')];
const flatpak = () => exists(LINUX_STEAM[3]) && !exists(LINUX_STEAM[0]);

let steamBase = null;
async function steamPath() {
  if (steamBase) return steamBase;
  if (WIN) {
    const m = /SteamPath\s+REG_SZ\s+([^\r\n]+)/.exec(await reg('HKCU\\Software\\Valve\\Steam', 'SteamPath'));
    steamBase = m ? m[1].trim().replace(/\//g, '\\') : 'C:\\Program Files (x86)\\Steam';
  } else steamBase = LINUX_STEAM.find((p) => exists(path.join(p, 'steamapps'))) || LINUX_STEAM[0];
  return steamBase;
}
async function steamExe() {
  if (WIN) {
    const m = /SteamExe\s+REG_SZ\s+([^\r\n]+)/.exec(await reg('HKCU\\Software\\Valve\\Steam', 'SteamExe'));
    return m ? m[1].trim().replace(/^"|"$/g, '') : path.join(await steamPath(), 'steam.exe');
  }
  return 'steam';
}
// the game Steam says is running ("0" when none)
async function runningAppId() {
  if (WIN) {
    const m = /RunningAppID\s+REG_DWORD\s+0x([0-9a-f]+)/i.exec(await reg('HKCU\\Software\\Valve\\Steam', 'RunningAppID'));
    return m ? String(parseInt(m[1], 16)) : '0';
  }
  for (const f of [path.join(home, '.steam', 'registry.vdf'), path.join(home, '.var', 'app', 'com.valvesoftware.Steam', '.steam', 'registry.vdf')]) {
    try { const m = /"RunningAppID"\s+"(\d+)"/.exec(fs.readFileSync(f, 'utf8')); if (m) return m[1]; } catch (e) { }
  }
  return '0';
}
async function steamRunning() {
  if (WIN) { const out = await sh('tasklist', ['/FI', 'IMAGENAME eq steam.exe', '/NH']); return !!out && /steam\.exe/i.test(out); }
  for (const f of [path.join(home, '.steam', 'steam.pid')]) { try { const pid = Number(fs.readFileSync(f, 'utf8').trim()); if (pid > 0) { process.kill(pid, 0); return true; } } catch (e) { } }
  const out = await sh('pgrep', ['-x', 'steam']); return !!out && out.trim().length > 0;
}
// starts Steam (or tells a running one) to open a game: steam -applaunch <id>
async function startSteam(args) {
  const a = ['-silent', ...args];
  const c = WIN ? spawn(await steamExe(), a, { detached: true, stdio: 'ignore', windowsHide: true })
    : flatpak() ? spawn('flatpak', ['run', 'com.valvesoftware.Steam', ...a], { detached: true, stdio: 'ignore' }) : spawn('steam', a, { detached: true, stdio: 'ignore' });
  c.on('error', () => { }); c.unref(); return c;
}

// ---------------------------------------------------------------- programs
// every running program with its path (null when the list could not be read, which never counts as "the game closed")
function listProcs() {
  if (WIN) {
    const script = "$ErrorActionPreference='SilentlyContinue'; Get-Process | Where-Object { $_.Path } | ForEach-Object { '{0}|{1}' -f $_.Id, $_.Path }";
    return sh('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], 9000).then((out) => (out === null ? null : out.split(/\r?\n/).filter(Boolean).map((l) => { const i = l.indexOf('|'); return { pid: l.slice(0, i), path: l.slice(i + 1) }; })));
  }
  return new Promise((resolve) => {
    try {
      const list = [];
      for (const d of fs.readdirSync('/proc')) {
        if (!/^\d+$/.test(d)) continue;
        let p = ''; try { p = fs.readlinkSync('/proc/' + d + '/exe'); } catch (e) { continue; }
        // a game run through Proton or Wine is the wine program; the game's own file is in its command line
        let extra = ''; try { extra = fs.readFileSync('/proc/' + d + '/cmdline', 'utf8').split('\0').slice(1, 4).join(' '); } catch (e) { }
        list.push({ pid: d, path: p, cmd: extra });
      }
      resolve(list);
    } catch (e) { resolve(null); }
  });
}
function killPid(pid) {
  if (WIN) { execFile('taskkill', ['/F', '/T', '/PID', String(pid)], { windowsHide: true }, () => { }); return; }
  try { process.kill(Number(pid), 'SIGTERM'); } catch (e) { return; }
  setTimeout(() => { try { process.kill(Number(pid), 0); process.kill(Number(pid), 'SIGKILL'); } catch (e) { } }, 4000).unref();
}
async function killName(name) {
  if (WIN) { execFile('taskkill', ['/F', '/T', '/IM', name], { windowsHide: true }, () => { }); return; }
  for (const p of (await listProcs()) || []) if (path.basename(p.path) === name || (p.cmd && p.cmd.includes(name))) killPid(p.pid);
}
// a file inside a game's folder that is the game itself (not an uninstaller or a helper)
const HELPER = /unins|crash|redist|setup|installer|easyanticheat|battleye|eos|bootstrap/i;
function isGameProgram(name, full) {
  if (HELPER.test(name)) return false;
  if (WIN) return /\.exe$/i.test(name);
  try { return /\.(x86_64|x86|sh|appimage)$/i.test(name) || (fs.statSync(full).mode & 0o111) !== 0 && !path.extname(name); } catch (e) { return false; }
}
const isProgramFile = (file) => { if (WIN) return /\.exe$/i.test(file); try { return fs.statSync(file).isFile() && (fs.statSync(file).mode & 0o111) !== 0; } catch (e) { return false; } };
// folders that hold many programs, so they are never taken to be one game's folder
function badFolders() {
  const e = process.env;
  const list = WIN ? [e.WINDIR, e.ProgramFiles, e['ProgramFiles(x86)'], e.USERPROFILE, e.LOCALAPPDATA, e.APPDATA] : [home, '/usr', '/usr/bin', '/usr/local', '/usr/local/bin', '/opt', '/bin', '/tmp', '/var'];
  return list.filter(Boolean).map((x) => x.toLowerCase());
}
// whole trees that are never a game
function badPrefixes() { return (WIN ? [process.env.WINDIR] : ['/usr', '/bin', '/sbin', '/etc', '/var', '/lib']).filter(Boolean).map((x) => x.toLowerCase()); }
// starts a program of the user's own (a game added by hand). admin: run as administrator (Windows only)
function runProgram(exe, args, admin) {
  const cwd = path.dirname(exe);
  if (WIN && admin) {
    const q = (v) => "'" + String(v).replace(/'/g, "''") + "'";
    spawn('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', 'Start-Process -FilePath ' + q(exe) + (args.length ? ' -ArgumentList @(' + args.map(q).join(',') + ')' : '') + ' -WorkingDirectory ' + q(cwd) + ' -Verb RunAs'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
    return;
  }
  const c = spawn(exe, args, { cwd, detached: true, stdio: 'ignore' }); c.on('error', () => { }); c.unref();
}

// ---------------------------------------------------------------- clipboard
async function copyText(text) {
  const tools = WIN ? [['clip', []]] : [['wl-copy', []], ['xclip', ['-selection', 'clipboard']], ['xsel', ['--clipboard', '--input']]];
  for (const [cmd, args] of tools) {
    const ok = await new Promise((res) => { try { const p = spawn(cmd, args, { windowsHide: true, stdio: ['pipe', 'ignore', 'ignore'] }); p.on('error', () => res(false)); p.on('close', (c) => res(c === 0)); p.stdin.on('error', () => { }); p.stdin.end(text, 'utf8'); } catch (e) { res(false); } });
    if (ok) return true;
  }
  return false;
}

// ---------------------------------------------------------------- secrets (the Steam sign-in token)
// Windows keeps it encrypted for this user (DPAPI). Linux keeps it in the settings file, which only this user can read (mode 600).
const ps = (script, env) => new Promise((res) => execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { env: Object.assign({}, process.env, env), windowsHide: true, timeout: 10000 }, (e, o) => res(e ? null : String(o).trim())));
const PRE = 'Add-Type -AssemblyName System.Security; ';
async function protect(plain) {
  if (!plain || !WIN) return { plain };
  const r = await ps(PRE + "[Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($env:SL_P),$null,'CurrentUser'))", { SL_P: plain });
  return r ? { enc: r } : { plain };
}
async function unprotect(v) {
  if (!v) return ''; if (v.plain) return v.plain; if (!v.enc || !WIN) return '';
  return (await ps(PRE + "[Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String($env:SL_P),$null,'CurrentUser'))", { SL_P: v.enc })) || '';
}

// ---------------------------------------------------------------- updating
// Windows: a Setup program is downloaded and run. Linux: the new AppImage is downloaded from GitHub by hand for now.
const canSelfUpdate = WIN;

module.exports = { WIN, userData, steamPath, steamExe, runningAppId, steamRunning, startSteam, listProcs, killPid, killName, isGameProgram, isProgramFile, badFolders, badPrefixes, runProgram, copyText, protect, unprotect, canSelfUpdate };
