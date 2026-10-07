// SteamLite 9.0 beta - "now playing" from Windows' own media session (the same thing the volume pop-up and the media keys use).
// No login and no Spotify developer app: it simply reads what the Spotify desktop app (or any media player) publishes, and can
// press its play / pause / next / previous buttons and seek. A hidden PowerShell process does the reading (media.ps1) and only
// runs while the feature is switched on.
const OPTS_DEFAULT = { enabled: false, source: 'spotify' };

module.exports = function createMedia(ctx) {
    const { app, ipcMain, store, spawn, path, fs, getWindow } = ctx;
    let child = null, latest = null, buf = '', restartTimer = null, scriptPath = '', stopped = false, restarts = 0;

    const opts = () => Object.assign({}, OPTS_DEFAULT, store.get('mediaOpts') || {});
    let lastArtTrack = '';
    const send = (payload) => {
        try {
            const w = getWindow(); if (!w || w.isDestroyed()) return;
            let out = payload;
            if (payload) { // the picture is big: send it with the first message of a track only
                if (payload.track === lastArtTrack) { out = Object.assign({}, payload); delete out.art; }
                else lastArtTrack = payload.track;
            } else lastArtTrack = '';
            w.webContents.send('media-update', out);
        } catch (e) { }
    };

    function ensureScript() {
        scriptPath = path.join(app.getPath('userData'), 'sl_media.ps1');
        fs.writeFileSync(scriptPath, fs.readFileSync(path.join(__dirname, 'media.ps1')));
    }

    function handleLine(line) {
        line = line.trim(); if (!line || line[0] !== '{') return;
        let m; try { m = JSON.parse(line); } catch (e) { return; }
        if (m.none) { if (latest) { latest = null; send(null); } return; }
        // album art is only sent when the track changes: keep it for the lines in between
        if (m.art === undefined) m.art = latest && latest.track === m.track ? latest.art : '';
        latest = m;
        send(m);
    }

    function start() {
        if (process.platform !== 'win32' || child || !opts().enabled || stopped) return;
        try { ensureScript(); } catch (e) { return; }
        child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', scriptPath, '-Source', opts().source === 'any' ? 'any' : 'spotify'], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
        buf = '';
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { handleLine(buf.slice(0, i)); buf = buf.slice(i + 1); } });
        child.on('exit', () => {
            child = null;
            if (opts().enabled && !stopped && restarts < 5) { restarts++; clearTimeout(restartTimer); restartTimer = setTimeout(start, 5000); }
        });
        child.on('error', () => { child = null; });
    }

    function stop() {
        clearTimeout(restartTimer);
        const c = child; child = null; restarts = 0;
        if (c) { try { c.kill(); } catch (e) { } }
        if (latest) { latest = null; send(null); }
    }

    function control(action, seek) {
        if (process.platform !== 'win32' || !opts().enabled) return false;
        if (!/^(next|prev|toggle|play|pause|seek)$/.test(String(action))) return false;
        try {
            ensureScript();
            const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', scriptPath, '-Action', String(action), '-Source', opts().source === 'any' ? 'any' : 'spotify'];
            if (action === 'seek') args.push('-Seek', String(Math.max(0, Number(seek) || 0)));
            spawn('powershell.exe', args, { windowsHide: true, stdio: 'ignore' }).on('error', () => { });
            return true;
        } catch (e) { return false; }
    }

    ipcMain.handle('media-get', () => ({ opts: opts(), latest }));
    ipcMain.handle('media-set-opts', (e, p) => {
        p = p || {};
        const next = opts();
        if (typeof p.enabled === 'boolean') next.enabled = p.enabled;
        if (p.source === 'spotify' || p.source === 'any') next.source = p.source;
        const before = opts();
        store.set('mediaOpts', next);
        if (!next.enabled) stop();
        else if (!before.enabled || before.source !== next.source) { stop(); restarts = 0; start(); }
        return next;
    });
    ipcMain.handle('media-control', (e, a) => control(a && a.action, a && a.seek));

    return { start, stop, destroy() { stopped = true; stop(); }, get: () => ({ opts: opts(), latest }) };
};
