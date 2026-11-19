// A small, safe Markdown reader for news posts. Everything is escaped first, so a post can never run code.
// Supported: # headings (1 to 4), paragraphs, **bold**, *italic*, `code`, [links](https://...), ![pictures](https://...), - and 1. lists,
// > quotes (also > [!NOTE] style), ``` code blocks, --- rules and simple | tables |. Links open in the browser; pictures must be https.

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeUrl = (u) => (/^https:\/\/[^\s"'<>]+$/i.test(u) ? u : '');

export function inline(src) {
  let s = esc(src);
  const stash = [];
  s = s.replace(/`([^`]+)`/g, (m, c) => { stash.push('<code>' + c + '</code>'); return '\u0000' + (stash.length - 1) + '\u0000'; });
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => { const u = safeUrl(url.replace(/&amp;/g, '&')); return u ? '<img src="' + esc(u) + '" alt="' + alt + '" loading="lazy">' : alt; });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, url) => { const u = safeUrl(url.replace(/&amp;/g, '&')); return u ? '<a href="#" data-u="' + esc(u) + '">' + t + '</a>' : t; });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>').replace(/(^|[\s(])_([^_\s][^_]*)_(?=[\s).,!?]|$)/g, '$1<i>$2</i>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => stash[+i]);
}

// the front matter (--- key: value ---) at the top of a post: returns { meta, body }
export function frontMatter(text) {
  const t = String(text || '').replace(/\r\n/g, '\n').replace(/^﻿/, '');
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(t); if (!m) return { meta: {}, body: t };
  const meta = {}; for (const line of m[1].split('\n')) { const k = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line); if (k) meta[k[1]] = k[2].replace(/^(["'])(.*)\1$/, '$2'); }
  return { meta, body: t.slice(m[0].length) };
}

// Markdown to a list of blocks: { t: 'h'|'p'|'ul'|'ol'|'quote'|'code'|'img'|'hr'|'table', ... }; text fields are safe HTML
export function blocks(src) {
  const lines = String(src || '').replace(/\r\n/g, '\n').split('\n'), out = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i], l = raw.trim();
    if (!l) { i++; continue; }
    if (/^```/.test(l)) { const code = []; i++; while (i < lines.length && !/^```/.test(lines[i].trim())) code.push(lines[i++]); i++; out.push({ t: 'code', text: esc(code.join('\n')) }); continue; }
    if (/^-{3,}$|^\*{3,}$/.test(l)) { out.push({ t: 'hr' }); i++; continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(l); if (h) { out.push({ t: 'h', level: h[1].length, html: inline(h[2]) }); i++; continue; }
    const img = /^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)\s*$/.exec(l); if (img) { out.push({ t: 'img', alt: img[1], src: img[2] }); i++; continue; }
    if (/^>/.test(l)) {
      const q = []; while (i < lines.length && /^>/.test(lines[i].trim())) q.push(lines[i++].trim().replace(/^>\s?/, ''));
      let kind = ''; const first = /^\[!(NOTE|TIP|WARNING|IMPORTANT)\]$/i.exec(q[0] || ''); if (first) { kind = first[1].toLowerCase(); q.shift(); }
      out.push({ t: 'quote', kind, html: q.map(inline).join('<br>') }); continue;
    }
    if (/^\|.*\|$/.test(l) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const cells = (x) => x.trim().replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim())); const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) rows.push(cells(lines[i++]));
      out.push({ t: 'table', head, rows }); continue;
    }
    if (/^[-*]\s+/.test(l)) { const items = []; while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(inline(lines[i++].replace(/^\s*[-*]\s+/, ''))); out.push({ t: 'ul', items }); continue; }
    if (/^\d+[.)]\s+/.test(l)) { const items = []; while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(inline(lines[i++].replace(/^\s*\d+[.)]\s+/, ''))); out.push({ t: 'ol', items }); continue; }
    if (l[0] === '<') { i++; continue; }                                     // html is not allowed
    const para = [l]; i++; while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|```|[-*]\s|\d+[.)]\s|!\[|\||-{3,}$)/.test(lines[i].trim())) para.push(lines[i++].trim());
    out.push({ t: 'p', html: inline(para.join(' ')) });
  }
  return out;
}

// a plain-text summary of a post (for the list): the first paragraph with the Markdown marks removed
export function summary(src, max = 220) {
  for (const b of blocks(src)) {
    if (b.t === 'p' || b.t === 'ul' || b.t === 'ol') {
      const html = b.t === 'p' ? b.html : b.items[0];
      const text = html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
      if (text) return text.length > max ? text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : text;
    }
  }
  return '';
}
export const firstImage = (src) => { const m = /!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/.exec(String(src || '')); return m ? m[1] : ''; };
