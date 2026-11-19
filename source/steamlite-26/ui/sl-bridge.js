// The window's line to the core: sl.call('area:action', ...args) asks, sl.on('area:event', fn) listens.
(function () {
  'use strict';
  var T = window.__TAURI__;
  if (!T || !T.core) { console.error('SteamLite: Tauri is not available'); return; }
  var invoke = T.core.invoke, listeners = {};
  T.event.listen('core-event', function (e) {
    var p = e.payload || {}, list = listeners[p.ch] || [];
    list.slice().forEach(function (fn) { try { fn.apply(null, p.args || []); } catch (err) { console.error(err); } });
  });
  var win = function () { return T.window.getCurrentWindow(); };
  window.sl = {
    call: function (ch) { return invoke('core_invoke', { ch: ch, args: Array.prototype.slice.call(arguments, 1) }); },
    on: function (ch, fn) { (listeners[ch] = listeners[ch] || []).push(fn); return function () { listeners[ch] = listeners[ch].filter(function (f) { return f !== fn; }); }; },
    minimize: function () { return win().minimize(); },
    close: function () { return invoke('core_invoke', { ch: 'app:quit', args: [] }); }
  };
})();
