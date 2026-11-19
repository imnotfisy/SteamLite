'use strict';
// SteamLite core: a small Node process the shell (Tauri) starts. It talks to the shell over stdin/stdout (see shim/bridge.js).
const bridge = require('./shim/bridge');
process.on('uncaughtException', (e) => { console.error('uncaught:', e && e.stack || e); });
process.on('unhandledRejection', (e) => { console.error('unhandled:', e && e.stack || e); });
bridge.start();
require('./main');
