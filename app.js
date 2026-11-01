'use strict';
/* Redesign concept. Static snapshot of public data, no wallet, no transactions. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('mfc:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('mfc:' + k, JSON.stringify(v)); } catch {} },
};
const reduced = false; // Motion is the review here, so it does not follow the OS setting
// Weak machines keep the layout and drop the per frame luxuries: blur, moving edges, ticking numbers
const lite = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
document.documentElement.classList.toggle('lite', lite);

const I = (() => {
  const s = (d, x = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${x}>${d}</svg>`;
  return {
    compass: s('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
    gift: s('<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M12 8v13M5.5 12v7a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-7M12 8S10.5 3 7.5 3a2.5 2.5 0 0 0 0 5zM12 8s1.5-5 4.5-5a2.5 2.5 0 0 1 0 5z"/>'),
    rocket: s('<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2-.1-2.8-.8-.8-2.1-.9-2.9-.200z"/><path d="m12 15-3-3c1-3.5 3.5-9 11-9 0 7.5-5.5 10-8 12z"/><path d="M9 12H4s.5-3 2-4c1.2-.8 4 0 4 0M12 15v5s3-.5 4-2c.8-1.2 0-4 0-4"/>'),
    list: s('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
    grid: s('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
    search: s('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/>'),
    star: s('<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.900L3.5 9.700l5.9-.800z"/>'),
    copy: s('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>'),
    check: s('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
    ext: s('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    alert: s('<path d="M12 4 2.5 20h19zM12 10v4.5M12 17.5h.01"/>'),
    bell: s('<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4"/>'),
    sliders: s('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
    globe: s('<circle cx="12" cy="12" r="9.2"/><ellipse cx="12" cy="12" rx="4" ry="9.2"/><path d="M3.4 9h17.2M3.4 15h17.2"/>', 'stroke-width="1.5"'),
    xb: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    flag: s('<path d="M5 21V4c5-2.5 9 2.5 14 0v10c-5 2.5-9-2.5-14 0"/>'),
    shield: s('<path d="M12 3 5 5.5v6c0 4.5 3 7.5 7 9.5 4-2 7-5 7-9.5v-6z"/><path d="m9 12 2.2 2.2 4-4.2"/>'),
    claw: s('<path d="M12 2v5M8.5 7h7v3.5h-7zM9.5 10.5 4.5 14v3.5l3.500 4M14.5 10.5l5 3.500v3.500l-3.500 4M12 10.500V16"/>'),
    arrow: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    x: s('<path d="m4 4 16 16M20 4 4 20"/>', 'stroke-width="2.2"'),
    wallet: s('<path d="M4 7.5A2.500 2.500 0 0 1 6.500 5H18v3M4 7.500V17a3 3 0 0 0 3 3h13V8H6.500A2.500 2.500 0 0 1 4 7.500z"/><path d="M16.500 14h.01"/>'),
    chev: s('<path d="m6 9 6 6 6-6"/>', 'stroke-width="2.2"'),
    mail: s('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7.500 8 6 8-6"/>'),
    image: s('<rect x="3.500" y="4.500" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.700"/><path d="m4 17 5-4.500 3.500 3 3-2.500 4.500 4"/>'),
    prev: s('<path d="m15 5-7 7 7 7"/>', 'stroke-width="2.2"'),
    next: s('<path d="m9 5 7 7-7 7"/>', 'stroke-width="2.2"'),
    discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
    doc: s('<path d="M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6"/>'),
    youtube: s('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>'),
    clock: s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    chart: s('<path d="M4 4v16h16M8 15l4-5 3 3 5-7"/>'),
    sim: s('<path d="m4 8 8-4 8 4-8 4zM4 13l8 4 8-4M4 18l8 4 8-4"/>'),
    cube: s('<path d="M12 3 4 7.500v9L12 21l8-4.500v-9zM4 7.500l8 4.500 8-4.500M12 12v9"/>'),
    chip: s('<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>'),
    play: s('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>'),
    full: s('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    save: s('<path d="M12 4v11M7.500 10.500 12 15l4.500-4.500M5 20h14"/>'),
    dots: s('<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>'),
  };
})();

/* Fixture: the one project filled in end to end, so every empty tab has a full counterpart */
const SAMPLE = {
  ref: 'grablab', name: 'Grablab', sample: true, pre: true, logo: true, cover: true, at: '2026-10-13T00:00:00Z',
  desc: "The claw that can't cheat you. A real claw machine played from the browser, every play proven fair on Solana.",
  tags: ['robotics', 'machine', 'simulation'],
  proof: { sim: 1, d3: 1 },
  founder: { name: 'Grablab team', role: 'Founders', img: '/assets/logos/grablab.webp' },
  links: [['globe', 'grablab.fun', 'https://grablab.fun', 'The site, the live machine and the provably fair page.', '/assets/art/model-spin.webp'], ['x', '@grablabfun', 'https://x.com/grablabfun', 'Build updates, renders and proof drops.', '/assets/art/gl-mark.webp']],
  milestones: [
    { s: 'done', t: 'Simulation of the full machine', d: 'Physics scene built and playable in SimArena.', proof: 'See the simulation', to: 'sim' },
    { s: 'done', t: 'Interactive 3D model', d: 'Every part of the metal build, exploded and labelled.', proof: 'See the 3D model', to: 'd3' },
    { s: 'now', t: 'Prototype 01 hardware build', d: 'Frame, gantry and claw module on the bench.' },
    { s: 'next', t: 'Plays signed by the machine', d: 'peaqOS identity, every play signed with a key it cannot fake.' },
    { s: 'next', t: 'First public claw night', d: 'Live stream, escrow public, receipts for every play.' },
  ],
};

let P = [], SNAP = 0, byRef = new Map(), dupCount = {};
let wallet = store.get('wallet', null), watch = new Set(store.get('watch', [])), reminds = new Set(store.get('remind', []));
let net = 'ok', tz = store.get('tz', 'UTC');
let cleanups = [];
const onLeave = f => cleanups.push(f);

/* formatters */
const usd = n => {
  if (n == null) return '-';
  const a = Math.abs(n);
  if (a >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return '$' + (n / 1e3).toFixed(a >= 1e5 ? 1 : 2) + 'K';
  return '$' + n.toFixed(a < 10 ? 2 : 0);
};
const SUB = '₀₁₂₃₄₅₆₇₈₉';
const price = n => {
  if (n == null) return '-';
  if (n >= 1) return '$' + n.toFixed(2);
  const s = n.toFixed(14).replace(/0+$/, ''), m = s.match(/^0\.(0*)(\d*)/);
  const z = m[1].length, rest = m[2].slice(0, 4);
  if (z < 3) return '$0.' + m[1] + rest;
  return '$0.0' + String(z).split('').map(d => SUB[d]).join('') + rest;
};
const int = n => n == null ? '-' : Number(n).toLocaleString('en-US');
const compact = n => n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(2) + 'K' : n.toFixed(2);
const short = m => m ? m.slice(0, 6) + '...' + m.slice(-6) : '';
const ago = t => {
  const s = (SNAP - new Date(t)) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm ago';
  if (s < 86400) return Math.round(s / 3600) + 'h ago';
  return Math.round(s / 86400) + 'd ago';
};
const pad = n => String(n).padStart(2, '0');
const clock = (ts, sec) => {
  const d = new Date(ts * 1000), u = tz === 'UTC';
  const h = u ? d.getUTCHours() : d.getHours(), m = u ? d.getUTCMinutes() : d.getMinutes(), s = u ? d.getUTCSeconds() : d.getSeconds();
  return pad(h) + ':' + pad(m) + (sec ? ':' + pad(s) : '');
};
const logoSrc = p => p.logoData || (p.logo ? `/assets/logos/${p.ref}.webp` : '/assets/art/dragonfly-poster.webp');
const coverSrc = p => p.cover ? `/assets/covers/${p.ref}.webp` : '/assets/art/gears.webp';
const pct = p => (p.mig ? 100 : Math.max(0, (p.prog || 0) * 100));
const isUp = p => p.change ? !p.change.startsWith('-') : true;
const stageOf = p => p.pre ? 'pre' : p.mig ? 'mig' : 'bond';
const stageTxt = { pre: 'Pre launch', mig: 'Migrated', bond: 'Bonding' };

function toast(t) {
  const e = document.createElement('div');
  e.className = 'toast'; e.textContent = t;
  $('#toasts').append(e);
  setTimeout(() => e.remove(), 2600);
}
async function copy(t) {
  try { await navigator.clipboard.writeText(t); toast('Copied'); } catch { toast(t); }
}
function toggleWatch(ref) {
  watch.has(ref) ? watch.delete(ref) : watch.add(ref);
  store.set('watch', [...watch]);
  $$(`.star[data-star="${ref}"]`).forEach(b => b.classList.toggle('on', watch.has(ref)));
  const chip = !watch.has(ref) && $(`.chip-w[data-live="${ref}"]`);
  if (chip) { chip.classList.add('out'); setTimeout(renderWatch, 260); } else renderWatch();
}
const WALLETS = [
  ['Brave Wallet', '#ff5500', 'brave.png', () => window.ethereum?.isBraveWallet || !!window.braveSolana],
  ['Phantom', '#ab9ff2', 'phantom.svg', () => !!window.phantom?.solana],
  ['MetaMask', '#f6851b', 'metamask.png', () => window.ethereum?.isMetaMask && !window.ethereum?.isBraveWallet],
  ['Solflare', '#fc7227', 'solflare.svg', () => !!window.solflare],
  ['Backpack', '#e33e3f', 'backpack.png', () => !!window.backpack]];
const SOCIALS = [
  ['Google', '#f5f5f5', 0, '<svg viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>'],
  ['X', '#f5f5f5', 0, '<svg viewBox="0 0 24 24" fill="#fff"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.3-8.3L1 2h6.4l4.4 5.8zm-1.1 18.2h1.7L6.7 3.7H4.9z"/></svg>'],
  ['Discord', '#5865f2', 0, '<svg viewBox="0 0 24 24" fill="#fff"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>'],
  ['GitHub', '#f5f5f5', 0, '<svg viewBox="0 0 16 16" fill="#fff"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>']];
const MAIL = ['Email', '#f5f5f5'];
const walletTile = w => `<span class="cw-tile">${w[2] ? `<img src="/assets/wallets/${w[2]}" alt="">` : w[3] || I.mail}</span>`;
let cw = null, cwTimers = [];
function drawConnect() {
  // Reading these globals only tells us what is installed. Nothing is requested from them.
  const list = WALLETS.map((w, i) => ({ w, i, on: !!w[3]() })).sort((a, b) => b.on - a.on);
  $('.cw-body', cw).innerHTML = `<div class="cw-head"><span class="cw-mark"><i></i></span><p class="kick">Back the build.</p><h2 class="display">Sign in</h2><p class="cw-sub">Connect a wallet, or use email.<br>A wallet can be added later.</p></div>
    <div class="cw-list">${list.map(({ w, i, on }) => `<button data-w="${i}">${walletTile(w)}<b>${w[0]}</b>${on ? '<em>Detected</em>' : I.next}</button>`).join('')}</div>
    <div class="cw-or"><span>or</span></div>
    <form class="cw-mail" novalidate><label>${I.mail}<span class="sr">Email address</span><input id="cw-em" type="email" autocomplete="email" placeholder="you@example.com"></label><button class="btn primary" type="submit" disabled>Continue with email</button></form>
    <div class="cw-soc">${SOCIALS.map((s, i) => `<button data-soc="${i}" aria-label="Continue with ${s[0]}" title="${s[0]}">${s[3]}</button>`).join('')}</div>
    <p class="cw-note">Concept demo. No extension is contacted and nothing is signed.</p>`;
}
function pickWallet(w) {
  const body = $('.cw-body', cw);
  body.innerHTML = `<div class="cw-wait"><span class="cw-ring" style="--c:${w[1]}">${walletTile(w)}</span><h2 class="display">Waiting for ${esc(w[0])}</h2>
    <div class="cw-steps"><div>${I.check}Request account</div><div>${I.check}Sign the welcome message</div><div>${I.check}Load your points</div></div></div>`;
  $$('.cw-steps div', body).forEach((d, i) => cwTimers.push(setTimeout(() => d.classList.add('ok'), 420 * (i + 1))));
  cwTimers.push(setTimeout(() => {
    wallet = { addr: 'Demo...wallet', name: w[0] };
    store.set('wallet', wallet);
    renderTop();
    document.dispatchEvent(new Event('wallet'));
    $('.cw-wait', body).classList.add('done');
    $('h2', body).textContent = 'You are in';
  }, 1500));
  cwTimers.push(setTimeout(() => { cw.close(); toast('Demo wallet. No extension was contacted.'); }, 2200));
}
function connect() {
  if (!cw) {
    cw = document.createElement('dialog');
    cw.className = 'cw';
    cw.setAttribute('aria-label', 'Sign in');
    cw.innerHTML = `<div class="cw-box"><button class="cw-x" aria-label="Close">${I.x}</button><div class="cw-body"></div></div>`;
    document.body.append(cw);
    cw.addEventListener('click', e => {
      if (e.target === cw || e.target.closest('.cw-x')) return cw.close();
      const b = e.target.closest('[data-w]');
      if (b) return pickWallet(WALLETS[+b.dataset.w]);
      const s = e.target.closest('[data-soc]');
      if (s) pickWallet(SOCIALS[+s.dataset.soc]);
    });
    cw.addEventListener('input', e => {
      if (e.target.id === 'cw-em') $('.cw-mail button', cw).disabled = !e.target.validity.valid || !e.target.value;
    });
    cw.addEventListener('submit', e => { e.preventDefault(); pickWallet(MAIL); });
    cw.addEventListener('close', () => cwTimers.splice(0).forEach(clearTimeout));
  }
  drawConnect();
  cw.showModal();
}
function toggleAccount() {
  const had = $('.acct');
  had?.remove();
  if (had) return;
  const e = document.createElement('div');
  e.className = 'acct panel';
  e.innerHTML = `<div class="a-id"><span class="av"></span><div><b class="mono">${esc(wallet.addr)}</b><span>${esc(wallet.name || 'Demo')}, demo only</span></div></div>
    <div class="a-row"><span>Balance</span><b class="mono">12.40 SOL</b></div><div class="a-row"><span>Points</span><b class="mono">12,480</b></div>
    <div class="a-acts"><a class="btn sm" href="/rewards" data-l>Rewards</a><button class="btn sm" data-disc>Disconnect</button></div>`;
  $('#top .right').append(e);
}
function disconnect() {
  wallet = null; store.set('wallet', null); renderTop();
  document.dispatchEvent(new Event('wallet'));
}

/* shell */
const NAV = [['/', 'Explore', 'compass'], ['/rewards', 'Rewards', 'gift'], ['/launch', 'Launch', 'rocket']];
function activeNav() {
  const p = location.pathname;
  if (p === '/' || p.startsWith('/project')) return '/';
  return NAV.find(n => n[0] === p)?.[0] || '/';
}
const comet = c => [[34, .3], [20, .6], [9, 1]].map(([d, o]) => `<rect class="c${d}" pathLength="100" style="stroke:${c};opacity:${o}"/>`).join('');
const EDGE = `<svg class="m-edge" aria-hidden="true"><rect class="base" pathLength="100"/><g class="glow">${comet('#ffae2c')}</g><g class="glow late">${comet('#9ebfff')}</g><g>${comet('#ffe0a7')}</g><g class="late">${comet('#fff')}</g></svg>`;
function renderTop() {
  $('#top').innerHTML = `<i class="top-bg" aria-hidden="true"></i>
    <a class="brand mark" href="/" data-l aria-label="machine.fun home"><i></i></a>
    <nav class="pill" aria-label="Primary"><span class="slide"></span>
      ${NAV.map(n => `<a href="${n[0]}" data-l data-nav="${n[0]}">${I[n[2]]}<span>${n[1]}</span></a>`).join('')}
    </nav>
    <div class="right">
      <button class="btn ico" data-search aria-label="Search projects">${I.search}</button>
      <a class="btn metal" href="/launch" data-l aria-label="Launch Project">${EDGE}<span class="m-in">${I.rocket}<em class="lbl">Launch Project</em></span></a>
      <button class="btn conn ${wallet ? 'on' : 'cta'}" id="conn">${wallet ? `<span class="av"></span><span>${esc(wallet.addr)}</span>${I.chev}` : `<span>${I.wallet}Connect</span>`}</button>
    </div>`;
  $('#conn').onclick = () => wallet ? toggleAccount() : connect();
  $('#tabbar').innerHTML = NAV.map(n => `<a href="${n[0]}" data-l data-nav="${n[0]}">${I[n[2]]}${n[1]}</a>`).join('');
  markNav();
}
function markNav() {
  fitNav();
  const a = activeNav();
  $$('[data-nav]').forEach(e => e.classList.toggle('on', e.dataset.nav === a));
  const on = $('.pill a.on'), sl = $('.pill .slide');
  if (on && sl) {
    sl.style.width = on.offsetWidth + 'px';
    sl.style.transform = `translateX(${on.offsetLeft}px)`;
    sl.style.opacity = 1;
  }
}
function renderFoot() {
  const ex = 'target="_blank" rel="noopener"';
  $('#foot').innerHTML = `<div class="ft-sky" aria-hidden="true"></div><div class="ft-in">
    <div class="ft-cols">
      <a class="brand mark" href="/" data-l aria-label="machine.fun"><i></i></a>
      <div class="ft-links">
        <div><h4>Product</h4><ul>
          <li><a href="/" data-l>Explore</a></li><li><a href="/launch" data-l>Launch</a></li><li><a href="/rewards" data-l>Rewards</a></li><li><a href="https://foundry.machine.fun" ${ex}>Foundry</a></li></ul></div>
        <div><h4>Resources</h4><ul>
          <li><a href="https://app.simarena.ai" ${ex}>SimArena</a></li><li><a href="https://docs.machine.fun" ${ex}>Docs</a></li><li><a href="https://machine.fun/terms" ${ex}>Terms</a></li><li><a href="https://machine.fun/privacy" ${ex}>Privacy</a></li></ul></div>
      </div>
      <div class="ft-soc"><a href="https://twitter.com/machinedotfun" ${ex} aria-label="X">${I.xb}</a><a href="https://github.com/machinedotfun" ${ex} aria-label="GitHub">${I.github}</a></div>
    </div>
    <p class="ft-risk">Tokens can be volatile or lose all value. Transactions cannot be reversed. A listing is not an endorsement. Nothing on this page is financial advice.</p>
    <div class="ft-base">
      <div class="ft-pw"><span>Powered by</span>
        <a href="https://codecflow.ai" ${ex}><img src="/assets/art/codecflow-white.svg" alt="">codecflow</a><i>×</i>
        <a href="https://peaq.xyz" ${ex} aria-label="peaq"><img src="/assets/art/peaq-white.svg" alt="peaq"></a><i>×</i>
        <a href="https://app.simarena.ai" ${ex}><img src="/assets/art/simarena-white.svg" alt="">SimArena</a></div>
      <span class="ft-by">Unofficial concept by Rony</span></div>
  </div>`;
}
const earnLogos = { 'machine.fun': '<i class="mk"></i>', 'FOMO or PUMP': '<img src="/assets/art/fomo.png" alt=""><img src="/assets/art/pump.png" alt="">' };
function renderChrome() {
  const lay = $('#layer');
  lay.innerHTML = `<button class="review" id="rv">${I.sliders}Review controls</button>`;
  $('#rv').onclick = () => {
    const d = $('.drawer');
    if (d) return d.remove();
    const e = document.createElement('div');
    e.className = 'drawer';
    const draw = () => {
      e.innerHTML = `<div class="eyebrow">Simulate the network</div>
      <p>Shows how the page behaves when RPC is slow or down.</p>
      <div class="seg sm" style="justify-self:start">${[['ok', 'Normal'], ['slow', 'Slow'], ['down', 'Down']].map(n => `<button data-n="${n[0]}" class="${net === n[0] ? 'on' : ''}">${n[1]}</button>`).join('')}</div>`;
      $$('[data-n]', e).forEach(b => b.onclick = () => { net = b.dataset.n; draw(); route(true); });
    };
    draw();
    lay.append(e);
  };
  if (!store.get('terms', false)) {
    document.body.classList.add('has-terms');
    const t = document.createElement('div');
    t.className = 'terms';
    t.innerHTML = `<span class="t-mark"><i></i></span><div class="t-copy"><b>Browse freely</b><p>Terms apply only when you sign in or trade.</p></div>
      <a class="t-read" href="https://machine.fun/terms" target="_blank" rel="noopener">Read terms</a><button class="btn sm primary" id="tok">Got it</button>`;
    lay.append(t);
    $('#tok').onclick = () => { store.set('terms', true); t.classList.add('out'); document.body.classList.remove('has-terms'); setTimeout(() => t.remove(), 320); };
  }
}

/* Generated robot face for a wallet, the same address always gets the same one */
function avatar(seed) {
  let h = 7;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pick = (a, s) => a[(h >>> s) % a.length];
  const col = pick([['#c60925', '#ff6a2b'], ['#2b5cff', '#27c4ff'], ['#7a3cff', '#ff4fa3'], ['#0fa37f', '#c6ff3b'], ['#ff9f1c', '#ffe066'], ['#39424e', '#b6c2cf'], ['#e0115f', '#ffb27a']], 0);
  const head = pick(['<rect x="9" y="11" width="22" height="21" rx="7"/>', '<circle cx="20" cy="21.500" r="11.500"/>', '<rect x="10" y="10" width="20" height="23" rx="10"/>', '<path d="M12 11h16l4 8v9a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5v-9z"/>'], 3);
  const top = pick(['', '<path d="M20 11V6" stroke="#0f0f14" stroke-width="2"/><circle cx="20" cy="5" r="2" fill="#0f0f14"/>', '<rect x="4.500" y="18" width="4" height="8" rx="2" fill="#0f0f14"/><rect x="31.500" y="18" width="4" height="8" rx="2" fill="#0f0f14"/>'], 7);
  const eyes = pick(['<circle cx="15.500" cy="20" r="2.600"/><circle cx="24.500" cy="20" r="2.600"/>', '<rect x="12.500" y="18" width="15" height="4.500" rx="2.200"/>', '<rect x="13" y="17.500" width="5" height="5" rx="1.500"/><rect x="22" y="17.500" width="5" height="5" rx="1.500"/>', '<circle cx="20" cy="20" r="3.600"/>'], 11);
  const mouth = pick(['<path d="M15 26q5 3.600 10 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', '<rect x="15" y="25.500" width="10" height="2.200" rx="1.100"/>', '<circle cx="20" cy="26.800" r="1.800"/>'], 15);
  const id = 'av' + h.toString(36);
  return `<svg class="ava" viewBox="0 0 40 40" aria-hidden="true" style="color:${col[1]}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${col[0]}"/><stop offset="1" stop-color="${col[1]}"/></linearGradient></defs><circle cx="20" cy="20" r="20" fill="url(#${id})"/>${top}<g fill="#0f0f14">${head}</g><g fill="currentColor">${eyes}${mouth}</g></svg>`;
}

/* cards */
function spark(p) {
  const v = p.spark || [], up = isUp(p), col = up ? '#c6ff3b' : '#ff3f3f';
  if (v.length < 2) return `<div class="sp"><svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30H100" stroke="rgba(255,255,255,.2)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/></svg></div>`;
  const min = Math.min(...v), max = Math.max(...v), r = max - min || 1;
  const pts = v.map((y, i) => [(i / (v.length - 1)) * 100, 36 - ((y - min) / r) * 32]);
  const f = n => n.toFixed(1), end = pts[pts.length - 1];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f((pts[i][0] + pts[i + 1][0]) / 2)} ${f((pts[i][1] + pts[i + 1][1]) / 2)}`;
  d += `L${f(end[0])} ${f(end[1])}`;
  const id = 'g' + p.ref.replace(/[^a-z0-9]/gi, '');
  return `<div class="sp"><svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".3"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
    <path d="${d}L100 40L0 40Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${col}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg><i style="top:${(end[1] / 40 * 100).toFixed(1)}%;background:${col}"></i></div>`;
}
const proofMinis = p => {
  const o = [];
  if (p.proof?.sim) o.push('<span class="mini hw">Sim</span>');
  if (p.proof?.d3) o.push('<span class="mini hw">3D</span>');
  if (p.proof?.pcb) o.push('<span class="mini hw">PCB</span>');
  return o.join('');
};
const tagsRow = p => proofMinis(p) + (p.tags || []).slice(0, 3).map(t => `<span class="mini">${esc(t)}</span>`).join('');
/* Simulated market on top of the snapshot: the real values stay in P */
const live = new Map();
let liveTimer = 0;
const fmtChange = n => (n < 0 ? '' : '+') + n.toFixed(1) + '%';
function walk(mc, base, ref) {
  let h = [...ref].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1009, 7);
  const out = Array.from({ length: 40 }, (_, i) => {
    h = (h * 31 + 7) % 1009;
    const t = i / 39;
    return base + (mc - base) * t + mc * .09 * (h / 1009 - .5) * Math.sin(Math.PI * t);
  });
  out[39] = mc;
  return out;
}
function liveOf(p) {
  if (!live.has(p.ref)) {
    const mc = p.mc || 1, chg = parseFloat(p.change) || 0, base = mc / (1 + chg / 100);
    live.set(p.ref, { mc, base, vol: p.vol || 0, change: p.change || '', prog: p.prog || 0, mig: p.mig, spark: p.spark?.length >= 24 ? [...p.spark] : walk(mc, base, p.ref) });
  }
  return live.get(p.ref);
}
const heat = v => v.mig ? '' : v.prog >= .9 ? 'forge' : v.prog >= .7 ? 'hot' : '';
const stageLabel = v => v.mig ? 'Migrated' : (v.prog >= .9 ? 'Forging ' : v.prog >= .7 ? 'Heating ' : 'Curve ') + Math.min(99, v.prog * 100).toFixed(0) + '%';
// A few projects run close to the bond so the forge state is always on show
function seedForge() {
  const bond = tokens().filter(p => !p.mig).sort((a, b) => (b.mc || 0) - (a.mc || 0));
  [[0, .955], [1, .9], [3, .93], [4, .76], [6, .82]].forEach(([i, v]) => { if (bond[i]) liveOf(bond[i]).prog = v; });
}
// Numbers glide to their new value instead of jumping
const tweens = new Map();
let tweenRaf = 0;
function tween(n, from, to, fmt) {
  if (reduced || lite) { n.textContent = fmt(to); return; }
  const s = tweens.get(n), start = s ? s.v : from;
  tweens.set(n, { a: start, b: to, v: start, t: performance.now(), fmt });
  tweenRaf ||= requestAnimationFrame(stepTweens);
}
let tweenAt = 0;
function stepTweens(now) {
  tweenRaf = 0;
  if (now - tweenAt < 30) { tweenRaf = requestAnimationFrame(stepTweens); return; }
  tweenAt = now;
  tweens.forEach((s, n) => {
    const k = Math.min(1, Math.max(0, (now - s.t) / 900));
    s.v = s.a + (s.b - s.a) * (1 - (1 - k) ** 3);
    const t = s.fmt(s.v);
    if (n.textContent !== t) n.textContent = t;
    if (k === 1 || !n.isConnected) tweens.delete(n);
  });
  if (tweens.size) tweenRaf = requestAnimationFrame(stepTweens);
}
// Same nodes, new geometry, so the line morphs and hover state survives
function paintSpark(sp, p, v) {
  const t = document.createElement('template');
  t.innerHTML = spark({ ...p, ...v });
  const next = t.content.firstElementChild, a = $$('path', sp), b = $$('path', next);
  if (a.length !== b.length || a.length < 2) { sp.replaceChildren(...next.childNodes); return; }
  a.forEach((x, i) => { x.setAttribute('d', b[i].getAttribute('d')); if (i) x.setAttribute('stroke', b[i].getAttribute('stroke')); });
  $$('stop', sp).forEach((x, i) => x.setAttribute('stop-color', $$('stop', next)[i].getAttribute('stop-color')));
  $('i', sp).style.cssText = $('i', next).style.cssText;
}
function paintLive(e, p, v, d, was) {
  const num = (k, to, from, fmt) => { const x = $(`[data-f=${k}]`, e); if (x) tween(x, from, to, fmt); };
  num('mc', v.mc, was.mc, usd); num('vol', v.vol, was.vol, usd);
  const stage = $('[data-f=stage]', e);
  if (stage) stage.textContent = stageLabel(v);
  const chg = $('[data-f=chg]', e);
  if (chg) { num('chg', (v.mc / v.base - 1) * 100, (was.mc / v.base - 1) * 100, fmtChange); chg.classList.remove('mut2', 'flat'); chg.classList.toggle('up', !v.change.startsWith('-')); chg.classList.toggle('down', v.change.startsWith('-')); }
  const n = $('[data-f=mc]', e);
  if (!reduced) n.animate([{ color: d < 0 ? '#ff8a7a' : '#d8ff7a', offset: 0 }], { duration: 1100, easing: 'cubic-bezier(.16,1,.3,1)' });
  const bar = $('.bar', e);
  if (bar) { bar.className = `bar ${v.mig ? 'done' : heat(v)}`; $('i', bar).style.width = Math.max(v.mig ? 100 : v.prog * 100, .6) + '%'; }
  const sp = $('.sp', e);
  if (sp?.closest('.fnd-row')) { $('path', sp).setAttribute('d', miniPath(v.spark)); sp.classList.toggle('down', v.change.startsWith('-')); sp.classList.toggle('up', !v.change.startsWith('-')); }
  else if (sp) paintSpark(sp, p, v);
  e.classList.toggle('forge', heat(v) === 'forge');
}
let liveBeat = 0;
function tickLive() {
  if (document.hidden || location.pathname !== '/' || fnd.el?.open) return;
  const page = $$('.page')[ex.page];
  if (!page || (lite && ++liveBeat % 3)) return;
  const groups = new Map();
  [...$$('[data-live]', page), ...$$('#watch [data-live]')].forEach(e => {
    const b = e.getBoundingClientRect();
    if (b.bottom < 0 || b.top > innerHeight) return;
    const r = e.dataset.live;
    groups.has(r) ? groups.get(r).push(e) : groups.set(r, [e]);
  });
  groups.forEach((els, ref) => {
    if (Math.random() > .45) return;
    setTimeout(() => stepToken(ref, () => els), Math.random() * 800);
  });
}
// Search stays live too, only the rows in view are touched so typing keeps its speed
function tickSearch() {
  if (!fnd.el?.open) { clearInterval(fnd.live); fnd.live = 0; return; }
  if (document.hidden) return;
  const box = $('#fnd-list'), first = Math.floor(box.scrollTop / ROW);
  if (lite && ++liveBeat % 3) return;
  for (let i = first; i < first + 10; i++) {
    const p = fnd.rows[i];
    if (!p?.mint || Math.random() > .6) continue;
    setTimeout(() => stepToken(p.ref, () => $$(`#fnd-list [data-live="${CSS.escape(p.ref)}"]`)), Math.random() * 800);
  }
}
function stepToken(ref, targets) {
      const p = byRef.get(ref), v = liveOf(p), hot = !!heat(v), was = { mc: v.mc, vol: v.vol }, els = targets();
      const d = (Math.random() - (hot ? .3 : .5)) * (hot ? .018 : .03);
      v.mc *= 1 + d;
      v.vol += v.mc * Math.abs(d) * .6;
      // The tip moves every tick, the line only rolls forward now and then
      v.n = (v.n || 0) + 1;
      const tip = v.spark[v.spark.length - 1] * (1 + d);
      v.spark = v.n % 6 ? [...v.spark.slice(0, -1), tip] : [...v.spark.slice(-39), tip];
      v.change = fmtChange((v.mc / v.base - 1) * 100);
      if (!v.mig) v.prog = Math.min(1, v.prog + (hot ? Math.random() * .006 : Math.max(0, d) * .04));
      if (!v.mig && v.prog >= 1) {
        v.mig = true;
        els.forEach(e => { e.classList.add('bonded'); setTimeout(() => e.classList.remove('bonded'), 1200); });
        const next = tokens().find(q => !liveOf(q).mig && liveOf(q).prog < .7);
        if (next) liveOf(next).prog = .84;
      }
      els.forEach(e => paintLive(e, p, v, d, was));
}
function card(p, opts = {}) {
  if (p.mint && !opts.preview) p = { ...p, ...liveOf(p) };
  const st = stageOf(p), dup = p.ticker && dupCount[p.ticker.toUpperCase()] > 1;
  return `<a class="card ${heat(p) === 'forge' ? 'forge' : ''}" href="/project/${esc(p.ref)}" data-l data-pre="${esc(p.ref)}"${p.mint && !opts.preview ? ` data-live="${esc(p.ref)}"` : ''}>
    <div class="c-top"><img class="bg" src="${coverSrc(p)}" alt="" loading="lazy" decoding="async">
      ${spark(p)}
      <img class="logo" data-vt="${esc(p.ref)}" src="${logoSrc(p)}" alt="" loading="lazy" decoding="async" width="84" height="84">
      <span class="age">${ago(p.at)}</span>
      ${opts.preview ? '' : `<button class="star ${watch.has(p.ref) ? 'on' : ''}" data-star="${esc(p.ref)}" aria-label="Add to watchlist">${I.star}</button>`}
    </div>
    <div class="c-body">
      <div class="c-tick"><span>$${esc(p.ticker || '')}</span>${opts.preview ? '' : `<button class="copy-ca" data-copy="${esc(p.mint)}" aria-label="Copy contract address">${I.copy}</button>`}${dup ? `<span class="dup" title="${dupCount[p.ticker.toUpperCase()]} projects use this ticker">dup x${dupCount[p.ticker.toUpperCase()]}</span>` : ''}</div>
      <div class="c-name">${esc(p.name)}</div>
      <div class="c-tags">${tagsRow(p)}</div>
      <div class="c-mc"><span class="num" data-f="mc">${usd(p.mc)}</span><span class="pair">/ ${esc(p.quote || 'SOL')}</span></div>
      <div class="bar ${st === 'mig' ? 'done' : heat(p)}"><i style="width:${Math.max(pct(p), .6)}%"></i></div>
      <div class="c-ft"><span data-f="stage">${stageLabel(p)}</span>
        <span data-f="chg" class="${p.change ? (isUp(p) ? 'up' : 'down') : ''}">${p.change || 'No trades'}</span><span data-f="vol">${usd(p.vol)}</span></div>
    </div></a>`;
}
function rowItem(p) {
  p = { ...p, ...liveOf(p) };
  return `<a class="row-l" href="/project/${esc(p.ref)}" data-l data-pre="${esc(p.ref)}" data-live="${esc(p.ref)}">
    <img class="logo" data-vt="${esc(p.ref)}" src="${logoSrc(p)}" alt="" loading="lazy">
    <div class="n"><b>${esc(p.name)}</b><span>$${esc(p.ticker)} ${stageTxt[stageOf(p)]}</span></div>
    <span class="num" style="font-size:15px" data-f="mc">${usd(p.mc)}</span>
    <span class="h ${p.change ? (isUp(p) ? 'up' : 'down') : 'mut2'}" data-f="chg">${p.change || '-'}</span>
    <span class="h" data-f="vol">${usd(p.vol)}</span><span class="h">${int(p.holders)}</span>
    <button class="star ${watch.has(p.ref) ? 'on' : ''}" data-star="${esc(p.ref)}" aria-label="Add to watchlist">${I.star}</button></a>`;
}

/* home */
const ex = { tag: 'all', stage: 'all', sort: 'mc', view: store.get('view', 'grid'), page: 0, pages: 0, size: 16 };
let homeEl = null, gridBox = null, heroTimer = 0, pageTimer = 0;
const tokens = () => P.filter(p => p.mint);
function exploreList() {
  const l = tokens().filter(p => {
    if (ex.tag !== 'all' && !p.tags.includes(ex.tag)) return false;
    if (ex.stage === 'bond' && p.mig) return false;
    if (ex.stage === 'mig' && !p.mig) return false;
    return true;
  });
  const s = { mc: (a, b) => (b.mc || 0) - (a.mc || 0), vol: (a, b) => (b.vol || 0) - (a.vol || 0), new: (a, b) => new Date(b.at) - new Date(a.at), hold: (a, b) => (b.holders || 0) - (a.holders || 0) }[ex.sort];
  return l.sort(s);
}
// Four rows a page: the column count comes from the same breakpoints as .grid
const perPage = () => ex.view === 'list' ? 10 : 3 * +getComputedStyle(document.documentElement).getPropertyValue('--cols');
function drawGrid() {
  const list = exploreList(), box = gridBox;
  ex.size = perPage();
  $('#ex-count').textContent = list.length;
  if (!list.length) {
    box.innerHTML = `<div class="empty"><b>Nothing matches these filters</b><button class="btn sm" id="clr">Clear filters</button></div>`;
    $('#clr').onclick = () => { ex.tag = 'all'; ex.stage = 'all'; ex.page = 0; syncControls(); drawGrid(); };
    return drawPager(0);
  }
  const pages = [];
  for (let i = 0; i < list.length; i += ex.size) pages.push(list.slice(i, i + ex.size));
  box.innerHTML = `<div class="pages" id="pages">${pages.map(g => `<div class="page">${ex.view === 'grid' ? `<div class="grid">${g.map(p => card(p)).join('')}</div>` : `<div class="list">${g.map(rowItem).join('')}</div>`}</div>`).join('')}</div>`;
  $('#pages').addEventListener('scroll', e => {
    clearTimeout(pageTimer);
    pageTimer = setTimeout(() => { ex.page = Math.round(e.target.scrollLeft / (e.target.clientWidth + 24)); markPager(); }, 90);
  }, { passive: true });
  dragScroll($('#pages'), () => $('#pages').clientWidth + 24);
  drawPager(pages.length);
  goPage(ex.page, true);
  $('#pages').style.setProperty('--ph', $('.page.cur').offsetHeight + 'px');
}
function drawPager(n) {
  ex.pages = n;
  const arrow = d => `<button class="pg" data-pg="${d}" aria-label="${d < 0 ? 'Previous' : 'Next'} page">${d < 0 ? I.prev : I.next}</button>`;
  $('#pgn-top').innerHTML = n > 1 ? `<span class="mono mut">Page <span id="pg-now"></span> of ${n}</span>${arrow(-1)}${arrow(1)}` : '';
  $('#pgn').innerHTML = n > 1 ? `${arrow(-1)}<div class="pg-n" id="pg-n"></div>${arrow(1)}` : '';
}
// Seven slots at most, so the pager never changes width as pages are added
function pgSlots(n, at) {
  if (n <= 7) return Array.from({ length: n }, (_, i) => i);
  if (at < 4) return [0, 1, 2, 3, 4, null, n - 1];
  if (at > n - 5) return [0, null, n - 5, n - 4, n - 3, n - 2, n - 1];
  return [0, null, at - 1, at, at + 1, null, n - 1];
}
function markPager() {
  const nums = $('#pg-n'), held = document.activeElement?.dataset?.pgTo;
  if (nums) nums.innerHTML = pgSlots(ex.pages, ex.page).map(i => i === null ? '<span class="pg gap">...</span>' : `<button class="pg ${i === ex.page ? 'on' : ''}" data-pg-to="${i}" aria-label="Page ${i + 1}">${i + 1}</button>`).join('');
  if (held !== undefined) $('#pg-n .on')?.focus({ preventScroll: true });
  $$('[data-pg]').forEach(b => { const to = ex.page + +b.dataset.pg; b.disabled = to < 0 || to >= ex.pages; });
  const t = $('#pg-now');
  if (t) t.textContent = ex.page + 1;
  $$('.page').forEach((p, i) => p.classList.toggle('cur', i === ex.page));
}
function goPage(i, instant) {
  const w = $('#pages');
  if (!w) return;
  ex.page = Math.max(0, Math.min(ex.pages - 1, i));
  markPager();
  w.scrollTo({ left: ex.page * (w.clientWidth + 24), behavior: instant || reduced ? 'auto' : 'smooth' });
}
function syncControls() {
  $$('[data-tag]').forEach(b => b.classList.toggle('on', b.dataset.tag === ex.tag));
  $$('[data-stage]').forEach(b => b.classList.toggle('on', b.dataset.stage === ex.stage));
  $$('[data-sort]').forEach(b => b.classList.toggle('on', b.dataset.sort === ex.sort));
  $$('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === ex.view));
}
function renderWatch() {
  const w = $('#wrail');
  if (!w) return;
  const items = [...watch].map(r => byRef.get(r)).filter(Boolean);
  const left = w.scrollLeft;
  w.innerHTML = (items.length ? items.map(p => {
    const v = liveOf(p), up = !v.change.startsWith('-');
    return `<div class="chip-w" data-live="${esc(p.ref)}"><a href="/project/${esc(p.ref)}" data-l><img src="${logoSrc(p)}" alt=""><b>${esc(p.name)}</b><span class="m" data-f="mc">${usd(v.mc)}</span><span class="${v.change ? (up ? 'up' : 'down') : ''}" data-f="chg">${v.change}</span></a><button class="star on" data-star="${esc(p.ref)}" aria-label="Remove from watchlist">${I.star}</button></div>`;
  }).join('') : '<span>Nothing on your watchlist. Star a project to follow it.</span>');
  w.scrollLeft = left;
  markWatch();
}
function markWatch() {
  const w = $('#wrail');
  if (!w) return;
  const max = w.scrollWidth - w.clientWidth, start = w.scrollLeft <= 1, end = w.scrollLeft >= max - 1;
  w.classList.toggle('at-start', start);
  w.classList.toggle('at-end', end);
  $('.w-nav').hidden = max <= 1;
  $('[data-wa="-1"]').disabled = start;
  $('[data-wa="1"]').disabled = end;
}
function watchRail(w) {
  let goal = null, goalT = 0;
  dragScroll(w);
  w.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY, max = w.scrollWidth - w.clientWidth;
    if (!d || max <= 0 || (d < 0 && w.scrollLeft <= 0) || (d > 0 && w.scrollLeft >= max - 1)) return;
    e.preventDefault();
    w.scrollLeft += d;
  }, { passive: false });
  w.addEventListener('scroll', markWatch, { passive: true });
  new ResizeObserver(markWatch).observe(w);
  w.parentElement.addEventListener('click', e => {
    const a = e.target.closest('[data-wa]');
    if (!a) return;
    // Quick clicks add up from the last target and always land on a whole chip
    const unit = $('.chip-w', w).offsetWidth + 10, page = Math.max(1, Math.floor((w.clientWidth + 10) / unit));
    const from = goal ?? w.scrollLeft, max = w.scrollWidth - w.clientWidth;
    goal = Math.max(0, Math.min(max, (Math.round(from / unit) + +a.dataset.wa * page) * unit));
    w.scrollTo({ left: goal, behavior: reduced ? 'auto' : 'smooth' });
    clearTimeout(goalT);
    goalT = setTimeout(() => { goal = null; }, 600);
  });
}
function preRail() {
  const seen = new Set(), pick = /NeuroTech|Making Robotics|Autonomous Web3|fullfilling/i;
  const real = P.filter(p => !p.mint && p.logo && /\s/.test(p.desc || '') && p.desc !== p.name && !seen.has(p.name) && seen.add(p.name));
  const rank = p => pick.test(p.name + ' ' + p.desc) ? 0 : 1;
  return [SAMPLE, ...real.sort((a, b) => rank(a) - rank(b)).slice(0, 11).map(p => ({ ...p, pre: true }))];
}
// Mouse drag for the sideways lists, landing on a whole card
function dragScroll(w, step) {
  let on = false, moved = false, x = 0, s = 0, dx = 0;
  w.classList.add('drag');
  w.addEventListener('dragstart', e => e.preventDefault());
  w.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button || e.target.closest('button')) return;
    on = true; moved = false; x = e.clientX; s = w.scrollLeft; dx = 0;
  });
  w.addEventListener('pointermove', e => {
    if (!on) return;
    dx = e.clientX - x;
    if (!moved) {
      if (Math.abs(dx) < 6) return;
      moved = true; w.setPointerCapture(e.pointerId); w.classList.add('dragging');
    }
    w.scrollLeft = s - dx;
  });
  const up = () => {
    if (!on) return;
    on = false;
    if (!moved) return;
    if (!step) return w.classList.remove('dragging');
    const st = step();
    w.scrollTo({ left: Math.round(w.scrollLeft / st + (dx < 0 ? .3 : -.3)) * st, behavior: reduced ? 'auto' : 'smooth' });
    setTimeout(() => w.classList.remove('dragging'), 460);
  };
  w.addEventListener('pointerup', up);
  w.addEventListener('pointercancel', up);
  w.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
}
function markRail() {
  const w = $('#rail');
  if (!w) return;
  const max = w.scrollWidth - w.clientWidth - 2;
  $$('[data-rail]').forEach(b => { b.disabled = +b.dataset.rail < 0 ? w.scrollLeft < 2 : w.scrollLeft > max; });
}
function preCard(p) {
  const on = reminds.has(p.ref);
  return `<a class="pre" href="/project/${esc(p.ref)}" data-l>
    <div class="row"><img src="${logoSrc(p)}" alt="" loading="lazy"><div style="min-width:0"><h3>${esc(p.name)}</h3><span class="tagline">${p.sample ? 'Full sample' : 'On the list'}</span></div></div>
    <p>${esc(p.desc)}</p>
    <div class="ft"><span class="mono mut2" style="font-size:11.5px">Date TBD</span><button class="btn sm" data-remind="${esc(p.ref)}">${I.bell}${on ? 'Reminder set' : 'Remind me'}</button></div></a>`;
}
function buildHome() {
  const t = tokens(), allTags = {};
  t.forEach(p => p.tags.forEach(x => allTags[x] = (allTags[x] || 0) + 1));
  const tagList = Object.entries(allTags).sort((a, b) => b[1] - a[1]).map(a => a[0]);
  const sum = k => t.reduce((a, p) => a + (p[k] || 0), 0);
  const words = ['machines', 'robots', 'hardware', 'inventions', 'devices', 'ideas', 'agents'];
  const el = document.createElement('div');
  el.className = 'wrap enter';
  seedForge();
  el.innerHTML = `
  <section class="hero">
    <div class="h-mask" aria-hidden="true"><div class="h-sky">
      <img class="plate" src="/assets/art/sky-hero.webp" srcset="/assets/art/sky-hero-m.webp 1800w,/assets/art/sky-hero.webp 3840w" sizes="100vw" alt="" fetchpriority="high" decoding="async">
      <img class="fly" src="/assets/art/fly-cut.webp" alt="" fetchpriority="high" decoding="async">
      <i class="h-grain"></i>
    </div></div>
    <div class="h-in">
      <div class="copy">
        <p class="kick">Back the build.</p>
        <h1 class="display"><span class="l"><span class="chr">Fund the </span><span class="rot">${words.map((w, i) => `<b class="${i ? '' : 'on'}">${w}</b>`).join('')}</span></span><span class="l"><span class="chr">that actually get built</span></span></h1>
        <p class="sub">Launch a physical product, prove it works, raise on chain through verifiable milestones.</p>
      </div>
      <div class="h-strip">
        <div><div class="eyebrow">Live projects</div><div class="num">${t.length}</div></div>
        <div><div class="eyebrow">Migrated</div><div class="num">${t.filter(p => p.mig).length}</div></div>
        <div><div class="eyebrow">Total market cap</div><div class="num">${usd(sum('mc'))}</div></div>
        <div><div class="eyebrow">Holders</div><div class="num">${int(sum('holders'))}</div></div>
        <div class="h-by"><div class="eyebrow">In collaboration with</div><div class="logos"><span><img src="/assets/art/codecflow-white.svg" alt="">codecflow</span><img src="/assets/art/peaq-white.svg" alt="peaq"><span><img src="/assets/art/simarena-white.svg" alt="">SimArena</span></div></div>
      </div>
    </div>
  </section>
  <div class="watch" id="watch"><span class="w-ic">${I.star}</span><div class="w-rail" id="wrail"></div><div class="w-nav" hidden><button class="w-arr" data-wa="-1" aria-label="Scroll left">${I.prev}</button><button class="w-arr" data-wa="1" aria-label="Scroll right">${I.next}</button></div></div>
  <section class="panel block grainy" id="prelaunch"><div>
    <div class="head"><div class="ttl"><p class="kick">Up next.</p><h2 class="display">Pre launch</h2></div><div class="grow"><button class="pg" data-rail="-1" aria-label="Previous projects">${I.prev}</button><button class="pg" data-rail="1" aria-label="More projects">${I.next}</button></div></div>
    <div class="rail" id="rail">${preRail().map(preCard).join('')}</div></div>
  </section>
  <section class="panel block grainy" id="explore"><div>
    <div class="head"><div class="ttl"><p class="kick">On the curve.</p><h2 class="display">Explore</h2></div><span class="count" id="ex-count">0</span><div class="grow pgn-top" id="pgn-top"></div></div>
    <div class="controls">
      <button class="search" type="button" data-search>${I.search}<span>Search projects</span><kbd>/</kbd></button>
      <div class="seg">${[['all', 'All'], ['bond', 'Bonding'], ['mig', 'Migrated']].map(s => `<button data-stage="${s[0]}">${s[1]}</button>`).join('')}</div>
      <div class="seg sort">${[['mc', 'Market cap'], ['vol', 'Volume'], ['hold', 'Holders'], ['new', 'Newest']].map(s => `<button data-sort="${s[0]}">${s[1]}</button>`).join('')}</div>
      <div class="seg"><button class="icon-btn" data-view="grid" aria-label="Grid view">${I.grid}</button><button class="icon-btn" data-view="list" aria-label="List view">${I.list}</button></div>
    </div>
    <div class="tags"><button class="tag-b" data-tag="all">All</button>${tagList.map(x => `<button class="tag-b" data-tag="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div id="neterr"></div>
    <div id="gridbox"></div>
    <div class="pgn" id="pgn"></div></div>
  </section>`;
  homeEl = el; gridBox = $('#gridbox', el);
  const hero = $('.hero', el);
  if (!reduced) hero.addEventListener('pointermove', e => {
    hero.style.setProperty('--px', (e.clientX / innerWidth - .5).toFixed(3));
    hero.style.setProperty('--py', (e.clientY / innerHeight - .5).toFixed(3));
  }, { passive: true });
  watchRail($('#wrail', el));
  const rail = $('#rail', el);
  dragScroll(rail, () => rail.firstElementChild.offsetWidth + 12);
  rail.addEventListener('scroll', markRail, { passive: true });
  el.addEventListener('click', e => {
    const rb = e.target.closest('[data-rail]');
    if (rb) return rail.scrollBy({ left: +rb.dataset.rail * (rail.clientWidth + 12), behavior: reduced ? 'auto' : 'smooth' });
    const pg = e.target.closest('[data-pg],[data-pg-to]');
    if (pg) {
      goPage(pg.dataset.pgTo ? +pg.dataset.pgTo : ex.page + +pg.dataset.pg);
      return;
    }
    const b = e.target.closest('[data-tag],[data-stage],[data-sort],[data-view]');
    if (!b) return;
    const d = b.dataset;
    if (d.tag) ex.tag = d.tag;
    if (d.stage) ex.stage = d.stage;
    if (d.sort) ex.sort = d.sort;
    if (d.view) { ex.view = d.view; store.set('view', d.view); }
    ex.page = 0; syncControls(); drawGrid();
  });
}
function startRot() {
  clearInterval(heroTimer);
  if (reduced) return;
  let i = 0;
  heroTimer = setInterval(() => {
    const w = $$('.rot b');
    if (!w.length) return;
    const a = w[i]; i = (i + 1) % w.length; const b = w[i];
    a.classList.remove('on'); a.classList.add('out');
    b.classList.remove('out');
    b.style.transition = 'none'; b.style.transform = ''; void b.offsetWidth; b.style.transition = '';
    b.classList.add('on');
    setTimeout(() => a.classList.remove('out'), 520);
  }, 2200);
}
function fitPages() {
  if (perPage() === ex.size) return;
  ex.page = Math.floor(ex.page * ex.size / perPage());
  drawGrid();
}
function viewHome() {
  if (!homeEl) buildHome();
  $('#view').replaceChildren(homeEl);
  $('#neterr', homeEl).innerHTML = net === 'down' ? `<div class="err-banner" style="margin-bottom:12px">${I.alert.replace('<svg', '<svg width="18" height="18"')}<span>Live prices are unavailable. Showing the last snapshot.</span><button class="btn sm" data-retry>Retry</button></div>` : '';
  syncControls(); drawGrid(); renderWatch(); startRot(); markRail();
  addEventListener('resize', fitPages, { passive: true });
  onLeave(() => removeEventListener('resize', fitPages));
  liveTimer = setInterval(tickLive, 900);
  onLeave(() => clearInterval(liveTimer));
  onLeave(() => clearInterval(heroTimer));
}

/* search tab: every project, filtered on the client */
const ROW = 62;
const fnd = { el: null, tab: 'all', i: 0, rows: [], map: new Map(), skip: false };
function searchPool() {
  const seen = new Set();
  return [SAMPLE, ...P].filter(p => p.mint || (!seen.has(p.name.toLowerCase()) && seen.add(p.name.toLowerCase())));
}
function searchScore(p, q) {
  const name = p.name.toLowerCase(), tick = (p.ticker || '').toLowerCase();
  if (name === q || tick === q) return 0;
  if (name.startsWith(q) || tick.startsWith(q)) return 1;
  if (name.includes(' ' + q)) return 2;
  if (name.includes(q) || tick.includes(q)) return 3;
  if ((p.mint || '').toLowerCase().includes(q)) return 4;
  if ((p.tags || []).join(' ').toLowerCase().includes(q)) return 5;
  if ((p.desc || '').toLowerCase().includes(q)) return 6;
  return -1;
}
const hl = (t, q) => {
  const s = String(t || ''), i = q ? s.toLowerCase().indexOf(q) : -1;
  return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length));
};
const miniPath = v => {
  const lo = Math.min(...v), hi = Math.max(...v), r = hi - lo || 1;
  return v.map((y, i) => `${i ? 'L' : 'M'}${(i / (v.length - 1) * 84).toFixed(1)} ${(27 - (y - lo) / r * 24).toFixed(1)}`).join('');
};
function miniSpark(p) {
  if (!p.mint) return '<i></i>';
  const v = liveOf(p);
  return `<svg class="sp ${v.change.startsWith('-') ? 'down' : 'up'}" viewBox="0 0 84 30" aria-hidden="true"><path d="${miniPath(v.spark)}"/></svg>`;
}
function drawSearch() {
  const q = $('#fq').value.trim().toLowerCase(), box = $('#fnd-list');
  const hits = searchPool().map(p => [p, q ? searchScore(p, q) : 0]).filter(a => a[1] >= 0).sort((a, b) => a[1] - b[1] || (b[0].mc || 0) - (a[0].mc || 0));
  const count = { all: hits.length, bond: 0, mig: 0, pre: 0 };
  hits.forEach(a => count[stageOf(a[0])]++);
  $$('[data-fnd]').forEach(b => { b.classList.toggle('on', b.dataset.fnd === fnd.tab); $('i', b).textContent = count[b.dataset.fnd]; });
  fnd.rows = hits.map(a => a[0]).filter(p => fnd.tab === 'all' || stageOf(p) === fnd.tab);
  fnd.i = 0;
  fnd.q = q; fnd.map = new Map();
  box.innerHTML = fnd.rows.length ? `<i class="fnd-hl"></i><i class="fnd-sp" style="height:${fnd.rows.length * ROW}px"></i>`
    : `<div class="empty"><b>Nothing matches "${esc($('#fq').value)}"</b><span>Search covers names, tickers, contracts, tags and descriptions.</span></div>`;
  box.scrollTop = 0;
  fnd.on = null; fnd.hl = $('.fnd-hl', box);
  winSearch();
  markSearch();
}
function searchRow(p, i) {
  const v = p.mint ? liveOf(p) : p, q = fnd.q;
  return `<a class="fnd-row" role="option" id="fnd-${i}" style="transform:translate3d(0,${i * ROW + 8}px,0)" href="/project/${esc(p.ref)}" data-l data-pre="${esc(p.ref)}"${p.mint ? ` data-live="${esc(p.ref)}"` : ''}>
    <img src="${logoSrc(p)}" alt="" decoding="async" width="40" height="40">
    <div class="n"><b>${hl(p.name, q)}</b><span>${p.ticker ? '$' + hl(p.ticker, q) + ' ' : ''}${p.sample ? 'Full sample' : stageTxt[stageOf(p)]}</span></div>
    ${miniSpark(p)}
    <span class="num"><small>${p.mint ? 'Mcap' : 'Launch'}</small><b ${p.mint ? 'data-f="mc"' : ''}>${p.mint ? usd(v.mc) : 'Date TBD'}</b></span>
    <span class="num chg"><small>${p.mint ? '24h' : ''}</small><b ${p.mint ? 'data-f="chg"' : ''} class="${v.change ? (v.change.startsWith('-') ? 'down' : 'up') : 'flat'}">${p.mint ? esc(v.change || '0.0%') : ''}</b></span></a>`;
}
function winSearch() {
  const box = $('#fnd-list'), n = fnd.rows.length;
  if (!n) return;
  const a = Math.max(0, Math.floor(box.scrollTop / ROW) - 3), b = Math.min(n, a + Math.ceil(box.clientHeight / ROW) + 7);
  fnd.map.forEach((e, i) => { if (i < a || i >= b) { e.remove(); fnd.map.delete(i); } });
  let html = '';
  for (let i = a; i < b; i++) if (!fnd.map.has(i)) html += searchRow(fnd.rows[i], i);
  if (!html) return;
  box.insertAdjacentHTML('beforeend', html);
  for (let i = a; i < b; i++) if (!fnd.map.has(i)) fnd.map.set(i, document.getElementById('fnd-' + i));
  const r = fnd.map.get(fnd.i);
  if (r && r !== fnd.on) { fnd.on?.removeAttribute('aria-selected'); fnd.on = r; r.setAttribute('aria-selected', 'true'); }
}
function markSearch(scroll) {
  fnd.on?.removeAttribute('aria-selected');
  const box = $('#fnd-list'), y = fnd.i * ROW + 8;
  if (scroll && fnd.rows.length) {
    if (y < box.scrollTop) box.scrollTop = y - 8;
    else if (y + ROW > box.scrollTop + box.clientHeight) box.scrollTop = y + ROW + 8 - box.clientHeight;
    winSearch();
  }
  const r = fnd.on = fnd.map.get(fnd.i), h = fnd.hl;
  if (r) { r.setAttribute('aria-selected', 'true'); h.style.transform = `translate3d(0,${y}px,0)`; }
  $('#fq').setAttribute('aria-activedescendant', r ? r.id : '');
}
function buildSearch() {
  const el = fnd.el = document.createElement('dialog');
  el.className = 'fnd';
  el.setAttribute('aria-label', 'Search projects');
  el.innerHTML = `<div class="fnd-box panel">
    <div class="fnd-bar"><label class="search">${I.search}<span class="sr">Search projects</span><input id="fq" type="search" role="combobox" aria-expanded="true" aria-controls="fnd-list" autocomplete="off" placeholder="Search name, ticker, contract or tag"></label><button class="fnd-x" id="fnd-x" aria-label="Close search">${I.x}</button></div>
    <div class="fnd-tabs"><div class="seg sm">${[['all', 'All'], ['bond', 'Bonding'], ['mig', 'Migrated'], ['pre', 'Pre launch']].map(t => `<button data-fnd="${t[0]}">${t[1]} <i></i></button>`).join('')}</div></div>
    <div class="fnd-list" id="fnd-list" role="listbox"></div>
    <div class="fnd-ft"><span><kbd>\u2191</kbd><kbd>\u2193</kbd>Navigate</span><span><kbd>\u21B5</kbd>Open</span><span><kbd>esc</kbd>Close</span></div></div>`;
  document.body.append(el);
  $('#fq', el).addEventListener('input', drawSearch);
  $('#fnd-list', el).addEventListener('pointerover', e => {
    const r = e.target.closest('.fnd-row');
    if (r && +r.id.slice(4) !== fnd.i) { fnd.i = +r.id.slice(4); markSearch(); }
  });
  $('#fnd-list', el).addEventListener('scroll', () => { fnd.sc ||= requestAnimationFrame(() => { fnd.sc = 0; winSearch(); }); }, { passive: true });
  // The page behind holds still while the panel is up
  el.addEventListener('close', () => { fnd.held?.forEach(a => a.play()); fnd.held = null; });
  el.addEventListener('click', e => {
    if (e.target === el || e.target.closest('#fnd-x')) return closeSearch();
    const t = e.target.closest('[data-fnd]');
    if (t) { fnd.tab = t.dataset.fnd; drawSearch(); $('#fq').focus(); }
  });
  el.addEventListener('cancel', e => { e.preventDefault(); closeSearch(); });
  el.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (fnd.rows.length) { fnd.i = (fnd.i + (e.key === 'ArrowDown' ? 1 : -1) + fnd.rows.length) % fnd.rows.length; markSearch(true); }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const p = fnd.rows[fnd.i];
      if (p) go(location.origin + '/project/' + encodeURIComponent(p.ref));
    }
  });
}
function openSearch() {
  if (!P.length) return;
  if (!fnd.el) buildSearch();
  if (fnd.el.open) return $('#fq').focus();
  saveY();
  // Its own history entry, so Back closes the tab instead of leaving the page
  history.pushState({ search: 1, y: scrollY }, '');
  fnd.tab = 'all'; $('#fq').value = '';
  fnd.held = document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity);
  fnd.held.forEach(a => a.pause());
  fnd.el.showModal();
  drawSearch();
  fnd.live ||= setInterval(tickSearch, 900);
  $('#fq').focus();
}
function closeSearch() {
  if (!fnd.el?.open) return;
  fnd.el.close();
  fnd.skip = true;
  history.back();
}

/* market data, one fetch per project, cached, prefetched on hover */
const cache = new Map();
function candles(ref) {
  if (!cache.has(ref)) cache.set(ref, fetch(`/data/c/${ref}.json`).then(r => { if (!r.ok) throw 0; return r.json(); }).catch(e => { cache.delete(ref); return []; }));
  return cache.get(ref);
}
const wait = ms => new Promise(r => setTimeout(r, ms));
async function market(ref) {
  if (net === 'down') { await wait(700); throw new Error('rpc'); }
  if (net === 'slow') await wait(2200);
  return candles(ref);
}

/* chart */
let lwc = null;
const loadChart = () => lwc ||= new Promise((ok, no) => {
  const s = document.createElement('script');
  s.src = '/assets/vendor/lightweight-charts.js';
  s.onload = ok;
  s.onerror = () => { lwc = null; no(new Error('chart')); };
  document.head.append(s);
});
// Mock history: a day of one minute candles per project, same every visit, ending on the real last price
function mockCandles(raw, p) {
  const rnd = seeded(p.ref + ':h'), n = 1440, last = raw[raw.length - 1], end = Math.floor((last?.[0] || SNAP / 1000) / 60) * 60;
  const px = p.price || last?.[4] || 1e-5, rise = Math.log(1.6 + rnd() * 5), xs = [0];
  let x = 0, vola = .008;
  for (let i = 1; i <= n; i++) {
    if (rnd() < .025) vola = .003 + rnd() * rnd() * .03;
    x += (rnd() - .5) * vola * 2 + (rnd() < .006 ? (rnd() - .42) * .22 : 0);
    xs.push(x);
  }
  const path = xs.map((v, i) => px * Math.exp(v - x + (rise + x) * (i / n - 1) - x * (i / n - 1) * 0));
  const out = path.slice(1).map((c, i) => {
    const o = path[i], body = Math.abs(c - o), top = body * rnd() * .8 + o * rnd() * .0025, low = body * rnd() * .8 + o * rnd() * .0025;
    return [end - (n - 1 - i) * 60, o, Math.max(o, c) + top, Math.max(1e-14, Math.min(o, c) - low), c, Math.abs(Math.log(c / o)) * 90 + rnd() * .5 + (rnd() < .03 ? 2.5 : 0)];
  });
  const f = (p.vol || 100) / out.reduce((a, c) => a + c[5], 0);
  out.forEach(c => { c[5] *= f; });
  return out;
}
function mountChart(box, raw, p, onTick, cfg) {
  const base = mockCandles(raw, p);
  const L = window.LightweightCharts, up = '#c6ff3b', dn = '#ff3f3f', line = 'rgba(255,255,255,.08)';
  let data = [], hover = null;
  const rebuild = () => {
    const iv = cfg.iv, end = base[base.length - 1]?.[0] || 0, from = end - RANGES[cfg.range], out = new Map();
    base.forEach(c => {
      if (c[0] < from) return;
      const k = Math.floor(c[0] / iv) * iv, o = out.get(k);
      if (!o) out.set(k, [k, c[1], c[2], c[3], c[4], c[5]]);
      else { o[2] = Math.max(o[2], c[2]); o[3] = Math.min(o[3], c[3]); o[4] = c[4]; o[5] += c[5]; }
    });
    data = [...out.values()];
  };
  const factor = () => (cfg.unit === 'mcap' ? (p.mc || 0) / (p.price || 1) : 1) / (cfg.cur === 'SOL' ? SOL_USD : 1);
  const fmt = v => {
    const n = v * factor();
    if (cfg.cur === 'SOL') return (cfg.unit === 'mcap' ? compact(n) : price(n).slice(1)) + ' SOL';
    return cfg.unit === 'mcap' ? usd(n) : price(n);
  };
  const chart = L.createChart(box, {
    autoSize: true,
    layout: { background: { type: 'solid', color: '#0a1124' }, textColor: '#a0a0a0', fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, attributionLogo: true },
    grid: { vertLines: { color: 'rgba(140,175,255,.05)' }, horzLines: { color: 'rgba(140,175,255,.05)' } },
    crosshair: { mode: L.CrosshairMode.Normal, vertLine: { color: 'rgba(255,255,255,.3)', labelBackgroundColor: '#292929' }, horzLine: { color: 'rgba(255,255,255,.3)', labelBackgroundColor: '#292929' } },
    rightPriceScale: { borderColor: line, scaleMargins: { top: .08, bottom: .24 } },
    timeScale: { borderColor: line, rightOffset: 4, minBarSpacing: 2, tickMarkFormatter: t => clock(t) },
    localization: { timeFormatter: t => clock(t, true) }
  });
  const candle = chart.addCandlestickSeries({ upColor: up, downColor: dn, wickUpColor: up, wickDownColor: dn, borderVisible: false, priceFormat: { type: 'custom', formatter: fmt, minMove: 1e-12 } });
  const volume = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '', lastValueVisible: false, priceLineVisible: false });
  volume.priceScale().applyOptions({ scaleMargins: { top: .84, bottom: 0 } });
  const bar = c => ({ time: c[0], open: c[1], high: c[2], low: c[3], close: c[4] });
  const vol = c => ({ time: c[0], value: c[5], color: c[4] >= c[1] ? 'rgba(198,255,59,.28)' : 'rgba(255,63,63,.28)' });
  const readout = trade => {
    const c = hover ?? data[data.length - 1];
    if (c) onTick({ c, data, hovering: !!hover, trade, fmt, last: base[base.length - 1][4] });
  };
  const frame = () => {
    const w = box.clientWidth - 70, n = data.length, s = Math.max(7, Math.min(24, w / (n + 6)));
    chart.timeScale().applyOptions({ barSpacing: s });
    chart.timeScale().scrollToRealTime();
  };
  const paintAll = () => {
    rebuild();
    candle.setData(data.map(bar));
    volume.setData(data.map(vol));
    chart.priceScale('right').applyOptions({ mode: { log: L.PriceScaleMode.Logarithmic, pct: L.PriceScaleMode.Percentage, auto: L.PriceScaleMode.Normal }[cfg.mode] });
    frame();
  };
  chart.subscribeCrosshairMove(e => {
    hover = e.time ? data.find(c => c[0] === e.time) || null : null;
    readout();
  });
  let t = 0;
  const seed = base.length ? base[base.length - 1][4] : 0;
  const timer = !reduced && base.length ? setInterval(() => {
    const c = base[base.length - 1];
    const drift = (seed - c[4]) / seed * .06, chg = drift + (Math.random() - .5) * .006;
    const v = c[4] * (1 + chg);
    c[4] = v; c[2] = Math.max(c[2], v); c[3] = Math.min(c[3], v); c[5] += Math.abs(chg) * (p.vol || 100) * .4;
    if (++t % 14 === 0) base.push([c[0] + 60, v, v, v, v, 0]);
    rebuild();
    const l = data[data.length - 1];
    if (l) { candle.update(bar(l)); volume.update(vol(l)); }
    readout(Math.random() < .5 ? { side: chg >= 0 ? 'Buy' : 'Sell', px: v } : undefined);
  }, 900) : 0;
  paintAll(); readout();
  return { redraw: () => { paintAll(); chart.applyOptions({}); readout(); }, stop() { clearInterval(timer); chart.remove(); }, shot: () => chart.takeScreenshot() };
}

/* project */
const TOKENS = { SOL: '/assets/tokens/sol.svg', USDC: '/assets/tokens/usdc.svg', PEAQ: '/assets/tokens/peaq-blue.svg', CODEC: '/assets/tokens/codec.svg' };
const tokenIcon = t => TOKENS[t] ? `<img src="${TOKENS[t]}" alt="">` : '';
const tokenPick = (q, list, key, label, attrs = '') => `<div class="pick ${attrs ? 'full' : ''}"><button type="button" ${attrs} data-pick-open aria-label="${label}" aria-haspopup="listbox">${tokenIcon(q)}${esc(q)}<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 3.5 5 7l3.5-3.5"/></svg></button><div class="pick-m" role="listbox">${list.map(x => `<button type="button" role="option" data-${key}="${esc(x)}" class="${x === q ? 'on' : ''}" aria-selected="${x === q}">${tokenIcon(x)}${esc(x)}</button>`).join('')}</div></div>`;
const SOL_USD = 185, RATES = { SOL: SOL_USD, USDC: 1 }, SUPPLY = 984e6;
const RANGES = { '1D': 864e2, '5D': 432e3, '1M': 2592e3, '3M': 7776e3, '6M': 15552e3, '1Y': 31536e3 };
const IVS = [['1m', 60], ['5m', 300], ['1h', 3600], ['1d', 86400]];
// Same project, same numbers on every load
function seeded(s) {
  let h = 7;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return () => { h = (h + 0x6D2B79F5) >>> 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const fakeAddr = r => { const c = n => Array.from({ length: n }, () => B58[Math.floor(r() * 58)]).join(''); return c(4) + '...' + c(4); };
const since = s => s < 60 ? Math.max(1, Math.round(s)) + 's' : s < 3600 ? Math.round(s / 60) + 'm' : s < 86400 ? Math.round(s / 3600) + 'h' : Math.round(s / 86400) + 'd';
const feesOf = p => { const all = (p.trades || 0) * .0133; return { all, creator: all * .3521, platform: all * .4719, rewards: all * .176 }; };
function seedTrades(p) {
  const r = seeded(p.ref + 't'), now = Date.now() / 1000, who = Array.from({ length: 14 }, () => fakeAddr(r));
  let t = now - 90;
  return Array.from({ length: 40 }, () => {
    t -= r() * r() * 3600;
    const sz = r() ** 3 * 6 + .002, px = (p.price || 0) * (1 + (r() - .5) * .1);
    return { t, side: r() < .54 ? 'Buy' : 'Sell', sz, px, who: who[Math.floor(r() * who.length)] };
  });
}
function seedHolders(p) {
  const r = seeded(p.ref + 'h'), n = Math.min(20, p.holders || 0);
  let w = 22 + r() * 8;
  const big = Array.from({ length: n }, () => { const o = { who: fakeAddr(r), pct: w }; w *= .72 + r() * .2; return o; });
  const top = big.slice(0, 10).reduce((a, o) => a + o.pct, 0), fit = (58 + r() * 24) / (top || 1);
  big.forEach(o => { o.pct *= fit; });
  const held = big.map(o => ({ ...o, sec: o.pct * (.72 + r() * .56) })).sort((a, b) => b.sec - a.sec);
  return { big, held };
}
function tradeHTML(p, state, amt, o) {
  if (p.pre) return `<div class="t-curve"><div class="eyebrow">Not live yet</div></div>
    <p class="t-note">No token exists for this project. The founder decides when it launches, and buying only opens then.</p>
    <button class="btn full ${reminds.has(p.ref) ? '' : 'primary'}" data-remind="${esc(p.ref)}">${I.bell}${reminds.has(p.ref) ? 'Reminder set' : 'Remind me at launch'}</button>`;
  if (state === 'loading') return `<div class="sk" style="height:42px"></div><div class="sk" style="height:44px"></div><div class="sk" style="height:52px"></div><div class="sk" style="height:34px"></div><div class="sk" style="height:84px"></div><button class="btn full lg" disabled>Reading pool state</button>`;
  if (state === 'error') return `<div class="t-err">${I.alert}<b>Could not reach the pool</b><span class="t-note">We will not show a price we cannot confirm. Your funds are not affected.</span><button class="btn sm" data-retry>Retry</button></div>`;
  const quote = p.quote || 'SOL', pays = [...new Set([quote, 'SOL', 'USDC'])], buy = o.side === 'buy', q = o.pay, sym = '$' + esc(p.ticker);
  const rate = RATES[q], left = p.mig ? Infinity : Math.max(0, (1 - (p.prog || 0)) * 100);
  const a = parseFloat(amt) || 0, usdIn = !rate ? 0 : buy ? a * rate : a * (p.price || 0);
  const got = !rate || !p.price ? 0 : buy ? usdIn / p.price * .985 : usdIn * .985 / rate;
  const impact = rate ? Math.min(usdIn / Math.max(p.mc || 1, 1) * 100, 99) : 0;
  const slip = o.slip === 'auto' ? .5 : parseFloat(o.custom) || 0, floor = got * (1 - slip / 100);
  const fee = rate ? usdIn * .015 / rate : 0, unit = buy ? sym : esc(q);
  const inSol = rate ? usdIn / SOL_USD : 0, tooBig = buy && !p.mig && inSol > left;
  const bal = !wallet ? null : buy ? (q === 'SOL' ? 12.4 : 842) : 0;
  const verb = buy ? 'Buy' : 'Sell', go = !wallet ? 'Connect to ' + verb.toLowerCase() : tooBig ? 'Too large for the curve' : a <= 0 ? 'Enter an amount' : `${verb} ${sym}`;
  return `<div class="t-curve">
      <div class="l"><span>${p.mig ? 'Raydium pool' : 'Bonding curve'}</span><b>${p.mig ? 'Migrated' : pct(p).toFixed(1) + '%'}</b></div>
      <div class="bar ${p.mig ? 'done' : ''}" style="margin:0"><i style="width:${Math.max(pct(p), .6)}%"></i></div>
      ${p.mig ? '' : `<div class="l mono" style="font-size:11.5px"><span>${left.toFixed(1)} SOL left</span><span>Target 100 SOL</span></div>`}
    </div>
    <div class="seg t-side"><button class="${buy ? 'on' : ''}" data-side="buy">Buy</button><button class="${buy ? '' : 'on'}" data-side="sell">Sell</button></div>
    <div class="t-pair"><span>${esc(p.ticker)}/${esc(quote)}</span><span>Balance <b>${bal == null ? '-' : bal}</b><button data-max ${bal ? '' : 'disabled'}>MAX</button></span></div>
    <label class="field"><span class="sr">Amount</span><input id="amt" inputmode="decimal" value="${esc(amt)}" autocomplete="off">
      ${buy ? tokenPick(q, pays, 'pay', 'Pay with') : `<span>${sym}</span>`}</label>
    <div class="quick">${(buy ? [.1, .5, 1, 5] : [1000, 10000, 100000, 1000000]).map(v => `<button data-amt="${v}">${buy ? v : compact(v).replace('.00', '')}</button>`).join('')}</div>
    <div class="t-est"><b>${rate ? '≈ ' + compact(got) + ' ' + unit : 'Quoted at signing'}</b><span>${rate ? usd(usdIn) : ''}</span></div>
    <div class="t-slip"><span>Slippage</span><div class="seg sm"><button class="${o.slip === 'auto' ? 'on' : ''}" data-slip="auto">Auto</button><button class="${o.slip === 'auto' ? '' : 'on'}" data-slip="custom">Custom</button></div>
      ${o.slip === 'auto' ? '' : `<label class="t-cust"><span class="sr">Custom slippage</span><input id="slipv" inputmode="decimal" value="${esc(o.custom)}" autocomplete="off">%</label>`}</div>
    <div class="t-rows">
      <div>Price Impact<b>${rate ? '+' + impact.toFixed(2) + '%' : '-'}</b></div>
      <div>Min. Received<b>${rate ? compact(floor) + ' ' + unit : '-'}</b></div>
      <div>Fee<b>${fee.toFixed(4)} ${esc(q)}</b></div>
    </div>
    ${tooBig ? `<p class="t-note" style="color:var(--down)">Only ${left.toFixed(1)} SOL left on the curve. Lower the amount.</p>` : ''}
    <button class="btn full lg primary" data-buy ${wallet && (tooBig || a <= 0) ? 'disabled' : ''}>${go}</button>
    <div class="t-rows t-fine"><div>Priced from the pool<b id="asof">${clock(Date.now() / 1000, true)}</b></div><div>Floor<b>Enforced on chain</b></div><div>Quote<b>Preview, no transaction</b></div></div>`;
}
const draftP = () => {
  const d = store.get('draft', {});
  return { ref: 'draft', draft: true, pre: true, name: d.name || 'Your project', ticker: d.ticker || 'TICKER', quote: d.pair || 'SOL', at: new Date().toISOString(), desc: d.brief || d.pitch || '', pitch: d.pitch || '', tags: [],
    proof: { sim: d.sim, d3: d.d3, pcb: d.pcb }, founder: d.founder ? { name: d.founder, role: 'Founder', img: '/assets/art/anon.svg' } : null,
    links: (d.links || []).map(u => [detect(u), u.replace(/^https?:\/\//, ''), u]), logoData: d.logo, bannerData: d.banner };
};
function renderProject(ref) {
  const p = ref === 'draft' ? draftP() : ref === 'grablab' ? SAMPLE : byRef.get(ref);
  const v = $('#view');
  if (!p) {
    v.innerHTML = `<div class="wrap enter"><section class="panel block"><div class="empty"><b>Project not found</b><a class="btn sm" href="/" data-l>Back to Explore</a></div></section></div>`;
    return;
  }
  const pr = p.proof || {}, st = stageOf(p), quote = p.quote || 'SOL', pair = `${esc(p.ticker)}/${esc(quote)}`;
  const emp = (ic, t, d, x = '') => `<div class="empty"><span class="e-ic">${I[ic]}</span><b>${t}</b><span>${d}</span>${x}</div>`;
  const simPane = () => `<div class="media-pane"><div class="m-stage"><video class="m-fill" src="/assets/art/simarena-final.mp4" poster="/assets/art/simarena-final.webp" autoplay muted loop playsinline></video>
    <div class="m-bar"><span><img src="/assets/art/simarena-white.svg" alt="">Recorded in SimArena, real physics</span><button class="btn sm" data-run>${I.next}Run it live</button></div></div></div>`;
  const SCENE = 'https://app.simarena.ai/editor?scene=' + encodeURIComponent('https://grablab.fun/lab/grablab-claw-final.scene.json?v=3');
  const NONE = { sim: ['No simulation published yet', 'A simulation appears here once a project shares one.'], d3: ['No 3D model published yet', 'An orbitable model appears here once a project shares one.'], pcb: ['No PCB published yet', 'Board files appear here once a project shares them.'], video: ['No video published yet', 'A demo video appears here once a project shares one.'] };
  const media = [...(p.pre ? [] : [['chart', 'Chart', I.chart]]), ['sim', 'Simulation', I.sim], ['d3', '3D View', I.cube], ['pcb', 'PCB', I.chip], ['video', 'Video', I.play]];
  const secs = [['overview', 'Overview'], ...(p.pre ? [] : [['trades', 'Trades'], ['holders', 'Holders'], ['token', 'Token']]), ['links', 'Links'], ['simulation', 'Simulation', pr.sim ? 1 : 0], ['machines', 'Machines', 0], ['verify', 'Verify'], ['milestones', 'Milestones', p.milestones ? p.milestones.filter(m => m.s === 'done').length + '/' + p.milestones.length : 0], ['team', 'Team']];
  const q = new URLSearchParams(location.search);
  let mediaTab = media[0][0], secTab = q.get('tab') && secs.some(s => s[0] === q.get('tab')) ? q.get('tab') : 'overview';
  let amt = '0.5', state = p.pre ? 'ready' : net === 'ok' ? 'ready' : 'loading', chart = null, pxNow = p.price;
  const trade = { side: 'buy', pay: quote, slip: 'auto', custom: '1' }, cfg = { iv: 60, unit: 'price', cur: 'USD', range: '1Y', mode: 'auto' };
  const tf = { who: '', side: 'all', size: 0 };
  let rows = p.pre ? [] : seedTrades(p), holders = null;
  const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const fName = p.founder?.name || 'Anonymous', fees = feesOf(p);

  v.innerHTML = `<div class="wrap enter">
    ${p.draft ? '<div class="dr-bar"><span>This is your page as visitors will see it.</span><a class="btn sm" href="/launch" data-l>Back to editing</a></div>' : ''}
    <div id="pbanner"></div>
    <div class="p-grid ${p.pre ? 'pre' : ''}">
      <div class="p-main">
        <section class="panel p-head grainy">
          <div class="p-cover ${p.bannerData ? 'real' : ''}"><img src="${p.bannerData || logoSrc(p)}" alt="" decoding="async"></div>
          <div class="p-id"><img class="p-logo" data-vt="${esc(p.ref)}" src="${logoSrc(p)}" alt="">
            <div class="p-title">
              ${p.mint ? `<div class="p-pair"><b>$${esc(p.ticker)}</b> / ${esc(quote)}<button class="ca" data-copy="${esc(p.mint)}">CA ${short(p.mint)} ${I.copy}</button></div>` : ''}
              <div class="line"><h1 class="display">${esc(p.name)}</h1><span class="stage ${st}">${stageTxt[st]}</span></div>
              <div class="p-meta">
                ${p.mint ? '' : '<span class="ca">No token yet</span>'}
                <button class="ca star-inline" data-star-p="${esc(p.ref)}">${I.star}${watch.has(p.ref) ? 'Watching' : 'Watch'}</button>
                ${proofMinis(p)}${(p.tags || []).map(t => `<span class="mini">${esc(t)}</span>`).join('')}
              </div>
              ${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
            </div>
            <div class="p-founder"><div class="f-who"><span class="f-av">${p.founder?.img ? `<img src="${p.founder.img}" alt="">` : '<img src="/assets/art/anon.svg" alt="">'}</span><div><b>${esc(fName)}</b><span>${esc(p.founder?.role || 'Founder')}</span></div></div></div>
          </div>
        </section>
        ${p.pre ? '' : `<section class="panel kpis grainy">
          <div><div class="eyebrow">Price</div><div class="num" id="kpx">${price(p.price)}</div><small class="${p.change ? (isUp(p) ? 'up' : 'down') : ''}">${p.change ? (isUp(p) ? '↑ ' : '↓ ') + esc(p.change) + ' 24h' : 'No trades'}</small></div>
          <div><div class="eyebrow">Market cap</div><div class="num">${usd(p.mc)}</div><small>Circ. Supply</small></div>
          <div><div class="eyebrow">Holders</div><div class="num">${int(p.holders)}</div><small>Wallets</small></div>
          <div><div class="eyebrow">24H Volume</div><div class="num">${usd(p.vol)}</div><small>Traded</small></div>
          <div><div class="eyebrow">Collected</div><div class="num">${fees.creator.toFixed(fees.creator < 10 ? 4 : 3)}</div><small>SOL fees</small></div>
        </section>`}
        <section class="panel grainy p-media" style="overflow:hidden"><div>
          <div class="tabs" id="mtabs">${media.map(m => `<button data-m="${m[0]}">${m[2]}${m[1]}</button>`).join('')}</div>
          <div id="mpane"></div></div>
        </section>
        <section class="panel grainy p-sec" style="overflow:hidden"><div>
          <div class="tabs" id="stabs">${secs.map(s => `<button data-s="${s[0]}">${s[1]}${s.length > 2 ? `<i class="bd">${s[2]}</i>` : ''}</button>`).join('')}</div>
          <div class="pane" id="spane"></div></div>
        </section>
      </div>
      <aside class="p-side"><section class="panel trade" id="trade"></section>${p.pre ? '' : `<section class="panel p-tape"><div class="eyebrow">Recent trades</div><div class="tp" id="ptape"></div></section>`}</aside>
    </div></div>`;

  const drawTrade = () => { $('#trade').innerHTML = tradeHTML(p, state, amt, trade); };
  queueMicrotask(() => drawTape());
  const banner = () => {
    $('#pbanner').innerHTML = state === 'error' ? `<div class="err-banner" style="margin-top:14px">${I.alert.replace('<svg', '<svg width="18" height="18"')}<span>Market data is unavailable right now. Numbers on this page are from the last snapshot.</span><button class="btn sm" data-retry>Retry</button></div>` : '';
  };
  const legend = (c, fmt) => {
    const e = $('#ohlc'); if (!e) return;
    const ch = c[1] ? (c[4] / c[1] - 1) * 100 : 0, cl = ch >= 0 ? 'up' : 'down';
    e.innerHTML = ['O', 'H', 'L', 'C'].map((n, i) => `<span>${n}<b class="${cl}">${fmt(c[i + 1])}</b></span>`).join('') + `<b class="${cl}">${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%</b>`;
    $('#lvol').textContent = usd(c[5]);
  };
  const tick = ({ c, hovering, trade: tr, fmt, last }) => {
    if (!hovering) { pxNow = last; const k = $('#kpx'); if (k) k.textContent = price(pxNow); }
    legend(c, fmt);
    if (tr) {
      const sz = (Math.random() ** 2 * 1.8 + .04);
      rows.unshift({ t: Date.now() / 1000, side: tr.side, sz, px: tr.px, who: fakeAddr(Math.random) });
      rows.length = Math.min(rows.length, 60);
      if (secTab === 'trades') drawRows(true);
      drawTape();
    }
  };
  function drawTape() {
    const box = $('#ptape'); if (!box) return;
    const now = Date.now() / 1000;
    box.innerHTML = rows.slice(0, 24).map(r => `<div><span class="${r.side === 'Buy' ? 'up' : 'down'}">${r.side}</span><span>${r.sz.toFixed(3)} SOL</span><span>${esc(r.who)}</span><span class="mut">${since(now - r.t)}</span></div>`).join('');
  }
  const seg = (attr, on, items) => `<div class="seg sm">${items.map(i => `<button class="${i[0] === on ? 'on' : ''}" data-${attr}="${i[0]}">${i[1]}</button>`).join('')}</div>`;
  const chartFoot = () => `<div class="c-foot"><div class="c-rng">${Object.keys(RANGES).map(r => `<button class="${r === cfg.range ? 'on' : ''}" data-rng="${r}">${r}</button>`).join('')}</div>
    <span class="grow"></span><span id="cclock"></span>
    ${seg('tz', tz, [['UTC', 'UTC'], ['Local', 'Local']])}
    <div class="c-rng">${[['pct', '%'], ['log', 'Log'], ['auto', 'Auto']].map(m => `<button class="${m[0] === cfg.mode ? 'on' : ''}" data-mode="${m[0]}">${m[1]}</button>`).join('')}</div></div>`;
  const paintClock = () => { const c = $('#cclock'); if (c) c.textContent = `${clock(Date.now() / 1000, true)} (${tz})`; const a = $('#asof'); if (a) a.textContent = clock(Date.now() / 1000, true); };
  const clockT = setInterval(paintClock, 1000);
  async function drawMedia() {
    $$('#mtabs [data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mediaTab));
    chart?.stop(); chart = null;
    const box = $('#mpane');
    if (mediaTab === 'chart') {
      box.innerHTML = `<div class="chart-wrap" id="cw">
        <div class="c-tools">
          <label class="c-iv"><span class="sr">Interval</span><select id="civ">${IVS.map(i => `<option value="${i[1]}" ${i[1] === cfg.iv ? 'selected' : ''}>${i[0]}</option>`).join('')}</select></label>
          ${seg('unit', cfg.unit, [['price', 'Price'], ['mcap', 'Mcap']])}${seg('cur', cfg.cur, [['USD', 'USD'], ['SOL', 'SOL']])}
          <span class="grow"></span>
          <button class="c-ic" data-full aria-label="Full screen">${I.full}</button><button class="c-ic" data-save aria-label="Save as image">${I.save}</button>
        </div>
        <div class="c-leg"><span class="c-name2">${pair} on machinefun</span><span id="ohlc"></span><span class="c-vol">Volume <b id="lvol">-</b></span></div>
        <div id="chartbox"><div class="sk"></div></div>
        ${chartFoot()}</div>`;
      paintClock();
      try {
        const data = await market(p.ref);
        if (!$('#chartbox') || mediaTab !== 'chart') return;
        state = 'ready'; drawTrade(); banner();
        if (!data.length && !p.price) { $('#chartbox').innerHTML = `<div class="empty" style="height:300px;align-content:center"><b>No trades yet</b><span>The first buy opens the chart.</span></div>`; return; }
        await loadChart();
        if (!$('#chartbox') || mediaTab !== 'chart') return;
        $('#chartbox').innerHTML = '<div id="chart" role="img" aria-label="Price chart"></div>';
        chart = mountChart($('#chart'), data, p, tick, cfg);
      } catch {
        if (!$('#chartbox')) return;
        state = 'error'; drawTrade(); banner();
        $('#chartbox').innerHTML = `<div class="t-err" style="height:300px;align-content:center">${I.alert}<b>Chart unavailable</b><span class="t-note">The price feed did not answer.</span><button class="btn sm" data-retry>Retry</button></div>`;
      }
    } else if (mediaTab === 'sim' && pr.sim) {
      box.innerHTML = simPane();
    } else if (mediaTab === 'd3' && pr.d3) {
      box.innerHTML = `<div class="media-pane"><div class="m-stage d3"><video class="m-fit" src="/assets/art/model-spin.webm" poster="/assets/art/model-spin.webp" autoplay muted loop playsinline></video>
        <div class="m-bar"><span>${I.cube}Every part of the build. In production you orbit it yourself.</span></div></div></div>`;
    } else {
      box.innerHTML = emp({ sim: 'sim', d3: 'cube', pcb: 'chip', video: 'play' }[mediaTab], NONE[mediaTab][0], NONE[mediaTab][1]);
    }
  }
  const redrawFoot = () => { const f = $('.c-foot'); if (f) { f.outerHTML = chartFoot(); paintClock(); } };
  function drawRows(soft) {
    const box = $('#tl'); if (!box) return;
    const needle = tf.who.toLowerCase(), l = rows.filter(r => (tf.side === 'all' || r.side === tf.side) && r.sz >= tf.size && (!needle || r.who.toLowerCase().includes(needle)));
    const now = Date.now() / 1000;
    box.innerHTML = l.length ? l.map((r, i) => `<div class="${soft && i === 0 ? 'new' : ''}"><span class="mut">${since(now - r.t)}</span><span class="${r.side === 'Buy' ? 'up' : 'down'}">${r.side.toLowerCase()}</span><span>${compact(r.sz * SOL_USD / (r.px || 1))}</span><span>${r.sz.toFixed(4)}</span><span class="mut">${r.who}</span></div>`).join('') : '<p class="t-note" style="padding:12px 8px">No trades match these filters.</p>';
  }
  function drawTradesTab() {
    const sp = p.spark || [], last = sp[sp.length - 1], ch = k => sp.length > k && sp[sp.length - 1 - k] ? (last / sp[sp.length - 1 - k] - 1) * 100 : null;
    const cf = n => n == null ? '-' : (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
    const f = [['5m', ch(1)], ['1h', ch(3)], ['6h', ch(12)], ['24h', parseFloat(p.change) || null]];
    const buys = rows.filter(r => r.side === 'Buy').length, r = buys / (rows.length || 1), tx = Math.min(p.trades || 0, Math.max(rows.length, Math.round((p.vol || 0) / SOL_USD / .46)));
    $('#spane').innerHTML = `<div class="t-sum">${f.map(x => `<div><span>${x[0]}</span><b class="${x[1] == null ? '' : x[1] >= 0 ? 'up' : 'down'}">${cf(x[1])}</b></div>`).join('')}
        <div><span>Volume</span><b>${compact((p.vol || 0) / SOL_USD)} SOL</b></div><div><span>Txns</span><b>${int(tx)}</b></div><div><span>Buys</span><b>${int(Math.round(tx * r))}</b></div><div><span>Sells</span><b>${int(tx - Math.round(tx * r))}</b></div></div>
      <div class="t-filter"><label class="search"><span class="sr">Filter by trader</span>${I.search}<input id="tfw" placeholder="Filter by trader" value="${esc(tf.who)}" autocomplete="off"></label>
        <span class="eyebrow">Side</span>${seg('fside', tf.side, [['all', 'All'], ['Buy', 'Buys'], ['Sell', 'Sells']])}
        <span class="eyebrow">Size</span>${seg('fsize', tf.size, [[0, 'Any'], [1, '≥1 SOL'], [10, '≥10 SOL'], [100, '≥100 SOL']])}</div>
      <div class="trades"><div class="th"><span>When</span><span>Side</span><span>Tokens</span><span>${esc(quote)}</span><span>Trader</span></div><div class="tb" id="tl"></div></div>
      <p class="t-note" style="margin-top:10px">Sample stream that follows the chart. The real build reads the pool.</p>`;
    drawRows();
  }
  function drawSec() {
    $$('#stabs [data-s]').forEach(b => b.classList.toggle('on', b.dataset.s === secTab));
    const box = $('#spane');
    const R = (t, s, url, todo) => `<div class="v-row"><div><b>${t}</b><span class="${todo ? 'todo' : ''}">${s}</span></div>${url ? `<a class="btn sm" href="${url}" target="_blank" rel="noopener">${I.ext}Verify</a>` : ''}</div>`;
    const linkList = () => p.links?.length ? `<div class="p-meta">${p.links.map(l => `<a class="ca" href="${l[2]}" target="_blank" rel="noopener">${linkIc(l[0])}${esc(l[1])}</a>`).join('')}</div>` : '';
    const LK = { globe: 'Website', x: 'X', github: 'GitHub', discord: 'Discord', telegram: 'Telegram', doc: 'Docs', youtube: 'YouTube' };
    const linkCards = () => p.links?.length ? `<div class="lk-e">${p.links.map(l => `<a class="lk-c" href="${l[2]}" target="_blank" rel="noopener"><span class="th">${l[4] ? `<img src="${l[4]}" alt="" loading="lazy">` : `<i>${linkIc(l[0])}</i>`}</span><span class="tx"><small>${linkIc(l[0])}${LK[l[0]] || 'Link'}</small><b>${esc(l[1])}</b>${l[3] ? `<span>${esc(l[3])}</span>` : ''}</span><em>${I.ext}</em></a>`).join('')}</div>` : '';
    if (secTab === 'overview') {
      const empties = ['Simulation', '3D View', 'PCB', 'Video'].filter((n, i) => !pr[['sim', 'd3', 'pcb', 'video'][i]]);
      const ml = p.milestones, cur = ml && (ml.find(m => m.s === 'now') || ml.find(m => m.s === 'next'));
      box.innerHTML = `<p style="max-width:68ch">${esc(p.desc || 'The founder has not written a description yet.')}</p>
        ${cur ? `<button class="ms-sum" data-s="milestones"><span class="ms-bar">${ml.map(m => `<i class="${m.s}"></i>`).join('')}</span><span class="ms-tx"><small>Milestone ${ml.indexOf(cur) + 1} of ${ml.length}, ${cur.s === 'now' ? 'in progress' : 'next'}</small><b>${esc(cur.t)}</b></span><em>All milestones${I.arrow}</em></button>` : ''}
        ${p.links ? `<div style="margin-top:14px">${linkList()}</div>` : ''}
        ${empties.length ? `<p class="t-note" style="margin-top:16px">Not published yet: ${empties.join(', ')}. The founder sees an Add proof button here.</p>` : ''}`;
    } else if (secTab === 'trades') {
      drawTradesTab();
    } else if (secTab === 'holders') {
      holders ||= seedHolders(p);
      const top = holders.big.slice(0, 10).reduce((a, h) => a + h.pct, 0);
      const line = (h, i, val, mv) => `<div><span class="mut">${i + 1}</span><span>${h.who}${mv || ''}</span><span>${val}</span><span class="mut">${compact(h.pct / 100 * SUPPLY)}</span></div>`;
      box.innerHTML = `<div class="h-kpi"><div><span class="eyebrow">Holders</span><b class="num">${int(p.holders)}</b><small>Wallets</small></div><div><span class="eyebrow">Top 10</span><b class="num">${top.toFixed(1)}%</b><small>Of supply</small></div><div><span class="eyebrow">Window</span><b class="num">30 days</b><small>Token-seconds</small></div></div>
        <div class="h-cols"><div><h3>Largest holders now</h3><div class="h-list">${holders.big.map((h, i) => line(h, i, h.pct.toFixed(2) + '%')).join('')}</div></div>
        <div><h3>Longest held 30 days</h3><div class="h-list">${holders.held.map((h, i) => { const was = holders.big.indexOf(holders.big.find(b => b.who === h.who)), d = was - i; return line(h, i, h.sec.toFixed(1) + '%', d ? ` <i class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '↑' : '↓'}${Math.abs(d)}</i>` : ''); }).join('')}</div></div></div>
        <div class="t-foot"><p class="t-note">Sample wallets in this concept. The real build reads them from chain.</p><a class="btn sm" href="https://solscan.io/token/${esc(p.mint)}#holders" target="_blank" rel="noopener">${I.ext}Open holder list</a></div>`;
    } else if (secTab === 'token') {
      const share = (n, pc, sol) => `<div class="f-share"><span>${n}</span><i><b style="width:${pc}%"></b></i><span class="mono">${pc}%</span><span class="mono">${sol.toFixed(4)} SOL</span></div>`;
      box.innerHTML = `<div class="tk-grid"><div><h3>Token relay</h3><div class="verify">
          ${R('Status', p.mig ? 'Live' : 'Bonding')}${R('Mint', esc(p.mint))}${p.pool ? R('Curve', esc(p.pool)) : ''}${p.mig && p.pool ? R('Pool', esc(p.pool)) : ''}</div>
          <a class="btn sm" style="margin-top:10px" href="https://solscan.io/token/${esc(p.mint)}" target="_blank" rel="noopener">${I.ext}View on Solscan</a></div>
        <div><h3>Trading fees</h3><div class="tk-fee"><div><span class="eyebrow">Per trade</span><b class="num">1.25%</b></div><div><span class="eyebrow">Fees generated</span><b class="num">${fees.all.toFixed(4)} SOL</b></div></div>
          ${share('Creator', 35.21, fees.creator)}${share('Platform', 47.19, fees.platform)}${share('Rewards', 17.6, fees.rewards)}
          <p class="t-note" style="margin-top:12px">The project earns a share of every trade. Buying here funds the team building it.<br>Fee figures are estimated in this concept.</p></div></div>`;
    } else if (secTab === 'links') {
      box.innerHTML = linkCards() || emp('globe', 'No links published', 'Website, X, GitHub and docs show here once the founder adds them.');
    } else if (secTab === 'simulation') {
      box.innerHTML = pr.sim ? simPane() : emp('sim', 'No simulation published for this project yet', 'A simulation appears here once a project shares one.');
    } else if (secTab === 'machines') {
      box.innerHTML = emp('claw', 'No machines attached', 'A project can point at machines registered on peaq. Their identity, bond and event log are read from chain state.');
    } else if (secTab === 'verify') {
      box.innerHTML = p.mint ? `<div class="verify">
        ${R('Token mint', esc(p.mint), 'https://solscan.io/token/' + encodeURIComponent(p.mint))}
        ${p.pool ? R(p.mig ? 'Raydium pool' : 'Curve pool', esc(p.pool), 'https://solscan.io/account/' + encodeURIComponent(p.pool)) : ''}
        ${p.mig ? R('Open on Raydium', 'Swap page for this mint', 'https://raydium.io/swap/?outputMint=' + encodeURIComponent(p.mint)) : ''}
        ${R('Independent chart', 'DexScreener', 'https://dexscreener.com/solana/' + encodeURIComponent(p.mint))}
        ${p.mig ? R('Migration transaction', 'Needs one API field: migration tx signature', '', 1) : ''}
        ${R('Fee escrow', 'Needs one API field: escrow address behind the Collected figure', '', 1)}
      </div>` : emp('shield', 'Nothing on chain yet', 'This tab fills up at launch: mint, pool, migration, escrow.');
    } else if (secTab === 'milestones') {
      const ml = p.milestones, reach = ml ? ml.filter(m => m.s !== 'next').length : 0;
      box.innerHTML = ml ? `<div class="ms" style="--n:${ml.length};--reach:${reach - 1}"><i class="ms-rail"></i>${ml.map((m, i) => `<article class="ms-i ${m.s}" style="--i:${i}"><span class="d">${m.s === 'done' ? I.check : ''}</span><span class="ms-n">${String(i + 1).padStart(2, '0')}</span><small>${{ done: 'Done', now: 'In progress', next: 'Next' }[m.s]}</small><b>${esc(m.t)}</b><p>${esc(m.d)}</p>${m.proof ? `<button class="ms-p" data-m="${m.to}">${esc(m.proof)}${I.arrow}</button>` : ''}</article>`).join('')}</div>`
        : emp('flag', 'No milestones published', 'Milestones are how a founder shows the money turned into hardware. Each one carries a proof link.', '<a class="btn sm" href="/project/grablab?tab=milestones" data-l>See a full example</a>');
    } else if (secTab === 'team') {
      box.innerHTML = p.founder ? `<div class="team"><span class="ava"><img src="${p.founder.img}" alt=""></span><div><b>${esc(p.founder.name)}</b><div class="mut" style="font-size:13px">${esc(p.founder.role)}</div></div></div>`
        : `<div class="team"><span class="ava"><img src="/assets/art/anon.svg" alt=""></span><div><b>Founder not disclosed</b><div class="mut" style="font-size:13px">Projects with a named founder rank higher in Explore.</div></div></div>`;
    }
  }
  const root = $('#view').firstElementChild;
  const setChart = () => { $$('[data-unit]').forEach(b => b.classList.toggle('on', b.dataset.unit === cfg.unit)); $$('[data-cur]').forEach(b => b.classList.toggle('on', b.dataset.cur === cfg.cur)); redrawFoot(); chart?.redraw(); };
  root.addEventListener('click', e => {
    const m = e.target.closest('[data-m]'), s = e.target.closest('[data-s]'), t = e.target.closest('[data-tz]'), a = e.target.closest('[data-amt]');
    const d = e.target.closest('[data-unit],[data-cur],[data-rng],[data-mode]')?.dataset;
    if (m) { mediaTab = m.dataset.m; drawMedia(); if (m.matches('.ms-p')) $('.p-media').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    if (e.target.closest('[data-run]')) e.target.closest('.m-stage').innerHTML = `<iframe class="m-fill" src="${SCENE}" title="Grablab claw in SimArena" allow="fullscreen; clipboard-write"></iframe>`;
    if (s) { secTab = s.dataset.s; drawSec(); }
    if (t) { tz = t.dataset.tz; store.set('tz', tz); redrawFoot(); chart?.redraw(); if (secTab === 'trades') drawRows(); }
    if (a) { amt = a.dataset.amt; drawTrade(); }
    if (d) { if (d.unit) cfg.unit = d.unit; if (d.cur) cfg.cur = d.cur; if (d.rng) cfg.range = d.rng; if (d.mode) cfg.mode = d.mode; setChart(); }
    if (e.target.closest('[data-full]')) { document.fullscreenElement ? document.exitFullscreen() : $('#cw').requestFullscreen?.(); }
    if (e.target.closest('[data-save]')) {
      chart?.shot().toBlob(b => { const u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = `${p.ticker}-chart.png`; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); });
    }
    const pay = e.target.closest('[data-pay]');
    if (pay) { e.preventDefault(); trade.pay = pay.dataset.pay; drawTrade(); }
    const side = e.target.closest('[data-side]');
    if (side) { trade.side = side.dataset.side; amt = trade.side === 'buy' ? '0.5' : '10000'; drawTrade(); }
    const sl = e.target.closest('[data-slip]');
    if (sl) { trade.slip = sl.dataset.slip; drawTrade(); }
    if (e.target.closest('[data-max]')) { amt = trade.pay === 'SOL' ? '12.4' : '842'; drawTrade(); }
    const fs = e.target.closest('[data-fside],[data-fsize]');
    if (fs) {
      if (fs.dataset.fside) tf.side = fs.dataset.fside; else tf.size = +fs.dataset.fsize;
      fs.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === fs));
      drawRows();
    }
    const sp = e.target.closest('[data-star-p]');
    if (sp) { toggleWatch(p.ref); sp.innerHTML = I.star + (watch.has(p.ref) ? 'Watching' : 'Watch'); }
    if (e.target.closest('[data-buy]')) {
      if (!wallet) return connect();
      const sol = (parseFloat(amt) || 0) * (trade.side === 'sell' ? pxNow / SOL_USD : RATES[trade.pay] / SOL_USD);
      rows.unshift({ t: Date.now() / 1000, side: trade.side === 'buy' ? 'Buy' : 'Sell', sz: sol, px: pxNow, who: 'You' });
      if (secTab === 'trades') drawRows(true);
      toast('Simulated. Nothing was signed or sent.');
    }
  });
  root.addEventListener('change', e => {
    if (e.target.id === 'civ') { cfg.iv = +e.target.value; chart?.redraw(); }
  });
  root.addEventListener('input', e => {
    if (e.target.id === 'tfw') { tf.who = e.target.value; return drawRows(); }
    if (e.target.id !== 'amt' && e.target.id !== 'slipv') return;
    const id = e.target.id, val = e.target.value.replace(/[^0-9.]/g, ''), pos = e.target.selectionStart;
    if (id === 'amt') amt = val; else trade.custom = val;
    drawTrade();
    const n = $('#' + id); n.focus(); n.setSelectionRange(pos, pos);
  });
  const onW = () => drawTrade();
  document.addEventListener('wallet', onW);
  onLeave(() => { chart?.stop(); clearInterval(clockT); document.removeEventListener('wallet', onW); });
  drawTrade(); banner(); drawSec(); drawMedia();
}

/* launch */
const LINK_RULES = [['github', /github\.com/i], ['x', /(^|\/\/|\.)(x|twitter)\.com/i], ['discord', /discord\.(gg|com)/i], ['telegram', /(t\.me|telegram\.)/i], ['youtube', /(youtube\.com|youtu\.be)/i], ['doc', /(docs\.|gitbook|notion\.)/i]];
const tip = t => `<button type="button" class="tip" aria-label="${esc(t)}">i<span>${esc(t)}</span></button>`;
const RV = {
  project: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  ticker: '<path d="M20.6 13.4 13 21l-9-9V4h8z"/><circle cx="8.5" cy="8.5" r="1"/>',
  pair: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  links: '<path d="M10 14a4 4 0 0 0 6 .4l3-3a4 4 0 0 0-5.7-5.7L12 7M14 10a4 4 0 0 0-6-.4l-3 3a4 4 0 0 0 5.700 5.700L12 17"/>',
  proofs: '<path d="m12 3 8 3v6c0 5-3.400 8-8 9-4.600-1-8-4-8-9V6z"/><path d="m8.500 12 2.500 2.500 4.500-5"/>',
  ignition: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 1-3 0-6 2-9.500z"/>'
};
const rv = (d, l, v) => `<div><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>${l}</span><b>${v}</b></div>`;
let launchD = {};
const d0 = k => launchD[k] || '';
const upf = (id, key, ph, accept) => `<div class="up-f"><input class="input" id="${id}" value="${esc(d0(key))}" placeholder="${ph}"><label class="btn up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7.500 9.500 12 5l4.500 4.500M4 19h16"/></svg><input type="file" data-file="${key}" accept="${accept}">Upload</label></div>`;
const IGN_CURVE = 'M40 250C240 250 300 236 420 206S600 164 640 150 800 104 860 86 980 52 1040 36';
const ignBlock = on => `<div class="ign ${on ? 'on' : ''}">
  <div class="ign-h"><div class="ign-ti"><span class="eyebrow">Optional and permanent</span><h3 class="display">Ignition</h3></div>
    <p>Set sell orders at market cap levels above launch.<br>Nothing goes live until you launch the token yourself.</p>
    <div class="tg"><button data-ign="0" aria-pressed="${!on}">Off</button><button data-ign="1" aria-pressed="${on}">On</button></div></div>
  <svg class="ign-c" viewBox="0 0 1400 284" role="img" aria-label="Price rises through locked sell orders, and each one that fills adds to the project treasury">
    <defs>
      <linearGradient id="ig-cv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f6bff" stop-opacity=".25"/><stop offset=".55" stop-color="#7fb0ff"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <linearGradient id="ig-ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a86ff" stop-opacity=".3"/><stop offset="1" stop-color="#4a86ff" stop-opacity="0"/></linearGradient>
      <radialGradient id="ig-hd"><stop offset="0" stop-color="#fff"/><stop offset=".22" stop-color="#a9c8ff" stop-opacity=".75"/><stop offset="1" stop-color="#4a86ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="ig-vg"><stop offset="0" stop-color="#7fb0ff" stop-opacity=".75"/><stop offset="1" stop-color="#2f6bff" stop-opacity="0"/></radialGradient>
      <clipPath id="ig-cl"><rect class="cl" x="0" y="0" width="0" height="284"/></clipPath>
    </defs>
    <image class="vt" href="/assets/art/ig-vault.webp" x="1150" y="22" width="240" height="216"/>
    <g class="dyn">
      <path class="base" d="M40 250H1120"/><text class="lb" x="40" y="272">Launch price</text>
      <path class="ar" clip-path="url(#ig-cl)" d="${IGN_CURVE}L1040 250H40Z"/>
      ${[1, 2, 3, 4].map(n => `<g class="ord"><path class="lv"/><text class="lb" x="40">Order ${n}</text></g>`).join('')}
      <path class="gl" pathLength="1" d="${IGN_CURVE}"/><path class="cv" pathLength="1" d="${IGN_CURVE}"/>
      <circle class="vg" cx="1238" cy="126" r="62" fill="url(#ig-vg)"/>
      <circle class="rg" cx="1238" cy="126" r="60" pathLength="1" transform="rotate(-90 1238 126)"/>
      ${[1, 2, 3, 4].map(() => `<path class="arc" pathLength="1"/><g class="ing"><image href="/assets/art/ig-ingot.webp" x="-48" y="-27" width="96" height="53"/></g>`).join('')}
      <g class="hd"><circle r="30" fill="url(#ig-hd)"/></g>
    </g>
    <text class="ct" x="1238" y="138" text-anchor="middle">${on ? '0/4' : 'Off'}</text>
    <text class="lb vl" x="1238" y="266" text-anchor="middle">Project treasury</text>
  </svg>
  <div class="ign-b">${[['Lock', 'Part of the supply sits in sell orders.'], ['Rise', 'Buyers push the price through them.'], ['Fund', 'Each filled order pays the project.']].map(([t, c]) => `<div><i></i><b>${t}</b><span>${c}</span></div>`).join('')}</div>
</div>`;
let ignRaf = 0;
function ignStart() {
  cancelAnimationFrame(ignRaf);
  const root = $('.ign');
  if (!root) return;
  const on = root.classList.contains('on'), cv = $('.cv', root), gl = $('.gl', root), len = cv.getTotalLength();
  const ings = $$('.ing', root), arcs = $$('.arc', root), ords = $$('.ord', root), beats = $$('.ign-b>div', root), dyn = $('.dyn', root);
  const hd = $('.hd', root), cl = $('.cl', root), rg = $('.rg', root), vg = $('.vg', root), ct = $('.ct', root);
  const cut = (a, b, x) => Math.min(1, Math.max(0, (x - a) / (b - a))), ease = x => x * x * (3 - 2 * x);
  // Each order sits on the curve, so the price really runs into it
  const stops = [420, 640, 860, 1000].map((x, i) => {
    let lo = 0, hi = len;
    for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; cv.getPointAtLength(m).x < x ? lo = m : hi = m; }
    const y = cv.getPointAtLength(lo).y;
    $('.lv', ords[i]).setAttribute('d', `M40 ${y}H${x - 54}`);
    $('text', ords[i]).setAttribute('y', y - 8);
    arcs[i].setAttribute('d', `M${x} ${y}Q${(x + 1238) / 2} ${Math.max(0, Math.min(y, 126) - 70)} 1238 126`);
    return { x, y, at: lo / len, long: arcs[i].getTotalLength() };
  });
  root.style.setProperty('--ign', on ? 1 : .4);
  ings.concat(arcs, ords).forEach(n => { n.style.display = on ? '' : 'none'; });
  rg.style.display = vg.style.display = on ? '' : 'none';
  $$('[data-ign]', root).forEach(b => b.setAttribute('aria-pressed', (b.dataset.ign === '1') === on));
  let shown = '';
  if (!on) ct.textContent = 'Off';
  const draw = t => {
    const run = ease(cut(.13, .78, t)), rt = run + cut(.78, .95, t) * .28, p = cv.getPointAtLength(run * len);
    [cv, gl].forEach(n => { n.style.strokeDashoffset = 1 - run; });
    cl.setAttribute('width', p.x);
    hd.setAttribute('transform', `translate(${p.x} ${p.y})`);
    hd.setAttribute('opacity', cut(.13, .16, t));
    dyn.setAttribute('opacity', 1 - cut(.95, 1, t));
    let level = 0;
    stops.forEach((o, i) => {
      const drop = ease(cut(.01 + i * .02, .1 + i * .02, t)), hit = cut(o.at, o.at + .04, rt), fly = ease(cut(o.at + .02, o.at + .2, rt));
      const at = fly ? arcs[i].getPointAtLength(fly * o.long) : o;
      ings[i].setAttribute('transform', `translate(${at.x} ${at.y + (1 - drop) * -20}) scale(${1 - fly * .62})`);
      ings[i].setAttribute('opacity', drop * (1 - cut(.82, 1, fly)));
      ings[i].style.filter = `brightness(${1 + Math.sin(Math.PI * hit) * .9})`;
      $('.lv', ords[i]).style.opacity = 1 - hit * .6;
      arcs[i].style.strokeDashoffset = 1.2 - fly * 1.4;
      arcs[i].setAttribute('opacity', Math.sin(Math.PI * fly) * .8);
      if (on) level += ease(cut(o.at + .18, o.at + .24, rt)) / 4;
    });
    rg.style.strokeDasharray = `${level} 1`;
    vg.setAttribute('opacity', level);
    if (on) { const c = `${Math.round(level * 4 - .25)}/4`; if (c !== shown) ct.textContent = shown = c; }
    const first = .13 + .65 * .34, ends = [.13, first, .95], from = [0, .13, first];
    beats.forEach((b, i) => {
      b.classList.toggle('on', on && t >= from[i] && t < (i === 2 ? 2 : ends[i]));
      $('i', b).style.transform = `scaleX(${on ? cut(from[i], ends[i], t) * (t < .95 ? 1 : 1 - cut(.95, 1, t)) : 0})`;
    });
  };
  const t0 = performance.now();
  const frame = now => { if (!root.isConnected) return; draw(((now - t0) % 9500) / 9500); ignRaf = requestAnimationFrame(frame); };
  ignRaf = requestAnimationFrame(frame);
}
const afterBlock = pair => `<div class="after-pub"><div class="eyebrow">After you publish</div><ol class="ap">
  ${[['Page goes live', 'Your proofs are public, no token yet.'],
    ['You launch', 'The token opens when you are ready.'],
    ['Curve fills', `Buyers fill the curve up to 100 ${esc(pair)}.`],
    ['Raydium', 'At 100 ' + esc(pair) + ' on the curve it migrates.']]
    .map(([t, c], i) => `<li style="--i:${i}"><i class="display">${i + 1}</i><b>${t}</b><span>${c}</span></li>`).join('')}
</ol></div>`;
const LINK_ICONS = ['globe', 'github', 'x', 'discord', 'telegram', 'doc'];
const linkIc = k => k === 'x' ? I.xb : I[k];
const detect = u => (LINK_RULES.find(r => r[1].test(u)) || ['globe'])[0];
function viewLaunch() {
  const saved = store.get('draft', {});
  const d = launchD = Object.assign({ name: '', pitch: '', brief: '', ticker: '', pair: 'SOL', links: [], sim: '', d3: '', pcb: '', video: '', founder: '', ignition: false, fx: false, draftAt: 0, logo: null, banner: null }, saved);
  let logo = d.logo, banner = d.banner, done = false;
  let step = Math.min(4, Math.max(1, parseInt(new URLSearchParams(location.search).get('step')) || 1)), picked = 'globe';
  const STEPS = ['Project', 'Proof', 'Token', 'Review'];
  const $v = $('#view');
  $v.innerHTML = `<div class="wrap enter"><div class="l-grid">
    <section class="panel l-hero grainy"><img src="/assets/art/bench-sky.webp" alt=""><div>
      <h1 class="display">Put your machine on chain</h1><p>No account needed to start. Four steps, and you sign in only to publish.</p></div></section>
    <section class="panel block grainy" style="margin:0"><div><div class="steps" id="steps"></div><div id="sbody"></div></div></section>
    <aside class="panel grainy l-side"><div class="side-sticky">
      <div class="preview"><div class="eyebrow">Live preview</div><div id="pv"></div><a class="btn mp-open" href="/project/draft" data-l>See the full page</a></div>
      <div class="l-ready"><div class="eyebrow">Ready to publish</div><div class="check" id="chk"></div></div>
    </div></aside></div></div>`;
  const save = () => { try { store.set('draft', d); } catch { toast('Draft too large for this browser.'); } };
  const pvObj = () => ({ ref: 'draft', name: d.name || 'Your project', ticker: d.ticker || 'TICKER', tags: [], at: new Date(SNAP - 60000).toISOString(), mc: 4600, quote: d.pair, prog: 0, proof: { sim: d.sim, d3: d.d3, pcb: d.pcb }, spark: [], logo: false, cover: false });
  const drawPv = () => {
    const c = $('#pv'), p = pvObj(), proofs = [['Sim', d.sim], ['3D', d.d3], ['PCB', d.pcb], ['Video', d.video]].filter(k => k[1]);
    c.innerHTML = `<div class="mp">
      <div class="mp-cv"><img class="bg ${banner ? 'set' : ''}" src="${banner || coverSrc(p)}" alt=""></div>
      <div class="mp-id"><img class="logo" src="${logo || logoSrc(p)}" alt=""><div class="mp-t"><h4 class="c-name">${esc(p.name)}</h4><span>$${esc(p.ticker)} / ${esc(p.quote)}</span></div></div>
      <div class="mp-tags"><span class="stage pre">Pre launch</span>${proofs.map(k => `<span class="mini hw">${k[0]}</span>`).join('')}</div>
      <p>${esc(d.pitch || 'Your one line shows here.')}</p>
      <div class="mp-f"><img src="/assets/art/anon.svg" alt=""><span>${esc(d.founder || 'Anonymous')}</span><i>${d.links.map(u => linkIc(detect(u))).join('')}</i></div>
    </div>`;
    const ck = [[d.name && d.pitch, 'Name and one line'], [d.brief.length >= 40, 'Brief of 40+ characters'], [d.links.length, 'At least one link'], [d.sim || d.d3 || d.pcb, 'One proof of work'], [/^[A-Z0-9]{2,10}$/.test(d.ticker), 'Ticker set']];
    $('#chk').innerHTML = ck.map(k => `<div class="${k[0] ? 'ok' : ''}"><i>${k[0] ? I.check : ''}</i>${k[1]}</div>`).join('');
  };
  const dupHint = () => {
    const t = d.ticker, h = $('#tick-h'); if (!h) return;
    if (!t) { h.className = 'hint'; h.textContent = ''; return; }
    if (t.length < 2) { h.className = 'hint warn'; h.textContent = 'At least 2 characters'; return; }
    const same = tokens().filter(p => p.ticker.toUpperCase() === t);
    if (same.length) { h.className = 'hint warn'; h.textContent = `$${t} is taken by ${same.length} project${same.length > 1 ? 's' : ''}: ${same.slice(0, 2).map(p => p.name).join(', ')}. Buyers will see a duplicate flag.`; }
    else { h.className = 'hint ok'; h.textContent = `$${t} is free`; }
  };
  const drawLinks = () => {
    const b = $('#lks'); if (!b) return;
    b.innerHTML = d.links.map((u, i) => `<div>${linkIc(detect(u))}<span>${esc(u)}</span><button class="copy-ca" data-rm="${i}" aria-label="Remove">${I.x}</button></div>`).join('');
  };
  const addLink = () => {
    const i = $('#lk'); let u = i.value.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    d.links.push(u); i.value = ''; picked = 'globe'; save(); drawLinks(); syncPick(); drawPv();
  };
  const syncPick = () => {
    $$('[data-pick]').forEach(b => b.classList.toggle('on', b.dataset.pick === picked));
    const e = $('#lk-i'); if (e) e.innerHTML = linkIc(picked);
  };
  function body() {
    $('#steps').innerHTML = STEPS.map((s, i) => `<button data-step="${i + 1}" class="${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}">${i + 1}. ${s}</button>`).join('');
    const b = $('#sbody');
    if (done) {
      b.innerHTML = `<div class="empty"><b>${esc(d.name || 'Project')} is live in this preview</b><span>Nothing was published. In production it would now appear in Explore.</span><a class="btn sm" href="/" data-l>Back to Explore</a></div>`;
      return;
    }
    if (step === 1) b.innerHTML = `<div class="form">
      <div class="f"><label for="f-name">Project name</label><input class="input" id="f-name" maxlength="40" value="${esc(d.name)}" placeholder="Grablab"></div>
      <div class="f"><label for="f-pitch">One line</label><input class="input" id="f-pitch" maxlength="90" value="${esc(d.pitch)}" placeholder="What the machine does, for whom"><small>Shown on cards. 90 characters.</small></div>
      <div class="f"><label for="f-brief">Brief</label><textarea class="ta" id="f-brief" placeholder="The problem, the machine, how far along you are, what the raise pays for.">${esc(d.brief)}</textarea><small>The brief is your project page. Four sentences are enough.</small></div>
      <div class="two"><label class="drop" id="d-logo"><input type="file" accept="image/*" data-up="logo"><span class="d-ico">${I.image}</span><b>Add logo</b><span>Square, 512 px or more</span></label>
      <label class="drop" id="d-ban"><input type="file" accept="image/*" data-up="banner"><span class="d-ico">${I.image}</span><b>Add banner</b><span>1500 x 500 px</span></label></div></div>`;
    if (step === 2) {
      b.innerHTML = `<div class="form">
      <div class="f"><span class="flabel">Links</span><div class="lk-icons">${LINK_ICONS.map(k => `<button data-pick="${k}" aria-label="${k}">${linkIc(k)}</button>`).join('')}</div>
        <div class="lk-add"><span class="lk-i" id="lk-i">${I.globe}</span><input class="input" id="lk" placeholder="Paste a URL, the platform is detected"><button class="btn" id="lk-add" style="height:46px">Add</button></div>
        <div class="lk-list" id="lks"></div></div>
      <div class="f"><span class="flabel">Proof of work</span><small>Each filled proof adds a tab to your page and a badge to your card. Empty ones stay hidden.</small></div>
      <div class="two">
        <div class="f"><div class="f-l"><label for="f-sim">Simulation</label>${tip('A SimArena scene or any public simulation of the machine. Backers can run it on your page.')}</div><input class="input" id="f-sim" value="${esc(d.sim)}" placeholder="SimArena scene link"></div>
        <div class="f"><div class="f-l"><label for="f-d3">3D model</label>${tip('A GLB file or a viewer link. It opens in the 3D view tab so people can inspect the design.')}</div>${upf('f-d3', 'd3', 'GLB file or viewer link', '.glb,.gltf')}</div>
        <div class="f"><div class="f-l"><label for="f-pcb">PCB</label>${tip('Gerber files or a KiCad repo. Shows the electronics exist and can be checked.')}</div>${upf('f-pcb', 'pcb', 'Gerber zip or KiCad repo', '.zip,.kicad_pcb,.gbr')}</div>
        <div class="f"><div class="f-l"><label for="f-video">Video</label>${tip('A clip of the real machine running, uploaded or linked. It is the strongest proof you can add.')}</div>${upf('f-video', 'video', 'Upload a clip or paste a link', 'video/*')}</div>
      </div><div class="f"><div class="f-l"><label for="f-founder">Founder</label>${tip('Your name or handle, shown on the project page. Projects with a named founder rank higher.')}</div><div class="up-f"><input class="input" id="f-founder" value="${esc(d.founder)}" placeholder="Name or handle"><button type="button" class="btn up x-c ${d.fx ? 'on' : ''}" data-fx>${I.x}${d.fx ? 'Connected' : 'Connect X'}</button></div></div></div>`;
      drawLinks(); syncPick();
    }
    if (step === 3) { b.innerHTML = `<div class="form">
      <div class="two"><div class="f"><label for="f-tick">Ticker</label><input class="input mono" id="f-tick" maxlength="10" value="${esc(d.ticker)}" placeholder="SENSE" autocapitalize="characters"><div class="hint" id="tick-h"></div></div>
      <div class="f"><label for="f-pair">Paired with</label>${tokenPick(d.pair, ['SOL', 'USDC', 'PEAQ', 'CODEC'], 'pair', 'Paired with', 'id="f-pair"')}</div></div>
      ${ignBlock(d.ignition)}${afterBlock(d.pair)}</div>`; dupHint(); ignStart(); }
    if (step === 4) b.innerHTML = `<div class="form rev-f"><h3 class="display">Ready to publish</h3>
      <div class="t-rev">
        ${rv(RV.project, 'Project', esc(d.name || '-'))}${rv(RV.ticker, 'Ticker', d.ticker ? '$' + esc(d.ticker) : '-')}
        ${rv(RV.pair, 'Paired with', tokenIcon(d.pair) + esc(d.pair))}${rv(RV.links, 'Links', d.links.length)}
        ${rv(RV.proofs, 'Proofs', [d.sim, d.d3, d.pcb, d.video].filter(Boolean).length + ' of 4')}${rv(RV.ignition, 'Ignition', d.ignition ? 'On' : 'Off')}
      </div><p class="t-note">${d.draftAt ? 'Draft saved at ' + clock(d.draftAt / 1000, true) + ' in this browser.' : 'Your draft stays in this browser.'}</p></div>`;
    const a = document.createElement('div');
    a.className = 'f-actions';
    a.innerHTML = `<button class="btn" data-go="-1" ${step === 1 ? 'style="visibility:hidden"' : ''}>Back</button>` + `<span class="l-acts"><button class="btn" data-draft>Save draft</button>${step < 4
      ? '<button class="btn primary" data-go="1">Continue</button>' : `<button class="btn primary" id="pub">${wallet ? 'Publish preview' : 'Sign in to publish'}</button>`}</span>`;
    b.append(a);
    [['#d-logo', logo], ['#d-ban', banner]].forEach(([id, u]) => {
      const z = $(id);
      if (z && u) { z.style.backgroundImage = `url(${u})`; z.classList.add('set'); $('b', z).textContent = 'Replace'; }
    });
  }
  const root = $v.firstElementChild;
  root.addEventListener('input', e => {
    const id = e.target.id, map = { 'f-name': 'name', 'f-pitch': 'pitch', 'f-brief': 'brief', 'f-sim': 'sim', 'f-d3': 'd3', 'f-pcb': 'pcb', 'f-video': 'video', 'f-founder': 'founder' };
    if (map[id]) { d[map[id]] = e.target.value; save(); drawPv(); }
    if (id === 'f-tick') { e.target.value = d.ticker = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); save(); dupHint(); drawPv(); }
    if (id === 'lk') { picked = detect(e.target.value); syncPick(); }
  });
  root.addEventListener('change', e => {
    const up = e.target.dataset.file;
    if (up && e.target.files[0]) { d[up] = e.target.files[0].name; save(); body(); drawPv(); return; }
    const k = e.target.dataset.up; if (!k) return;
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas'), z = Math.min(1, (k === 'logo' ? 512 : 1500) / im.width);
        c.width = im.width * z; c.height = im.height * z;
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        const u = c.toDataURL('image/webp', .82);
        if (k === 'logo') logo = d.logo = u; else banner = d.banner = u;
        save(); body(); drawPv();
      };
      im.src = r.result;
    };
    r.readAsDataURL(f);
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'lk') { e.preventDefault(); addLink(); } });
  root.addEventListener('click', e => {
    const t = e.target;
    const g = t.closest('[data-go]'), s = t.closest('[data-step]'), pk = t.closest('[data-pick]'), rm = t.closest('[data-rm]'), ig = t.closest('[data-ign]');
    if (g) { step += +g.dataset.go; body(); scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
    if (s) { step = +s.dataset.step; body(); }
    if (pk) { picked = pk.dataset.pick; syncPick(); $('#lk').focus(); }
    if (rm) { d.links.splice(+rm.dataset.rm, 1); save(); drawLinks(); drawPv(); }
    if (ig) { d.ignition = ig.dataset.ign === '1'; save(); $('.ign').classList.toggle('on', d.ignition); ignStart(); }
    if (t.closest('[data-fx]')) {
      d.fx = !d.fx;
      if (d.fx) { d.founder = d.founder || '@your_handle'; toast('Demo. The real build opens X sign in.'); }
      save(); body(); drawPv();
    }
    if (t.closest('[data-draft]')) { d.draftAt = Date.now(); save(); body(); toast('Draft saved.'); }
    const pr = t.closest('[data-pair]');
    if (pr) { d.pair = pr.dataset.pair; save(); body(); drawPv(); }
    if (t.closest('#lk-add')) addLink();
    if (t.closest('#pub')) {
      if (!wallet) { connect(); body(); return; }
      done = true; body(); toast('Preview only. Nothing was published.');
    }
  });
  const onW = () => body();
  document.addEventListener('wallet', onW);
  onLeave(() => document.removeEventListener('wallet', onW));
  body(); drawPv();
}

/* rewards */
function viewRewards() {
  const v = $('#view');
  const draw = () => {
    const me = wallet ? 12480 : null;
    const board = [['7xKp...Q2ms', 418200], ['Dn4v...8hTz', 302750], ['9qRb...mL1c', 276100], ['Bc2H...wY7e', 188940], ['Fh8s...Ua3k', 140320], ['3mZt...kP9d', 97610], ['Gy6L...cN4r', 61200]];
    const list = [...board];
    if (wallet) list.push(['You', me]);
    v.innerHTML = `<div class="wrap enter">
    <section class="panel r-hero grainy"><div class="t">
      <div class="kick">Season one</div>
      <h1 class="display">Every trade is already counted</h1>
      <p class="mut">Points track your trading and holding from your wallet, on FOMO and PUMP too. Projects can add their own rewards on top.</p>
      ${wallet ? `<div class="pts"><span class="num">${int(me)}</span><span class="mut">points, rank #1,204</span></div>` : '<div><button class="btn primary" data-conn>Connect to see your points</button></div>'}
    </div><img src="/assets/art/medal-cut.webp" alt="" decoding="async"></section>
    <section class="panel block grainy"><div>
      <div class="head"><h2 class="display">How you earn</h2></div>
      <div class="art-grid">
        ${[['earn-trade', 'Trade', 'Any project, buy or sell. FOMO and PUMP count on the same wallet.', [['machine.fun', '10 points per $100'], ['FOMO or PUMP', '5 points per $100']]],
          ['earn-hold', 'Hold and back', 'Counted daily on your balance. Buy before a project migrates to double it.', [['Holding', '2 points per $100 a day'], ['Bonding', 'x2 points']]],
          ['earn-vault', 'Project rewards', 'Founders can add their own rewards on top of the season.', [['Set by each founder', 'Varies']]]].map(a => `<article class="art-c"><img src="/assets/art/${a[0]}-cut.webp" alt="" loading="lazy" decoding="async"><div><h3>${a[1]}</h3><p>${a[2]}</p><dl>${a[3].map(r => `<div><dt>${earnLogos[r[0]] || ''}${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl></div></article>`).join('')}
      </div></div>
    </section>
    <section class="panel block grainy r-board"><img src="/assets/art/podium-cut.webp" alt="" decoding="async"><div>
      <div class="head"><h2 class="display">Leaderboard</h2></div>
      <table class="lb"><thead><tr><th>Rank</th><th>Wallet</th><th>Points</th></tr></thead><tbody>${list.map((r, i) => `<tr class="${r[0] === 'You' ? 'me' : ''}"><td>${r[0] === 'You' ? '1,204' : i + 1}</td><td class="mono"><span class="who">${avatar(r[0])}${esc(r[0])}</span></td><td>${int(r[1])} <em class="unit">pts</em></td></tr>`).join('')}</tbody></table></div>
    </section>
    <section class="panel block grainy"><div class="art-grid slim">
      ${[['medal', 'What you get', 'Points decide your share when a season closes.'], ['hourglass', 'When', 'Your counter updates after every trade.<br>Seasons close on a date shown here.'], ['loupe', 'How to check', 'Every point links to the trade that earned it.']].map(a => `<article class="art-c"><img src="/assets/art/${a[0]}-cut.webp" alt="" decoding="async"><div><h3>${a[1]}</h3><p>${a[2]}</p></div></article>`).join('')}
    </div></section></div>`;
    requestAnimationFrame(reveal);
  };
  draw();
  const c = e => { if (e.target.closest('[data-conn]')) connect(); };
  v.addEventListener('click', c);
  document.addEventListener('wallet', draw);
  onLeave(() => { v.removeEventListener('click', c); document.removeEventListener('wallet', draw); });
}

/* router */
function saveY() {
  try { history.replaceState({ ...(history.state || {}), y: scrollY }, ''); } catch {}
}
function render() {
  cleanups.splice(0).forEach(f => f());
  $('.drawer')?.remove();
  $('.acct')?.remove();
  const p = location.pathname;
  const m = p.match(/^\/project\/([^/]+)/);
  if (p === '/') viewHome();
  else if (m) renderProject(decodeURIComponent(m[1]));
  else if (p === '/launch') viewLaunch();
  else if (p === '/rewards') viewRewards();
  else { $('#view').innerHTML = `<div class="wrap enter"><section class="panel block"><div class="empty"><b>Nothing here</b><a class="btn sm" href="/" data-l>Back to Explore</a></div></section></div>`; }
  markNav();
  requestAnimationFrame(reveal);
}
// Anything below the fold rises in as it arrives; what is already on screen never waits
let revealIO = null;
function reveal() {
  if (reduced) return;
  revealIO ||= new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    revealIO.unobserve(e.target);
  }), { rootMargin: '0px 0px -7% 0px' });
  $$('#view section.panel,#view .stats,#view .art-c,#view .lb tbody tr,#foot .panel').forEach(e => {
    if (e.classList.contains('rv') || e.getBoundingClientRect().top < innerHeight * .93) return;
    e.classList.add('rv');
    if (!e.matches('section,.stats,#foot .panel')) e.style.setProperty('--d', Math.min([...e.parentElement.children].indexOf(e), 7) * 70 + 'ms');
    revealIO.observe(e);
  });
}
function scrollAfter() {
  const y = history.state?.y;
  if (location.hash) { const t = $(location.hash); if (t) { scrollTo(0, t.getBoundingClientRect().top + scrollY - 70); return; } }
  scrollTo(0, y || 0);
}
function route(sameView) {
  const ref = (location.pathname.match(/^\/project\/([^/]+)/) || [])[1] || lastRef;
  const named = [];
  const name = () => { const e = ref && $(`[data-vt="${CSS.escape(decodeURIComponent(ref))}"]`); if (e) { e.style.viewTransitionName = 'logo'; named.push(e); } };
  const clear = () => named.splice(0).forEach(e => e.style.viewTransitionName = '');
  if (document.startViewTransition && !reduced && !sameView) {
    name();
    const t = document.startViewTransition(() => { clear(); render(); scrollAfter(); name(); });
    t.ready.catch(() => {});
    t.finished.catch(() => {}).finally(clear);
  } else { render(); if (!sameView) scrollAfter(); }
  const m = location.pathname.match(/^\/project\/([^/]+)/);
  if (m) lastRef = m[1];
  if (location.hash === '#search') { history.replaceState({}, '', location.pathname); openSearch(); }
}
let lastRef = null;
function go(url) {
  const u = new URL(url, location.href);
  if (fnd.el?.open) { fnd.el.close(); history.replaceState({}, '', u); route(); return; }
  if (u.pathname === location.pathname && u.search === location.search && u.hash === location.hash) {
    if (!u.hash) scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    return;
  }
  saveY();
  if (u.pathname === location.pathname && u.hash) {
    history.pushState({}, '', u);
    const t = $(u.hash);
    if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY - 70, behavior: reduced ? 'auto' : 'smooth' });
    return;
  }
  history.pushState({}, '', u);
  route();
}

/* global input: navigate on press, not on release */
let pressed = null;
document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.acct,#conn')) $('.acct')?.remove();
  if (e.pointerType !== 'mouse' || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.target.closest('button,input,.drag')) return;
  const a = e.target.closest('a[data-l]');
  if (!a) return;
  pressed = a; go(a.href);
});
document.addEventListener('click', e => {
  const t = e.target;
  const star = t.closest('[data-star]'), cp = t.closest('[data-copy]'), rem = t.closest('[data-remind]'), retry = t.closest('[data-retry]');
  if (t.closest('[data-search]')) { e.preventDefault(); openSearch(); return; }
  if (t.closest('[data-disc]')) { disconnect(); return; }
  if (star) { e.preventDefault(); e.stopPropagation(); wiggle($('svg', star)); toggleWatch(star.dataset.star); return; }
  const inline = t.closest('[data-star-p]'), bar = t.closest('.watch');
  if (inline) wiggle($('svg', inline));
  if (bar && !t.closest('a,button')) wiggle($('.w-ic svg', bar));
  if (cp) { e.preventDefault(); e.stopPropagation(); copy(cp.dataset.copy); return; }
  if (rem) {
    e.preventDefault(); e.stopPropagation();
    const r = rem.dataset.remind;
    reminds.has(r) ? reminds.delete(r) : reminds.add(r);
    store.set('remind', [...reminds]);
    $$(`[data-remind="${r}"]`).forEach(b => { const s = reminds.has(r); b.innerHTML = I.bell + (s ? 'Reminder set' : b.closest('.trade') ? 'Remind me at launch' : 'Remind me'); b.classList.toggle('primary', !s && !!b.closest('.trade')); });
    toast(reminds.has(r) ? 'Reminder set, demo only' : 'Reminder removed');
    return;
  }
  if (retry) { e.preventDefault(); net = 'ok'; route(true); toast('Back online'); return; }
  const a = t.closest('a[data-l]');
  if (!a) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  e.preventDefault();
  if (pressed === a) { pressed = null; return; }
  pressed = null;
  go(a.href);
});
let preT = 0;
const prefetch = e => {
  const c = e.target.closest?.('[data-pre]');
  clearTimeout(preT);
  if (c && byRef.get(c.dataset.pre)?.mint) preT = setTimeout(() => candles(c.dataset.pre), 140);
};
document.addEventListener('pointerover', prefetch, { passive: true });
document.addEventListener('touchstart', prefetch, { passive: true });
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
  if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key === 'k')) { e.preventDefault(); openSearch(); }
  if (!typing && $('#pages') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) goPage(ex.page + (e.key === 'ArrowLeft' ? -1 : 1));
  if (e.key === 'Escape' && typing) document.activeElement.blur();
});
addEventListener('popstate', () => {
  if (fnd.skip) { fnd.skip = false; return; }
  if (fnd.el?.open) { fnd.el.close(); return; }
  route();
});
// The bar keeps one size in layout, only its layers glide, so nothing reflows
const wiggle = el => { if (el && !reduced) el.animate([{ rotate: '0deg', scale: 1 }, { rotate: '-18deg', scale: 1.25 }, { rotate: '14deg', scale: 1.25 }, { rotate: '-9deg', scale: 1.1 }, { rotate: '5deg', scale: 1.04 }, { rotate: '0deg', scale: 1 }], { duration: 480, easing: 'ease-out' }); };
function fitNav() {
  const t = $('#top');
  document.documentElement.style.setProperty('--sb', innerWidth - document.body.clientWidth + 'px');
  if (!t) return;
  const w = t.offsetWidth, need = [...t.children].reduce((n, e) => n + (e.matches('.top-bg') ? 0 : e.offsetWidth), 0) + 220;
  const pill = innerWidth > 1020 ? Math.min(w, need) : w;
  navDx = (w - pill) / 2; navW = w;
  navApply();
}
let navDx = 0, navW = 1;
function navApply() {
  const t = $('#top'), bg = $('.top-bg', t), br = $('.brand', t), r = $('.right', t), m = $('.brand.mark i', t);
  if (!bg) return;
  bg.style.opacity = Math.min(1, navS * 2.4).toFixed(3);
  bg.style.transform = `scaleX(${(1 - 2 * navDx * navS / navW).toFixed(4)})`;
  br.style.transform = `translate3d(${(navDx * navS).toFixed(2)}px,0,0)`;
  r.style.transform = `translate3d(${(-navDx * navS).toFixed(2)}px,0,0)`;
  if (m) m.style.transform = `scale(${(1 - navS * .16).toFixed(4)})`;
  t.dataset.np = navS.toFixed(4);
}
let navS = 0, navRaf = 0;
/* the wheel moves the page in 100px jumps, so the pill runs on its own compositor transition instead of following the scroll */
function navStep() {
  navRaf = 0;
  const on = scrollY > 24 ? 1 : 0;
  if (on === navS) return;
  navS = on;
  navApply();
  $('#top').classList.toggle('stuck', !!on);
}
addEventListener('scroll', () => { if (!navRaf) navRaf = requestAnimationFrame(navStep); }, { passive: true });
addEventListener('resize', fitNav, { passive: true });
document.fonts?.addEventListener('loadingdone', fitNav);
addEventListener('click', e => {
  const o = e.target.closest('[data-pick-open]');
  if (o) { e.preventDefault(); o.parentElement.classList.toggle('open'); }
  else $('.pick.open')?.classList.remove('open');
});
addEventListener('keydown', e => { if (e.key === 'Escape') $('.pick.open')?.classList.remove('open'); });
addEventListener('resize', markNav, { passive: true });
history.scrollRestoration = 'manual';

async function boot() {
  renderTop();
  let r;
  try {
    r = await fetch('/data/projects.json', { credentials: 'omit' }).then(x => { if (!x.ok) throw 0; return x.json(); });
  } catch {
    $('#view').innerHTML = `<div class="wrap enter"><section class="panel block"><div class="t-err">${I.alert}<b>Could not load projects</b><span class="t-note">Check your connection and try again.</span><button class="btn sm" id="reboot">Retry</button></div></section></div>`;
    $('#reboot').onclick = boot;
    return;
  }
  P = r.items; SNAP = +new Date(r.at);
  P.forEach(p => { if (!p.mint) p.pre = true; byRef.set(p.ref, p); if (p.ticker) { const k = p.ticker.toUpperCase(); dupCount[k] = (dupCount[k] || 0) + 1; } });
  byRef.set('grablab', SAMPLE);
  renderTop(); renderFoot(); renderChrome();
  route(true);
  scrollAfter();
  document.fonts?.ready.then(markNav);
}
boot();
