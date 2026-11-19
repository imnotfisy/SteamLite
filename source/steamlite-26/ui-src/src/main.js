import { mount } from 'svelte';
import './app.css';
import './motion.css';
import './themes.css';
import App from './App.svelte';
mount(App, { target: document.getElementById('app') });

// this is an app, not a web page: no browser menu on right click, and no browser shortcuts (reload, print, save, find, zoom)
window.addEventListener('contextmenu', (e) => { if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) e.preventDefault(); });
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (e.key === 'F5' || e.key === 'F12' || (e.ctrlKey && ['r', 'p', 's', 'f', 'g', 'u', 'j', '+', '-', '=', '0'].includes(k)) || (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 'r'].includes(k))) e.preventDefault();
}, true);
window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
