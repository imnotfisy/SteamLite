'use strict';
// The line between the core (this Node process) and the shell (Rust/Tauri): one JSON message per line over stdin / stdout.
//   shell -> core:  {t:'ipc', id, ch, args}        the window asked for something (ipcRenderer.invoke)
//                   {t:'send', ch, args}           the window told us something (ipcRenderer.send)
//                   {t:'native-res', id, ok, value, error}
//                   {t:'event', name, data}        something happened in the shell (tray click, shortcut, window state...)
//   core -> shell:  {t:'ipc-res', id, ok, value, error}
//                   {t:'emit', ch, args, target}   tell the window something (webContents.send)
//                   {t:'native', id, op, args}     ask the shell to do something native (tray, dialog, window...)
const readline = require('readline');

// the protocol owns stdout: anything the old code prints goes to stderr instead
const realWrite = process.stdout.write.bind(process.stdout);
console.log = (...a) => console.error(...a);
console.info = (...a) => console.error(...a);

// Buffers cannot travel as JSON: they are sent as {__buf: base64} and turned back into bytes by the window
const replacer = (k, v) => (v && v.type === 'Buffer' && Array.isArray(v.data) ? { __buf: Buffer.from(v.data).toString('base64') } : v);
const out = (o) => { try { realWrite(JSON.stringify(o, replacer) + '\n'); } catch (e) { console.error('bridge write failed:', e && e.message); } };

let nid = 1; const pending = new Map(), eventHandlers = new Map(); let ipcHandler = null, sendHandler = null;
function native(op, ...args) { return new Promise((resolve, reject) => { const id = nid++; pending.set(id, { resolve, reject }); out({ t: 'native', id, op, args }); }); }
const emit = (ch, args, target) => out({ t: 'emit', ch, args: args || [], target: target || 'main' });
const onEvent = (name, fn) => { if (!eventHandlers.has(name)) eventHandlers.set(name, []); eventHandlers.get(name).push(fn); };
const setHandlers = (ipc, send) => { ipcHandler = ipc; sendHandler = send; };
const serializeError = (e) => (e && e.message) ? String(e.message) : String(e);

function start() {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rl.on('line', (line) => {
    let m; try { m = JSON.parse(line); } catch (e) { return; }
    try {
      if (m.t === 'ipc') {
        Promise.resolve().then(() => ipcHandler(m.ch, m.args || [])).then(
          (value) => out({ t: 'ipc-res', id: m.id, ok: true, value: value === undefined ? null : value }),
          (err) => out({ t: 'ipc-res', id: m.id, ok: false, error: serializeError(err) }));
      } else if (m.t === 'send') { if (sendHandler) sendHandler(m.ch, m.args || []); }
      else if (m.t === 'native-res') { const p = pending.get(m.id); if (p) { pending.delete(m.id); m.ok ? p.resolve(m.value) : p.reject(new Error(m.error || 'native call failed')); } }
      else if (m.t === 'event') { (eventHandlers.get(m.name) || []).forEach((fn) => { try { fn(m.data); } catch (e) { console.error('event handler failed:', e && e.message); } }); }
    } catch (e) { console.error('bridge message failed:', e && e.message); }
  });
  rl.on('close', () => process.exit(0));   // the shell is gone: so are we
}

module.exports = { native, emit, onEvent, setHandlers, start, out };
