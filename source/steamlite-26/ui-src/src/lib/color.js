import { art } from './util.js';
// The accent colour of whatever you are looking at, taken from its picture. If the picture cannot be read (no network, blocked), a colour is made from the name.
const cache = new Map();
const DEFAULT = '#8D99AE';
const fromName = (name) => { const h = [...String(name)].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) % 360; return `hsl(${h} 70% 62%)`; };

function sample(url) {
  return new Promise((resolve) => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = 24; c.height = 14; const x = c.getContext('2d', { willReadFrequently: true });
        x.drawImage(img, 0, 0, 24, 14); const d = x.getImageData(0, 0, 24, 14).data;
        let r = 0, g = 0, b = 0, w = 0;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]), sat = mx ? (mx - mn) / mx : 0, wt = sat * sat * (0.3 + mx / 255) + 0.01;   // vivid pixels count most
          r += d[i] * wt; g += d[i + 1] * wt; b += d[i + 2] * wt; w += wt;
        }
        r /= w; g /= w; b /= w;
        const mx = Math.max(r, g, b); const k = mx < 150 ? 190 / mx : 1;      // keep it bright enough to glow
        resolve(`rgb(${Math.min(255, r * k) | 0} ${Math.min(255, g * k) | 0} ${Math.min(255, b * k) | 0})`);
      } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null); img.src = url;
  });
}

export async function glowOf(g) {
  if (!g) return DEFAULT;
  if (cache.has(g.id)) return cache.get(g.id);
  let c = g.nonSteam && !g.cover ? null : await sample(art.header(g));
  c = c || fromName(g.name); cache.set(g.id, c); return c;
}
export function setGlow(c) { const s = document.documentElement.style; if (document.documentElement.dataset.accent === 'fixed' || !c) s.removeProperty('--glow'); else s.setProperty('--glow', c); }
export async function glowFor(g) { const c = await glowOf(g); setGlow(c); return c; }
export const resetGlow = () => setGlow(DEFAULT);
