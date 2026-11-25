// The profile page: who is signed in, and what other SteamLite players see (banner, picture, tagline, top games).
(() => {
  const A = window.slAccount, view = document.getElementById('acctView'); if (!A || !view) return;
  const esc = A.esc;
  async function draw() {
    const s = A.state();
    if (!s.signedIn) {
      view.innerHTML = '<div class="acard center"><h3>Sign in to see your profile</h3><p class="sub">Steam opens in a new tab. SteamLite never sees your password, and the sign-in is kept in this browser only.</p><div id="signBox"></div></div>';
      const ok = await A.available(); const box = document.getElementById('signBox');
      if (!ok) { box.innerHTML = '<p class="muted">Sign-in on the website is not available right now. You can still sign in from the SteamLite app.</p>'; return; }
      box.innerHTML = s.waiting ? '<p class="muted">Finish signing in on Steam, this page updates by itself.</p><button class="btn" id="cancelBtn">Cancel</button>' : '<button class="btn go big" id="inBtn">Sign in with Steam</button>';
      const i = document.getElementById('inBtn'); if (i) i.onclick = () => A.start();
      const c = document.getElementById('cancelBtn'); if (c) c.onclick = () => A.cancel();
      return;
    }
    view.innerHTML = '<div class="acard"><p class="sub">Loading your profile...</p></div>';
    const [me, prof] = await Promise.all([A.refresh(), A.profile()]);
    const a = A.state(), cu = (prof && prof.custom) || {}, b = cu.banner || {}, base = await A.base();
    const accent = /^#[0-9a-f]{6}$/i.test(cu.accent || '') ? cu.accent : '';
    const bg = b.mode === 'image' && /^[a-f0-9]{24}$/.test(b.id || '') ? 'background-image:url(' + esc(base) + '/media/' + b.id + ')' : b.mode === 'gradient' && /^#[0-9a-f]{6}$/i.test(b.c1 || '') && /^#[0-9a-f]{6}$/i.test(b.c2 || '') ? 'background:linear-gradient(' + (Number(b.angle) || 135) + 'deg,' + b.c1 + ',' + b.c2 + ')' : '';
    const games = (Array.isArray(cu.showcase) ? cu.showcase : []).map(Number).filter(Boolean).slice(0, 5);
    const name = (prof && prof.name) || a.name || 'Player', ava = (prof && prof.avatar) || a.avatar;
    view.innerHTML = '<div class="acard prof"' + (accent ? ' style="--ac:' + accent + '"' : '') + '>'
      + '<div class="ban" style="' + bg + '"></div>'
      + '<div class="pin"><span class="pav">' + (ava ? '<img src="' + esc(ava) + '" alt="">' : esc(name.trim()[0] || '?').toUpperCase()) + '</span>'
      + '<div class="pwho"><h2>' + esc(name) + '</h2>' + (cu.tagline ? '<p>' + esc(cu.tagline) + '</p>' : '') + (a.code || (me && me.code) ? '<small>Friend code: <b>' + esc(a.code || me.code) + '</b></small>' : '') + '</div>'
      + '<button class="btn sm" id="outBtn">Sign out</button></div>'
      + (games.length ? '<h3 class="gh">Top games</h3><div class="gcs">' + games.map((id) => '<img src="https://cdn.akamai.steamstatic.com/steam/apps/' + id + '/library_600x900.jpg" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">').join('') + '</div>' : '')
      + (prof ? '' : '<p class="muted note">Your profile is not shared yet, or the server could not be reached. In the SteamLite app, open Settings and turn on Share my profile.</p>')
      + '</div>';
    document.getElementById('outBtn').onclick = async () => { await A.signOut(); location.href = 'index.html'; };
  }
  A.on(() => draw()); draw();
})();
