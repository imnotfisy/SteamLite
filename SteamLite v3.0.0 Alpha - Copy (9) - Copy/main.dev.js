const { app, BrowserWindow, ipcMain, shell, Tray, Menu, dialog, nativeImage, globalShortcut, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec, execSync, spawn } = require('child_process');
const Store = require('electron-store');

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

const NON_GAME_APPIDS = new Set(['228980', '228985', '243750', '243730', '17510', '17515', '17520', '17530', '427520', '43110', '211', '218', '250820', '705']);

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
        discordRpcEnabled: true
    }
});

let mainWindow;
let activeGameTracking = null;
let tray = null;
let isQuiting = false;

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

async function getLocalGames() {
    const primarySteamPath = 'C:\\Program Files (x86)\\Steam\\steamapps';
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
                        if (NON_GAME_APPIDS.has(id)) continue;
                        games.push({ id, name: nameMatch[1], installdir: dirMatch[1], commonPath: path.join(steamPath, 'common'), installed: true });
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
        const { contextBridge, ipcRenderer } = require('electron');
        contextBridge.exposeInMainWorld('electronAPI', {
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
            getNews: (appId) => ipcRenderer.invoke('get-news', appId),
            getExternalNews: () => ipcRenderer.invoke('get-external-news'),
            markChangelogSeen: () => ipcRenderer.invoke('mark-changelog-seen'),
            browseLocalFiles: (data) => ipcRenderer.invoke('browse-local-files', data),
            getScreenshots: (data) => ipcRenderer.invoke('get-screenshots', data),
            launchGame: (data) => ipcRenderer.invoke('launch-game', data),
            stopGame: (data) => ipcRenderer.invoke('stop-game', data),
            installGame: (gameId) => ipcRenderer.invoke('install-game', gameId),
            uninstallGame: (gameId) => ipcRenderer.invoke('uninstall-game', gameId),
            verifyGame: (gameId) => ipcRenderer.invoke('verify-game', gameId),
            getTelemetry: () => ipcRenderer.invoke('get-telemetry'),
            checkUpdates: () => ipcRenderer.invoke('check-updates'),
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
            resetTheme: () => ipcRenderer.invoke('reset-theme')
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
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.dev.html');

    if (iconPath) {
        tray = new Tray(iconPath);
        tray.setToolTip('SteamLite 6.0.5');
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
        if (!isQuiting && tray) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    const cacheDir = path.join(app.getPath('userData'), 'image_cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    protocol.handle('steamlite', async (request) => {
        const appId = request.url.replace('steamlite://cache/', '');
        const filePath = path.join(cacheDir, `${appId}.jpg`);

        if (fs.existsSync(filePath)) {
            return net.fetch(`file://${filePath}`);
        } else {
            try {
                const res = await net.fetch(`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`);
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
                    return new Response(Buffer.from(arrayBuffer), { headers: { 'Content-Type': 'image/jpeg' } });
                }
            } catch (e) {
                return new Response('', { status: 404 });
            }
        }
        return new Response('', { status: 404 });
    });

    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    globalShortcut.register('CommandOrControl+Alt+G', () => {
        if (mainWindow) mainWindow.webContents.send('show-quick-launch');
    });

    globalShortcut.register('CommandOrControl+K', () => {
        if (mainWindow) mainWindow.webContents.send('show-command-palette');
    });

    globalShortcut.register('CommandOrControl+Alt+X', () => {
        if (activeGameTracking) {
            const tracked = activeGameTracking;
            if (tracked.pids.length > 0) {
                tracked.pids.forEach(pid => {
                    try { exec(`taskkill /F /T /PID ${pid}`); } catch (e) { }
                });
            } else {
                clearInterval(tracked.interval);
                if (tracked.ghostProcess) tracked.ghostProcess.kill();

                const sessionSeconds = tracked.sessionStart ? Math.floor((Date.now() - tracked.sessionStart) / 1000) : 0;
                const telemetry = store.get('telemetry') || {};
                if (!telemetry[tracked.gameId]) telemetry[tracked.gameId] = { playtime: 0, launches: 0, lastPlayed: 0 };
                telemetry[tracked.gameId].playtime += sessionSeconds;
                telemetry[tracked.gameId].launches += 1;
                telemetry[tracked.gameId].lastPlayed = Date.now();
                store.set('telemetry', telemetry);

                activeGameTracking = null;
                if (mainWindow) mainWindow.webContents.send('game-status', { appId: tracked.gameId, status: 'stopped', telemetry: telemetry[tracked.gameId] });
                buildTrayMenu();
            }
        }
    });

    setTimeout(checkForUpdates, 3000);
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('before-quit', () => {
    isQuiting = true;
    if (tray) {
        tray.destroy();
        tray = null;
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-close', () => { if (mainWindow) mainWindow.close(); });

ipcMain.handle('open-external', (event, url) => {
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
        discordRpcEnabled: store.get('discordRpcEnabled')
    };
});

ipcMain.handle('save-config', (event, config) => {
    store.set('apiKey', config.apiKey);
    store.set('steamId', config.steamId);
    store.set('familyIds', config.familyIds);
    store.set('accentColor', config.accentColor);
    store.set('wideGrid', config.wideGrid);
    store.set('soundVolume', config.soundVolume);
    if (config.updateChannel) store.set('updateChannel', config.updateChannel);
    store.set('bgPath', config.bgPath || '');
    store.set('bgBlur', config.bgBlur || 0);
    store.set('bgOpacity', config.bgOpacity || 1);
    store.set('bgSpeed', config.bgSpeed || 1);
    store.set('discordRpcEnabled', config.discordRpcEnabled !== undefined ? config.discordRpcEnabled : true);
    return true;
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
    if (!store.get('discordRpcEnabled')) return true; // Respect user setting
    if (discordRPCClient && discordReady) {
        discordRPCClient.setActivity({
            details: data.details,
            state: data.state,
            startTimestamp: data.startTimestamp || undefined,
            largeImageKey: DISCORD_CLIENT_ID,
            largeImageText: 'SteamLite 6.0.5',
            instance: false
        }).catch(err => console.error('Failed to set Discord activity:', err.message));
    }
    return true;
});

function fetchApi(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = { headers: headers };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

ipcMain.handle('scan-local-games', async () => {
    return await getLocalGames();
});

ipcMain.handle('sync-api', async (event, { apiKey, steamId, familyIds }) => {
    const ownedUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true`;
    try {
        const ownedData = await fetchApi(ownedUrl);
        const ownedGames = (ownedData.response.games || []).filter(g => !NON_GAME_APPIDS.has(String(g.appid)));
        let sharedGames = [];
        const famArray = familyIds.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
        for (const famId of famArray) {
            const famUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${famId}&format=json&include_appinfo=true`;
            try {
                const famData = await fetchApi(famUrl);
                const famGames = (famData.response.games || []).filter(g => !NON_GAME_APPIDS.has(String(g.appid))).map(g => ({ ...g, isShared: true, ownerId: famId }));
                sharedGames = sharedGames.concat(famGames);
            } catch (e) { }
        }
        return { ownedGames, sharedGames };
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
            summary: summaryData.response.players[0] || null,
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
            summary: summaryData.response.players[0] || null,
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
        const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${friendIds}`;
        const profileData = await fetchApi(profileUrl);
        return profileData.response.players;
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
        return achievements.map(a => {
            const info = schema.find(s => s.name === a.apiname);
            return { name: info ? info.displayName : a.apiname, description: info ? info.description : '', icon: info ? info.icon : '', achieved: a.achieved };
        });
    } catch (err) { return []; }
});

ipcMain.handle('get-achievement-progress', async (event, { apiKey, steamId, appId }) => {
    const cache = store.get('achievementCache') || {};
    const cached = cache[appId];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (cached && (now - cached.timestamp < oneDay)) {
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

ipcMain.handle('get-news', async (event, appId) => {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=3&maxlength=300&feeds=steam_community_announcements`;
    try {
        const data = await fetchApi(url);
        return data.appnews.newsitems || [];
    } catch (err) { return []; }
});

// ==========================================
// GITHUB NEWS & CHANGELOG LOGIC
// ==========================================
ipcMain.handle('get-external-news', async () => {
    const currentVersion = '6.0.5';
    const url = 'https://raw.githubusercontent.com/imnotfisy/SteamLite/main/news.json';
    try {
        const data = await fetchApi(url);
        const lastSeen = store.get('lastSeenChangelogVersion');
        let showChangelog = false;

        if (data.changelog && data.changelog.version !== lastSeen) {
            showChangelog = true;
        }

        return { ...data, showChangelog, currentVersion };
    } catch (err) {
        return null;
    }
});

ipcMain.handle('mark-changelog-seen', () => {
    store.set('lastSeenChangelogVersion', '6.0.5');
    return true;
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
    return configs[appId] || { args: '', exePath: '' };
});

ipcMain.handle('save-game-config', (event, { appId, args, exePath }) => {
    const configs = store.get('gameConfigs') || {};
    configs[appId] = { args, exePath };
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
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }] });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('add-nonsteam-game', (event, { name, exe, cover }) => {
    let nonSteam = store.get('nonSteamGames') || [];
    const appId = `ns_${Date.now()}`;
    nonSteam.push({ appid: appId, name, cover, isNonSteam: true, exePath: exe });
    store.set('nonSteamGames', nonSteam);

    const configs = store.get('gameConfigs') || {};
    configs[appId] = { args: '', exePath: exe };
    store.set('gameConfigs', configs);

    return true;
});

ipcMain.handle('remove-nonsteam-game', (event, appId) => {
    let nonSteam = store.get('nonSteamGames') || [];
    nonSteam = nonSteam.filter(g => g.appid !== appId);
    store.set('nonSteamGames', nonSteam);

    const configs = store.get('gameConfigs') || {};
    delete configs[appId];
    store.set('gameConfigs', configs);

    const covers = store.get('customCovers') || {};
    delete covers[appId];
    store.set('customCovers', covers);

    return true;
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

async function executeLaunch({ gameId, installdir, commonPath, name }) {
    if (activeGameTracking) return false;

    const configs = store.get('gameConfigs') || {};
    const config = configs[gameId] || {};

    if (config.exePath && fs.existsSync(config.exePath)) {
        const argString = config.args || '';
        const argsArray = argString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
        const cleanArgs = argsArray.map(arg => arg.replace(/^"(.*)"$/, '$1'));
        spawn(config.exePath, cleanArgs, { cwd: path.dirname(config.exePath), detached: true });
    } else {
        shell.openExternal(`steam://rungameid/${gameId}`);
    }

    const psScript = `
        Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win { [DllImport("user32.dll")] public static extern IntPtr FindWindow(string lpClassName, string lpWindowName); [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam); }'
        while($true) {
            $steam = [Win]::FindWindow("Steam", "Steam")
            if($steam -ne [IntPtr]::Zero) { [Win]::PostMessage($steam, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null }
            Start-Sleep -Milliseconds 50
        }
    `;
    const ghostProcess = spawn('powershell.exe', ['-Command', psScript], { windowsHide: true });

    activeGameTracking = { gameId, ghostProcess, pids: [], sessionStart: null, interval: null, isCustomExe: !!(config.exePath), name: name || 'Game' };
    const trackingString = activeGameTracking.isCustomExe ? path.basename(config.exePath).toLowerCase() : installdir.toLowerCase();

    activeGameTracking.interval = setInterval(() => {
        exec('wmic process get processid,executablepath,name', (err, stdout) => {
            if (!activeGameTracking) return;
            const lines = stdout.split('\n');
            let foundPids = [];
            lines.forEach(line => {
                if (line.toLowerCase().includes(trackingString)) {
                    const match = line.match(/(\d+)\s*$/);
                    if (match) foundPids.push(match[1]);
                }
            });
            activeGameTracking.pids = foundPids;
            if (foundPids.length > 0 && !activeGameTracking.sessionStart) {
                activeGameTracking.sessionStart = Date.now();
                if (mainWindow) mainWindow.webContents.send('game-status', { appId: gameId, status: 'running', name: activeGameTracking.name });

                if (store.get('discordRpcEnabled') && discordRPCClient && discordReady) {
                    discordRPCClient.setActivity({
                        details: `Playing ${activeGameTracking.name}`,
                        state: 'In-Game',
                        startTimestamp: Date.now(),
                        largeImageKey: DISCORD_CLIENT_ID,
                        largeImageText: 'SteamLite 6.0.5',
                        instance: false
                    }).catch(err => console.error('Failed to set Discord activity:', err.message));
                }
            } else if (foundPids.length === 0 && activeGameTracking.sessionStart) {
                clearInterval(activeGameTracking.interval);
                activeGameTracking.ghostProcess.kill();
                const sessionSeconds = Math.floor((Date.now() - activeGameTracking.sessionStart) / 1000);
                const telemetry = store.get('telemetry') || {};
                if (!telemetry[gameId]) telemetry[gameId] = { playtime: 0, launches: 0, lastPlayed: 0 };
                telemetry[gameId].playtime += sessionSeconds;
                telemetry[gameId].launches += 1;
                telemetry[gameId].lastPlayed = Date.now();
                store.set('telemetry', telemetry);
                if (mainWindow) mainWindow.webContents.send('game-status', { appId: gameId, status: 'stopped', telemetry: telemetry[gameId] });
                activeGameTracking = null;
                buildTrayMenu();
            }
        });
    }, 2000);
    return true;
}

ipcMain.handle('launch-game', async (event, data) => {
    return await executeLaunch(data);
});

ipcMain.handle('stop-game', async (event, { gameId }) => {
    if (activeGameTracking && activeGameTracking.gameId === String(gameId)) {
        if (activeGameTracking.pids.length > 0) {
            activeGameTracking.pids.forEach(pid => {
                try { exec(`taskkill /F /T /PID ${pid}`); } catch (e) { }
            });
        } else {
            clearInterval(activeGameTracking.interval);
            if (activeGameTracking.ghostProcess) activeGameTracking.ghostProcess.kill();

            const sessionSeconds = activeGameTracking.sessionStart ? Math.floor((Date.now() - activeGameTracking.sessionStart) / 1000) : 0;
            const telemetry = store.get('telemetry') || {};
            if (!telemetry[gameId]) telemetry[gameId] = { playtime: 0, launches: 0, lastPlayed: 0 };
            telemetry[gameId].playtime += sessionSeconds;
            telemetry[gameId].launches += 1;
            telemetry[gameId].lastPlayed = Date.now();
            store.set('telemetry', telemetry);

            if (mainWindow) mainWindow.webContents.send('game-status', { appId: gameId, status: 'stopped', telemetry: telemetry[gameId] });
            activeGameTracking = null;
            buildTrayMenu();
        }
        return true;
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
            const files = fs.readdirSync(screenshotPath);
            for (const file of files) {
                if (file.endsWith('.jpg') || file.endsWith('.png')) {
                    const buffer = fs.readFileSync(path.join(screenshotPath, file));
                    screenshots.push(`data:image/jpeg;base64,${buffer.toString('base64')}`);
                }
            }
        }
        return screenshots;
    } catch (err) { return []; }
});

// ==========================================
// UPDATE LOGIC RESTORED
// ==========================================
function compareVersions(v1, v2) {
    const parts1 = v1.split('-')[0].split('.').map(Number);
    const parts2 = v2.split('-')[0].split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (parts1[i] > parts2[i]) return 1;
        if (parts1[i] < parts2[i]) return -1;
    }
    const isV1Beta = v1.includes('beta');
    const isV2Beta = v2.includes('beta');
    if (isV1Beta && !isV2Beta) return -1;
    if (!isV1Beta && isV2Beta) return 1;
    return 0;
}

async function checkForUpdates(silent = false) {
    const channel = store.get('updateChannel') || 'stable';
    const url = channel === 'beta'
        ? 'https://raw.githubusercontent.com/imnotfisy/SteamLite-Beta-Branch/refs/heads/main/version.json'
        : 'https://raw.githubusercontent.com/imnotfisy/SteamLite/refs/heads/main/version.json';

    const currentVersion = '6.0.5';
    try {
        const data = await fetchApi(url);
        if (data.version) {
            if (compareVersions(data.version, currentVersion) > 0) {
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('update-available', {
                        version: data.version,
                        url: data.downloadUrl || 'https://github.com/imnotfisy/SteamLite/releases'
                    });
                }
                return 'Update available';
            }
            if (!silent) return 'You are on the latest version!';
            return null;
        }
        if (!silent) return 'You are on the latest version!';
        return null;
    } catch (err) {
        console.error('Update check failed:', err);
        if (!silent) return 'Update check failed. Try again later.';
        return null;
    }
}

ipcMain.handle('check-updates', async () => {
    return await checkForUpdates(false);
});