const { app, BrowserWindow, ipcMain, shell, Tray, Menu, dialog, nativeImage, globalShortcut, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { exec, execSync, spawn } = require('child_process');
const { pathToFileURL } = require('url');
const Store = require('electron-store');

const APP_VERSION = app.getVersion();
// SL_CDP=1 turns on a CDP debug port for automated UI testing (never on in normal use)
if (process.env.SL_CDP) app.commandLine.appendSwitch('remote-debugging-port', '9222');
const LAUNCH_IDLE_TIMEOUT = 5 * 60 * 1000;

// Pin userData to the folder 6.0.x builds already use, so settings survive app-identity changes
// (SL_NO_USERDATA_PIN=1 skips the pin - used for isolated test runs with --user-data-dir)
if (!process.env.SL_NO_USERDATA_PIN) {
    try {
        app.setPath('userData', path.join(app.getPath('appData'), 'SteamLite-DEV'));
    } catch (e) { }
}

// Discord RPC Safe Require & Setup
let DiscordRPC = null;
let discordRPCClient = null;
let discordReady = false;
const DISCORD_CLIENT_ID = '1517860638620127263';

try {
    DiscordRPC = require('discord-rpc');
    DiscordRPC.register(DISCORD_CLIENT_ID);
    discordRPCClient = new DiscordRPC.Client({ transport: 'ipc' });

    discordRPCClient.on('ready', () => {
        console.log('Discord RPC Connected successfully!');
        discordReady = true;
    });

    discordRPCClient.on('disconnected', () => {
        discordReady = false;
        setTimeout(() => {
            discordRPCClient.login({ clientId: DISCORD_CLIENT_ID }).catch(console.error);
        }, 5000);
    });

    discordRPCClient.login({ clientId: DISCORD_CLIENT_ID }).catch(err => {
        console.error('Failed to login to Discord RPC:', err.message);
    });
} catch (e) {
    console.log('discord-rpc module not installed. Skipping Discord RPC.');
}

const NON_GAME_APPIDS = new Set(['228980', '228985', '243750', '243730', '17510', '17515', '17520', '17530', '427520', '43110', '211', '218', '250820', '705', '480']);
const NON_GAME_NAME_REGEX = /(?:original\s+)?soundtrack|\(ost\)|redistributable|steamworks|dedicated server$|\bsdk\b|proton\s+\w+\s+runtime|steam linux runtime|steam input configurator/i;
const OWNER_STEAM_ID = '76561199473454186';
const CO_OWNER_STEAM_ID = '76561199152494033';
const STEAMLITE_STEAM_ID = '76561198652781296';
const SPECIAL_ROLE_LABELS = {
    [OWNER_STEAM_ID]: 'Owner',
    [CO_OWNER_STEAM_ID]: 'Co-Owner'
};

function normalizeKnownPlayer(player) {
    if (!player || typeof player !== 'object') return player;
    const normalized = { ...player };
    if (normalized.steamid === STEAMLITE_STEAM_ID) normalized.personaname = 'Steamlite';
    if (SPECIAL_ROLE_LABELS[normalized.steamid]) normalized.ownerRole = SPECIAL_ROLE_LABELS[normalized.steamid];
    return normalized;
}

async function resolveSteamProfiles(apiKey, steamIds) {
    const ids = Array.from(new Set((Array.isArray(steamIds) ? steamIds : []).filter(Boolean).map(String)));
    if (!apiKey || ids.length === 0) return [];
    try {
        const data = await fetchApi(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${ids.join(',')}`, {}, 8000);
        return ((data.response && data.response.players) || []).map(normalizeKnownPlayer);
    } catch (err) {
        return [];
    }
}

const store = new Store({
    defaults: {
        apiKey: '',
        steamId: '',
        familyIds: '',
        accentColor: '#8b5cf6',
        telemetry: {},
        gameConfigs: {},
        gameNotes: {},
        favorites: [],
        hiddenGames: [],
        customCovers: {},
        collections: {},
        wideGrid: false,
        soundVolume: 0.5,
        achievementCache: {},
        updateChannel: 'stable',
        nonSteamGames: [],
        bgPath: '',
        bgBlur: 0,
        bgOpacity: 1,
        bgSpeed: 1,
        themeVars: {},
        lastSeenChangelogVersion: '0.0.0',
        discordRpcEnabled: true,
        sessionHistory: [],
        metaAchievements: {},
        themeUnlocks: {},
        streak: { current: 0, best: 0, lastPlayDay: null, recovery: { activeUntil: null, previousStreak: 0 } },
        lastLibrarySize: 0,
        themeAppliedAt: 0,
        themeApplyCount: 0,
        notifDuration: 4,
        notifMaxStack: 3,
        maxCommonFriends: 3,
        widgetSizes: {},
        dashboardSectionOrder: [],
        profileBanners: {},
        friendPrefs: {},
        profileCustom: {},
        uiPrefs: {},
        startMinimized: false,
        potatoMode: false,
        closeToTray: true,
        autoUpdateCheck: true,
        skippedUpdateVersion: '',
        hotkeys: { quickLaunch: 'CommandOrControl+Alt+G', commandPalette: 'CommandOrControl+K', stopGame: 'CommandOrControl+Alt+X' },
        launchToLibrary: false,
        hideOfflineFriends: false,
        reduceAnimations: false,
        notifSounds: true,
        customThemes: [],
        profiles: { list: [], activeId: null, data: {} },
        devLicense: { active: false, steamId: '', name: '', avatar: '', activatedAt: 0 },
        streakRestores: 0,
        levelRewardsVersion: 1,
        boostLog: {},
        levelRewardsClaimed: [],
        gameMeta: {},
        challengeXp: {},
        challengesDone: {},
        friendActivity: [],
        wishlistSeen: {},
        wishlistAlerts: true,
        breakReminderMin: 0,
        dailyLimitHours: 0
    }
});

// Memory saver (default OFF, since software drawing makes animations choppy): software rendering and no separate GPU / audio processes. This is what takes the app from
// roughly 450 MB down to about 200 MB. It has to be decided before Electron is ready, so it is read straight from the store.
// Needs a restart to change (Tools & extras > Extras settings). SL_NO_MEMSAVER=1 turns it off for testing.
let lowMemoryOn = false;
try {
    const early = store.get('featSettings') || {};
    lowMemoryOn = early.lowMemory === true && !process.env.SL_NO_MEMSAVER;
    const off = ['MediaRouter', 'Translate', 'OptimizationHints'];
    if (lowMemoryOn) {
        app.commandLine.appendSwitch('disable-gpu');
        app.commandLine.appendSwitch('in-process-gpu');
        off.push('AudioServiceOutOfProcess');
    }
    app.commandLine.appendSwitch('disable-features', off.join(','));
    app.commandLine.appendSwitch('disable-background-networking');
    app.commandLine.appendSwitch('no-pings');
} catch (e) { }

// Edition: "full" (everything) or "lite" (just the basics for browsing and launching games, much lighter).
// The installer's choice is written to edition.txt next to the exe; it is applied once per installer run, after that the
// in-app switch (Settings > Advanced) decides. SL_EDITION overrides it for testing.
function readEdition() {
    let ed = store.get('edition');
    try {
        const f = path.join(path.dirname(process.execPath), 'edition.txt');
        if (fs.existsSync(f)) {
            const raw = fs.readFileSync(f, 'utf8').trim().toLowerCase();
            const stamp = raw + '@' + Math.round(fs.statSync(f).mtimeMs);
            if (store.get('editionStamp') !== stamp) {
                if (raw === 'lite' || raw === 'full') ed = raw;
                store.set('editionStamp', stamp);
                store.set('edition', ed === 'lite' ? 'lite' : 'full');
            }
        }
    } catch (e) { }
    if (process.env.SL_EDITION === 'lite' || process.env.SL_EDITION === 'full') ed = process.env.SL_EDITION;
    return ed === 'lite' ? 'lite' : 'full';
}
const EDITION = readEdition();

let mainWindow;
let activeGameTracking = null;
let tray = null;
let isQuiting = false;
let features = { hooks: {} }; // filled in by features_main.js once the app is ready

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            if (!mainWindow.isVisible()) mainWindow.show();
            mainWindow.focus();
        }
    });
}

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'steamlite',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true, // the page reads cover pixels (ambient glow colour), which needs a CORS-readable image
            stream: true
        }
    }
]);

function getSteamBasePath() {
    try {
        const stdout = execSync('reg query "HKCU\\Software\\Valve\\Steam" /v SteamPath').toString();
        const match = stdout.match(/SteamPath\s+REG_SZ\s+([^\r\n]+)/);
        if (match && match[1]) return match[1].trim().replace(/\//g, '\\');
    } catch (e) { }
    return 'C:\\Program Files (x86)\\Steam';
}

function getSteamExePath() {
    try {
        const stdout = execSync('reg query "HKCU\\Software\\Valve\\Steam" /v SteamExe').toString();
        const match = stdout.match(/SteamExe\s+REG_SZ\s+([^\r\n]+)/);
        if (match && match[1]) return match[1].trim().replace(/^"|"$/g, '');
    } catch (e) { }
    return path.join(getSteamBasePath(), 'steam.exe');
}

async function getLocalGames() {
    const primarySteamPath = path.join(getSteamBasePath(), 'steamapps');
    let steamPaths = [primarySteamPath];

    try {
        const vdfPath = path.join(primarySteamPath, 'libraryfolders.vdf');
        if (fs.existsSync(vdfPath)) {
            const vdfContent = fs.readFileSync(vdfPath, 'utf8');
            const pathMatches = [...vdfContent.matchAll(/"path"\s+"([^"]+)"/g)];
            for (const match of pathMatches) {
                let p = match[1].replace(/\\\\/g, '\\');
                steamPaths.push(path.join(p, 'steamapps'));
            }
        }
    } catch (err) { }

    steamPaths = [...new Set(steamPaths)];
    const games = [];

    for (const steamPath of steamPaths) {
        try {
            if (!fs.existsSync(steamPath)) continue;
            const files = fs.readdirSync(steamPath);
            for (const file of files) {
                if (file.startsWith('appmanifest_') && file.endsWith('.acf')) {
                    const content = fs.readFileSync(path.join(steamPath, file), 'utf8');
                    const idMatch = content.match(/"appid"\s+"(\d+)"/);
                    const nameMatch = content.match(/"name"\s+"([^"]+)"/);
                    const dirMatch = content.match(/"installdir"\s+"([^"]+)"/);
                    if (idMatch && nameMatch && dirMatch) {
                        const id = idMatch[1];
                        const name = nameMatch[1];
                        if (NON_GAME_APPIDS.has(id) || NON_GAME_NAME_REGEX.test(name)) continue;
                        const sizeMatch = content.match(/"SizeOnDisk"\s+"(\d+)"/);
                        const stateMatch = content.match(/"StateFlags"\s+"(\d+)"/);
                        games.push({ id, name, installdir: dirMatch[1], commonPath: path.join(steamPath, 'common'), installed: true, sizeOnDisk: sizeMatch ? Number(sizeMatch[1]) : 0, stateFlags: stateMatch ? Number(stateMatch[1]) : 0 });
                    }
                }
            }
        } catch (err) { }
    }
    return games;
}

async function buildTrayMenu() {
    if (!tray) return;

    const telemetry = store.get('telemetry') || {};
    const localGames = await getLocalGames();
    const localMap = {};
    localGames.forEach(g => localMap[g.id] = g);

    const sortedTelemetry = Object.entries(telemetry)
        .filter(([id, t]) => localMap[id] && t.playtime > 0)
        .sort((a, b) => b[1].playtime - a[1].playtime)
        .slice(0, 5);

    const template = [];

    if (sortedTelemetry.length > 0) {
        template.push({ label: 'Quick Launch (Top Played)', enabled: false });
        sortedTelemetry.forEach(([id, t]) => {
            template.push({
                label: `${localMap[id].name} (${Math.floor(t.playtime / 3600)}h)`,
                click: () => {
                    if (!activeGameTracking) {
                        executeLaunch({ gameId: id, installdir: localMap[id].installdir, commonPath: localMap[id].commonPath, name: localMap[id].name });
                        if (mainWindow) mainWindow.show();
                    }
                }
            });
        });
        template.push({ type: 'separator' });
    }

    try { template.push(...(features.hooks.trayItems ? features.hooks.trayItems() : [])); } catch (e) { }
    template.push({
        label: 'Show App', click: () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });
    template.push({ label: 'Quit', click: () => { isQuiting = true; app.quit(); } });

    tray.setContextMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
    const preloadPath = path.join(app.getPath('userData'), 'sl_preload.js');
    const preloadContent = `
        const { contextBridge, ipcRenderer, webUtils } = require('electron');
        contextBridge.exposeInMainWorld('electronAPI', {
            getPathForFile: (file) => { try { return webUtils.getPathForFile(file); } catch (e) { return ''; } },
            appQuit: () => ipcRenderer.send('app-quit'),
            edition: '${EDITION}',
            getEdition: () => ipcRenderer.invoke('get-edition'),
            setEdition: (ed) => ipcRenderer.invoke('set-edition', ed),
            setMemorySaver: (on) => ipcRenderer.invoke('set-memory-saver', on),
            relaunch: () => ipcRenderer.invoke('relaunch-app'),
            getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
            setHotkeys: (keys) => ipcRenderer.invoke('set-hotkeys', keys),
            restoreNonSteamGame: (snapshot) => ipcRenderer.invoke('restore-nonsteam-game', snapshot),
            resolveDroppedFile: (p) => ipcRenderer.invoke('resolve-dropped-file', p),
            scanStartMenu: () => ipcRenderer.invoke('scan-start-menu'),
            windowMinimize: () => ipcRenderer.send('window-minimize'),
            windowClose: () => ipcRenderer.send('window-close'),
            openExternal: (url) => ipcRenderer.invoke('open-external', url),
            getConfig: () => ipcRenderer.invoke('get-config'),
            saveConfig: (config) => ipcRenderer.invoke('save-config', config),
            scanLocalGames: () => ipcRenderer.invoke('scan-local-games'),
            syncApi: (data) => ipcRenderer.invoke('sync-api', data),
            getProfile: (data) => ipcRenderer.invoke('get-profile', data),
            getFriendProfile: (data) => ipcRenderer.invoke('get-friend-profile', data),
            getFriends: (data) => ipcRenderer.invoke('get-friends', data),
            getAchievements: (data) => ipcRenderer.invoke('get-achievements', data),
            getAchievementProgress: (data) => ipcRenderer.invoke('get-achievement-progress', data),
            cacheAchievement: (data) => ipcRenderer.invoke('cache-achievement', data),
            getNews: (appId) => ipcRenderer.invoke('get-news', appId),
            getEvents: () => ipcRenderer.invoke('get-events'),
            previewTheme: (file) => ipcRenderer.invoke('preview-theme', file),
            getNewsFeed: (appIds) => ipcRenderer.invoke('get-news-feed', appIds),
            setUiScale: (factor) => ipcRenderer.invoke('set-ui-scale', factor),
            getExternalNews: () => ipcRenderer.invoke('get-external-news'),
            markChangelogSeen: (version) => ipcRenderer.invoke('mark-changelog-seen', version),
            resolveProfiles: (data) => ipcRenderer.invoke('resolve-profiles', data),
            browseLocalFiles: (data) => ipcRenderer.invoke('browse-local-files', data),
            getScreenshots: (data) => ipcRenderer.invoke('get-screenshots', data),
            launchGame: (data) => ipcRenderer.invoke('launch-game', data),
            stopGame: (data) => ipcRenderer.invoke('stop-game', data),
            installGame: (gameId) => ipcRenderer.invoke('install-game', gameId),
            uninstallGame: (gameId) => ipcRenderer.invoke('uninstall-game', gameId),
            verifyGame: (gameId) => ipcRenderer.invoke('verify-game', gameId),
            getTelemetry: () => ipcRenderer.invoke('get-telemetry'),
            checkUpdates: () => ipcRenderer.invoke('check-updates'),
            updatesReady: () => ipcRenderer.invoke('updates-renderer-ready'),
            getGameConfig: (appId) => ipcRenderer.invoke('get-game-config', appId),
            saveGameConfig: (data) => ipcRenderer.invoke('save-game-config', data),
            getGameNotes: (appId) => ipcRenderer.invoke('get-game-notes', appId),
            saveGameNotes: (data) => ipcRenderer.invoke('save-game-notes', data),
            selectGameExe: () => ipcRenderer.invoke('select-game-exe'),
            getLibraryData: () => ipcRenderer.invoke('get-library-data'),
            toggleFavorite: (appId) => ipcRenderer.invoke('toggle-favorite', appId),
            toggleHidden: (appId) => ipcRenderer.invoke('toggle-hidden', appId),
            setCustomCover: (appId) => ipcRenderer.invoke('set-custom-cover', appId),
            getCustomCovers: () => ipcRenderer.invoke('get-custom-covers'),
            resetCover: (appId) => ipcRenderer.invoke('reset-cover', appId),
            saveCollections: (data) => ipcRenderer.invoke('save-collections', data),
            updateDiscordRpc: (data) => ipcRenderer.invoke('update-discord-rpc', data),
            onGameStatusChange: (cb) => ipcRenderer.on('game-status', (e, d) => cb(d)),
            onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (e, d) => cb(d)),
            onQuickLaunch: (cb) => ipcRenderer.on('show-quick-launch', () => cb()),
            onCommandPalette: (cb) => ipcRenderer.on('show-command-palette', () => cb()),
            selectBgFile: () => ipcRenderer.invoke('select-bg-file'),
            selectImageFile: () => ipcRenderer.invoke('select-image-file'),
            addNonSteamGame: (data) => ipcRenderer.invoke('add-nonsteam-game', data),
            removeNonSteamGame: (appId) => ipcRenderer.invoke('remove-nonsteam-game', appId),
            importTheme: () => ipcRenderer.invoke('import-theme'),
            resetTheme: () => ipcRenderer.invoke('reset-theme'),
            getThemeShop: () => ipcRenderer.invoke('get-theme-shop'),
            downloadTheme: (fileName) => ipcRenderer.invoke('download-theme', fileName),
            getMetaAchievements: (opts) => ipcRenderer.invoke('get-meta-achievements', opts),
            checkAchievements: (opts) => ipcRenderer.invoke('check-achievements', opts),
            onMetaAchievementUnlocked: (cb) => ipcRenderer.on('meta-achievement-unlocked', (e, d) => cb(d)),
            onStreakUpdated: (cb) => ipcRenderer.on('streak-updated', (e, d) => cb(d)),
            getProfiles: () => ipcRenderer.invoke('get-profiles'),
            addProfile: (data) => ipcRenderer.invoke('add-profile', data),
            switchProfile: (steamId) => ipcRenderer.invoke('switch-profile', steamId),
            removeProfile: (steamId) => ipcRenderer.invoke('remove-profile', steamId),
            logoutProfile: () => ipcRenderer.invoke('logout-profile'),
            activateDevLicense: (data) => ipcRenderer.invoke('activate-dev-license', data),
            getSessionHistory: () => ipcRenderer.invoke('get-session-history'),
            installUpdate: () => ipcRenderer.invoke('install-update'),
            openUpdater: () => ipcRenderer.invoke('open-updater'),
            feat: (name, payload) => ipcRenderer.invoke('feat:' + String(name), payload),
            onFeat: (name, cb) => ipcRenderer.on('feat:' + String(name), (e, d) => cb(d)),
            updateOnQuit: () => ipcRenderer.invoke('update-on-quit'),
            useStreakRestore: () => ipcRenderer.invoke('use-streak-restore'),
            getChallenges: () => ipcRenderer.invoke('get-challenges'),
            getWishlist: (force) => ipcRenderer.invoke('get-wishlist', force),
            getGameMeta: () => ipcRenderer.invoke('get-game-meta'),
            setGameMeta: (d) => ipcRenderer.invoke('set-game-meta', d),
            addFriendActivity: (items) => ipcRenderer.invoke('add-friend-activity', items),
            getFriendActivity: () => ipcRenderer.invoke('get-friend-activity'),
            clearFriendActivity: () => ipcRenderer.invoke('clear-friend-activity'),
            getYearReview: (year) => ipcRenderer.invoke('get-year-review', year),
            saveImageFile: (d) => ipcRenderer.invoke('save-image-file', d),
            onChallengeComplete: (cb) => ipcRenderer.on('challenge-complete', (e, d) => cb(d)),
            onLevelReward: (cb) => ipcRenderer.on('level-reward', (e, d) => cb(d)),
            onWishlistSale: (cb) => ipcRenderer.on('wishlist-sale', (e, d) => cb(d)),
            onPlayReminder: (cb) => ipcRenderer.on('play-reminder', (e, d) => cb(d)),
            restartForUpdate: () => ipcRenderer.invoke('restart-for-update'),
            exportSettings: () => ipcRenderer.invoke('export-settings'),
            importSettings: () => ipcRenderer.invoke('import-settings'),
            onUpdateDownloadProgress: (cb) => ipcRenderer.on('update-download-progress', (e, d) => cb(d)),
            onUpdateReady: (cb) => ipcRenderer.on('update-ready', (e, d) => cb(d))
        });
    `;
    fs.writeFileSync(preloadPath, preloadContent);

    const iconPath = fs.existsSync(path.join(__dirname, 'icon.ico')) ? path.join(__dirname, 'icon.ico') : undefined;

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 960,
        minHeight: 640,
        frame: false,
        backgroundColor: '#05050a',
        icon: iconPath,
        show: false,
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // "Start minimised to tray": stay hidden on launch (only if there's a tray icon to bring it back from)
    mainWindow.once('ready-to-show', () => {
        if (mainWindow && !(store.get('startMinimized') && tray)) mainWindow.show();
    });

    mainWindow.loadFile('index.dev.html');

    if (iconPath) {
        tray = new Tray(iconPath);
        tray.setToolTip(`SteamLite ${APP_VERSION}`);
        buildTrayMenu();
        tray.on('click', () => {
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                if (mainWindow.isVisible()) {
                    mainWindow.hide();
                } else {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        });
    }

    mainWindow.on('close', (event) => {
        // closing the window hides it to the tray, unless the user chose "Quit when I close the window"
        if (!isQuiting && tray && store.get('closeToTray') !== false) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ===== Global hotkeys (rebindable in Advanced Settings) =====
const DEFAULT_HOTKEYS = { quickLaunch: 'CommandOrControl+Alt+G', commandPalette: 'CommandOrControl+K', stopGame: 'CommandOrControl+Alt+X' };
function getHotkeys() { return { ...DEFAULT_HOTKEYS, ...(store.get('hotkeys') || {}) }; }
const HOTKEY_ACTIONS = {
    quickLaunch: () => { if (mainWindow) mainWindow.webContents.send('show-quick-launch'); },
    commandPalette: () => { if (mainWindow) mainWindow.webContents.send('show-command-palette'); },
    stopGame: () => { stopActiveGame(); }
};
// Registers every hotkey and reports the ones the system refused (for example because another app owns them)
function registerHotkeys() {
    globalShortcut.unregisterAll();
    const keys = getHotkeys(), failed = [];
    for (const action of Object.keys(HOTKEY_ACTIONS)) {
        let ok = false;
        try { ok = globalShortcut.register(keys[action], HOTKEY_ACTIONS[action]); } catch (e) { ok = false; }
        if (!ok) failed.push(action);
    }
    return failed;
}
// an accelerator like "CommandOrControl+Alt+G": at least one modifier plus exactly one key
function isValidAccelerator(acc) {
    if (typeof acc !== 'string' || acc.length > 60) return false;
    const parts = acc.split('+');
    const mods = ['CommandOrControl', 'Alt', 'Shift'];
    const key = parts[parts.length - 1];
    if (parts.length < 2 || !parts.slice(0, -1).every(p => mods.includes(p))) return false;
    return /^([A-Z0-9]|F([1-9]|1[0-9]|2[0-4])|Space|Tab|Enter|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Up|Down|Left|Right|Plus|Minus|Comma|Period|Slash|Backslash|Semicolon|Quote)$/.test(key) && !mods.includes(key);
}
ipcMain.handle('set-hotkeys', (event, wanted) => {
    const next = {};
    for (const action of Object.keys(DEFAULT_HOTKEYS)) {
        const acc = wanted && wanted[action];
        if (!isValidAccelerator(acc)) return { ok: false, error: 'Invalid shortcut for ' + action, failed: [action], hotkeys: getHotkeys() };
        next[action] = acc;
    }
    if (new Set(Object.values(next)).size !== Object.keys(next).length) return { ok: false, error: 'Each action needs a different shortcut.', failed: [], hotkeys: getHotkeys() };
    const previous = getHotkeys();
    store.set('hotkeys', next);
    const failed = registerHotkeys();
    if (failed.length) { // roll back: a shortcut another app already owns can't be used
        store.set('hotkeys', previous); registerHotkeys();
        return { ok: false, error: 'That shortcut is already used by another program.', failed, hotkeys: previous };
    }
    return { ok: true, failed: [], hotkeys: next };
});

// ===== Game cover images =====
// Steam stores newer games' art under a hashed path that only the store API reveals. Requests to that API are
// queued one at a time with a short gap (Steam rate-limits it), pause for a few minutes if Steam says "slow
// down", and apps that have no store page at all are remembered for a few days so they aren't asked again on
// every launch.
let imageMissingFile = null;
let imageMissing = {};
const IMAGE_MISSING_TTL = 3 * 24 * 60 * 60 * 1000;
let storeApiQueue = Promise.resolve();
let storeApiBackoffUntil = 0;

function saveImageMissing() { try { if (imageMissingFile) fs.writeFileSync(imageMissingFile, JSON.stringify(imageMissing)); } catch (e) { } }

async function fetchImageBuffer(url) {
    try {
        const res = await net.fetch(url);
        if (!res.ok) return null;
        if (!/^image\//i.test(res.headers.get('content-type') || '')) return null;
        return Buffer.from(await res.arrayBuffer());
    } catch (e) { return null; }
}

function storeApiHeaderImage(appId) {
    const missedAt = imageMissing[appId];
    if (missedAt && Date.now() - missedAt < IMAGE_MISSING_TTL) return Promise.resolve(null);
    const job = storeApiQueue.then(async () => {
        if (Date.now() < storeApiBackoffUntil) return null;
        await new Promise(r => setTimeout(r, 300));
        try {
            const res = await net.fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic&cc=us&l=en`);
            if (res.status === 429 || res.status === 403) { storeApiBackoffUntil = Date.now() + 5 * 60 * 1000; return null; }
            if (!res.ok) return null;
            const entry = (await res.json())[appId];
            const img = entry && entry.success && entry.data && entry.data.header_image;
            if (!img || !/^https:\/\//i.test(img)) {
                if (entry && entry.success === false) { imageMissing[appId] = Date.now(); saveImageMissing(); } // no store page
                return null;
            }
            return await fetchImageBuffer(img);
        } catch (e) { return null; }
    });
    storeApiQueue = job.catch(() => { });
    return job;
}

app.whenReady().then(() => {
    const cacheDir = path.join(app.getPath('userData'), 'image_cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    imageMissingFile = path.join(cacheDir, 'missing.json');
    try { imageMissing = JSON.parse(fs.readFileSync(imageMissingFile, 'utf8')) || {}; } catch (e) { imageMissing = {}; }

    protocol.handle('steamlite', async (request) => {
        const url = decodeURIComponent(request.url);

        // steamlite://shot/<accountId>/<appId>/<file> - stream a local screenshot straight from disk
        const shotMatch = url.match(/^steamlite:\/\/shot\/(\d+)\/([\w.\-]+)\/([^/]+)$/);
        if (shotMatch) {
            const userDataRoot = path.resolve(path.join(getSteamBasePath(), 'userdata'));
            const filePath = path.resolve(path.join(userDataRoot, shotMatch[1], '760', 'remote', shotMatch[2], 'screenshots', shotMatch[3]));
            if (!filePath.startsWith(userDataRoot)) {
                return new Response('', { status: 403 });
            }
            if (fs.existsSync(filePath)) {
                const mime = filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
                return new Response(fs.readFileSync(filePath), { headers: { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*' } });
            }
            return new Response('', { status: 404 });
        }

        const appId = url.replace('steamlite://cache/', '');
        if (!/^[A-Za-z0-9_-]+$/.test(appId)) return new Response('', { status: 404 }); // ids only - never a path
        const filePath = path.join(cacheDir, `${appId}.jpg`);

        if (fs.existsSync(filePath)) {
            try { return new Response(fs.readFileSync(filePath), { headers: { 'Content-Type': 'image/jpeg', 'Access-Control-Allow-Origin': '*' } }); }
            catch (e) { return net.fetch(pathToFileURL(filePath).href); }
        }
        // Image sources, in order: the classic Steam CDN path (fast, covers most older games), then the Steam
        // store API, which knows the real image location of newer games (they use a hashed path the classic one
        // doesn't have, so they used to show up with no cover at all).
        let buf = await fetchImageBuffer(`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`);
        if (!buf && /^\d+$/.test(appId)) buf = await storeApiHeaderImage(appId);
        if (buf) {
            try { fs.writeFileSync(filePath, buf); } catch (e) { }
            return new Response(buf, { headers: { 'Content-Type': 'image/jpeg', 'Access-Control-Allow-Origin': '*' } });
        }
        return new Response('', { status: 404 });
    });

    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    registerHotkeys();

    scheduleUpdateChecks();
    scheduleWishlistChecks();
    if (EDITION === 'full') try {
        features = require('./features_main')({
            app, ipcMain, BrowserWindow, dialog, nativeImage, store, fs, path, os: require('os'), spawn, exec, fetchApi,
            getMainWindow: () => mainWindow, getTray: () => tray, APP_VERSION, BACKUP_KEYS,
            streakDayKey, getLocalGames, getSteamBasePath, getProfiles, swapPerUserData, getChallenges, applyBoost, addRestores,
            levelInfo, totalXp, rawXp, grantTheme, ACHIEVEMENT_DEFS,
            lowMemoryActive: () => lowMemoryOn, quitApp: () => { isQuiting = true; app.quit(); }
        });
        setTimeout(() => { try { features.hooks.applyIcons && features.hooks.applyIcons(); } catch (e) { } }, 800);
    } catch (e) { console.error('Could not start the extra features:', e && e.message); }

    // achievements re-check every 5 minutes (covers playtime thresholds crossed mid-session)
    setInterval(() => { checkAchievements(); }, 5 * 60 * 1000);
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (updateOnQuit) launchUpdaterAfterQuit();
});

app.on('before-quit', () => {
    isQuiting = true;
    if (activeGameTracking) finalizeSession(activeGameTracking);
    if (tray) {
        tray.destroy();
        tray = null;
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-edition', () => ({ edition: EDITION, lowMemory: lowMemoryOn }));
ipcMain.handle('set-edition', (e, ed) => {
    if (ed !== 'lite' && ed !== 'full') return false;
    store.set('edition', ed);
    isQuiting = true;
    try { app.relaunch(); } catch (err) { }
    app.quit();
    return true;
});
ipcMain.handle('set-memory-saver', (e, on) => {
    const cur = store.get('featSettings') || {};
    store.set('featSettings', Object.assign({}, cur, { lowMemory: !!on }));
    return true;
});
ipcMain.handle('relaunch-app', () => { isQuiting = true; try { app.relaunch(); } catch (err) { } app.quit(); return true; });

ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-close', () => { if (mainWindow) mainWindow.close(); });
// a real quit (the command palette's "Quit SteamLite"), regardless of the close-to-tray setting
ipcMain.on('app-quit', () => { isQuiting = true; app.quit(); });

ipcMain.handle('open-external', (event, url) => {
    // only web links and Steam links - never a local file or another program's protocol
    if (typeof url !== 'string' || !/^(https?|steam):\/\//i.test(url)) return false;
    shell.openExternal(url);
    return true;
});

ipcMain.handle('get-config', () => {
    return {
        apiKey: store.get('apiKey'),
        steamId: store.get('steamId'),
        familyIds: store.get('familyIds'),
        accentColor: store.get('accentColor'),
        wideGrid: store.get('wideGrid'),
        soundVolume: store.get('soundVolume'),
        updateChannel: store.get('updateChannel') || 'stable',
        bgPath: store.get('bgPath'),
        bgBlur: store.get('bgBlur'),
        bgOpacity: store.get('bgOpacity'),
        bgSpeed: store.get('bgSpeed'),
        themeVars: store.get('themeVars') || {},
        discordRpcEnabled: store.get('discordRpcEnabled'),
        launchToLibrary: store.get('launchToLibrary') || false,
        hideOfflineFriends: store.get('hideOfflineFriends') || false,
        reduceAnimations: store.get('reduceAnimations') || false,
        notifSounds: store.get('notifSounds') !== undefined ? store.get('notifSounds') : true,
        notifDuration: store.get('notifDuration') || 4,
        notifMaxStack: store.get('notifMaxStack') || 3,
        maxCommonFriends: store.get('maxCommonFriends') || 3,
        widgetSizes: store.get('widgetSizes') || {},
        dashboardSectionOrder: store.get('dashboardSectionOrder') || [],
        profileBanners: store.get('profileBanners') || {},
        friendPrefs: store.get('friendPrefs') || {},
        profileCustom: store.get('profileCustom') || {},
        uiPrefs: store.get('uiPrefs') || {},
        startMinimized: !!store.get('startMinimized'),
        potatoMode: !!store.get('potatoMode'),
        closeToTray: store.get('closeToTray') !== false,
        autoUpdateCheck: store.get('autoUpdateCheck') !== false,
        skippedUpdateVersion: store.get('skippedUpdateVersion') || '',
        hotkeys: getHotkeys(),
        startWithWindows: (() => { try { return !!app.getLoginItemSettings().openAtLogin; } catch (e) { return false; } })(),
        appVersion: APP_VERSION,
        devLicense: store.get('devLicense') || { active: false, steamId: '', name: '', avatar: '', activatedAt: 0 },
        streakRestores: store.get('streakRestores') || 0,
        gameMeta: store.get('gameMeta') || {},
        wishlistAlerts: store.get('wishlistAlerts') !== false,
        breakReminderMin: Number(store.get('breakReminderMin')) || 0,
        dailyLimitHours: Number(store.get('dailyLimitHours')) || 0
    };
});

ipcMain.handle('save-config', (event, config) => {
    // merge partial patches - only overwrite keys the caller actually sent,
    // so a partial save (e.g. Advanced Settings) never wipes credentials
    const keys = ['apiKey', 'steamId', 'familyIds', 'accentColor', 'wideGrid', 'soundVolume', 'updateChannel',
        'bgPath', 'bgBlur', 'bgOpacity', 'bgSpeed', 'discordRpcEnabled', 'appVersion',
        'launchToLibrary', 'hideOfflineFriends', 'reduceAnimations', 'notifSounds', 'notifDuration', 'notifMaxStack',
        'maxCommonFriends', 'widgetSizes', 'dashboardSectionOrder', 'profileBanners', 'friendPrefs', 'profileCustom', 'uiPrefs',
        'startMinimized', 'potatoMode', 'closeToTray', 'autoUpdateCheck', 'skippedUpdateVersion', 'themeVars', 'customCovers', 'customThemes',
        'wishlistAlerts', 'breakReminderMin', 'dailyLimitHours'];
    for (const k of keys) {
        if (config[k] !== undefined) store.set(k, config[k]);
    }
    // "Start with Windows" is a system setting, not a stored value - apply it to the OS login items
    if (config.startWithWindows !== undefined) {
        try { app.setLoginItemSettings({ openAtLogin: !!config.startWithWindows, path: process.execPath }); } catch (e) { }
    }
    return true;
});

// SETTINGS BACKUP / RESTORE - preferences and local data only. Credentials (API key, SteamID,
// saved logins, dev license) are deliberately never exported, so a backup file is safe to share.
const BACKUP_KEYS = ['accentColor', 'wideGrid', 'soundVolume', 'updateChannel', 'bgPath', 'bgBlur', 'bgOpacity', 'bgSpeed',
    'themeVars', 'discordRpcEnabled', 'launchToLibrary', 'hideOfflineFriends', 'reduceAnimations', 'notifSounds', 'notifDuration',
    'notifMaxStack', 'maxCommonFriends', 'widgetSizes', 'dashboardSectionOrder', 'profileBanners', 'friendPrefs', 'profileCustom',
    'uiPrefs', 'startMinimized', 'potatoMode', 'closeToTray', 'autoUpdateCheck', 'hotkeys', 'themeUnlocks', 'achievementXp', 'boostLog', 'streakRestores', 'prestige', 'cosmetics', 'seasonClaimed', 'journal', 'saveBackups', 'wishlistTargets', 'wishlistHistory', 'featSettings', 'autoBackup', 'challengeXp', 'challengesDone', 'levelRewardsClaimed', 'gameMeta', 'wishlistAlerts', 'breakReminderMin', 'dailyLimitHours', 'customThemes', 'customCovers', 'favorites', 'hiddenGames', 'collections', 'gameConfigs',
    'gameNotes', 'nonSteamGames', 'telemetry', 'sessionHistory', 'achievementCache', 'metaAchievements', 'streak'];

ipcMain.handle('export-settings', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export SteamLite settings',
        defaultPath: `SteamLite-backup-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: 'SteamLite backup', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) return { ok: false, canceled: true };
    try {
        const data = {};
        for (const k of BACKUP_KEYS) data[k] = store.get(k);
        fs.writeFileSync(result.filePath, JSON.stringify({ app: 'SteamLite', version: APP_VERSION, exportedAt: Date.now(), data }, null, 2));
        return { ok: true, path: result.filePath };
    } catch (err) { return { ok: false, error: err.message }; }
});

ipcMain.handle('import-settings', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import SteamLite settings',
        properties: ['openFile'],
        filters: [{ name: 'SteamLite backup', extensions: ['json'] }]
    });
    if (result.canceled || result.filePaths.length === 0) return { ok: false, canceled: true };
    try {
        const parsed = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
        if (!parsed || parsed.app !== 'SteamLite' || typeof parsed.data !== 'object' || parsed.data === null) return { ok: false, error: 'This file is not a SteamLite backup.' };
        let restored = 0;
        for (const k of BACKUP_KEYS) {
            if (parsed.data[k] !== undefined && parsed.data[k] !== null) { store.set(k, parsed.data[k]); restored++; }
        }
        return { ok: true, restored };
    } catch (err) { return { ok: false, error: 'Could not read that file.' }; }
});

ipcMain.handle('get-library-data', () => {
    return {
        favorites: store.get('favorites') || [],
        hiddenGames: store.get('hiddenGames') || [],
        customCovers: store.get('customCovers') || {},
        achievementCache: store.get('achievementCache') || {},
        collections: store.get('collections') || {},
        nonSteamGames: store.get('nonSteamGames') || []
    };
});

ipcMain.handle('toggle-favorite', (event, appId) => {
    let favorites = store.get('favorites') || [];
    if (favorites.includes(appId)) {
        favorites = favorites.filter(id => id !== appId);
    } else {
        favorites.push(appId);
    }
    store.set('favorites', favorites);
    return favorites;
});

ipcMain.handle('toggle-hidden', (event, appId) => {
    let hidden = store.get('hiddenGames') || [];
    if (hidden.includes(appId)) {
        hidden = hidden.filter(id => id !== appId);
    } else {
        hidden.push(appId);
    }
    store.set('hiddenGames', hidden);
    return hidden;
});

ipcMain.handle('save-collections', (event, data) => {
    store.set('collections', data);
    return true;
});

ipcMain.handle('set-custom-cover', async (event, appId) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }]
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const covers = store.get('customCovers') || {};
        covers[appId] = result.filePaths[0];
        store.set('customCovers', covers);
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('get-custom-covers', () => store.get('customCovers') || {});

ipcMain.handle('reset-cover', (event, appId) => {
    const covers = store.get('customCovers') || {};
    delete covers[appId];
    store.set('customCovers', covers);
    return true;
});

ipcMain.handle('get-game-notes', (event, appId) => {
    const notes = store.get('gameNotes') || {};
    return notes[appId] || '';
});

ipcMain.handle('save-game-notes', (event, { appId, notes }) => {
    const allNotes = store.get('gameNotes') || {};
    allNotes[appId] = notes;
    store.set('gameNotes', allNotes);
    return true;
});

ipcMain.handle('update-discord-rpc', (event, data) => {
    if (!store.get('discordRpcEnabled')) return true;
    if (discordRPCClient && discordReady) {
        discordRPCClient.setActivity({
            details: data.details,
            state: data.state,
            startTimestamp: data.startTimestamp || undefined,
            largeImageKey: DISCORD_CLIENT_ID,
            largeImageText: `SteamLite ${APP_VERSION}`,
            instance: false
        }).catch(err => console.error('Failed to set Discord activity:', err.message));
    }
    return true;
});

function fetchApi(url, headers = {}, timeout = 12000) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('http://') ? http : https;
        const req = mod.get(url, { headers, timeout }, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`HTTP Status ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on('timeout', () => req.destroy(new Error('Request timed out')));
        req.on('error', reject);
    });
}

// Free and total space of every drive that holds a Steam library, for the dashboard's Disk Usage widget
ipcMain.handle('get-storage-info', async () => {
    const libs = [path.join(getSteamBasePath(), 'steamapps')];
    try {
        const vdf = path.join(libs[0], 'libraryfolders.vdf');
        if (fs.existsSync(vdf)) for (const m of fs.readFileSync(vdf, 'utf8').matchAll(/"path"\s+"([^"]+)"/g)) libs.push(path.join(m[1].replace(/\\\\/g, '\\'), 'steamapps'));
    } catch (e) { }
    const out = [], seen = new Set();
    for (const lib of [...new Set(libs)]) {
        try {
            if (!fs.existsSync(lib)) continue;
            const st = fs.statfsSync(lib);
            const total = Number(st.blocks) * Number(st.bsize), free = Number(st.bavail) * Number(st.bsize);
            const rootKey = path.parse(lib).root.toLowerCase(); // "c:\" and "C:\" are the same drive
            if (seen.has(rootKey)) continue; seen.add(rootKey);
            out.push({ path: lib, drive: path.parse(lib).root, totalBytes: total, freeBytes: free });
        } catch (e) { }
    }
    return out;
});

ipcMain.handle('scan-local-games', async () => {
    return await getLocalGames();
});

ipcMain.handle('sync-api', async (event, { apiKey, steamId, familyIds }) => {
    const ownedUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true`;
    try {
        const ownedData = await fetchApi(ownedUrl);
        const ownedGames = (ownedData.response.games || []).filter(g => !NON_GAME_APPIDS.has(String(g.appid)) && !NON_GAME_NAME_REGEX.test(g.name || ''));
        const famArray = (familyIds || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        const famResults = await Promise.all(famArray.map(famId => {
            const famUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${famId}&format=json&include_appinfo=true`;
            return fetchApi(famUrl)
                .then(famData => (famData.response.games || []).filter(g => !NON_GAME_APPIDS.has(String(g.appid)) && !NON_GAME_NAME_REGEX.test(g.name || '')).map(g => ({ ...g, isShared: true, ownerId: famId })))
                .catch(() => []);
        }));
        return { ownedGames, sharedGames: famResults.flat() };
    } catch (err) { return { ownedGames: [], sharedGames: [] }; }
});

ipcMain.handle('get-profile', async (event, { apiKey, steamId }) => {
    const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
    const bansUrl = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamId}`;
    const levelUrl = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamId}`;
    try {
        const summaryData = await fetchApi(summaryUrl);
        const bansData = await fetchApi(bansUrl);
        const levelData = await fetchApi(levelUrl);
        return {
            summary: normalizeKnownPlayer(summaryData.response.players[0] || null),
            bans: bansData.players[0] || null,
            level: levelData.response.player_level || 0
        };
    } catch (err) { return { summary: null, bans: null, level: 0 }; }
});

ipcMain.handle('get-friend-profile', async (event, { apiKey, steamId }) => {
    const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
    const bansUrl = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamId}`;
    const levelUrl = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamId}`;
    const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true`;
    try {
        const summaryData = await fetchApi(summaryUrl);
        const bansData = await fetchApi(bansUrl);
        const levelData = await fetchApi(levelUrl);
        const gamesData = await fetchApi(gamesUrl);
        return {
            summary: normalizeKnownPlayer(summaryData.response.players[0] || null),
            bans: bansData.players[0] || null,
            level: levelData.response.player_level || 0,
            games: gamesData.response.games || []
        };
    } catch (err) { return { summary: null, bans: null, level: 0, games: [] }; }
});

ipcMain.handle('get-friends', async (event, { apiKey, steamId }) => {
    const url = `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${apiKey}&steamid=${steamId}`;
    try {
        const data = await fetchApi(url);
        const friends = data.friendslist.friends;
        const friendIds = friends.map(f => f.steamid).join(',');
        if (!friendIds) return [];
        const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${friendIds}`;
        const profileData = await fetchApi(profileUrl);
        return (profileData.response.players || []).map(normalizeKnownPlayer);
    } catch (err) { return []; }
});

ipcMain.handle('get-achievements', async (event, { apiKey, steamId, appId }) => {
    const playerUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appId}`;
    const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${appId}`;
    try {
        const playerData = await fetchApi(playerUrl);
        const schemaData = await fetchApi(schemaUrl);
        const achievements = playerData.playerstats.achievements || [];
        const schema = schemaData.game.availableGameStats.achievements || [];
        const schemaMap = {};
        schema.forEach(s => schemaMap[s.name] = s);
        return achievements.map(a => {
            const info = schemaMap[a.apiname];
            return { name: info ? info.displayName : a.apiname, description: info ? info.description : '', icon: info ? info.icon : '', achieved: a.achieved };
        });
    } catch (err) { return []; }
});

ipcMain.handle('get-achievement-progress', async (event, { apiKey, steamId, appId }) => {
    const cache = store.get('achievementCache') || {};
    const cached = cache[appId];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (cached && cached.timestamp && (now - cached.timestamp < oneDay)) {
        return { total: cached.total, achieved: cached.achieved };
    }

    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${apiKey}&steamid=${steamId}&appid=${appId}`;
    try {
        const data = await fetchApi(url);
        if (data.playerstats && data.playerstats.achievements) {
            const ach = data.playerstats.achievements;
            const total = ach.length;
            const achieved = ach.filter(a => a.achieved === 1).length;

            cache[appId] = { total, achieved, timestamp: now };
            store.set('achievementCache', cache);

            return { total, achieved };
        }
        return null;
    } catch (err) { return null; }
});

ipcMain.handle('cache-achievement', (event, { appId, total, achieved }) => {
    if (!appId || typeof total !== 'number' || typeof achieved !== 'number') return false;
    const cache = store.get('achievementCache') || {};
    cache[appId] = { total, achieved, timestamp: Date.now() };
    store.set('achievementCache', cache);
    return true;
});

ipcMain.handle('get-news', async (event, appId) => {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=6&maxlength=5000&feeds=steam_community_announcements`;
    try {
        const data = await fetchApi(url);
        return data.appnews.newsitems || [];
    } catch (err) { return []; }
});

// DASHBOARD NEWS FEED - latest announcements across several games, cached so reopening the dashboard
// doesn't re-hit the Steam API every time
const newsFeedCache = new Map(); // appId -> { t, items }
const NEWS_FEED_TTL = 20 * 60 * 1000;
function cleanNewsSnippet(text) {
    return String(text || '')
        .replace(/\{STEAM_CLAN_IMAGE\}\S*/g, ' ')
        .replace(/\[\/?[a-z0-9*]+(?:=[^\]]*)?\]/gi, ' ')   // BBCode tags
        .replace(/<[^>]+>/g, ' ')
        .replace(/https?:\/\/\S+/g, ' ')
        .replace(/\\+/g, ' ')
        .replace(/&nbsp;|&amp;|&quot;|&#39;/g, m => ({ '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'" }[m]))
        .replace(/\s+/g, ' ').trim().slice(0, 200);
}
async function fetchNewsFor(appId) {
    const hit = newsFeedCache.get(appId);
    if (hit && Date.now() - hit.t < NEWS_FEED_TTL) return hit.items;
    try {
        const data = await fetchApi(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=3&maxlength=600&feeds=steam_community_announcements`, {}, 8000);
        const items = ((data.appnews && data.appnews.newsitems) || []).map(n => ({
            appId, gid: String(n.gid || ''), title: String(n.title || '').slice(0, 160),
            url: /^https:\/\//i.test(n.url || '') ? n.url : '', date: n.date || 0, snippet: cleanNewsSnippet(n.contents)
        }));
        newsFeedCache.set(appId, { t: Date.now(), items });
        return items;
    } catch (e) { return hit ? hit.items : []; }
}
ipcMain.handle('get-news-feed', async (event, appIds) => {
    const ids = [...new Set((Array.isArray(appIds) ? appIds : []).map(String).filter(id => /^\d+$/.test(id)))].slice(0, 12);
    const results = await Promise.all(ids.map(fetchNewsFor));
    return results.flat().sort((a, b) => b.date - a.date).slice(0, 40);
});

// UI scale (Appearance settings) - zooms the whole window so layout reflows properly
ipcMain.handle('set-ui-scale', (event, factor) => {
    const f = Math.min(1.5, Math.max(0.75, Number(factor) || 1));
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.setZoomFactor(f);
    return f;
});

// GITHUB NEWS & CHANGELOG LOGIC
ipcMain.handle('get-external-news', async () => {
    const url = 'https://raw.githubusercontent.com/imnotfisy/SteamLite/main/news.json';
    try {
        const data = await fetchApi(url);
        const lastSeen = store.get('lastSeenChangelogVersion');
        let showChangelog = false;

        if (data.changelog && data.changelog.version !== lastSeen) {
            showChangelog = true;
        }

        return { ...data, showChangelog, currentVersion: APP_VERSION };
    } catch (err) {
        return null;
    }
});

ipcMain.handle('mark-changelog-seen', (event, version) => {
    store.set('lastSeenChangelogVersion', version || APP_VERSION);
    return true;
});

ipcMain.handle('resolve-profiles', async (event, { apiKey, steamIds }) => {
    return resolveSteamProfiles(apiKey || store.get('apiKey'), steamIds);
});

ipcMain.handle('browse-local-files', (event, data) => {
    const fullPath = path.join(data.commonPath, data.installdir);
    shell.openPath(fullPath);
});

ipcMain.handle('install-game', (event, gameId) => { shell.openExternal(`steam://install/${gameId}`); });
ipcMain.handle('uninstall-game', (event, gameId) => { shell.openExternal(`steam://uninstall/${gameId}`); });
ipcMain.handle('verify-game', (event, gameId) => { shell.openExternal(`steam://validate/${gameId}`); });

ipcMain.handle('get-game-config', (event, appId) => {
    const configs = store.get('gameConfigs') || {};
    return configs[appId] || { args: '', exePath: '', admin: false };
});

ipcMain.handle('save-game-config', (event, { appId, args, exePath, admin }) => {
    const configs = store.get('gameConfigs') || {};
    configs[appId] = Object.assign({}, configs[appId] || {}, { args, exePath, admin: !!admin }); // keeps the launch profile fields
    store.set('gameConfigs', configs);
    return true;
});

ipcMain.handle('select-game-exe', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'Executables', extensions: ['exe'] }] });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-bg-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'Media', extensions: ['jpg', 'png', 'jpeg', 'mp4', 'webm', 'gif'] }] });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-image-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'] }] });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('add-nonsteam-game', (event, { name, exe, cover, args }) => {
    let nonSteam = store.get('nonSteamGames') || [];
    const appId = `ns_${Date.now()}`;
    nonSteam.push({ appid: appId, name, cover, isNonSteam: true, exePath: exe });
    store.set('nonSteamGames', nonSteam);

    const configs = store.get('gameConfigs') || {};
    configs[appId] = { args: String(args || ''), exePath: exe };
    store.set('gameConfigs', configs);

    // BUG FIX: Ensure custom cover is actually saved if provided
    if (cover) {
        let covers = store.get('customCovers') || {};
        covers[appId] = cover;
        store.set('customCovers', covers);
    }

    return true;
});

// Returns a snapshot of everything that was removed, so the "Undo" button can put it back exactly as it was
ipcMain.handle('remove-nonsteam-game', (event, appId) => {
    let nonSteam = store.get('nonSteamGames') || [];
    const configs = store.get('gameConfigs') || {};
    const covers = store.get('customCovers') || {};
    const snapshot = { record: nonSteam.find(g => g.appid === appId) || null, config: configs[appId] || null, cover: covers[appId] || null };

    nonSteam = nonSteam.filter(g => g.appid !== appId);
    store.set('nonSteamGames', nonSteam);

    delete configs[appId];
    store.set('gameConfigs', configs);

    delete covers[appId];
    store.set('customCovers', covers);

    return snapshot;
});

ipcMain.handle('restore-nonsteam-game', (event, snapshot) => {
    if (!snapshot || !snapshot.record || !snapshot.record.appid) return false;
    const nonSteam = store.get('nonSteamGames') || [];
    if (nonSteam.some(g => g.appid === snapshot.record.appid)) return true;
    nonSteam.push(snapshot.record);
    store.set('nonSteamGames', nonSteam);
    if (snapshot.config) { const configs = store.get('gameConfigs') || {}; configs[snapshot.record.appid] = snapshot.config; store.set('gameConfigs', configs); }
    if (snapshot.cover) { const covers = store.get('customCovers') || {}; covers[snapshot.record.appid] = snapshot.cover; store.set('customCovers', covers); }
    return true;
});

// A file dropped onto the window: a program (.exe) or a Windows shortcut (.lnk) that points at one
ipcMain.handle('resolve-dropped-file', (event, filePath) => {
    try {
        const p = String(filePath || '');
        const ext = path.extname(p).toLowerCase();
        if (ext === '.lnk') {
            const link = shell.readShortcutLink(p);
            if (!link.target || !/\.exe$/i.test(link.target)) return { ok: false, error: 'That shortcut doesn\'t point to a program (.exe).' };
            return { ok: true, name: path.basename(p, '.lnk'), exe: link.target, args: link.args || '' };
        }
        if (ext === '.exe') return { ok: true, name: path.basename(p, '.exe'), exe: p, args: '' };
        return { ok: false, error: 'Drop a program (.exe) or a shortcut to one (.lnk).' };
    } catch (e) { return { ok: false, error: 'Couldn\'t read that file.' }; }
});

// Programs found in the Start menu, for "Import from Start menu". Steam games, Windows itself and
// installers/uninstallers/readmes are filtered out.
const START_MENU_SKIP = /(uninstall|unins\d|setup|installer|updater|readme|help|manual|website|support|license|release notes|documentation|repair|configure|redistributable|crash|vcredist|dotnet|steam)/i;
function collectShortcuts(dir, depth, out) {
    if (depth > 4) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) collectShortcuts(full, depth + 1, out);
        else if (e.name.toLowerCase().endsWith('.lnk')) out.push(full);
    }
}
ipcMain.handle('scan-start-menu', () => {
    const roots = [];
    if (process.env.ProgramData) roots.push(path.join(process.env.ProgramData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
    roots.push(path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
    const links = [];
    roots.forEach(r => collectShortcuts(r, 0, links));
    const winDir = (process.env.windir || 'C:\\Windows').toLowerCase();
    const known = new Set((store.get('nonSteamGames') || []).map(g => String(g.exePath || '').toLowerCase()));
    const seen = new Set(), found = [];
    for (const lnk of links) {
        try {
            const name = path.basename(lnk, '.lnk');
            const link = shell.readShortcutLink(lnk);
            const target = link.target || '';
            const lower = target.toLowerCase();
            if (!/\.exe$/.test(lower) || !fs.existsSync(target)) continue;
            if (lower.startsWith(winDir) || lower.includes('\\steamapps\\') || START_MENU_SKIP.test(name) || START_MENU_SKIP.test(path.basename(target))) continue;
            if (seen.has(lower) || known.has(lower)) continue;
            seen.add(lower);
            found.push({ name, exe: target, args: link.args || '' });
        } catch (e) { }
    }
    return found.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 400);
});

ipcMain.handle('import-theme', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Theme Files', extensions: ['json', 'txt'] }]
    });
    if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const theme = JSON.parse(content);
            store.set('themeVars', theme);
            return theme;
        } catch (e) {
            return null;
        }
    }
    return null;
});

ipcMain.handle('reset-theme', () => {
    store.set('themeVars', {});
    return true;
});

// THEME SHOP - themes ship inside the app (themes/ folder next to main.dev.js);
// extra themes can also be published to the GitHub repo and are merged in by id
const BUNDLED_THEMES_DIR = path.join(__dirname, 'themes');
const THEME_REPO_BASE = 'https://raw.githubusercontent.com/imnotfisy/SteamLite/main/themes';

function readBundledThemes() {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(BUNDLED_THEMES_DIR, 'themes.json'), 'utf8'));
        return Array.isArray(data.themes) ? data.themes.filter(t => t && t.id && t.file) : [];
    } catch (err) { return []; }
}

ipcMain.handle('get-theme-shop', async () => {
    const themes = readBundledThemes().map(t => ({ ...t, source: 'official' }));
    const seenIds = new Set(themes.map(t => t.id));
    try {
        const online = await fetchApi(`${THEME_REPO_BASE}/themes.json`, {}, 5000);
        if (Array.isArray(online.themes)) {
            for (const t of online.themes) {
                if (t && t.id && t.file && !seenIds.has(t.id)) { themes.push({ ...t, source: 'community' }); seenIds.add(t.id); }
            }
        }
    } catch (err) { /* offline or nothing published - bundled themes still show */ }
    return { ok: true, themes };
});

// Try a bundled theme on for a while without owning it. Reads the theme only - it doesn't unlock anything, doesn't
// count as applying a theme (so it can't trigger theme achievements) and never touches the network.
ipcMain.handle('preview-theme', (event, fileName) => {
    if (typeof fileName !== 'string' || !/^[\w.-]+\.json$/i.test(fileName) || fileName.includes('..') || fileName === 'themes.json') return null;
    try {
        const idx = JSON.parse(fs.readFileSync(path.join(BUNDLED_THEMES_DIR, 'themes.json'), 'utf8'));
        if (!(idx.themes || []).some(t => t.file === fileName)) return null; // only themes listed in the bundled index
        return JSON.parse(fs.readFileSync(path.join(BUNDLED_THEMES_DIR, fileName), 'utf8'));
    } catch (err) { return null; }
});

ipcMain.handle('download-theme', async (event, fileName) => {
    if (typeof fileName !== 'string' || !/^[\w.-]+\.json$/i.test(fileName) || fileName.includes('..')) return null;

    // reward themes are gated behind SteamLite achievements
    let requires = null, themeId = null;
    try {
        const idx = JSON.parse(fs.readFileSync(path.join(BUNDLED_THEMES_DIR, 'themes.json'), 'utf8'));
        const entry = (idx.themes || []).find(t => t.file === fileName);
        requires = entry && entry.requires ? entry.requires : null;
        themeId = entry ? entry.id : null;
    } catch (err) { }
    if (requires) {
        const unlocked = store.get('metaAchievements') || {};
        const granted = themeId && (store.get('themeUnlocks') || {})[themeId];
        if (!unlocked[requires] && !granted) return { locked: true, requires };
    }

    try {
        const local = path.join(BUNDLED_THEMES_DIR, fileName);
        if (fs.existsSync(local)) {
            store.set('themeAppliedAt', Date.now());
            store.set('themeApplyCount', (store.get('themeApplyCount') || 0) + 1);
            return JSON.parse(fs.readFileSync(local, 'utf8'));
        }
    } catch (err) { }
    try {
        store.set('themeAppliedAt', Date.now());
        store.set('themeApplyCount', (store.get('themeApplyCount') || 0) + 1);
        return await fetchApi(`${THEME_REPO_BASE}/${fileName}`);
    } catch (err) { return null; }
});

// ==========================================
// STEAMLITE ACHIEVEMENTS + STREAK SYSTEM
// ==========================================
const ACHIEVEMENT_DEFS = [
    { id: 'first-launch', name: 'First Steps', desc: 'Launch a game through SteamLite.', icon: '🎮', check: s => s.totalLaunches >= 1, progress: s => [Math.min(s.totalLaunches, 1), 1] },
    { id: 'veteran-launches', name: 'Centurion', desc: 'Launch games 100 times.', icon: '💯', rewardTheme: 'centurion-gold', check: s => s.totalLaunches >= 100, progress: s => [Math.min(s.totalLaunches, 100), 100] },
    { id: 'hour-one', name: 'Hour One', desc: 'Play for 1 hour in total.', icon: '⏰', check: s => s.totalPlaytimeSec >= 3600, progress: s => [Math.min(Math.floor(s.totalPlaytimeSec / 3600), 1), 1] },
    { id: 'hundred-hours', name: 'Hundred Club', desc: 'Play for 100 hours in total.', icon: '🕐', check: s => s.totalPlaytimeSec >= 360000, progress: s => [Math.min(Math.floor(s.totalPlaytimeSec / 3600), 100), 100] },
    { id: 'five-hundred', name: '500 Club', desc: 'Play 500 hours of a single game.', icon: '🏆', rewardTheme: '500-club-platinum', check: s => s.maxGamePlaytimeSec >= 1800000, progress: s => [Math.min(Math.floor(s.maxGamePlaytimeSec / 3600), 500), 500] },
    { id: 'marathon', name: 'Marathon', desc: 'Play a single session of 5 hours or more.', icon: '🏃', rewardTheme: 'marathon-redline', check: s => s.longestSessionSec >= 18000, progress: s => [Math.min(Math.floor(s.longestSessionSec / 3600), 5), 5] },
    { id: 'night-owl', name: 'Night Owl', desc: 'Start a session between 02:00 and 05:00.', icon: '🦉', check: s => s.nightSessions >= 1, progress: s => [Math.min(s.nightSessions, 1), 1] },
    { id: 'early-bird', name: 'Early Bird', desc: 'Start a session before 08:00.', icon: '🌅', check: s => s.morningSessions >= 1, progress: s => [Math.min(s.morningSessions, 1), 1] },
    { id: 'streak-3', name: 'Getting Warm', desc: 'Reach a 3-day play streak.', icon: '🔥', check: s => s.streakBest >= 3, progress: s => [Math.min(s.streakBest, 3), 3] },
    { id: 'streak-7', name: 'On a Roll', desc: 'Reach a 7-day play streak.', icon: '🔥', rewardTheme: 'streak-inferno', check: s => s.streakBest >= 7, progress: s => [Math.min(s.streakBest, 7), 7] },
    { id: 'streak-30', name: 'Unstoppable', desc: 'Reach a 30-day play streak.', icon: '☄️', rewardTheme: 'unstoppable-solar', check: s => s.streakBest >= 30, progress: s => [Math.min(s.streakBest, 30), 30] },
    { id: 'collector', name: 'Collector', desc: 'Own 50 or more games.', icon: '📚', check: s => s.librarySize >= 50, progress: s => [Math.min(s.librarySize, 50), 50] },
    { id: 'completionist', name: 'Completionist', desc: 'Unlock every achievement in any game.', icon: '✅', rewardTheme: 'completionist-prism', check: s => s.perfectGames >= 1, progress: s => [Math.min(s.perfectGames, 1), 1] },
    { id: 'decorator', name: 'Decorator', desc: 'Apply a theme from the Theme Shop.', icon: '🎨', check: s => s.themeApplied, progress: s => [s.themeApplied ? 1 : 0, 1] },
    { id: 'theme-collector', name: 'Theme Collector', desc: 'Apply themes from the Theme Shop 5 times.', icon: '🖌️', rewardTheme: 'chrome-aurora', check: s => s.themeApplies >= 5, progress: s => [Math.min(s.themeApplies, 5), 5] },
    { id: 'bibliophile', name: 'Bibliophile', desc: 'Own 200 or more games.', icon: '📖', check: s => s.librarySize >= 200, progress: s => [Math.min(s.librarySize, 200), 200] },
    { id: 'variety-player', name: 'Variety Player', desc: 'Play 25 different games.', icon: '🎲', check: s => s.distinctGames >= 25, progress: s => [Math.min(s.distinctGames, 25), 25] },
    { id: 'century-sessions', name: 'Century Sessions', desc: 'Complete 100 tracked sessions.', icon: '💯', check: s => s.totalSessions >= 100, progress: s => [Math.min(s.totalSessions, 100), 100] },
    { id: 'theme-author', name: 'Theme Author', desc: 'Create your own theme with the Theme Maker.', icon: '🎨', check: s => s.customThemesCount >= 1, progress: s => [Math.min(s.customThemesCount, 1), 1] },
    { id: 'night-owl-plus', name: 'Night Owl+', desc: 'Start 5 tracked sessions between 2AM and 5AM.', icon: '🌙', check: s => s.nightSessions >= 5, progress: s => [Math.min(s.nightSessions, 5), 5] },
    { id: 'sunrise-grind', name: 'Sunrise Grind', desc: 'Start 5 tracked sessions before 8AM.', icon: '🌄', check: s => s.morningSessions >= 5, progress: s => [Math.min(s.morningSessions, 5), 5] },
    { id: 'session-veteran', name: 'Session Veteran', desc: 'Complete 250 tracked sessions.', icon: '🕹️', check: s => s.totalSessions >= 250, progress: s => [Math.min(s.totalSessions, 250), 250] },
    { id: 'library-titan', name: 'Library Titan', desc: 'Own 500 or more games.', icon: '🏛️', check: s => s.librarySize >= 500, progress: s => [Math.min(s.librarySize, 500), 500] },
    { id: 'theme-master', name: 'Theme Master', desc: 'Apply themes from the Theme Shop 10 times.', icon: '🪄', check: s => s.themeApplies >= 10, progress: s => [Math.min(s.themeApplies, 10), 10] },
    { id: 'legendary-collector', name: 'Legendary Collector', desc: 'Play 50 different games.', icon: '👑', check: s => s.distinctGames >= 50, progress: s => [Math.min(s.distinctGames, 50), 50] },
    { id: 'community-castiel', name: 'Castiel Community Pick', desc: 'Celebrate the community release and claim a streak restore.', icon: '⭐', rewardRestores: 1, check: s => s.themeApplied, progress: s => [s.themeApplied ? 1 : 0, 1] },
    { id: 'community-alex', name: 'Alex Community Pick', desc: 'Complete 10 tracked sessions and claim a streak restore.', icon: '✨', rewardRestores: 1, check: s => s.totalSessions >= 10, progress: s => [Math.min(s.totalSessions, 10), 10] },
    { id: 'dedicated-gamer', name: 'Dedicated Gamer', desc: 'Play for 1000 hours in total.', icon: '🎯', check: s => s.totalPlaytimeSec >= 3600000, progress: s => [Math.min(Math.floor(s.totalPlaytimeSec / 3600), 1000), 1000] },
    { id: 'game-master', name: 'Game Master', desc: 'Play 100 different games.', icon: '🎲', check: s => s.distinctGames >= 100, progress: s => [Math.min(s.distinctGames, 100), 100] },
    { id: 'session-pro', name: 'Session Pro', desc: 'Complete 500 tracked sessions.', icon: '🕹️', check: s => s.totalSessions >= 500, progress: s => [Math.min(s.totalSessions, 500), 500] },
    { id: 'streak-legend', name: 'Streak Legend', desc: 'Reach a 60-day play streak.', icon: '🏆', check: s => s.streakBest >= 60, progress: s => [Math.min(s.streakBest, 60), 60] },
    { id: 'theme-enthusiast', name: 'Theme Enthusiast', desc: 'Apply themes from the Theme Shop 20 times.', icon: '🎨', check: s => s.themeApplies >= 20, progress: s => [Math.min(s.themeApplies, 20), 20] },

    // ===== 8.5.1 achievements (each one rewards a theme) =====
    { id: 'weekend-warrior', name: 'Weekend Warrior', desc: 'Play on 8 different weekend days (Saturday or Sunday).', icon: '🎉', rewardTheme: 'weekend-warrior', check: s => s.weekendDays >= 8, progress: s => [Math.min(s.weekendDays, 8), 8] },
    { id: 'regular', name: 'Regular', desc: 'Play on 14 different days.', icon: '📅', rewardTheme: 'regular-teal', check: s => s.activeDays >= 14, progress: s => [Math.min(s.activeDays, 14), 14] },
    { id: 'calendar-keeper', name: 'Calendar Keeper', desc: 'Play on 60 different days.', icon: '🗓️', rewardTheme: 'calendar-sapphire', check: s => s.activeDays >= 60, progress: s => [Math.min(s.activeDays, 60), 60] },
    { id: 'long-haul', name: 'Long Haul', desc: 'Play 10 sessions of 2 hours or more.', icon: '🚀', rewardTheme: 'long-haul-copper', check: s => s.longSessions >= 10, progress: s => [Math.min(s.longSessions, 10), 10] },
    { id: 'launch-legend', name: 'Launch Legend', desc: 'Launch games 500 times.', icon: '🎯', rewardTheme: 'launch-legend-onyx', check: s => s.totalLaunches >= 500, progress: s => [Math.min(s.totalLaunches, 500), 500] },
    { id: 'quarter-k', name: 'Quarter K', desc: 'Play for 250 hours in total.', icon: '⌛', rewardTheme: 'quarter-k-jade', check: s => s.totalPlaytimeSec >= 900000, progress: s => [Math.min(Math.floor(s.totalPlaytimeSec / 3600), 250), 250] },
    { id: 'time-lord', name: 'Time Lord', desc: 'Play for 2500 hours in total.', icon: '⏳', rewardTheme: 'time-lord-amethyst', check: s => s.totalPlaytimeSec >= 9000000, progress: s => [Math.min(Math.floor(s.totalPlaytimeSec / 3600), 2500), 2500] },
    { id: 'devoted', name: 'Devoted', desc: 'Play 100 hours of a single game.', icon: '💖', rewardTheme: 'devoted-rose', check: s => s.maxGamePlaytimeSec >= 360000, progress: s => [Math.min(Math.floor(s.maxGamePlaytimeSec / 3600), 100), 100] },
    { id: 'favourite-things', name: 'Favourite Things', desc: 'Add 10 games to your favorites.', icon: '⭐', rewardTheme: 'favourite-coral', check: s => s.favoritesCount >= 10, progress: s => [Math.min(s.favoritesCount, 10), 10] },
    { id: 'organiser', name: 'Organiser', desc: 'Create 3 collections.', icon: '🗂️', rewardTheme: 'organiser-slate', check: s => s.collectionsCount >= 3, progress: s => [Math.min(s.collectionsCount, 3), 3] },
    { id: 'achievement-hunter', name: 'Achievement Hunter', desc: 'Unlock 10 SteamLite achievements.', icon: '🔎', rewardTheme: 'hunter-moss', check: s => s.achUnlocked >= 10, progress: s => [Math.min(s.achUnlocked, 10), 10] },
    { id: 'trophy-case', name: 'Trophy Case', desc: 'Unlock 25 SteamLite achievements.', icon: '🏅', rewardTheme: 'trophy-bronze', check: s => s.achUnlocked >= 25, progress: s => [Math.min(s.achUnlocked, 25), 25] },
    { id: 'level-25', name: 'Rising Star', desc: 'Reach SteamLite level 25.', icon: '⚡', rewardTheme: 'level-up-electric', check: s => s.level >= 25, progress: s => [Math.min(s.level, 25), 25] },
    { id: 'restore-hoarder', name: 'Restore Hoarder', desc: 'Hold 5 streak restores at the same time.', icon: '🧊', rewardTheme: 'hoarder-ice', check: s => s.restores >= 5, progress: s => [Math.min(s.restores, 5), 5] },
    { id: 'streak-14', name: 'Fortnight Strong', desc: 'Reach a 14-day play streak.', icon: '🔥', rewardTheme: 'fortnight-ember', check: s => s.streakBest >= 14, progress: s => [Math.min(s.streakBest, 14), 14] },

    // ===== Halloween event (October 1 - November 1, every year) =====
    // Counted only from play inside the event window, and only unlockable while the event is open. Once earned
    // they stay unlocked for good.
    { id: 'hw-trick-or-treat', event: 'halloween', name: 'Trick or Treat', desc: 'Play a game on Halloween (October 31).', icon: '🍬', check: s => s.hwOpen && s.hw.onHalloween, progress: s => [s.hw.onHalloween ? 1 : 0, 1] },
    { id: 'hw-witching-hour', event: 'halloween', name: 'Witching Hour', desc: 'Start a session between 3:00 and 4:00 AM.', icon: '🔮', check: s => s.hwOpen && s.hw.witching >= 1, progress: s => [Math.min(s.hw.witching, 1), 1] },
    { id: 'hw-night-stalker', event: 'halloween', name: 'Night Stalker', desc: 'Start 5 sessions after 10 PM.', icon: '🦇', check: s => s.hwOpen && s.hw.late >= 5, progress: s => [Math.min(s.hw.late, 5), 5] },
    { id: 'hw-vampire-hours', event: 'halloween', name: 'Vampire Hours', desc: 'Play on 7 different days.', icon: '🧛', check: s => s.hwOpen && s.hw.days >= 7, progress: s => [Math.min(s.hw.days, 7), 7] },
    { id: 'hw-tangled-web', event: 'halloween', name: 'Tangled Web', desc: 'Play 7 different games.', icon: '🕸️', check: s => s.hwOpen && s.hw.games >= 7, progress: s => [Math.min(s.hw.games, 7), 7] },
    { id: 'hw-haunted-marathon', event: 'halloween', name: 'Haunted Marathon', desc: 'Play a single session of 3 hours or more.', icon: '👻', check: s => s.hwOpen && s.hw.longestSec >= 10800, progress: s => [Math.min(Math.floor(s.hw.longestSec / 3600), 3), 3] },
    { id: 'hw-graveyard-shift', event: 'halloween', name: 'Graveyard Shift', desc: 'Play 13 hours during the event.', icon: '💀', check: s => s.hwOpen && s.hw.totalSec >= 46800, progress: s => [Math.min(Math.floor(s.hw.totalSec / 3600), 13), 13] },
    { id: 'hw-survivor', event: 'halloween', name: 'Spooky Season Survivor', desc: 'Unlock every other Halloween achievement. Rewards the Haunted Harvest theme (yours forever) and a streak restore.', icon: '🎃', rewardTheme: 'haunted-harvest', rewardRestores: 1, check: (s, u) => s.hwOpen && HALLOWEEN_IDS.every(id => u[id]), progress: (s, u) => [HALLOWEEN_IDS.filter(id => u && u[id]).length, HALLOWEEN_IDS.length] },

    // ===== Winter Holidays (December 1 - 31, every year) =====
    { id: 'xmas-day', event: 'christmas', name: 'Merry Christmas', desc: 'Play a game on December 25.', icon: '🎁', check: s => s.ev.christmas.open && s.ev.christmas.dates.includes('12-25'), progress: s => [s.ev.christmas.dates.includes('12-25') ? 1 : 0, 1] },
    { id: 'xmas-advent', event: 'christmas', name: 'Advent Calendar', desc: 'Play on 12 different days.', icon: '📅', check: s => s.ev.christmas.open && s.ev.christmas.days >= 12, progress: s => [Math.min(s.ev.christmas.days, 12), 12] },
    { id: 'xmas-gifts', event: 'christmas', name: 'Gift Wrapped', desc: 'Play 5 different games.', icon: '🎀', check: s => s.ev.christmas.open && s.ev.christmas.games >= 5, progress: s => [Math.min(s.ev.christmas.games, 5), 5] },
    { id: 'xmas-fireside', event: 'christmas', name: 'By the Fireside', desc: 'Play 12 hours during the event.', icon: '🔥', check: s => s.ev.christmas.open && s.ev.christmas.totalSec >= 43200, progress: s => [Math.min(Math.floor(s.ev.christmas.totalSec / 3600), 12), 12] },
    { id: 'xmas-nye', event: 'christmas', name: 'Auld Lang Syne', desc: 'Play a game on December 31.', icon: '🎆', check: s => s.ev.christmas.open && s.ev.christmas.dates.includes('12-31'), progress: s => [s.ev.christmas.dates.includes('12-31') ? 1 : 0, 1] },
    { id: 'xmas-spirit', event: 'christmas', capstone: true, name: 'Christmas Spirit', desc: 'Unlock every other Winter Holidays achievement. Rewards the Winter Wonderland theme (yours forever) and a streak restore.', icon: '🎄', rewardTheme: 'winter-wonderland', rewardRestores: 1, check: (s, u) => s.ev.christmas.open && eventMemberIds('christmas').every(id => u[id]), progress: (s, u) => [eventMemberIds('christmas').filter(id => u && u[id]).length, eventMemberIds('christmas').length] },

    // ===== Summer Splash (June 21 - July 5, every year) =====
    { id: 'summer-solstice', event: 'summer', name: 'Solstice', desc: 'Play a game on June 21, the longest day.', icon: '☀️', check: s => s.ev.summer.open && s.ev.summer.dates.includes('6-21'), progress: s => [s.ev.summer.dates.includes('6-21') ? 1 : 0, 1] },
    { id: 'summer-sunny', event: 'summer', name: 'Sunny Days', desc: 'Play on 7 different days.', icon: '🌞', check: s => s.ev.summer.open && s.ev.summer.days >= 7, progress: s => [Math.min(s.ev.summer.days, 7), 7] },
    { id: 'summer-beach', event: 'summer', name: 'Beach Bum', desc: 'Play 8 hours during the event.', icon: '🏝️', check: s => s.ev.summer.open && s.ev.summer.totalSec >= 28800, progress: s => [Math.min(Math.floor(s.ev.summer.totalSec / 3600), 8), 8] },
    { id: 'summer-sale', event: 'summer', name: 'Sale Hunter', desc: 'Play 4 different games.', icon: '🏷️', check: s => s.ev.summer.open && s.ev.summer.games >= 4, progress: s => [Math.min(s.ev.summer.games, 4), 4] },
    { id: 'summer-night', event: 'summer', name: 'Midnight Swim', desc: 'Start 3 sessions after 10 PM.', icon: '🌊', check: s => s.ev.summer.open && s.ev.summer.late >= 3, progress: s => [Math.min(s.ev.summer.late, 3), 3] },
    { id: 'summer-survivor', event: 'summer', capstone: true, name: 'Summer Survivor', desc: 'Unlock every other Summer Splash achievement. Rewards the Summer Splash theme (yours forever) and a streak restore.', icon: '🏖️', rewardTheme: 'summer-splash', rewardRestores: 1, check: (s, u) => s.ev.summer.open && eventMemberIds('summer').every(id => u[id]), progress: (s, u) => [eventMemberIds('summer').filter(id => u && u[id]).length, eventMemberIds('summer').length] },

    // ===== Spring Bloom (March 20 - April 5, every year) =====
    { id: 'spring-equinox', event: 'spring', name: 'Equinox', desc: 'Play a game on March 20, the first day of spring.', icon: '🌱', check: s => s.ev.spring.open && s.ev.spring.dates.includes('3-20'), progress: s => [s.ev.spring.dates.includes('3-20') ? 1 : 0, 1] },
    { id: 'spring-bloom', event: 'spring', name: 'In Bloom', desc: 'Play on 7 different days.', icon: '🌸', check: s => s.ev.spring.open && s.ev.spring.days >= 7, progress: s => [Math.min(s.ev.spring.days, 7), 7] },
    { id: 'spring-fresh', event: 'spring', name: 'Fresh Start', desc: 'Play 4 different games.', icon: '🍃', check: s => s.ev.spring.open && s.ev.spring.games >= 4, progress: s => [Math.min(s.ev.spring.games, 4), 4] },
    { id: 'spring-rain', event: 'spring', name: 'April Showers', desc: 'Play 8 hours during the event.', icon: '☔', check: s => s.ev.spring.open && s.ev.spring.totalSec >= 28800, progress: s => [Math.min(Math.floor(s.ev.spring.totalSec / 3600), 8), 8] },
    { id: 'spring-dawn', event: 'spring', name: 'Dawn Chorus', desc: 'Start 3 sessions before 9 AM.', icon: '🐦', check: s => s.ev.spring.open && s.ev.spring.early >= 3, progress: s => [Math.min(s.ev.spring.early, 3), 3] },
    { id: 'spring-awaken', event: 'spring', capstone: true, name: 'Spring Awakening', desc: 'Unlock every other Spring Bloom achievement. Rewards the Spring Bloom theme (yours forever) and a streak restore.', icon: '🌷', rewardTheme: 'spring-bloom', rewardRestores: 1, check: (s, u) => s.ev.spring.open && eventMemberIds('spring').every(id => u[id]), progress: (s, u) => [eventMemberIds('spring').filter(id => u && u[id]).length, eventMemberIds('spring').length] }
];
// the achievements an event's capstone needs (every other one of that event)
function eventMemberIds(eventId) { return ACHIEVEMENT_DEFS.filter(d => d.event === eventId && !d.capstone && d.id !== 'hw-survivor').map(d => d.id); }
function eventWindowStats(id, history) {
    const st = eventState(id), days = new Set(), games = new Set(), dates = new Set();
    let totalSec = 0, longestSec = 0, late = 0, early = 0;
    for (const h of history) {
        if (!(h.start >= st.start && h.start < st.end)) continue;
        const d = new Date(h.start);
        days.add(streakDayKey(h.start)); games.add(String(h.gameId)); dates.add((d.getMonth() + 1) + '-' + d.getDate());
        totalSec += h.seconds || 0; longestSec = Math.max(longestSec, h.seconds || 0);
        if (d.getHours() >= 22) late++;
        if (d.getHours() < 9) early++;
    }
    return { open: st.open, days: days.size, games: games.size, totalSec, longestSec, late, early, dates: Array.from(dates) };
}
const HALLOWEEN_IDS = ACHIEVEMENT_DEFS.filter(d => d.event === 'halloween' && d.id !== 'hw-survivor').map(d => d.id);

// ===== Seasonal events =====
// An event runs on the same dates every year, and its achievements (and any theme they unlock) can only be earned
// while it is open. graceDays can keep it open a little after it ends - 0 means it closes at midnight after the last
// day. SL_FORCE_EVENT=halloween forces it open (for testing).
const EVENTS = {
    halloween: { id: 'halloween', name: 'Halloween Event', icon: '🎃', start: [10, 1], end: [11, 1], graceDays: 0, theme: 'haunted-harvest', themeName: 'Haunted Harvest', blurb: 'Earn spooky achievements and unlock the Haunted Harvest theme by unlocking all 8 achievements - and it is yours forever.' },
    christmas: { id: 'christmas', name: 'Winter Holidays', icon: '🎄', start: [12, 1], end: [12, 31], graceDays: 0, theme: 'winter-wonderland', themeName: 'Winter Wonderland', blurb: 'Play through December, unlock all 6 festive achievements and the Winter Wonderland theme is yours forever.' },
    spring: { id: 'spring', name: 'Spring Bloom', icon: '🌷', start: [3, 20], end: [4, 5], graceDays: 0, theme: 'spring-bloom', themeName: 'Spring Bloom', blurb: 'Spring is here: unlock all 6 spring achievements and the Spring Bloom theme is yours forever.' },
    summer: { id: 'summer', name: 'Summer Splash', icon: '🏖️', start: [6, 21], end: [7, 5], graceDays: 0, theme: 'summer-splash', themeName: 'Summer Splash', blurb: 'Soak up the sun: unlock all 6 summer achievements and the Summer Splash theme is yours forever.' }
};
function eventState(id, nowMs = Date.now()) {
    if (process.env.SL_FAKE_NOW) nowMs = Number(process.env.SL_FAKE_NOW) || nowMs; // testing only: pretend it is another date
    const ev = EVENTS[id], now = new Date(nowMs);
    let year = now.getFullYear();
    let start = new Date(year, ev.start[0] - 1, ev.start[1]);
    if (now < start) { year -= 1; start = new Date(year, ev.start[0] - 1, ev.start[1]); } // before this year's start: the last event is last year's
    const end = new Date(year, ev.end[0] - 1, ev.end[1] + 1); // exclusive - midnight after the last day
    const forced = process.env.SL_FORCE_EVENT === id;
    const active = forced || (now >= start && now < end);
    const open = active || (now >= start && now < new Date(end.getTime() + ev.graceDays * 86400000));
    return { id: ev.id, name: ev.name, icon: ev.icon, theme: ev.theme, themeName: ev.themeName, blurb: ev.blurb, year, start: start.getTime(), end: end.getTime(), active, open, daysLeft: active ? Math.max(0, Math.ceil((end.getTime() - nowMs) / 86400000)) : 0 };
}

function getStreakState() {
    const s = store.get('streak');
    return (s && typeof s.current === 'number') ? s : { current: 0, best: 0, lastPlayDay: null, recovery: { activeUntil: null, previousStreak: 0 } };
}

// Zero-padded so the YYYY-MM-DD keys sort/compare correctly as strings (e.g. "09" < "10")
function streakDayKey(ts = Date.now()) { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

function expireStreakRecoveryIfPast(s) {
    if (s.recovery && s.recovery.activeUntil && streakDayKey() > s.recovery.activeUntil) {
        s.recovery = { activeUntil: null, previousStreak: 0 };
    }
    return s;
}

function collectStats(librarySize) {
    const telemetry = store.get('telemetry') || {};
    const history = store.get('sessionHistory') || [];
    const achCache = store.get('achievementCache') || {};
    const streak = getStreakState();
    let totalLaunches = 0, totalPlaytimeSec = 0, maxGamePlaytimeSec = 0;
    for (const id in telemetry) {
        totalLaunches += telemetry[id].launches || 0;
        totalPlaytimeSec += telemetry[id].playtime || 0;
        maxGamePlaytimeSec = Math.max(maxGamePlaytimeSec, telemetry[id].playtime || 0);
    }
    let longestSessionSec = 0, nightSessions = 0, morningSessions = 0;
    history.forEach(h => {
        longestSessionSec = Math.max(longestSessionSec, h.seconds || 0);
        const hr = new Date(h.start).getHours();
        if (hr >= 2 && hr < 5) nightSessions++;
        else if (hr >= 5 && hr < 8) morningSessions++;
    });
    // Halloween event: only sessions that started inside the event window count
    const hwState = eventState('halloween');
    const hw = { days: new Set(), games: new Set(), totalSec: 0, longestSec: 0, late: 0, witching: 0, onHalloween: false };
    history.forEach(h => {
        if (!(h.start >= hwState.start && h.start < hwState.end)) return;
        const d = new Date(h.start), hr = d.getHours();
        hw.days.add(streakDayKey(h.start)); hw.games.add(String(h.gameId));
        hw.totalSec += h.seconds || 0; hw.longestSec = Math.max(hw.longestSec, h.seconds || 0);
        if (hr >= 22) hw.late++;
        if (hr === 3) hw.witching++;
        if (d.getMonth() === 9 && d.getDate() === 31) hw.onHalloween = true;
    });
    const dayKeys = new Set(), weekendKeys = new Set(); let longSessions = 0;
    history.forEach(h => {
        const k = streakDayKey(h.start), dow = new Date(h.start).getDay();
        dayKeys.add(k);
        if (dow === 0 || dow === 6) weekendKeys.add(k);
        if ((h.seconds || 0) >= 7200) longSessions++;
    });
    const metaUnlocked = store.get('metaAchievements') || {};
    let perfectGames = 0;
    for (const id in achCache) { const a = achCache[id]; if (a && a.total > 0 && a.achieved >= a.total) perfectGames++; }
    return {
        totalLaunches, totalPlaytimeSec, maxGamePlaytimeSec, longestSessionSec,
        nightSessions, morningSessions, perfectGames,
        distinctGames: Object.keys(telemetry).length,
        totalSessions: history.length,
        streakBest: streak.best,
        librarySize: typeof librarySize === 'number' && librarySize > 0 ? librarySize : (store.get('lastLibrarySize') || 0),
        themeApplied: !!store.get('themeAppliedAt'),
        themeApplies: store.get('themeApplyCount') || 0,
        customThemesCount: (store.get('customThemes') || []).length,
        activeDays: dayKeys.size, weekendDays: weekendKeys.size, longSessions,
        favoritesCount: (store.get('favorites') || []).length,
        collectionsCount: Object.keys(store.get('collections') || {}).length,
        achUnlocked: ACHIEVEMENT_DEFS.filter(d => metaUnlocked[d.id]).length,
        level: levelInfo(totalXp(metaUnlocked)).level,
        restores: store.get('streakRestores') || 0,
        ev: { christmas: eventWindowStats('christmas', history), summer: eventWindowStats('summer', history), spring: eventWindowStats('spring', history) },
        hwOpen: hwState.open,
        hw: { days: hw.days.size, games: hw.games.size, totalSec: hw.totalSec, longestSec: hw.longestSec, late: hw.late, witching: hw.witching, onHalloween: hw.onHalloween }
    };
}

// ===== SteamLite levels =====
// Every achievement (event ones included) gives a random 60-140 XP (about 100 on average) the moment it unlocks, and
// the amount is remembered in `achievementXp`. On Saturdays and Sundays all XP is boosted by 1.2x. Each level takes
// 50 XP; level 1 is the start and 100 is the cap. Achievements unlocked before XP existed count as a flat 100 XP.
const XP_MIN = 60, XP_MAX = 140, XP_LEGACY = 100, XP_PER_LEVEL = 50, MAX_LEVEL = 100, WEEKEND_BOOST = 1.2;
const EVENT_BOOST = 2.0;       // while an event is on, all XP is doubled...
const BOOST_DR_SCALE = 300;    // ...but bonus XP fades the more of it you earn in a day (see applyBoost)
const RESTORE_CAP = 5;         // you can hold at most this many streak restores
// Gives streak restores up to the cap and returns how many were actually added (holding more than the cap is never taken away)
function addRestores(n) {
    const cur = store.get('streakRestores') || 0;
    const next = cur >= RESTORE_CAP ? cur : Math.min(RESTORE_CAP, cur + n);
    store.set('streakRestores', next);
    return next - cur;
}
function levelInfo(xp) {
    const level = Math.min(MAX_LEVEL, 1 + Math.floor(xp / XP_PER_LEVEL));
    const maxed = level >= MAX_LEVEL;
    return { xp, level, maxLevel: MAX_LEVEL, maxed, into: maxed ? XP_PER_LEVEL : xp - (level - 1) * XP_PER_LEVEL, perLevel: XP_PER_LEVEL, nextAt: maxed ? null : level * XP_PER_LEVEL, xpMin: XP_MIN, xpMax: XP_MAX };
}
// Weekend = Saturday and Sunday, local time. SL_FAKE_NOW (testing only) pretends it is another moment.
function weekendBoost(nowMs) {
    if (nowMs === undefined) nowMs = process.env.SL_FAKE_NOW ? (Number(process.env.SL_FAKE_NOW) || Date.now()) : Date.now();
    const d = new Date(nowMs), day = d.getDay();
    const active = day === 0 || day === 6;
    const at = (addDays) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + addDays).getTime();
    return { multiplier: WEEKEND_BOOST, active, endsAt: active ? at(day === 6 ? 2 : 1) : null, startsAt: active ? null : at(6 - day) };
}
// XP stored for each unlocked achievement; ones unlocked before XP existed are filled in at the flat legacy amount
function getAchievementXp(unlocked) {
    const log = store.get('achievementXp') || {};
    let changed = false;
    for (const def of ACHIEVEMENT_DEFS) {
        if (unlocked && unlocked[def.id] && typeof log[def.id] !== 'number') { log[def.id] = XP_LEGACY; changed = true; }
    }
    if (changed) store.set('achievementXp', log);
    return log;
}
// all XP ever earned, and the XP that counts for the current level (prestige starts the level over from zero)
function rawXp(unlocked) {
    const log = getAchievementXp(unlocked);
    const fromAchievements = ACHIEVEMENT_DEFS.reduce((sum, d) => sum + (unlocked && unlocked[d.id] ? log[d.id] : 0), 0);
    const fromChallenges = Object.values(store.get('challengeXp') || {}).reduce((s, v) => s + (Number(v) || 0), 0);
    return fromAchievements + fromChallenges;
}
function totalXp(unlocked) { return Math.max(0, rawXp(unlocked) - ((store.get('prestige') || {}).baseXp || 0)); }
// titles / frames / level rewards stay unlocked after a prestige
function effectiveLevel(unlocked) { const lv = levelInfo(totalXp(unlocked)).level; return ((store.get('prestige') || {}).count || 0) > 0 ? 100 : lv; }
// XP boosts. While an event is live all XP is doubled, and on weekends it is boosted by 1.2x. They add together
// (event + weekend = 2.2x) instead of multiplying. The bonus part then fades through the day: its strength is
// 1 / (1 + bonusBaseXpEarnedToday / 300), so the first achievement gets nearly the full boost and later ones less
// (100 XP earned -> 75% strength, 300 -> 50%, 900 -> 25%). It resets every day, so nobody levels up in a rush.
function currentBoost(nowMs) {
    const wk = weekendBoost(nowMs);
    const live = Object.keys(EVENTS).map(id => eventState(id, nowMs)).filter(e => e.active);
    const parts = [];
    if (live.length) parts.push({ id: 'event', label: live[0].name, icon: live[0].icon, mult: EVENT_BOOST, endsAt: live[0].end });
    if (wk.active) parts.push({ id: 'weekend', label: 'Weekend', mult: WEEKEND_BOOST, endsAt: wk.endsAt });
    const raw = 1 + parts.reduce((s, p) => s + (p.mult - 1), 0);
    const day = streakDayKey();
    const log = store.get('boostLog') || {};
    const used = log.day === day ? (log.base || 0) : 0;
    const strength = 1 / (1 + used / BOOST_DR_SCALE);
    return { active: parts.length > 0, parts, raw, strength, effective: 1 + (raw - 1) * strength, usedToday: used, weekend: wk };
}
// Boosts one amount of XP and counts it towards today's fade
function applyBoost(baseXp) {
    const b = currentBoost();
    if (!b.active) return { xp: baseXp, mult: 1, boosted: false };
    const day = streakDayKey(), log = store.get('boostLog') || {};
    store.set('boostLog', { day, base: (log.day === day ? (log.base || 0) : 0) + baseXp });
    return { xp: Math.round(baseXp * b.effective), mult: Math.round(b.effective * 100) / 100, boosted: b.effective > 1.005 };
}
function rollXp() {
    const base = XP_MIN + Math.floor(Math.random() * (XP_MAX - XP_MIN + 1));
    const b = applyBoost(base);
    return { base, boosted: b.boosted, mult: b.mult, xp: b.xp };
}

function buildAchievementList(stats, unlocked) {
    const xpLog = getAchievementXp(unlocked);
    return ACHIEVEMENT_DEFS.map(def => {
        const p = def.progress(stats, unlocked);
        return {
            id: def.id,
            event: def.event || null,
            name: def.name,
            desc: def.desc,
            icon: def.icon,
            rewardTheme: def.rewardTheme || null,
            rewardRestores: def.rewardRestores || 0,
            xp: unlocked[def.id] ? xpLog[def.id] : null, // what it gave; null while it is still locked (the amount is rolled on unlock)
            unlockedAt: unlocked[def.id] || null,
            progress: { current: p[0], max: p[1] }
        };
    });
}

function grantTheme(themeId) {
    const grants = store.get('themeUnlocks') || {};
    if (!grants[themeId]) { grants[themeId] = Date.now(); store.set('themeUnlocks', grants); }
}

function checkAchievements(librarySize) {
    const stats = collectStats(librarySize);
    const unlocked = store.get('metaAchievements') || {};
    getAchievementXp(unlocked); // give anything unlocked before XP existed its flat amount first, so only new unlocks are rolled below
    const newly = [];
    for (const def of ACHIEVEMENT_DEFS) {
        if (!unlocked[def.id] && def.check(stats, unlocked)) { unlocked[def.id] = Date.now(); newly.push(def); }
    }
    if (newly.length > 0) store.set('metaAchievements', unlocked);
    // A reward theme is granted for good the moment its achievement unlocks. The grant is stored on its own, so the theme
    // stays yours even after the event ends, and even if the achievement list is later reset or restored from a backup.
    for (const def of newly) { if (def.rewardTheme) grantTheme(def.rewardTheme); }
    // roll the XP for each new unlock and remember it
    const xpLog = store.get('achievementXp') || {};
    const rolls = {};
    for (const def of newly) { rolls[def.id] = rollXp(); xpLog[def.id] = rolls[def.id].xp; }
    if (newly.length > 0) store.set('achievementXp', xpLog);
    let xpRunning = totalXp(unlocked) - newly.reduce((s, d) => s + rolls[d.id].xp, 0);
    for (const def of newly) {
        if (def.rewardRestores) addRestores(def.rewardRestores);
        maybeRenewStreak();
        const before = levelInfo(xpRunning).level;
        xpRunning += rolls[def.id].xp;
        const after = levelInfo(xpRunning).level;
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('meta-achievement-unlocked', {
                xp: rolls[def.id].xp,
                xpBoosted: rolls[def.id].boosted,
                xpMult: rolls[def.id].mult,
                level: after,
                leveledUp: after > before,
                id: def.id,
                name: def.name,
                desc: def.desc,
                icon: def.icon,
                rewardTheme: def.rewardTheme || null,
                rewardRestores: def.rewardRestores || 0
            });
        }
    }
    checkChallenges();
    claimLevelRewards();
    try { features.hooks.afterXp && features.hooks.afterXp(); } catch (e) { }
    return newly;
}

// A play day = a day where a tracked session starts. Streak is visible from day 1.
function updateStreakOnPlay() {
    const s = expireStreakRecoveryIfPast(getStreakState());
    const today = streakDayKey();
    if (s.lastPlayDay === today) return null;
    const yesterday = streakDayKey(Date.now() - 86400000);
    let evt = null;
    if (s.lastPlayDay === yesterday && s.current >= 1) {
        s.current += 1;
        evt = { current: s.current, previous: s.current - 1, restored: false };
    } else {
        // gap: a streak of 3+ can be renewed within 5 days by earning any achievement
        if (s.current >= 3) s.recovery = { activeUntil: streakDayKey(Date.now() + 5 * 86400000), previousStreak: s.current };
        s.current = 1;
        evt = { current: s.current, previous: 0, restored: false };
    }
    if (s.current > s.best) s.best = s.current;
    s.lastPlayDay = today;
    store.set('streak', s);
    return evt;
}

function maybeRenewStreak() {
    const s = expireStreakRecoveryIfPast(getStreakState());
    if (s.recovery && s.recovery.activeUntil && streakDayKey() <= s.recovery.activeUntil) {
        s.current = Math.max(s.current, s.recovery.previousStreak);
        if (s.current > s.best) s.best = s.current;
        s.recovery = { activeUntil: null, previousStreak: 0 };
        store.set('streak', s);
        if (s.lastPlayDay === streakDayKey() && s.current >= 3 && mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('streak-updated', { current: s.current, previous: 1, restored: true });
        }
        return true;
    }
    return false;
}

ipcMain.handle('get-meta-achievements', (event, opts) => {
    const librarySize = opts && typeof opts.librarySize === 'number' ? opts.librarySize : (store.get('lastLibrarySize') || 0);
    if (opts && typeof opts.librarySize === 'number') store.set('lastLibrarySize', librarySize);
    // process unlocks on every refresh (boot, library sync, shop open) - not just on theme apply
    checkAchievements(librarySize);
    const stats = collectStats(librarySize);
    const unlocked = store.get('metaAchievements') || {};
    return { achievements: buildAchievementList(stats, unlocked), streak: expireStreakRecoveryIfPast(getStreakState()), stats, events: eventsSummary(unlocked), unlockedThemes: Object.keys(store.get('themeUnlocks') || {}), level: levelInfo(totalXp(unlocked)), xpBoost: currentBoost(), restores: store.get('streakRestores') || 0, restoreCap: RESTORE_CAP,
        challenges: getChallenges(), titles: buildTitles(unlocked), levelRewards: levelRewardsList(),
        prestige: store.get('prestige') || { count: 0 }, cosmetics: { frames: (store.get('cosmetics') || {}).frames || [] } };
});

// Seasonal events with how far along the user is, for the dashboard banner and the achievements window
function eventsSummary(unlocked) {
    unlocked = unlocked || store.get('metaAchievements') || {};
    return Object.keys(EVENTS).map(id => {
        const ids = ACHIEVEMENT_DEFS.filter(d => d.event === id).map(d => d.id);
        return { ...eventState(id), unlocked: ids.filter(i => unlocked[i]).length, total: ids.length };
    });
}
ipcMain.handle('get-events', () => { checkAchievements(); return eventsSummary(); });

ipcMain.handle('check-achievements', (event, opts) => {
    const librarySize = opts && typeof opts.librarySize === 'number' ? opts.librarySize : (store.get('lastLibrarySize') || 0);
    if (opts && typeof opts.librarySize === 'number') store.set('lastLibrarySize', librarySize);
    return checkAchievements(librarySize).map(def => ({ id: def.id, name: def.name, rewardTheme: def.rewardTheme || null }));
});

if (process.env.SL_DEBUG) {
    ipcMain.handle('debug-streak-tick', () => {
        const evt = updateStreakOnPlay();
        if (evt && evt.current >= 1 && mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('streak-updated', evt);
        return evt;
    });
}

// ==========================================
// 8.6.0: LEVEL REWARDS, TITLES, CHALLENGES, WISHLIST, GAME STATUS, REMINDERS, YEAR IN REVIEW, FRIEND ACTIVITY
// ==========================================

// ----- Spendable streak restores -----
ipcMain.handle('use-streak-restore', () => {
    const s = expireStreakRecoveryIfPast(getStreakState());
    const restores = store.get('streakRestores') || 0;
    if (!(s.recovery && s.recovery.activeUntil && streakDayKey() <= s.recovery.activeUntil)) return { ok: false, error: 'There is no broken streak to restore right now.' };
    if (restores < 1) return { ok: false, error: 'You have no streak restores left.' };
    store.set('streakRestores', restores - 1);
    s.current = Math.max(s.current, s.recovery.previousStreak);
    if (s.current > s.best) s.best = s.current;
    s.recovery = { activeUntil: null, previousStreak: 0 };
    store.set('streak', s);
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('streak-updated', { current: s.current, previous: 1, restored: true });
    return { ok: true, streak: s, restores: restores - 1 };
});

// ----- Level rewards: titles, avatar frames and bonus streak restores -----
const LEVEL_TITLES = [
    [1, 'newcomer', 'Newcomer'], [5, 'explorer', 'Explorer'], [10, 'adventurer', 'Adventurer'], [15, 'veteran', 'Veteran'],
    [20, 'specialist', 'Specialist'], [30, 'champion', 'Champion'], [40, 'hero', 'Hero'], [50, 'master', 'Master'],
    [60, 'elite', 'Elite'], [70, 'legend', 'Legend'], [80, 'mythic', 'Mythic'], [90, 'titan', 'Titan'], [100, 'ascended', 'Ascended']
];
const LEVEL_FRAMES = [[12, 'flame', 'Flame'], [22, 'aurora', 'Aurora'], [35, 'gold', 'Gold'], [55, 'galaxy', 'Galaxy'], [75, 'legend', 'Legendary']];
const LEVEL_RESTORES = { 25: 1, 50: 1, 75: 2, 100: 3 };

function levelRewardsList() {
    const lv = effectiveLevel(store.get('metaAchievements') || {});
    const out = [];
    LEVEL_TITLES.forEach(([level, id, name]) => out.push({ level, type: 'title', id, name, unlocked: lv >= level }));
    LEVEL_FRAMES.forEach(([level, id, name]) => out.push({ level, type: 'frame', id, name, unlocked: lv >= level }));
    Object.keys(LEVEL_RESTORES).forEach(l => out.push({ level: Number(l), type: 'restores', name: LEVEL_RESTORES[l] + ' streak restore' + (LEVEL_RESTORES[l] === 1 ? '' : 's'), amount: LEVEL_RESTORES[l], unlocked: lv >= Number(l) }));
    return out.sort((a, b) => a.level - b.level);
}
// everything the player may pick as a profile title: titles earned by level, plus the name of any unlocked achievement
function buildTitles(unlocked) {
    const lv = effectiveLevel(unlocked);
    const list = LEVEL_TITLES.filter(t => lv >= t[0]).map(t => ({ id: 'lv:' + t[1], text: t[2], source: 'level', level: t[0] }));
    ACHIEVEMENT_DEFS.forEach(d => { if (unlocked[d.id]) list.push({ id: 'ach:' + d.id, text: d.name, source: 'achievement', icon: d.icon }); });
    ((store.get('cosmetics') || {}).titles || []).forEach(t => list.push({ id: 'cos:' + t, text: t, source: 'season', icon: '🏅' }));
    return list;
}
// bonus streak restores are given once, the first time a level is reached
function claimLevelRewards() {
    const lv = effectiveLevel(store.get('metaAchievements') || {});
    let claimed = store.get('levelRewardsClaimed') || [];
    // 8.6.1 made restores scarcer: levels already reached when this version first runs count as claimed, without paying out
    if ((store.get('levelRewardsVersion') || 1) < 2) {
        claimed = Object.keys(LEVEL_RESTORES).map(Number).filter(l => l <= lv);
        store.set('levelRewardsClaimed', claimed); store.set('levelRewardsVersion', 2);
    }
    let gained = 0; const levels = [];
    for (const l of Object.keys(LEVEL_RESTORES).map(Number).sort((a, b) => a - b)) {
        if (lv < l || claimed.includes(l)) continue;
        if ((store.get('streakRestores') || 0) >= RESTORE_CAP) break; // full: the reward waits until there is room
        gained += addRestores(LEVEL_RESTORES[l]); claimed.push(l); levels.push(l);
    }
    if (!levels.length) return;
    store.set('levelRewardsClaimed', claimed);
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('level-reward', { level: levels[levels.length - 1], restores: gained });
}

// ----- Daily and weekly challenges -----
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seedFrom(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const CHALLENGE_POOL = {
    daily: [
        { id: 'two-games', text: 'Play 2 different games', max: 2, xp: 30, calc: w => w.games },
        { id: 'hour', text: 'Play for an hour', max: 60, unit: 'min', xp: 30, calc: w => Math.floor(w.sec / 60) },
        { id: 'long-session', text: 'Play one session of 45 minutes or more', max: 1, xp: 35, calc: w => w.longest >= 2700 ? 1 : 0 },
        { id: 'morning', text: 'Start a session before noon', max: 1, xp: 25, calc: w => w.morning ? 1 : 0 },
        { id: 'evening', text: 'Start a session after 6 PM', max: 1, xp: 25, calc: w => w.evening ? 1 : 0 },
        { id: 'three-sessions', text: 'Play 3 sessions', max: 3, xp: 30, calc: w => w.sessions }
    ],
    weekly: [
        { id: 'four-days', text: 'Play on 4 different days', max: 4, xp: 80, calc: w => w.days },
        { id: 'eight-hours', text: 'Play for 8 hours', max: 480, unit: 'min', xp: 90, calc: w => Math.floor(w.sec / 60) },
        { id: 'five-games', text: 'Play 5 different games', max: 5, xp: 80, calc: w => w.games },
        { id: 'long-week', text: 'Play one session of 2 hours or more', max: 1, xp: 70, calc: w => w.longest >= 7200 ? 1 : 0 },
        { id: 'ten-sessions', text: 'Play 10 sessions', max: 10, xp: 80, calc: w => w.sessions },
        { id: 'both-weekend-days', text: 'Play on both Saturday and Sunday', max: 2, xp: 90, calc: w => w.weekendDays }
    ]
};
function challengeWindow(scope, nowMs) {
    const d = new Date(nowMs);
    if (scope === 'daily') {
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        return { key: streakDayKey(nowMs), start, end: start + 86400000 };
    }
    const dow = (d.getDay() + 6) % 7; // Monday = 0
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow).getTime();
    return { key: streakDayKey(start), start, end: new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + 7).getTime() };
}
function windowActivity(start, end, history) {
    const games = new Set(), days = new Set(), weekendDays = new Set(); let sec = 0, longest = 0, sessions = 0, morning = false, evening = false;
    for (const h of history) {
        if (!(h.start >= start && h.start < end)) continue;
        const d = new Date(h.start), hr = d.getHours();
        games.add(String(h.gameId)); days.add(streakDayKey(h.start)); sessions++;
        sec += h.seconds || 0; longest = Math.max(longest, h.seconds || 0);
        if (hr < 12) morning = true;
        if (hr >= 18) evening = true;
        if (d.getDay() === 0 || d.getDay() === 6) weekendDays.add(d.getDay());
    }
    return { games: games.size, days: days.size, weekendDays: weekendDays.size, sec, longest, sessions, morning, evening };
}
function getChallenges(nowMs) {
    if (nowMs === undefined) nowMs = process.env.SL_FAKE_NOW ? (Number(process.env.SL_FAKE_NOW) || Date.now()) : Date.now();
    const history = store.get('sessionHistory') || [];
    const done = store.get('challengesDone') || {}, xpLog = store.get('challengeXp') || {};
    const out = {};
    for (const scope of ['daily', 'weekly']) {
        const win = challengeWindow(scope, nowMs);
        const rng = mulberry32(seedFrom(scope + win.key));
        const pool = CHALLENGE_POOL[scope].slice();
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
        const activity = windowActivity(win.start, win.end, history);
        out[scope] = {
            key: win.key, endsAt: win.end,
            list: pool.slice(0, 3).map(c => {
                const k = scope + ':' + win.key + ':' + c.id;
                const current = Math.min(c.max, c.calc(activity));
                return { id: c.id, key: k, text: c.text, unit: c.unit || '', max: c.max, current, baseXp: c.xp, done: !!done[k], xp: xpLog[k] || null };
            })
        };
    }
    return out;
}
function checkChallenges() {
    const ch = getChallenges();
    const done = store.get('challengesDone') || {}, xpLog = store.get('challengeXp') || {};
    const newly = [];
    for (const scope of ['daily', 'weekly']) {
        for (const c of ch[scope].list) {
            if (c.done || c.current < c.max) continue;
            const b = applyBoost(c.baseXp);
            const xp = b.xp;
            done[c.key] = Date.now(); xpLog[c.key] = xp;
            newly.push({ scope, text: c.text, xp, boosted: b.boosted, mult: b.mult });
        }
    }
    if (!newly.length) return newly;
    // keep the two logs from growing for ever: only the most recent 400 entries are needed
    const trim = (o) => { const keys = Object.keys(o); if (keys.length > 400) keys.sort().slice(0, keys.length - 400).forEach(k => delete o[k]); return o; };
    store.set('challengesDone', done); store.set('challengeXp', xpLog);
    // (trimming XP entries would take XP away, so only the "done" markers are trimmed)
    store.set('challengesDone', trim(done));
    if (mainWindow && !mainWindow.isDestroyed()) newly.forEach(n => mainWindow.webContents.send('challenge-complete', n));
    return newly;
}
ipcMain.handle('get-challenges', () => { checkChallenges(); return getChallenges(); });

// ----- Wishlist and sales -----
let wishlistMem = { at: 0, items: [], error: null };
async function loadWishlist(force) {
    const steamId = store.get('steamId');
    if (!steamId) return { ok: false, error: 'Set your SteamID in Settings first.', items: [] };
    if (!force && Date.now() - wishlistMem.at < 20 * 60 * 1000 && wishlistMem.items.length) return { ok: true, items: wishlistMem.items, at: wishlistMem.at };
    try {
        const w = await fetchApi(`https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=${steamId}`, {}, 12000);
        const ids = ((w && w.response && w.response.items) || []).map(i => Number(i.appid)).filter(Boolean);
        const items = [];
        for (let i = 0; i < ids.length; i += 40) {
            const chunk = ids.slice(i, i + 40);
            const input = { ids: chunk.map(appid => ({ appid })), context: { language: 'english', country_code: store.get('storeCountry') || 'US' }, data_request: { include_basic_info: true } };
            const d = await fetchApi('https://api.steampowered.com/IStoreBrowseService/GetItems/v1?input_json=' + encodeURIComponent(JSON.stringify(input)), {}, 15000);
            ((d && d.response && d.response.store_items) || []).forEach(it => {
                const o = it.best_purchase_option || null;
                items.push({
                    appid: String(it.appid), name: it.name || ('App ' + it.appid),
                    comingSoon: !o, free: !!it.is_free,
                    price: o ? (o.formatted_final_price || '') : '',
                    original: o && o.formatted_original_price ? o.formatted_original_price : '',
                    discount: o ? (o.discount_pct || 0) : 0,
                    cents: o ? Number(o.final_price_in_cents || 0) : 0
                });
            });
        }
        items.sort((a, b) => (b.discount - a.discount) || a.name.localeCompare(b.name));
        wishlistMem = { at: Date.now(), items, error: null };
        try { features.hooks.afterWishlist && features.hooks.afterWishlist(items); } catch (e) { }
        return { ok: true, items, at: wishlistMem.at, empty: ids.length === 0 };
    } catch (err) {
        return { ok: false, error: 'Could not load your wishlist (' + (err && err.message ? err.message : 'network error') + '). Make sure your Steam profile and game details are public.', items: wishlistMem.items };
    }
}
ipcMain.handle('get-wishlist', (event, force) => loadWishlist(!!force));

// every few hours: tell the player when something on the wishlist goes on sale (or the discount gets bigger)
async function checkWishlistSales() {
    if (store.get('wishlistAlerts') === false || !store.get('steamId')) return;
    const r = await loadWishlist(true);
    if (!r.ok || !r.items) return;
    const seen = store.get('wishlistSeen') || {};
    const fresh = [];
    for (const it of r.items) {
        if (it.discount > 0 && it.discount > (seen[it.appid] || 0)) fresh.push(it);
        seen[it.appid] = it.discount;
    }
    store.set('wishlistSeen', seen);
    if (fresh.length && mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('wishlist-sale', fresh.slice(0, 5).map(i => ({ appid: i.appid, name: i.name, discount: i.discount, price: i.price })).concat(fresh.length > 5 ? [{ more: fresh.length - 5 }] : []));
}
function scheduleWishlistChecks() {
    setTimeout(() => { checkWishlistSales().catch(() => { }); }, 90 * 1000);
    setInterval(() => { checkWishlistSales().catch(() => { }); }, 6 * 60 * 60 * 1000);
}

// ----- Game status / rating -----
ipcMain.handle('get-game-meta', () => store.get('gameMeta') || {});
ipcMain.handle('set-game-meta', (event, { appId, status, rating }) => {
    if (!/^[A-Za-z0-9_-]+$/.test(String(appId))) return false;
    const STATUSES = ['', 'playing', 'backlog', 'completed', 'dropped'];
    const all = store.get('gameMeta') || {};
    const cur = all[appId] || {};
    const next = { status: STATUSES.includes(status) ? status : (cur.status || ''), rating: Math.max(0, Math.min(5, Number(rating === undefined ? cur.rating : rating) || 0)) };
    if (!next.status && !next.rating) delete all[appId]; else all[appId] = next;
    store.set('gameMeta', all);
    return all;
});

// ----- Friend activity feed (recorded while SteamLite is open) -----
ipcMain.handle('add-friend-activity', (event, items) => {
    if (!Array.isArray(items) || !items.length) return true;
    const log = store.get('friendActivity') || [];
    items.slice(0, 20).forEach(i => log.push({ at: Date.now(), steamid: String(i.steamid || ''), name: String(i.name || '').slice(0, 60), avatar: String(i.avatar || ''), text: String(i.text || '').slice(0, 120) }));
    if (log.length > 200) log.splice(0, log.length - 200);
    store.set('friendActivity', log);
    return true;
});
ipcMain.handle('get-friend-activity', () => (store.get('friendActivity') || []).slice().reverse());
ipcMain.handle('clear-friend-activity', () => { store.set('friendActivity', []); return true; });

// ----- Play-time reminders: a break reminder every N minutes of one session, and a daily limit -----
let dailyLimitNotifiedDay = null;
function checkPlayReminders(tracking) {
    if (!mainWindow || mainWindow.isDestroyed() || !tracking.sessionStart) return;
    const now = Date.now();
    const breakMin = Number(store.get('breakReminderMin')) || 0;
    if (breakMin > 0) {
        const elapsedMin = (now - tracking.sessionStart) / 60000;
        const due = Math.floor(elapsedMin / breakMin);
        if (due > (tracking.breakNotified || 0)) {
            tracking.breakNotified = due;
            mainWindow.webContents.send('play-reminder', { kind: 'break', text: 'You have been playing ' + tracking.name + ' for ' + Math.round(elapsedMin) + ' minutes. Time for a break?' });
        }
    }
    const limitH = Number(store.get('dailyLimitHours')) || 0;
    const today = streakDayKey();
    if (limitH > 0 && dailyLimitNotifiedDay !== today) {
        const history = store.get('sessionHistory') || [];
        let sec = (now - tracking.sessionStart) / 1000;
        for (let i = history.length - 1; i >= 0 && history[i].start > now - 2 * 86400000; i--) if (streakDayKey(history[i].start) === today) sec += history[i].seconds || 0;
        if (sec >= limitH * 3600) {
            dailyLimitNotifiedDay = today;
            mainWindow.webContents.send('play-reminder', { kind: 'limit', text: 'You have reached your daily play limit of ' + limitH + ' hour' + (limitH === 1 ? '' : 's') + '.' });
        }
    }
}

// ----- Year in review -----
ipcMain.handle('get-year-review', (event, yearArg) => {
    const year = Number(yearArg) || (process.env.SL_FAKE_NOW ? new Date(Number(process.env.SL_FAKE_NOW)).getFullYear() : new Date().getFullYear());
    const from = new Date(year, 0, 1).getTime(), to = new Date(year + 1, 0, 1).getTime();
    const history = (store.get('sessionHistory') || []).filter(h => h.start >= from && h.start < to);
    const perGame = {}, days = new Set(), hours = new Array(24).fill(0), months = new Array(12).fill(0);
    let totalSec = 0, longest = null;
    history.forEach(h => {
        const sec = h.seconds || 0, d = new Date(h.start);
        totalSec += sec; days.add(streakDayKey(h.start)); hours[d.getHours()] += sec; months[d.getMonth()] += sec;
        const g = perGame[h.gameId] || (perGame[h.gameId] = { appid: String(h.gameId), name: h.name || 'Game', sec: 0, sessions: 0 });
        g.sec += sec; g.sessions++; if (h.name) g.name = h.name;
        if (!longest || sec > longest.sec) longest = { name: h.name || 'Game', sec, at: h.start };
    });
    const top = Object.values(perGame).sort((a, b) => b.sec - a.sec).slice(0, 5);
    const unlocked = store.get('metaAchievements') || {};
    const achievementsThisYear = Object.keys(unlocked).filter(id => unlocked[id] >= from && unlocked[id] < to && ACHIEVEMENT_DEFS.some(d => d.id === id)).length;
    const peakHour = hours.indexOf(Math.max(...hours)), peakMonth = months.indexOf(Math.max(...months));
    const streak = getStreakState();
    return {
        year, sessions: history.length, totalSec, activeDays: days.size, top, longest, gamesPlayed: Object.keys(perGame).length,
        achievementsThisYear, achievementsTotal: ACHIEVEMENT_DEFS.filter(d => unlocked[d.id]).length, level: levelInfo(totalXp(unlocked)),
        bestStreak: streak.best || 0, peakHour: totalSec ? peakHour : null, peakMonth: totalSec ? peakMonth : null,
        userName: store.get('profiles.list.0.name') || ''
    };
});
ipcMain.handle('save-image-file', async (event, { dataUrl, defaultName }) => {
    const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
    if (!m) return { ok: false, error: 'Not a PNG image.' };
    const safe = String(defaultName || 'SteamLite-review.png').replace(/[^\w.\- ]/g, '_');
    const r = await dialog.showSaveDialog(mainWindow, { title: 'Save image', defaultPath: safe, filters: [{ name: 'PNG image', extensions: ['png'] }] });
    if (r.canceled || !r.filePath) return { ok: false, canceled: true };
    try { fs.writeFileSync(r.filePath, Buffer.from(m[1], 'base64')); return { ok: true, path: r.filePath }; }
    catch (err) { return { ok: false, error: err.message }; }
});

// ----- "Install when I quit SteamLite" -----
let updateOnQuit = false;
ipcMain.handle('update-on-quit', () => {
    if (!lastUpdateInfo) return { ok: false, error: 'No update available.' };
    if (!updaterExePath()) return { ok: false, error: 'The SteamLite Updater is not installed.' };
    updateOnQuit = true;
    return { ok: true };
});
function launchUpdaterAfterQuit() {
    const exe = updaterExePath();
    if (!exe) return;
    const args = ['--current', APP_VERSION, '--dir', path.dirname(process.execPath), '--auto'];
    if (store.get('updateChannel') === 'beta') args.push('--channel', 'beta');
    try { const child = spawn(exe, args, { detached: true, stdio: 'ignore', cwd: path.dirname(exe) }); child.on('error', () => { }); child.unref(); } catch (e) { }
}

// PROFILE SYSTEM - multiple logins, saved once, switch instantly
function getProfiles() {
    const p = store.get('profiles');
    if (!p || !Array.isArray(p.list)) return { list: [], activeId: null, data: {} };
    if (!p.data) p.data = {};
    return p;
}

// telemetry/achievementCache are per-user: park the current slices under the old
// profile and load the new profile's slices into the live keys
function swapPerUserData(newId, prevId) {
    if (prevId && prevId !== newId) {
        store.set(`profiles.data.${prevId}.telemetry`, store.get('telemetry') || {});
        store.set(`profiles.data.${prevId}.achievementCache`, store.get('achievementCache') || {});
    }
    store.set('telemetry', store.get(`profiles.data.${newId}.telemetry`) || {});
    store.set('achievementCache', store.get(`profiles.data.${newId}.achievementCache`) || {});
}

ipcMain.handle('get-profiles', async () => {
    const p = getProfiles();
    const apiKey = store.get('apiKey');
    const steamId = store.get('steamId');
    // bootstrap: fold the existing login into the profile list on first run
    if (apiKey && steamId && !p.list.some(x => x.steamId === steamId)) {
        p.list.push({ steamId, apiKey, name: '', avatar: '', addedAt: Date.now() });
        p.activeId = steamId;
        store.set('profiles', p);
    }
    // fill in names/avatars once via the API
    const need = p.list.filter(x => !x.name);
    if (need.length > 0) {
        await Promise.all(need.map(async (prof) => {
            try {
                const d = await fetchApi(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${prof.apiKey}&steamids=${prof.steamId}`, {}, 5000);
                const u = d.response.players[0];
                if (u) {
                    const normalized = normalizeKnownPlayer(u);
                    prof.name = normalized.personaname;
                    prof.avatar = normalized.avatarfull;
                }
                else prof.name = prof.steamId;
            } catch (err) { prof.name = prof.steamId; }
        }));
        store.set('profiles', p);
    }
    return { profiles: p.list, activeId: p.activeId };
});

ipcMain.handle('add-profile', async (event, { steamId, apiKey }) => {
    if (!steamId || !apiKey) return { ok: false, error: 'SteamID64 and API key are required.' };
    try {
        const data = await fetchApi(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`, {}, 8000);
        const u = normalizeKnownPlayer(data.response.players[0]);
        if (!u) return { ok: false, error: 'Login failed. Check the SteamID64 and API key.' };
        const p = getProfiles();
        const existing = p.list.find(x => x.steamId === steamId);
        if (existing) {
            existing.apiKey = apiKey; existing.name = u.personaname; existing.avatar = u.avatarfull;
        } else {
            p.list.push({ steamId, apiKey, name: u.personaname, avatar: u.avatarfull, addedAt: Date.now() });
        }
        const prevId = p.activeId !== steamId ? p.activeId : null;
        p.activeId = steamId;
        store.set('profiles', p);
        store.set('apiKey', apiKey);
        store.set('steamId', steamId);
        swapPerUserData(steamId, prevId);
        return { ok: true };
    } catch (err) {
        return { ok: false, error: 'Login failed. Check the SteamID64 and API key.' };
    }
});

ipcMain.handle('switch-profile', (event, steamId) => {
    const p = getProfiles();
    const prof = p.list.find(x => x.steamId === steamId);
    if (!prof || steamId === p.activeId) return false;
    const prevId = p.activeId;
    p.activeId = steamId;
    store.set('profiles', p);
    store.set('apiKey', prof.apiKey);
    store.set('steamId', steamId);
    swapPerUserData(steamId, prevId);
    return true;
});

ipcMain.handle('remove-profile', (event, steamId) => {
    const p = getProfiles();
    if (steamId === p.activeId) return false;
    p.list = p.list.filter(x => x.steamId !== steamId);
    store.set('profiles', p);
    store.delete(`profiles.data.${steamId}`);
    return true;
});

ipcMain.handle('logout-profile', () => {
    const p = getProfiles();
    p.activeId = null;
    store.set('profiles', p);
    store.set('apiKey', '');
    store.set('steamId', '');
    store.set('devLicense', { active: false, steamId: '', name: '', avatar: '', activatedAt: 0 });
    return true;
});

ipcMain.handle('activate-dev-license', async (event, { apiKey, steamId }) => {
    if (!apiKey || !steamId) {
        return { ok: false, error: 'Steam Web API key and SteamID64 are required.' };
    }
    if (String(steamId) !== OWNER_STEAM_ID) {
        return { ok: false, error: 'this user doesnt have an active Developer licence, please try again later.' };
    }
    try {
        const profiles = await resolveSteamProfiles(apiKey, [steamId]);
        const user = profiles[0];
        if (!user || String(user.steamid) !== OWNER_STEAM_ID) {
            return { ok: false, error: 'this user doesnt have an active Developer licence, please try again later.' };
        }
        const license = {
            active: true,
            steamId: user.steamid,
            name: user.personaname,
            avatar: user.avatarfull || '',
            activatedAt: Date.now()
        };
        store.set('devLicense', license);
        return { ok: true, license };
    } catch (err) {
        return { ok: false, error: 'this user doesnt have an active Developer licence, please try again later.' };
    }
});

// Process listing: wmic (fast) with a PowerShell CIM fallback for systems where wmic has been removed
// (e.g. Windows 11 24H2+). BUG FIX: ExecutablePath must come before ProcessId here so each CSV row
// ends with the PID, matching the trailing-digit regex below that both code paths share - with
// ProcessId first (the old order), every row ended in the exe path instead of a number, so the
// regex never matched and a launched game was never detected as running (Play button stuck loading).
let processListMode = null; // null = undetected, 'wmic' | 'cim'
const CIM_COMMAND = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Select-Object ExecutablePath,ProcessId | ConvertTo-Csv -NoTypeInformation"';
let processListBusy = false;
function getProcessList(rawCallback) {
    // never let a slow process listing overlap the next poll - on a weak CPU the CIM query can take
    // longer than the poll interval, which used to stack up PowerShell processes
    if (processListBusy) return;
    processListBusy = true;
    const callback = (out) => { processListBusy = false; rawCallback(out); };
    if (processListMode !== 'cim') {
        exec('wmic process get processid,executablepath,name', { windowsHide: true }, (err, stdout) => {
            if (!err && stdout && stdout.trim()) {
                processListMode = 'wmic';
                return callback(stdout);
            }
            processListMode = 'cim';
            exec(CIM_COMMAND, { windowsHide: true }, (err2, out2) => callback(err2 ? '' : out2));
        });
    } else {
        exec(CIM_COMMAND, { windowsHide: true }, (err2, out2) => callback(err2 ? '' : out2));
    }
}

function setDiscordGameActivity(gameId, name) {
    if (!store.get('discordRpcEnabled') || !discordRPCClient || !discordReady) return;
    const isSteamGame = /^\d+$/.test(String(gameId));
    discordRPCClient.setActivity({
        details: `Playing ${name}`,
        state: 'In-Game',
        startTimestamp: Date.now(),
        largeImageKey: isSteamGame ? `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/header.jpg` : DISCORD_CLIENT_ID,
        largeImageText: `${name} | SteamLite ${APP_VERSION}`,
        instance: false
    }).catch(err => console.error('Failed to set Discord activity:', err.message));
}

function finalizeSession(tracking, countLaunch = true) {
    clearInterval(tracking.interval);
    if (tracking.ghostProcess) tracking.ghostProcess.kill();

    // Steam achievements earned during the session renew a lost streak
    if (typeof tracking.achBaseline === 'number' && store.get('apiKey') && /^\d+$/.test(String(tracking.gameId))) {
        fetchApi(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${store.get('apiKey')}&steamid=${store.get('steamId')}&appid=${tracking.gameId}`, {}, 8000)
            .then(d => {
                const now = (d.playerstats.achievements || []).filter(a => a.achieved === 1).length;
                if (now > tracking.achBaseline) maybeRenewStreak();
            })
            .catch(() => { });
    }
    checkAchievements();

    const sessionSeconds = tracking.sessionStart ? Math.floor((Date.now() - tracking.sessionStart) / 1000) : 0;
    if (sessionSeconds > 0) {
        const telemetry = store.get('telemetry') || {};
        if (!telemetry[tracking.gameId]) telemetry[tracking.gameId] = { playtime: 0, launches: 0, lastPlayed: 0 };
        telemetry[tracking.gameId].playtime += sessionSeconds;
        if (countLaunch) telemetry[tracking.gameId].launches += 1;
        telemetry[tracking.gameId].lastPlayed = Date.now();
        store.set('telemetry', telemetry);

        const history = store.get('sessionHistory') || [];
        history.push({ gameId: tracking.gameId, name: tracking.name, start: tracking.sessionStart, seconds: sessionSeconds });
        if (history.length > 5000) history.splice(0, history.length - 5000);
        store.set('sessionHistory', history);

        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('game-status', { appId: tracking.gameId, status: 'stopped', telemetry: telemetry[tracking.gameId] });
    } else if (countLaunch && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('game-status', { appId: tracking.gameId, status: 'stopped' });
    }
    if (discordRPCClient && discordReady) {
        discordRPCClient.clearActivity().catch(() => { });
    }
    try { features.hooks.onGameStopped && features.hooks.onGameStopped(tracking); } catch (e) { }
    activeGameTracking = null;
    buildTrayMenu();
}

function stopActiveGame() {
    if (!activeGameTracking) return false;
    const tracking = activeGameTracking;
    if (tracking.pids.length > 0) {
        tracking.pids.forEach(pid => {
            try { exec(`taskkill /F /T /PID ${pid}`); } catch (e) { }
        });
        // the tracking interval finalizes the session once the processes are gone
    } else {
        finalizeSession(tracking);
    }
    return true;
}

async function executeLaunch({ gameId, installdir, commonPath, name }) {
    if (activeGameTracking) return false;

    const configs = store.get('gameConfigs') || {};
    const config = configs[gameId] || {};
    try { features.hooks.beforeLaunch && features.hooks.beforeLaunch(config); } catch (e) { }

    if (config.exePath && fs.existsSync(config.exePath)) {
        const argString = config.args || '';
        const argsArray = argString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const cleanArgs = argsArray.map(arg => arg.replace(/^"(.*)"$/, '$1'));
        if (config.admin) {
            // "Run as administrator": Start-Process -Verb RunAs shows the Windows permission prompt, then starts the game
            const q = (v) => "'" + String(v).replace(/'/g, "''") + "'";
            const argPart = cleanArgs.length ? ' -ArgumentList @(' + cleanArgs.map(q).join(',') + ')' : '';
            spawn('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', 'Start-Process -FilePath ' + q(config.exePath) + argPart + ' -WorkingDirectory ' + q(path.dirname(config.exePath)) + ' -Verb RunAs'], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
        } else {
            spawn(config.exePath, cleanArgs, { cwd: path.dirname(config.exePath), detached: true });
        }
    } else {
        // Boot Steam with -silent so no launcher/library window appears, and hand the
        // game (plus its launch options) straight to it via -applaunch
        const argString = config.args || '';
        const argsArray = argString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const cleanArgs = argsArray.map(arg => arg.replace(/^"(.*)"$/, '$1'));
        try {
            spawn(getSteamExePath(), ['-silent', '-applaunch', String(gameId), ...cleanArgs], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
        } catch (e) {
            shell.openExternal(`steam://rungameid/${gameId}`);
        }
    }

    // Safety net: if Steam still flashes a window (e.g. it was mid-boot), close it the
    // instant it appears - but only for the first 25 seconds, then this exits by itself
    const psScript = `
        Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win { [DllImport("user32.dll")] public static extern IntPtr FindWindow(string lpClassName, string lpWindowName); [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam); }'
        $deadline = (Get-Date).AddSeconds(25)
        while((Get-Date) -lt $deadline) {
            $steam = [Win]::FindWindow("Steam", "Steam")
            if($steam -ne [IntPtr]::Zero) { [Win]::PostMessage($steam, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null }
            Start-Sleep -Milliseconds ${store.get('potatoMode') ? 100 : 25}
        }
    `;
    const ghostProcess = spawn('powershell.exe', ['-Command', psScript], { windowsHide: true });

    activeGameTracking = { gameId, ghostProcess, pids: [], sessionStart: null, interval: null, launchedAt: Date.now(), isCustomExe: !!(config.exePath), name: name || 'Game' };
    const trackingString = activeGameTracking.isCustomExe ? path.basename(config.exePath).toLowerCase() : installdir.toLowerCase();

    activeGameTracking.interval = setInterval(() => {
        getProcessList((stdout) => {
            const tracking = activeGameTracking;
            if (!tracking) return;
            const lines = (stdout || '').split('\n');
            let foundPids = [];
            lines.forEach(line => {
                if (line.toLowerCase().includes(trackingString)) {
                    const match = line.match(/(\d+)\s*"?\s*$/);
                    if (match) foundPids.push(match[1]);
                }
            });
            tracking.pids = foundPids;
            if (tracking.sessionStart && foundPids.length > 0) checkPlayReminders(tracking);
            if (foundPids.length > 0 && !tracking.sessionStart) {
                tracking.sessionStart = Date.now();
                try { features.hooks.onSessionStart && features.hooks.onSessionStart(tracking, (store.get('gameConfigs') || {})[gameId] || {}); } catch (e) { }
                if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('game-status', { appId: gameId, status: 'running', name: tracking.name });
                setDiscordGameActivity(gameId, tracking.name);

                // new play day -> streak increment (celebration from day 3)
                const streakEvt = updateStreakOnPlay();
                if (streakEvt && streakEvt.current >= 1 && mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('streak-updated', streakEvt);
                }
                checkAchievements();

                // baseline for detecting Steam achievements earned during this session (streak renewal)
                tracking.achBaseline = null;
                if (store.get('apiKey') && /^\d+$/.test(String(gameId))) {
                    fetchApi(`https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${store.get('apiKey')}&steamid=${store.get('steamId')}&appid=${gameId}`, {}, 8000)
                        .then(d => { if (activeGameTracking === tracking) tracking.achBaseline = (d.playerstats.achievements || []).filter(a => a.achieved === 1).length; })
                        .catch(() => { });
                }
            } else if (foundPids.length === 0 && tracking.sessionStart) {
                finalizeSession(tracking);
            } else if (foundPids.length === 0 && !tracking.sessionStart && Date.now() - tracking.launchedAt > LAUNCH_IDLE_TIMEOUT) {
                // Game never started (launch failed or cancelled) - stop tracking and clean up
                finalizeSession(tracking, false);
            }
        });
    }, store.get('potatoMode') ? 5000 : 2000); // Potato Mode polls the process list less often
    return true;
}

ipcMain.handle('launch-game', async (event, data) => {
    return await executeLaunch(data);
});

ipcMain.handle('stop-game', async (event, { gameId }) => {
    if (activeGameTracking && activeGameTracking.gameId === String(gameId)) {
        return stopActiveGame();
    }
    return false;
});

ipcMain.handle('get-telemetry', () => store.get('telemetry'));

ipcMain.handle('get-screenshots', async (event, { steamId, gameId }) => {
    if (!steamId || !gameId) return [];
    try {
        const accountId = BigInt(steamId) - 76561197960265728n;
        const steamBase = getSteamBasePath();
        const screenshotPath = path.join(steamBase, 'userdata', accountId.toString(), '760', 'remote', String(gameId), 'screenshots');
        const screenshots = [];
        if (fs.existsSync(screenshotPath)) {
            const files = fs.readdirSync(screenshotPath)
                .filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'))
                .map(f => ({ f, m: fs.statSync(path.join(screenshotPath, f)).mtimeMs }))
                .sort((a, b) => b.m - a.m)
                .slice(0, 60);
            for (const { f } of files) {
                screenshots.push(`steamlite://shot/${accountId}/${gameId}/${encodeURIComponent(f)}`);
            }
        }
        return screenshots;
    } catch (err) { return []; }
});

ipcMain.handle('get-session-history', () => store.get('sessionHistory') || []);

// AUTO-UPDATE: download the release installer and run it silently
let lastUpdateInfo = null;
let lastUpdateInstaller = null;

function deriveUpdateAssetUrl(version, pageUrl, channelUrl) {
    if (pageUrl && /\.exe(\?|$)/i.test(pageUrl)) return pageUrl;
    const m = (channelUrl || '').match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\//);
    const repo = m ? `${m[1]}/${m[2]}` : 'imnotfisy/SteamLite';
    return `https://github.com/${repo}/releases/download/v${version}/SteamLite.Setup.${version}.exe`;
}

function downloadFile(url, dest, onProgress) {
    return new Promise((resolve, reject) => {
        const follow = (u, depth) => {
            if (depth > 5) return reject(new Error('Too many redirects'));
            const mod = u.startsWith('http://') ? http : https;
            const req = mod.get(u, { headers: { 'User-Agent': 'SteamLite-Updater' }, timeout: 120000 }, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    res.resume();
                    return follow(new URL(res.headers.location, u).href, depth + 1);
                }
                if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
                const total = parseInt(res.headers['content-length'] || '0', 10);
                let loaded = 0;
                let lastSent = -1;
                const out = fs.createWriteStream(dest);
                res.on('data', (chunk) => {
                    loaded += chunk.length;
                    if (total) {
                        const pct = Math.floor((loaded / total) * 100);
                        if (pct !== lastSent) { lastSent = pct; onProgress(pct); }
                    }
                });
                res.on('error', reject);
                out.on('error', reject);
                out.on('finish', () => resolve({ path: dest, size: loaded }));
                res.pipe(out);
            });
            req.on('timeout', () => req.destroy(new Error('Download timed out')));
            req.on('error', reject);
        };
        follow(url, 0);
    });
}

// The stand-alone updater (source: SteamLite_source/updater) is installed next to SteamLite.exe. It
// downloads and installs updates in its own window, even when this app is broken or can't reach GitHub.
function updaterExePath() {
    if (process.platform !== 'win32') return null;
    // its own folder, outside the install folder, so SteamLite updates never have to replace a running updater.
    // An "all users" install puts it under ProgramData (the installer's shell folders point there), a "just me"
    // install under the user's AppData\Local - so look in both.
    const candidates = [
        path.join(process.env.LOCALAPPDATA || '', 'SteamLite Updater', 'SteamLite Updater.exe'),
        path.join(process.env.ProgramData || process.env.ALLUSERSPROFILE || '', 'SteamLite Updater', 'SteamLite Updater.exe'),
        path.join(path.dirname(process.execPath), 'SteamLite Updater.exe')
    ];
    return candidates.find(p => p && fs.existsSync(p)) || null;
}

// Starts the updater (detached, so it outlives this app) and quits SteamLite - the updater needs the
// app closed to replace its files. Returns false when the updater isn't installed.
function launchUpdater() {
    const exe = updaterExePath();
    if (!exe) return false;
    const args = ['--current', APP_VERSION, '--dir', path.dirname(process.execPath)];
    if (store.get('updateChannel') === 'beta') args.push('--channel', 'beta');
    try {
        const child = spawn(exe, args, { detached: true, stdio: 'ignore', cwd: path.dirname(exe) });
        child.on('error', () => {});
        child.unref();
    } catch (e) { return false; }
    isQuiting = true;
    setTimeout(() => app.quit(), 400);
    return true;
}

ipcMain.handle('open-updater', () => {
    return launchUpdater() ? { ok: true } : { ok: false, error: 'The updater is not installed. Install the latest SteamLite once to get it.' };
});

ipcMain.handle('install-update', async () => {
    if (!lastUpdateInfo) return { ok: false, error: 'No update available.' };
    if (launchUpdater()) return { ok: true, updater: true };
    try {
        const assetUrl = deriveUpdateAssetUrl(lastUpdateInfo.version, lastUpdateInfo.url, lastUpdateInfo.channelUrl);
        const dest = path.join(app.getPath('temp'), `SteamLite.Setup.${lastUpdateInfo.version}.exe`);
        const info = await downloadFile(assetUrl, dest, (pct) => {
            if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('update-download-progress', { percent: pct });
        });
        if (info.size < 20 * 1024 * 1024) return { ok: false, error: 'Downloaded file looks invalid.' };
        lastUpdateInstaller = dest;
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('update-ready', { version: lastUpdateInfo.version });
        return { ok: true };
    } catch (err) {
        return { ok: false, error: `Download failed: ${err.message}` };
    }
});

ipcMain.handle('restart-for-update', () => {
    if (!lastUpdateInstaller || !fs.existsSync(lastUpdateInstaller)) return false;
    // The installer asks for admin rights, so it has to be started through the Windows shell
    // (`start` = ShellExecute, which can show the UAC prompt) - Node's spawn() can't elevate.
    // It also has to start AFTER this app has quit (so the installer can overwrite SteamLite.exe),
    // which means a helper that outlives us. Two Windows/Node gotchas decide how that helper is made:
    //  - a normal child is placed in a job object that Windows kills when we exit, so it must be `detached`
    //  - a `detached` powershell.exe never starts (no console) - but `cmd.exe` does, so use cmd + ping as the delay
    // (An earlier PowerShell-based helper silently died every time, so the installer never opened.)
    try {
        const cmdLine = `"ping -n 4 127.0.0.1 >nul & start "" "${lastUpdateInstaller}""`;
        const helper = spawn('cmd.exe', ['/d', '/s', '/c', cmdLine], { detached: true, stdio: 'ignore', windowsHide: true, windowsVerbatimArguments: true });
        helper.on('error', () => { shell.openPath(lastUpdateInstaller); });
        helper.unref();
    } catch (e) {
        shell.openPath(lastUpdateInstaller);
    }
    isQuiting = true;
    setTimeout(() => app.quit(), 300);
    return true;
});

// UPDATE LOGIC
function compareVersions(v1, v2) {
    const parts1 = v1.split('-')[0].split('.').map(Number);
    const parts2 = v2.split('-')[0].split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
        if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
    }
    const isV1Beta = v1.includes('beta');
    const isV2Beta = v2.includes('beta');
    if (isV1Beta && !isV2Beta) return -1;
    if (!isV1Beta && isV2Beta) return 1;
    if (isV1Beta && isV2Beta) {
        // "9.0.0-beta" is beta 1, "9.0.0-beta.2" is beta 2
        const no = (v) => { const mm = /beta[.-]?(\d+)/i.exec(v); return mm ? Number(mm[1]) : 1; };
        if (no(v1) !== no(v2)) return no(v1) > no(v2) ? 1 : -1;
    }
    return 0;
}

// The "update available" message is only delivered once the page has said it is listening. Before, it was
// sent once, 3 seconds after launch - on a slower PC the window often hadn't finished loading by then, so the
// message was lost and the update never showed up.
let rendererUpdatesReady = false;
let updateNotifiedVersion = null;
let lastUpdateCheckFailed = false;

function notifyUpdate() {
    if (!lastUpdateInfo || !rendererUpdatesReady || !mainWindow || mainWindow.isDestroyed()) return;
    if (updateNotifiedVersion === lastUpdateInfo.version) return;
    updateNotifiedVersion = lastUpdateInfo.version;
    mainWindow.webContents.send('update-available', {
        version: lastUpdateInfo.version,
        url: lastUpdateInfo.url,
        notes: lastUpdateInfo.notes,
        currentVersion: APP_VERSION
    });
}

ipcMain.handle('updates-renderer-ready', () => {
    rendererUpdatesReady = true;
    updateNotifiedVersion = null; // a freshly loaded page hasn't been told about any update yet
    notifyUpdate();
    return true;
});

// Primary source, then a fallback through the GitHub API in case raw.githubusercontent.com is blocked
// or flaky on the user's network.
function updateSources(channel) {
    // Betas live in the main repo as pre-releases; the beta channel reads version-beta.json, stable reads version.json
    const file = channel === 'beta' ? 'version-beta.json' : 'version.json';
    return [
        { url: `https://raw.githubusercontent.com/imnotfisy/SteamLite/refs/heads/main/${file}`, headers: { 'User-Agent': 'SteamLite' } },
        { url: `https://api.github.com/repos/imnotfisy/SteamLite/contents/${file}?ref=main`, headers: { 'User-Agent': 'SteamLite', 'Accept': 'application/vnd.github.raw+json' } }
    ];
}

async function checkForUpdates(silent = false) {
    const channel = store.get('updateChannel') || 'stable';
    lastUpdateCheckFailed = false;
    let data = null, url = null, lastErr = null;
    for (const src of updateSources(channel)) {
        try { data = await fetchApi(src.url, src.headers); url = src.url; break; }
        catch (err) { lastErr = err; console.error('Update check failed (' + src.url + '):', err && err.message); }
    }
    if (!data) {
        lastUpdateCheckFailed = true;
        if (!silent) {
            const why = lastErr && (lastErr.code || lastErr.message) ? ` (${lastErr.code || lastErr.message})` : '';
            return `Update check failed${why}. Check your internet connection, firewall or antivirus.`;
        }
        return null;
    }
    if (data.version && compareVersions(String(data.version), APP_VERSION) > 0) {
        // "Skip this version": automatic checks stay quiet about it (a manual check still shows it)
        if (silent && String(data.version) === store.get('skippedUpdateVersion')) return null;
        lastUpdateInfo = { version: data.version, url: data.downloadUrl || `https://github.com/imnotfisy/SteamLite/releases`, channelUrl: url, notes: data.notes || data.changelog || null };
        if (!silent) updateNotifiedVersion = null; // a manual check always shows the update again
        notifyUpdate();
        return 'Update available';
    }
    return silent ? null : 'You are on the latest version!';
}

// Check shortly after launch (retrying a few times if the network isn't up yet, e.g. when starting with
// Windows) and then every few hours, so an app that stays open in the tray still finds new versions.
function scheduleUpdateChecks() {
    let attempts = 0;
    const startup = async () => {
        if (store.get('autoUpdateCheck') === false) return; // automatic checks switched off
        await checkForUpdates(true);
        if (lastUpdateCheckFailed && ++attempts < 4) setTimeout(startup, 45 * 1000);
    };
    setTimeout(startup, 3000);
    setInterval(() => { if (store.get('autoUpdateCheck') !== false) checkForUpdates(true); }, 4 * 60 * 60 * 1000);
}

ipcMain.handle('check-updates', async () => {
    return await checkForUpdates(false);
});
