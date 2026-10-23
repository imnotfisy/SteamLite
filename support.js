// builds a pre-filled GitHub issue link from the form
const K = { bug: ['Bug: ', 'bug'], feature: ['Feature request: ', 'enhancement'], question: ['Question: ', 'question'] };
let kind = 'bug';
const seg = document.getElementById('kind');
const pick = (k) => { kind = k; seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === k)); };
seg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) pick(b.dataset.k); });
document.querySelectorAll('.paths a[data-type]').forEach((a) => a.addEventListener('click', () => pick(a.dataset.type)));
document.getElementById('reportForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = (id) => document.getElementById(id).value.trim();
  const body = '**What happened**\n' + v('rBody') + '\n\n**SteamLite version:** ' + (v('rVer') || 'not given') + '\n**Windows:** ' + (v('rOs') || 'not given') + '\n\n_Sent from the SteamLite website support page._';
  const url = 'https://github.com/imnotfisy/SteamLite/issues/new?title=' + encodeURIComponent(K[kind][0] + v('rTitle')) + '&labels=' + encodeURIComponent(K[kind][1]) + '&body=' + encodeURIComponent(body);
  window.open(url, '_blank', 'noopener');
});
