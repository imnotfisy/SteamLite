'use strict';
// Settings and data in one JSON file. Same folder and file name as every SteamLite before 26.11 (AppData\Roaming\SteamLite\config.json),
// so an existing install keeps its logins, favourites, collections and play time without any migration step.
const fs = require('fs'), path = require('path');

const userData = require('./platform').userData();
const file = path.join(userData, 'config.json');
let data = {};
try { data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')); } catch (e) { data = {}; }
if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};

let timer = null;
function flush() {
  clearTimeout(timer); timer = null;
  try {
    fs.mkdirSync(userData, { recursive: true });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data), { mode: 0o600 });
    fs.renameSync(tmp, file);
  } catch (e) { console.error('save failed:', e.message); }
}
const get = (k, d) => (data[k] === undefined ? d : data[k]);
const set = (k, v) => { data[k] = v; if (!timer) timer = setTimeout(flush, 400); };
process.on('exit', () => { if (timer) flush(); });

module.exports = { get, set, flush, userData };
