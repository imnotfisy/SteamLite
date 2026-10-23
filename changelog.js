// Loads release notes from GitHub and renders them (small, safe markdown subset: headings, lists, bold, code, links).
const tl = document.getElementById('timeline'), loadEl = document.getElementById('clLoad');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
function md(src) {
  const out = []; let list = false, para = [];
  const flush = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
  const close = () => { if (list) { out.push('</ul>'); list = false; } };
  for (const raw of String(src || '').replace(/^﻿/, '').split(/\r?\n/)) {
    const l = raw.trimEnd(), h = l.match(/^#{1,4}\s+(.*)/), li = l.match(/^\s*[-*]\s+(.*)/);
    if (h) { flush(); close(); out.push('<h3>' + inline(h[1]) + '</h3>'); }
    else if (li) { flush(); if (!list) { out.push('<ul>'); list = true; } out.push('<li>' + inline(li[1]) + '</li>'); }
    else if (!l.trim()) { flush(); close(); }
    else { close(); para.push(l.trim()); }
  }
  flush(); close(); return out.join('');
}
const niceTag = (t) => t.replace(/^v/, '').replace(/-beta\.?(\d*)/, (m, n) => ' beta' + (n ? ' ' + n : ''));

function card(r, i) {
  const a = document.createElement('article');
  a.className = 'rel reveal'; a.dataset.kind = r.prerelease ? 'beta' : 'stable';
  a.innerHTML = '<div class="head"><h2>' + esc(niceTag(r.tag_name)) + '</h2><span class="pill' + (r.prerelease ? ' hot' : '') + '">' + (r.prerelease ? 'Beta' : 'Stable') + '</span><time>' + esc((r.published_at || '').slice(0, 10)) + '</time></div><div class="body">' + (md(r.body) || '<p>No notes for this release.</p>') + '</div>';
  return a;
}

(async () => {
  try {
    const all = [];
    for (let page = 1; page <= 3; page++) {
      const rs = await (await fetch('https://api.github.com/repos/imnotfisy/SteamLite/releases?per_page=100&page=' + page)).json();
      if (!Array.isArray(rs) || !rs.length) break; all.push(...rs); if (rs.length < 100) break;
    }
    const rels = all.filter((r) => !r.draft);
    if (!rels.length) throw new Error('none');
    // the card written into the page is only a fallback: replace it with every release, newest first
    tl.querySelectorAll('.rel').forEach((r) => r.remove());
    rels.forEach((r) => tl.insertBefore(card(r), loadEl));
    loadEl.remove();
    tl.querySelectorAll('.reveal').forEach((el) => { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.disconnect(); } }), { threshold: 0.05 }); io.observe(el); });
  } catch (e) {
    loadEl.innerHTML = 'Could not load earlier releases. <a href="https://github.com/imnotfisy/SteamLite/releases">Open them on GitHub</a>.';
  }
})();

// stable / beta filter
const filters = document.getElementById('filters');
filters.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  filters.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
  const f = b.dataset.f;
  tl.querySelectorAll('.rel').forEach((r) => { r.hidden = f !== 'all' && r.dataset.kind !== f; });
});
