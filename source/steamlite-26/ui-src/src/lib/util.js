// Picture providers, tried in order until one loads. Steam serves the same files from several networks, and some games only exist on one of them.
const CDNS = [
  'https://cdn.cloudflare.steamstatic.com/steam/apps/',
  'https://cdn.akamai.steamstatic.com/steam/apps/',
  'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/',
  'https://steamcdn-a.akamaihd.net/steam/apps/'
];
const many = (g, file) => (g.nonSteam ? [g.cover] : CDNS.map((c) => c + g.id + '/' + file));
export const art = {
  capsule: (g) => many(g, 'library_600x900.jpg')[0],
  header: (g) => many(g, 'header.jpg')[0],
  hero: (g) => many(g, 'library_hero.jpg')[0],
  // every address worth trying for a kind of picture, best first (the store's own capsule pictures come last: they exist for games with no library art)
  list(g, kind) {
    if (g.nonSteam) return g.cover ? [g.cover] : [];
    const tall = many(g, 'library_600x900.jpg'), wide = many(g, 'header.jpg'), hero = many(g, 'library_hero.jpg');
    const extra = many(g, 'capsule_616x353.jpg').concat(many(g, 'capsule_467x181.jpg').slice(0, 2), many(g, 'library_header.jpg').slice(0, 2));
    return kind === 'hero' ? [...hero, ...wide, ...extra] : kind === 'header' ? [...wide, ...extra] : [...tall, ...wide, ...extra];
  }
};
// total play time shown as the biggest sensible units
export function hours(sec) {
  if (!sec) return '0 min';
  const m = Math.round(sec / 60); if (m < 60) return m + ' min';
  const h = sec / 3600; return (h < 10 ? h.toFixed(1) : Math.round(h)) + ' h';
}
// Steam's own count and the time SteamLite counted on top of it are added together
export const played = (g) => (g.steamMinutes || 0) * 60 + (g.seconds || 0);
export function ago(ms) {
  if (!ms) return 'Never';
  const d = Math.floor((Date.now() - ms) / 864e5);
  if (d <= 0) return 'Today'; if (d === 1) return 'Yesterday'; if (d < 30) return d + ' days ago';
  if (d < 365) return Math.floor(d / 30) + ' months ago'; return Math.floor(d / 365) + ' years ago';
}
export function bytes(n) { if (!n) return ''; const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; while (n >= 1024 && i < 4) { n /= 1024; i++; } return (n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)) + ' ' + u[i]; }
export function date(sec) { return new Date(sec * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }

// release notes: a small safe subset of Markdown (paragraphs, bullets, headings, bold, italics, code, links, https pictures) turned into blocks the page can show
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inl = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>')
  .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="#" data-u="$2">$1</a>');
export function notesBlocks(src) {
  const out = [];
  for (const raw of String(src || '').replace(/\r/g, '').split('\n')) {
    const l = raw.trim().replace(/^>\s?/, '').trim();
    if (!l || /^-{3,}$/.test(l) || l[0] === '<') continue;                         // blank lines, rules and html lines are skipped
    const img = /^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)$/.exec(l), h = /^#{1,4}\s+(.*)/.exec(l), li = /^[-*]\s+(.*)/.exec(l);
    if (img) out.push({ t: 'img', alt: img[1], src: img[2] });
    else if (h) out.push({ t: 'h', html: inl(h[1]) });
    else if (li) out.push({ t: 'li', html: inl(li[1]) });
    else out.push({ t: 'p', html: inl(l) });
  }
  return out;
}

// Themes that are only open for a while. The GTA 6 theme can be picked from NOV 15 to DEC 1 (2026, local time); the rest of the year it is listed but locked.
const WINDOWS = { gta6: { from: new Date(2026, 10, 15, 0, 0, 0), to: new Date(2026, 11, 1, 23, 59, 59), startText: 'Starts Nov 15', endText: 'Ended Dec 1', endedDescription: "The 'GTA 6' theme will return when the game releases for the PC platform, or when it's available on Steam." } };
const clock = () => (typeof window !== 'undefined' && window.__slNow ? new Date(window.__slNow) : new Date());      // (window.__slNow is only for testing)
export function themeState(id) {
  const w = WINDOWS[id]; if (!w) return { open: true, note: '' };
  const n = clock(); if (n < w.from) return { open: false, note: w.startText }; if (n > w.to) return { open: false, note: w.endText, text: w.endedDescription };
  return { open: true, note: '' };
}
export const themeOpen = (id) => themeState(id).open;
