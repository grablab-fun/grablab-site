'use strict';
/* Redesign concept. Static snapshot of public data, no wallet, no transactions. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('mfc:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('mfc:' + k, JSON.stringify(v)); } catch {} },
};
const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

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
    globe: s('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
    github: s('<path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.200s-1.1-.3-3.5 1.300a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.100a4.3 4.3 0 0 0-.1 3.200A4.7 4.7 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>'),
    x: s('<path d="m4 4 16 16M20 4 4 20"/>', 'stroke-width="2.2"'),
    discord: s('<path d="M8.5 7C7 7.3 5.8 7.8 5 8.5 3.5 11.5 3 14.5 3.2 17.5c1.4 1 2.9 1.7 4.5 2l1-1.800M15.5 7c1.5.3 2.7.8 3.5 1.5 1.5 3 2 6 1.8 9-1.4 1-2.9 1.7-4.5 2l-1-1.800M7.5 16.5c3 1.3 6 1.3 9 0"/><circle cx="9.5" cy="12.5" r="1.2"/><circle cx="14.5" cy="12.5" r="1.2"/>'),
    telegram: s('<path d="M21 4 3 11.5l6 2.200L18 7l-6.5 8.5 6 4.5z"/>'),
    doc: s('<path d="M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6"/>'),
    youtube: s('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>'),
    clock: s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
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
  links: [['globe', 'grablab.fun', 'https://grablab.fun'], ['x', '@grablabfun', 'https://x.com/grablabfun']],
  milestones: [
    { s: 'done', t: 'Simulation of the full machine', d: 'Physics scene built and playable in SimArena.', proof: 'Simulation tab' },
    { s: 'done', t: 'Interactive 3D model', d: 'Every part of the metal build, exploded and labelled.', proof: '3D View tab' },
    { s: 'now', t: 'Prototype 01 hardware build', d: 'Frame, gantry and claw module on the bench.' },
    { s: 'next', t: 'Plays signed by the machine', d: 'peaqOS identity, every play signed with a key it cannot fake.' },
    { s: 'next', t: 'First public claw night', d: 'Live stream, escrow public, receipts for every play.' },
  ],
};

const CHANGES = [
  { g: 'Bugs', t: 'Project page never renders fake defaults', d: 'Live: a fresh load shows Bonding Curve 0.0% and "Too Large For The Curve" on $SENSE, a migrated token. Here the market state ships with the page, and the trade widget has real loading and error states.', l: '/project/zweAAsj6sIj', img: '2-project-stuck-bonding-state', demo: 1 },
  { g: 'Bugs', t: 'Chart moves between polls', d: 'Live: polling /api/rpc every 15 s. Here the last candle streams. Ticks are simulated in this concept, the real build needs a websocket.', l: '/project/zweAAsj6sIj' },
  { g: 'Bugs', t: 'One request per project open', d: 'Live: about 10 sequential /api/rpc calls. Here the page opens from a single payload, candles arrive in one extra file, prefetched on hover.', l: '/project/zweAAsj6sIj' },
  { g: 'Bugs', t: 'One time zone everywhere', d: 'Live: chart in UTC, price text in local 12 h. Here a single UTC / Local switch drives the axis, the crosshair and the price stamp.', l: '/project/zweAAsj6sIj' },
  { g: 'Bugs', t: 'Explore grid aligned', d: 'Live: cards are 197 or 226 px and flow in columns. Here rows are real and the tag row is always reserved.', l: '/#explore', img: '1-explore-alignment' },
  { g: 'Bugs', t: 'Launch button answers the cursor', d: 'Live: hover:brightness-125 on a near black button shows nothing. Here the metal edge lights and a sheen crosses it.', l: '/', img: '4-launch-hover' },
  { g: 'Bugs', t: 'Terms no longer hide the site', d: 'Live: main is visibility:hidden until you tick the box. Here you browse first and accept in a small card.', l: '/' },
  { g: 'Bugs', t: 'Duplicate tickers flagged', d: 'Live: three $BUG, two $CLANKER. Here cards carry a duplicate flag and Launch warns while you type the ticker.', l: '/launch' },
  { g: 'Bugs', t: 'Mobile bar stays out of the way', d: 'Live: it covers search and filters and has no active state on project pages. Here the page reserves its space and every route lights its tab.', l: '/' },
  { g: 'Bugs', t: 'Real error states', d: 'Live: skeleton forever when RPC fails. Here a clear message and a Retry. Try it with Review controls, bottom right.', l: '/project/zweAAsj6sIj', demo: 1 },
  { g: 'UX', t: 'Launch flow in four steps', d: 'Open without an account, sign in only to publish. Every field says what is expected, and a live preview shows the final card.', l: '/launch' },
  { g: 'UX', t: 'Add a link in one paste', d: 'A row of icons, and a URL field that detects the platform from the domain.', l: '/launch?step=2' },
  { g: 'UX', t: 'Floating nav pill', d: 'Live: a flat full width black band on scroll. Here a detached pill with blur and a sliding active state.', l: '/', img: '3-sticky-header' },
  { g: 'UX', t: 'Hero holds still', d: 'The rotating word has a fixed slot, the dragonfly sits behind, subtitle and buttons share one axis.', l: '/' },
  { g: 'UX', t: 'Numbers with character', d: 'Archivo expanded with tabular figures for prices and market caps, a mono face for small data.', l: '/#explore' },
  { g: 'UX', t: 'A footer that works', d: 'Linked CodecFlow, peaq and SimArena logos, full navigation, contact and a risk notice.', l: '/', img: '5-footer' },
  { g: 'UX', t: 'Foundry grain everywhere', d: 'Grain and a soft metal gradient on the backdrop, panels and cards. No flat surfaces left.', l: '/' },
  { g: 'UX', t: 'Founders get a face', d: 'Team has its own tab, and a project with no founder shows what is missing and how to add it.', l: '/project/grablab' },
  { g: 'Product', t: 'Rewards that explain themselves', d: 'Action to points table, leaderboard and your own counter. Numbers are samples.', l: '/rewards', img: '6-rewards' },
  { g: 'Product', t: 'Pre launch rail', d: 'Separate from permissionless launches. Not an endorsement, just on the list, with Remind me.', l: '/#prelaunch' },
  { g: 'Product', t: 'Media tabs only when real, badges on cards', d: 'Empty tabs disappear. Sim, 3D and PCB badges separate builders from memes in a second.', l: '/project/grablab', img: '7-empty-tabs' },
  { g: 'Product', t: 'A public Verify tab', d: 'Mint, pool, Raydium and explorer links in one place. Migration tx and fee escrow are marked where the API must expose them.', l: '/project/zweAAsj6sIj?tab=verify' },
  { g: 'Product', t: 'Milestones with proof', d: 'The pitch promises verifiable milestones. This tab makes them the core of a project page.', l: '/project/grablab?tab=milestones' },
  { g: 'Product', t: 'Search that finds things', d: 'Name, ticker, contract, tags and description, with no network call. Press / anywhere.', l: '/#explore' },
  { g: 'Product', t: 'Feed instead of pagination', d: 'Explore loads as you scroll.', l: '/#explore' },
];

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
const logoSrc = p => p.logo ? `/assets/logos/${p.ref}.webp` : '/assets/art/dragonfly-poster.webp';
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
  renderWatch();
}
function connect() {
  wallet = { addr: 'Demo...wallet' };
  store.set('wallet', wallet);
  renderTop();
  toast('Demo wallet. No extension was contacted.');
  document.dispatchEvent(new Event('wallet'));
}
function disconnect() {
  wallet = null; store.set('wallet', null); renderTop();
  document.dispatchEvent(new Event('wallet'));
}

/* shell */
const NAV = [['/', 'Explore', 'compass'], ['/rewards', 'Rewards', 'gift'], ['/launch', 'Launch', 'rocket'], ['/changes', 'Changes', 'list']];
function activeNav() {
  const p = location.pathname;
  if (p === '/' || p.startsWith('/project')) return '/';
  return NAV.find(n => n[0] === p)?.[0] || '/';
}
function renderTop() {
  $('#top').innerHTML = `
    <a class="brand" href="/" data-l aria-label="Home"><i></i>machine.fun<small>concept</small></a>
    <nav class="pill" aria-label="Primary"><span class="slide"></span>
      ${NAV.map(n => `<a href="${n[0]}" data-l data-nav="${n[0]}">${I[n[2]]}<span>${n[1]}</span></a>`).join('')}
    </nav>
    <div class="right">
      <a class="btn metal" href="/launch" data-l><span style="display:flex;gap:8px;align-items:center">${I.rocket}Launch Project</span></a>
      <button class="btn conn ${wallet ? '' : 'primary'}" id="conn">${wallet ? esc(wallet.addr) : 'Connect'}</button>
    </div>`;
  $('#conn').onclick = () => wallet ? disconnect() : connect();
  $('#tabbar').innerHTML = NAV.map(n => `<a href="${n[0]}" data-l data-nav="${n[0]}">${I[n[2]]}${n[1]}</a>`).join('');
  markNav();
}
function markNav() {
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
  $('#foot').innerHTML = `<div class="panel grainy in"><div>
    <div class="f-cols">
      <div><a class="brand" href="/" data-l style="padding:0;height:auto;background:none;box-shadow:none"><i></i>machine.fun</a>
        <p style="margin-top:10px">Fund the hardware that actually gets built.<br>This page is an unofficial concept by Grablab.</p></div>
      <div><h4>Product</h4><ul>
        <li><a href="/" data-l>Explore</a></li><li><a href="/launch" data-l>Launch</a></li><li><a href="/rewards" data-l>Rewards</a></li>
        <li><a href="https://foundry.machine.fun" target="_blank" rel="noopener">Foundry</a></li><li><a href="https://app.simarena.ai" target="_blank" rel="noopener">SimArena</a></li></ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="https://docs.machine.fun" target="_blank" rel="noopener">Docs</a></li><li><a href="https://machine.fun/terms" target="_blank" rel="noopener">Terms</a></li>
        <li><a href="https://machine.fun/privacy" target="_blank" rel="noopener">Privacy</a></li><li><a href="https://twitter.com/machinedotfun" target="_blank" rel="noopener">X</a></li>
        <li><a href="https://github.com/machinedotfun" target="_blank" rel="noopener">GitHub</a></li></ul></div>
      <div><h4>Risk notice</h4><p>Tokens can be volatile or lose all value. Transactions cannot be reversed. A listing is not an endorsement. Nothing on this page is financial advice.</p></div>
    </div>
    <div class="powered"><span>Data: public snapshot, ${new Date(SNAP).toUTCString().slice(5, 16)}</span>
      <div class="logos"><span>Powered by</span>
        <a href="https://codecflow.ai" target="_blank" rel="noopener" aria-label="CodecFlow"><img src="/assets/art/codecflow-white.svg" alt="CodecFlow"></a>
        <a href="https://peaq.xyz" target="_blank" rel="noopener" aria-label="peaq"><img src="/assets/art/peaq-white.svg" alt="peaq"></a>
        <a href="https://app.simarena.ai" target="_blank" rel="noopener" aria-label="SimArena"><img src="/assets/art/simarena-white.svg" alt="SimArena"></a>
      </div></div>
  </div></div>`;
}
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
      <div class="seg sm" style="justify-self:start">${[['ok', 'Normal'], ['slow', 'Slow'], ['down', 'Down']].map(n => `<button data-n="${n[0]}" class="${net === n[0] ? 'on' : ''}">${n[1]}</button>`).join('')}</div>
      <a class="btn sm" href="/changes" data-l>All 25 changes</a>`;
      $$('[data-n]', e).forEach(b => b.onclick = () => { net = b.dataset.n; draw(); route(true); });
    };
    draw();
    lay.append(e);
  };
  if (!store.get('terms', false)) {
    document.body.classList.add('has-terms');
    const t = document.createElement('div');
    t.className = 'terms';
    t.innerHTML = `<b>Browse first</b><p>Terms now apply when you sign in or trade, not before.</p>
      <div class="a"><button class="btn sm primary" id="tok">Got it</button><a class="btn sm sm-hide" href="https://machine.fun/terms" target="_blank" rel="noopener">Read Terms</a></div>`;
    lay.append(t);
    $('#tok').onclick = () => { store.set('terms', true); t.remove(); document.body.classList.remove('has-terms'); };
  }
}

/* cards */
function spark(p) {
  const v = p.spark || [], up = isUp(p), col = up ? '#c6ff3b' : '#ff5c3a';
  if (v.length < 2) return `<svg class="sp" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30H100" stroke="rgba(255,255,255,.2)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" fill="none"/></svg>`;
  const min = Math.min(...v), max = Math.max(...v), r = max - min || 1;
  const pts = v.map((y, i) => [(i / (v.length - 1)) * 100, 36 - ((y - min) / r) * 32]);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
  const id = 'g' + p.ref.replace(/[^a-z0-9]/gi, '');
  return `<svg class="sp" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".32"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
    <path d="${d}L100 40L0 40Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}
const proofMinis = p => {
  const o = [];
  if (p.proof?.sim) o.push('<span class="mini hw">Sim</span>');
  if (p.proof?.d3) o.push('<span class="mini hw">3D</span>');
  if (p.proof?.pcb) o.push('<span class="mini hw">PCB</span>');
  return o.join('');
};
const tagsRow = p => proofMinis(p) + (p.tags || []).slice(0, 3).map(t => `<span class="mini">${esc(t)}</span>`).join('');
function card(p, opts = {}) {
  const st = stageOf(p), dup = p.ticker && dupCount[p.ticker.toUpperCase()] > 1;
  return `<a class="card" href="/project/${esc(p.ref)}" data-l data-pre="${esc(p.ref)}">
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
      <div class="c-mc"><span class="num">${usd(p.mc)}</span><span class="pair">/ ${esc(p.quote || 'SOL')}</span></div>
      <div class="bar ${st === 'mig' ? 'done' : ''}"><i style="width:${Math.max(pct(p), .6)}%"></i></div>
      <div class="c-ft"><span>${st === 'mig' ? 'Migrated' : 'Curve ' + pct(p).toFixed(0) + '%'}</span>
        <span class="${p.change ? (isUp(p) ? 'up' : 'down') : ''}">${p.change || 'No trades'}</span><span>${usd(p.vol)}</span></div>
    </div></a>`;
}
function rowItem(p) {
  return `<a class="row-l" href="/project/${esc(p.ref)}" data-l data-pre="${esc(p.ref)}">
    <img class="logo" data-vt="${esc(p.ref)}" src="${logoSrc(p)}" alt="" loading="lazy">
    <div class="n"><b>${esc(p.name)}</b><span>$${esc(p.ticker)} ${stageTxt[stageOf(p)]}</span></div>
    <span class="num" style="font-size:15px">${usd(p.mc)}</span>
    <span class="h ${p.change ? (isUp(p) ? 'up' : 'down') : 'mut2'}">${p.change || '-'}</span>
    <span class="h">${usd(p.vol)}</span><span class="h">${int(p.holders)}</span>
    <button class="star ${watch.has(p.ref) ? 'on' : ''}" data-star="${esc(p.ref)}" aria-label="Add to watchlist">${I.star}</button></a>`;
}

/* home */
const ex = { q: '', tag: 'all', stage: 'all', sort: 'mc', view: store.get('view', 'grid'), limit: 16 };
let homeEl = null, gridBox = null, heroTimer = 0;
const tokens = () => P.filter(p => p.mint);
function exploreList() {
  const q = ex.q.trim().toLowerCase();
  let l = tokens().filter(p => {
    if (ex.tag !== 'all' && !p.tags.includes(ex.tag)) return false;
    if (ex.stage === 'bond' && p.mig) return false;
    if (ex.stage === 'mig' && !p.mig) return false;
    if (q && !(p.name + ' ' + p.ticker + ' ' + p.mint + ' ' + p.tags.join(' ') + ' ' + p.desc).toLowerCase().includes(q)) return false;
    return true;
  });
  const s = { mc: (a, b) => (b.mc || 0) - (a.mc || 0), vol: (a, b) => (b.vol || 0) - (a.vol || 0), new: (a, b) => new Date(b.at) - new Date(a.at), hold: (a, b) => (b.holders || 0) - (a.holders || 0) }[ex.sort];
  return l.sort(s);
}
function drawGrid() {
  const list = exploreList(), box = gridBox;
  $('#ex-count').textContent = list.length;
  const show = list.slice(0, ex.limit);
  if (!list.length) {
    box.innerHTML = `<div class="empty"><b>Nothing matches "${esc(ex.q)}"</b><span>Search covers names, tickers, contracts, tags and descriptions.</span><button class="btn sm" id="clr">Clear filters</button></div>`;
    $('#clr').onclick = () => { ex.q = ''; ex.tag = 'all'; ex.stage = 'all'; $('#q').value = ''; syncControls(); drawGrid(); };
  } else {
    box.innerHTML = ex.view === 'grid' ? `<div class="grid">${show.map(p => card(p)).join('')}</div>` : `<div class="list">${show.map(rowItem).join('')}</div>`;
  }
  $('#more').textContent = list.length > ex.limit ? 'Loading more' : list.length ? 'That is everything' : '';
}
function syncControls() {
  $$('[data-tag]').forEach(b => b.classList.toggle('on', b.dataset.tag === ex.tag));
  $$('[data-stage]').forEach(b => b.classList.toggle('on', b.dataset.stage === ex.stage));
  $$('[data-sort]').forEach(b => b.classList.toggle('on', b.dataset.sort === ex.sort));
  $$('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === ex.view));
}
function renderWatch() {
  const w = $('#watch');
  if (!w) return;
  const items = [...watch].map(r => byRef.get(r)).filter(Boolean);
  w.innerHTML = I.star + (items.length ? items.map(p => `<a class="chip-w" href="/project/${esc(p.ref)}" data-l><img src="${logoSrc(p)}" alt="">${esc(p.name)}</a>`).join('') : '<span>Nothing on your watchlist. Star a project to follow it.</span>');
}
function preRail() {
  const pick = /NeuroTech|Making Robotics|Autonomous Web3|fullfilling/i;
  const seen = new Set();
  const others = P.filter(p => !p.mint && pick.test(p.name + ' ' + p.desc) && !seen.has(p.name) && seen.add(p.name)).slice(0, 4).map(p => ({ ...p, pre: true }));
  return [SAMPLE, ...others];
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
  el.innerHTML = `
  <section class="panel hero grainy">
    <img class="plate" src="/assets/art/fly-macro.webp" alt="" fetchpriority="high" decoding="async">
    <div class="copy">
      <h1 class="display"><span class="l">Fund the <span class="rot">${words.map((w, i) => `<b class="${i ? '' : 'on'}">${w}</b>`).join('')}</span></span><span class="l">that actually get built</span></h1>
      <p>Launch a physical product, prove it works, raise on chain through verifiable milestones.</p>
      <div class="cta"><a class="btn lg metal" href="/launch" data-l><span style="display:flex;gap:8px;align-items:center">${I.rocket}Launch Project</span></a><a class="btn lg" href="/#explore" data-l data-anchor="explore">Explore projects</a></div>
    </div>
  </section>
  <div class="panel grainy stats">
    <div><div class="eyebrow">Live projects</div><div class="num">${t.length}</div></div>
    <div><div class="eyebrow">Migrated</div><div class="num">${t.filter(p => p.mig).length}</div></div>
    <div><div class="eyebrow">Total market cap</div><div class="num">${usd(sum('mc'))}</div></div>
    <div><div class="eyebrow">Holders</div><div class="num">${int(sum('holders'))}</div></div>
  </div>
  <div class="watch" id="watch"></div>
  <section class="panel block grainy" id="prelaunch"><div>
    <div class="head"><h2 class="display">Pre launch</h2><span class="note">On the list. Not an endorsement.</span></div>
    <div class="rail">${preRail().map(preCard).join('')}</div></div>
  </section>
  <section class="panel block grainy" id="explore"><div>
    <div class="head"><h2 class="display">Explore</h2><span class="count" id="ex-count">0</span></div>
    <div class="controls">
      <label class="search">${I.search}<span class="sr">Search projects</span><input id="q" type="search" autocomplete="off" placeholder="Search projects"><kbd>/</kbd></label>
      <div class="seg">${[['all', 'All'], ['bond', 'Bonding'], ['mig', 'Migrated']].map(s => `<button data-stage="${s[0]}">${s[1]}</button>`).join('')}</div>
      <div class="seg sort">${[['mc', 'Market cap'], ['vol', 'Volume'], ['hold', 'Holders'], ['new', 'Newest']].map(s => `<button data-sort="${s[0]}">${s[1]}</button>`).join('')}</div>
      <div class="seg"><button class="icon-btn" data-view="grid" aria-label="Grid view">${I.grid}</button><button class="icon-btn" data-view="list" aria-label="List view">${I.list}</button></div>
    </div>
    <div class="tags"><button class="tag-b" data-tag="all">All</button>${tagList.map(x => `<button class="tag-b" data-tag="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div id="neterr"></div>
    <div id="gridbox"></div>
    <div class="sentinel" id="sent"></div>
    <div class="more" id="more"></div></div>
  </section>`;
  homeEl = el; gridBox = $('#gridbox', el);
  const input = $('#q', el);
  input.addEventListener('input', () => { ex.q = input.value; ex.limit = 16; drawGrid(); });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-tag],[data-stage],[data-sort],[data-view]');
    if (!b) return;
    const d = b.dataset;
    if (d.tag) ex.tag = d.tag;
    if (d.stage) ex.stage = d.stage;
    if (d.sort) ex.sort = d.sort;
    if (d.view) { ex.view = d.view; store.set('view', d.view); }
    ex.limit = 16; syncControls(); drawGrid();
  });
  new IntersectionObserver(es => {
    if (es[0].isIntersecting && location.pathname === '/' && ex.limit < exploreList().length) { ex.limit += 16; drawGrid(); }
  }, { rootMargin: '700px' }).observe($('#sent', el));
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
function viewHome() {
  if (!homeEl) buildHome();
  $('#view').replaceChildren(homeEl);
  $('#neterr', homeEl).innerHTML = net === 'down' ? `<div class="err-banner" style="margin-bottom:12px">${I.alert.replace('<svg', '<svg width="18" height="18"')}<span>Live prices are unavailable. Showing the last snapshot.</span><button class="btn sm" data-retry>Retry</button></div>` : '';
  syncControls(); drawGrid(); renderWatch(); startRot();
  onLeave(() => clearInterval(heroTimer));
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
function mountChart(cv, raw, p, onTick) {
  const scale = raw.length ? (p.price || raw[raw.length - 1][4]) / raw[raw.length - 1][4] : 1;
  // Buckets with one trade are flat, so each candle opens at the previous close
  const data = raw.map((c, i) => {
    const close = c[4] * scale, open = i ? raw[i - 1][4] * scale : c[1] * scale;
    return [c[0], open, Math.max(c[2] * scale, open, close), Math.min(c[3] * scale, open, close), close];
  }).slice(-64);
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, hover = -1, raf = 0;
  const up = '#c6ff3b', dn = '#ff5c3a';
  const size = () => {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); draw();
  };
  const axisR = 72, axisB = 22;
  const geom = () => {
    const n = Math.max(data.length, 24), step = (W - axisR - 8) / n;
    const hi = Math.max(...data.map(c => c[2])), lo = Math.min(...data.map(c => c[3]));
    const pad0 = (hi - lo || hi * .02) * .14, top = hi + pad0, bot = lo - pad0;
    const y = v => 10 + (top - v) / (top - bot) * (H - axisB - 20);
    const x = i => W - axisR - 8 - (data.length - 1 - i + .5) * step;
    return { step, y, x, top, bot };
  };
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!data.length) return;
    const g = geom();
    ctx.font = '500 11px "IBM Plex Mono",monospace'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const v = g.bot + (g.top - g.bot) * i / 4, y = g.y(v);
      ctx.strokeStyle = 'rgba(255,255,255,.055)'; ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W - axisR, y + .5); ctx.stroke();
      ctx.fillStyle = '#74747e'; ctx.textAlign = 'left'; ctx.fillText(price(v), W - axisR + 6, y);
    }
    const bw = Math.max(2, Math.min(g.step * .64, 16));
    data.forEach((c, i) => {
      const x = g.x(i), isUpC = c[4] >= c[1], col = isUpC ? up : dn;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.globalAlpha = hover === i || hover < 0 ? 1 : .55;
      ctx.beginPath(); ctx.moveTo(Math.round(x) + .5, g.y(c[2])); ctx.lineTo(Math.round(x) + .5, g.y(c[3])); ctx.stroke();
      const a = g.y(Math.max(c[1], c[4])), b = g.y(Math.min(c[1], c[4]));
      ctx.fillRect(x - bw / 2, a, bw, Math.max(1.5, b - a));
    });
    ctx.globalAlpha = 1;
    const every = Math.max(1, Math.ceil(data.length / Math.max(3, Math.floor(W / 130))));
    ctx.fillStyle = '#74747e'; ctx.textAlign = 'center';
    data.forEach((c, i) => { if ((data.length - 1 - i) % every === 0 && g.x(i) > 20) ctx.fillText(clock(c[0]), g.x(i), H - 9); });
    const last = data[data.length - 1], ly = g.y(last[4]), lc = last[4] >= last[1] ? up : dn;
    ctx.setLineDash([3, 4]); ctx.strokeStyle = lc; ctx.globalAlpha = .6;
    ctx.beginPath(); ctx.moveTo(0, ly + .5); ctx.lineTo(W - axisR, ly + .5); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
    ctx.fillStyle = lc; ctx.fillRect(W - axisR + 1, ly - 10, axisR - 1, 20);
    ctx.fillStyle = '#0a0a0d'; ctx.textAlign = 'left'; ctx.fillText(price(last[4]), W - axisR + 6, ly);
    if (hover >= 0 && data[hover]) {
      const x = g.x(hover);
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H - axisB); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  const readout = () => {
    const c = data[hover >= 0 ? hover : data.length - 1];
    if (c) onTick(c, data, hover >= 0);
  };
  const paint = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  const move = e => {
    const r = cv.getBoundingClientRect(), g = geom();
    const i = data.length - 1 - Math.round((W - axisR - 8 - (e.clientX - r.left)) / g.step - .5);
    hover = i >= 0 && i < data.length ? i : -1; readout(); paint();
  };
  cv.addEventListener('pointermove', move);
  const leave = () => { hover = -1; readout(); paint(); };
  cv.addEventListener('pointerleave', leave);
  const ro = new ResizeObserver(size); ro.observe(cv);
  let t = 0;
  const seed = data.length ? data[data.length - 1][4] : 0;
  const timer = !reduced && data.length ? setInterval(() => {
    const c = data[data.length - 1];
    const drift = (seed - c[4]) / seed * .06, chg = drift + (Math.random() - .5) * .006;
    const v = c[4] * (1 + chg);
    c[4] = v; c[2] = Math.max(c[2], v); c[3] = Math.min(c[3], v);
    if (++t % 14 === 0) { data.push([c[0] + 60, v, v, v, v]); if (data.length > 64) data.shift(); }
    readout(); paint();
    if (Math.random() < .5) onTick(c, data, hover >= 0, { side: chg >= 0 ? 'Buy' : 'Sell', px: v });
  }, 900) : 0;
  size(); readout();
  return { redraw: () => { draw(); readout(); }, stop() { clearInterval(timer); ro.disconnect(); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerleave', leave); } };
}

/* project */
const SOL_USD = 185, RATES = { SOL: SOL_USD, USDC: 1 };
function tradeHTML(p, state, amt) {
  if (p.pre) return `<div class="t-curve"><div class="eyebrow">Not live yet</div></div>
    <p class="t-note">No token exists for this project. The founder decides when it launches, and buying only opens then.</p>
    <button class="btn full ${reminds.has(p.ref) ? '' : 'primary'}" data-remind="${esc(p.ref)}">${I.bell}${reminds.has(p.ref) ? 'Reminder set' : 'Remind me at launch'}</button>`;
  if (state === 'loading') return `<div class="sk" style="height:42px"></div><div class="sk" style="height:44px"></div><div class="sk" style="height:52px"></div><div class="sk" style="height:34px"></div><div class="sk" style="height:84px"></div><button class="btn full lg" disabled>Reading pool state</button>`;
  if (state === 'error') return `<div class="t-err">${I.alert}<b>Could not reach the pool</b><span class="t-note">We will not show a price we cannot confirm. Your funds are not affected.</span><button class="btn sm" data-retry>Retry</button></div>`;
  const q = p.quote || 'SOL', rate = RATES[q], left = p.mig ? Infinity : Math.max(0, (1 - (p.prog || 0)) * 100);
  const a = parseFloat(amt) || 0, usdIn = rate ? a * rate : 0, got = rate && p.price ? usdIn / p.price * .985 : 0;
  const impact = rate ? Math.min(usdIn / Math.max(p.mc || 1, 1) * 100, 99) : 0;
  const tooBig = !p.mig && q === 'SOL' && a > left;
  const go = !wallet ? 'Connect to buy' : tooBig ? 'Too large for the curve' : a <= 0 ? 'Enter an amount' : 'Simulate buy';
  return `<div class="t-curve">
      <div class="l"><span>${p.mig ? 'Raydium pool' : 'Bonding curve'}</span><b>${p.mig ? 'Migrated' : pct(p).toFixed(1) + '%'}</b></div>
      <div class="bar ${p.mig ? 'done' : ''}" style="margin:0"><i style="width:${Math.max(pct(p), .6)}%"></i></div>
      ${p.mig ? '' : `<div class="l mono" style="font-size:11.5px"><span>${left.toFixed(1)} ${q} left</span><span>Target 100 ${q}</span></div>`}
    </div>
    <div class="seg" style="width:100%;display:grid;grid-template-columns:1fr 1fr"><button class="on">Buy</button><button data-sell>Sell</button></div>
    <label class="field"><span class="sr">Amount</span><input id="amt" inputmode="decimal" value="${esc(amt)}" autocomplete="off"><span>${esc(q)}</span></label>
    <div class="quick">${[.1, .5, 1, 5].map(v => `<button data-amt="${v}">${v}</button>`).join('')}</div>
    <div class="t-rows">
      <div>You get<b>${rate ? '≈ ' + compact(got) + ' ' + esc(p.ticker) : 'Quoted at signing'}</b></div>
      <div>Price impact<b>${rate ? impact.toFixed(2) + '%' : '-'}</b></div>
      <div>Fee (1.5%)<b>${(a * .015).toFixed(4)} ${esc(q)}</b></div>
    </div>
    ${tooBig ? `<p class="t-note" style="color:var(--down)">Only ${left.toFixed(1)} ${q} left on the curve. Lower the amount.</p>` : ''}
    <button class="btn full lg primary" data-buy ${wallet && (tooBig || a <= 0) ? 'disabled' : ''}>${go}</button>
    <p class="t-note">Preview quote. No wallet, no transaction.</p>`;
}
function renderProject(ref) {
  const p = ref === 'grablab' ? SAMPLE : byRef.get(ref);
  const v = $('#view');
  if (!p) {
    v.innerHTML = `<div class="wrap enter"><section class="panel block"><div class="empty"><b>Project not found</b><a class="btn sm" href="/" data-l>Back to Explore</a></div></section></div>`;
    return;
  }
  const pr = p.proof || {}, st = stageOf(p);
  const media = [['chart', 'Chart', !p.pre], ['sim', 'Simulation', pr.sim], ['d3', '3D View', pr.d3], ['pcb', 'PCB', pr.pcb], ['video', 'Video', pr.video]].filter(m => m[2]);
  const secs = [['overview', 'Overview'], ...(p.pre ? [] : [['trades', 'Trades'], ['holders', 'Holders']]), ['verify', 'Verify'], ['milestones', 'Milestones'], ['team', 'Team']];
  const q = new URLSearchParams(location.search);
  let mediaTab = media[0]?.[0], secTab = q.get('tab') && secs.some(s => s[0] === q.get('tab')) ? q.get('tab') : 'overview';
  let amt = '0.5', state = p.pre ? 'ready' : net === 'ok' ? 'ready' : 'loading', chart = null, rows = [], pxNow = p.price;

  v.innerHTML = `<div class="wrap enter">
    <div id="pbanner"></div>
    <div class="p-grid">
      <div class="p-main">
        <section class="panel p-head grainy">
          <div class="p-cover"><img src="${coverSrc(p)}" alt="" decoding="async"></div>
          <div class="p-id"><img class="p-logo" data-vt="${esc(p.ref)}" src="${logoSrc(p)}" alt="">
            <div class="p-title">
              <div class="line"><h1 class="display">${esc(p.name)}</h1><span class="stage ${st}">${stageTxt[st]}</span></div>
              ${p.desc ? `<p>${esc(p.desc)}</p>` : ''}
              <div class="p-meta">
                ${p.mint ? `<button class="ca" data-copy="${esc(p.mint)}">$${esc(p.ticker)} ${short(p.mint)} ${I.copy}</button>` : '<span class="ca">No token yet</span>'}
                <button class="ca star-inline" data-star-p="${esc(p.ref)}">${I.star}${watch.has(p.ref) ? 'Watching' : 'Watch'}</button>
                ${proofMinis(p)}${(p.tags || []).map(t => `<span class="mini">${esc(t)}</span>`).join('')}
              </div>
            </div></div>
        </section>
        ${p.pre ? '' : `<section class="panel kpis grainy">
          <div><div class="eyebrow">Market cap</div><div class="num">${usd(p.mc)}</div></div>
          <div><div class="eyebrow">Volume</div><div class="num">${usd(p.vol)}</div></div>
          <div><div class="eyebrow">Holders</div><div class="num">${int(p.holders)}</div></div>
          <div><div class="eyebrow">Trades</div><div class="num">${int(p.trades)}</div></div>
          <div><div class="eyebrow">Price</div><div class="num" id="kpx">${price(p.price)}</div></div>
        </section>`}
        ${media.length ? `<section class="panel grainy p-media" style="overflow:hidden"><div>
          ${media.length > 1 ? `<div class="tabs" id="mtabs">${media.map(m => `<button data-m="${m[0]}">${m[1]}</button>`).join('')}</div>` : ''}
          <div id="mpane"></div></div>
        </section>` : ''}
        <section class="panel grainy p-sec" style="overflow:hidden"><div>
          <div class="tabs" id="stabs">${secs.map(s => `<button data-s="${s[0]}">${s[1]}${s[0] === 'milestones' && p.milestones ? '<i class="dot"></i>' : ''}</button>`).join('')}</div>
          <div class="pane" id="spane"></div></div>
        </section>
      </div>
      <aside class="p-side"><section class="panel trade" id="trade"></section></aside>
    </div></div>`;

  const drawTrade = () => { $('#trade').innerHTML = tradeHTML(p, state, amt); };
  const banner = () => {
    $('#pbanner').innerHTML = state === 'error' ? `<div class="err-banner" style="margin-top:14px">${I.alert.replace('<svg', '<svg width="18" height="18"')}<span>Market data is unavailable right now. Numbers on this page are from the last snapshot.</span><button class="btn sm" data-retry>Retry</button></div>` : '';
  };
  const stamp = c => {
    const e = $('#stamp'); if (!e) return;
    e.textContent = `O ${price(c[1])}  H ${price(c[2])}  L ${price(c[3])}  C ${price(c[4])}  ${clock(c[0])} ${tz}`;
  };
  const tick = (c, data, hovering, trade) => {
    if (!hovering) { pxNow = data[data.length - 1][4]; const k = $('#kpx'); if (k) k.textContent = price(pxNow); }
    stamp(c);
    const asof = $('#asof'); if (asof) asof.textContent = 'Priced from the pool at ' + clock(Date.now() / 1000, true) + ' ' + tz;
    if (trade) {
      const sz = (Math.random() ** 2 * 1.8 + .04);
      rows.unshift({ t: Date.now() / 1000, side: trade.side, sz, px: trade.px });
      rows.length = Math.min(rows.length, 30);
      if (secTab === 'trades') drawSec(true);
    }
  };
  async function drawMedia() {
    $$('#mtabs [data-m]').forEach(b => b.classList.toggle('on', b.dataset.m === mediaTab));
    chart?.stop(); chart = null;
    const box = $('#mpane');
    if (mediaTab === 'chart') {
      box.innerHTML = `<div class="chart-wrap">
        <div class="chart-top"><span class="live"><i></i>Live</span><span id="stamp"></span>
          <div class="grow"><div class="seg sm"><button data-tz="UTC">UTC</button><button data-tz="Local">Local</button></div></div></div>
        <div id="chartbox"><div class="sk" style="height:340px"></div></div>
        <div class="chart-top" style="margin:10px 0 0"><span id="asof"></span><span class="mut2" style="margin-left:auto">Ticks simulated in this concept</span></div></div>`;
      syncTz();
      try {
        const data = await market(p.ref);
        if (!$('#chartbox') || mediaTab !== 'chart') return;
        state = 'ready'; drawTrade(); banner();
        if (!data.length) { $('#chartbox').innerHTML = `<div class="empty" style="height:300px;align-content:center"><b>No trades yet</b><span>The first buy opens the chart.</span></div>`; return; }
        $('#chartbox').innerHTML = '<canvas id="chart" role="img" aria-label="Price chart"></canvas>';
        chart = mountChart($('#chart'), data, p, tick);
      } catch {
        if (!$('#chartbox')) return;
        state = 'error'; drawTrade(); banner();
        $('#chartbox').innerHTML = `<div class="t-err" style="height:300px;align-content:center">${I.alert}<b>Chart unavailable</b><span class="t-note">The price feed did not answer.</span><button class="btn sm" data-retry>Retry</button></div>`;
      }
    } else if (mediaTab === 'sim') {
      box.innerHTML = `<div class="media-pane"><video src="/assets/art/gl-feed.mp4" autoplay muted loop playsinline></video><p class="media-note">Simulation proof. In production this is the live SimArena embed.</p></div>`;
    } else if (mediaTab === 'd3') {
      box.innerHTML = `<div class="media-pane"><img src="/assets/art/gl-threequarter.webp" alt="Grablab metal build, three quarter view"><p class="media-note">3D proof. In production this is the orbitable model.</p></div>`;
    }
  }
  const syncTz = () => $$('[data-tz]').forEach(b => b.classList.toggle('on', b.dataset.tz === tz));
  function drawSec(soft) {
    $$('#stabs [data-s]').forEach(b => b.classList.toggle('on', b.dataset.s === secTab));
    const box = $('#spane');
    if (secTab === 'overview') {
      const empties = ['Simulation', '3D View', 'PCB', 'Video'].filter((n, i) => !pr[['sim', 'd3', 'pcb', 'video'][i]]);
      box.innerHTML = `<p style="max-width:68ch">${esc(p.desc || 'The founder has not written a description yet.')}</p>
        ${p.links ? `<div class="p-meta" style="margin-top:14px">${p.links.map(l => `<a class="ca" href="${l[2]}" target="_blank" rel="noopener">${I[l[0]]}${esc(l[1])}</a>`).join('')}</div>` : ''}
        ${empties.length ? `<p class="t-note" style="margin-top:16px">Hidden because empty: ${empties.join(', ')}. The founder sees an Add proof button here.</p>` : ''}`;
    } else if (secTab === 'trades') {
      if (!rows.length) { box.innerHTML = `<p class="t-note">Waiting for the next trade.</p>`; return; }
      const q = esc(p.quote || 'SOL');
      box.innerHTML = `<p class="t-note" style="margin-bottom:10px">Sample stream that follows the chart.</p><div class="trades">${rows.map((r, i) => `<div class="${soft && i === 0 ? 'new' : ''}"><span class="mut">${clock(r.t, true)}</span><span class="${r.side === 'Buy' ? 'up' : 'down'}">${r.side}</span><span>${r.sz.toFixed(3)} ${q}</span><span>${price(r.px)}</span></div>`).join('')}</div>`;
    } else if (secTab === 'holders') {
      box.innerHTML = `<div class="pts"><span class="num">${int(p.holders)}</span><span class="mut">holders</span></div>
        <a class="btn sm" style="margin-top:14px" href="https://solscan.io/token/${esc(p.mint)}#holders" target="_blank" rel="noopener">${I.ext}Open holder list</a>`;
    } else if (secTab === 'verify') {
      const R = (t, s, url, todo) => `<div class="v-row"><div><b>${t}</b><span class="${todo ? 'todo' : ''}">${s}</span></div>${url ? `<a class="btn sm" href="${url}" target="_blank" rel="noopener">${I.ext}Verify</a>` : ''}</div>`;
      box.innerHTML = p.mint ? `<div class="verify">
        ${R('Token mint', esc(p.mint), 'https://solscan.io/token/' + encodeURIComponent(p.mint))}
        ${p.pool ? R(p.mig ? 'Raydium pool' : 'Curve pool', esc(p.pool), 'https://solscan.io/account/' + encodeURIComponent(p.pool)) : ''}
        ${p.mig ? R('Open on Raydium', 'Swap page for this mint', 'https://raydium.io/swap/?outputMint=' + encodeURIComponent(p.mint)) : ''}
        ${R('Independent chart', 'DexScreener', 'https://dexscreener.com/solana/' + encodeURIComponent(p.mint))}
        ${p.mig ? R('Migration transaction', 'Needs one API field: migration tx signature', '', 1) : ''}
        ${R('Fee escrow', 'Needs one API field: escrow address behind the Collected figure', '', 1)}
      </div>` : `<div class="empty"><b>Nothing on chain yet</b><span>This tab fills up at launch: mint, pool, migration, escrow.</span></div>`;
    } else if (secTab === 'milestones') {
      box.innerHTML = p.milestones ? `<div class="ms">${p.milestones.map(m => `<div class="ms-i ${m.s}"><span class="d">${m.s === 'done' ? I.check : m.s === 'now' ? I.clock : ''}</span><div><b>${esc(m.t)}</b><p>${esc(m.d)}</p></div>${m.proof ? `<span class="mini hw">${esc(m.proof)}</span>` : ''}</div>`).join('')}</div>`
        : `<div class="empty"><b>No milestones published</b><span>Milestones are how a founder shows the money turned into hardware. Each one carries a proof link.</span><a class="btn sm" href="/project/grablab?tab=milestones" data-l>See a full example</a></div>`;
    } else if (secTab === 'team') {
      box.innerHTML = p.founder ? `<div class="team"><span class="ava"><img src="${p.founder.img}" alt=""></span><div><b>${esc(p.founder.name)}</b><div class="mut" style="font-size:13px">${esc(p.founder.role)}</div></div></div>`
        : `<div class="team"><span class="ava">${I.dots.replace('<svg', '<svg width="20" height="20"')}</span><div><b>Founder not disclosed</b><div class="mut" style="font-size:13px">Projects with a named founder rank higher in Explore.</div></div></div>`;
    }
  }
  const root = $('#view').firstElementChild;
  root.addEventListener('click', e => {
    const m = e.target.closest('[data-m]'), s = e.target.closest('[data-s]'), t = e.target.closest('[data-tz]'), a = e.target.closest('[data-amt]');
    if (m) { mediaTab = m.dataset.m; drawMedia(); }
    if (s) { secTab = s.dataset.s; drawSec(); }
    if (t) { tz = t.dataset.tz; store.set('tz', tz); syncTz(); chart?.redraw(); if (secTab === 'trades') drawSec(); }
    if (a) { amt = a.dataset.amt; drawTrade(); }
    if (e.target.closest('[data-sell]')) toast('Sell mirrors Buy in this concept');
    const sp = e.target.closest('[data-star-p]');
    if (sp) { toggleWatch(p.ref); sp.innerHTML = I.star + (watch.has(p.ref) ? 'Watching' : 'Watch'); }
    if (e.target.closest('[data-buy]')) {
      if (!wallet) return connect();
      rows.unshift({ t: Date.now() / 1000, side: 'Buy', sz: parseFloat(amt) || 0, px: pxNow });
      if (secTab === 'trades') drawSec(true);
      toast('Simulated. Nothing was signed or sent.');
    }
  });
  root.addEventListener('input', e => {
    if (e.target.id !== 'amt') return;
    amt = e.target.value.replace(/[^0-9.]/g, '');
    const pos = e.target.selectionStart;
    drawTrade();
    const n = $('#amt'); n.focus(); n.setSelectionRange(pos, pos);
  });
  const onW = () => drawTrade();
  document.addEventListener('wallet', onW);
  onLeave(() => { chart?.stop(); document.removeEventListener('wallet', onW); });
  drawTrade(); banner(); drawSec(); if (media.length) drawMedia();
}

/* launch */
const LINK_RULES = [['github', /github\.com/i], ['x', /(^|\/\/|\.)(x|twitter)\.com/i], ['discord', /discord\.(gg|com)/i], ['telegram', /(t\.me|telegram\.)/i], ['youtube', /(youtube\.com|youtu\.be)/i], ['doc', /(docs\.|gitbook|notion\.)/i]];
const LINK_ICONS = ['globe', 'github', 'x', 'discord', 'telegram', 'doc'];
const detect = u => (LINK_RULES.find(r => r[1].test(u)) || ['globe'])[0];
function viewLaunch() {
  const saved = store.get('draft', {});
  const d = Object.assign({ name: '', pitch: '', brief: '', ticker: '', pair: 'SOL', links: [], sim: '', d3: '', pcb: '', video: '', founder: '', ignition: false }, saved);
  let logo = null, banner = null, done = false;
  let step = Math.min(4, Math.max(1, parseInt(new URLSearchParams(location.search).get('step')) || 1)), picked = 'globe';
  const STEPS = ['Project', 'Proof', 'Token', 'Review'];
  const $v = $('#view');
  $v.innerHTML = `<div class="wrap enter"><div class="l-grid">
    <section class="panel l-hero grainy"><img src="/assets/art/bench.webp" alt=""><div>
      <h1 class="display">Put your machine on chain</h1><p>No account needed to start. Four steps, and you sign in only to publish.</p></div></section>
    <section class="panel block grainy" style="margin:0"><div><div class="steps" id="steps"></div><div id="sbody"></div></div></section>
    <aside class="side-sticky">
      <div class="preview"><div class="eyebrow" style="margin-bottom:8px">Live preview</div><div id="pv"></div></div>
      <section class="panel block grainy" style="margin:0;padding:16px"><div class="check" id="chk"></div></section>
    </aside></div></div>`;
  const save = () => store.set('draft', d);
  const pvObj = () => ({ ref: 'draft', name: d.name || 'Your project', ticker: d.ticker || 'TICKER', tags: [], at: new Date(SNAP - 60000).toISOString(), mc: 4600, quote: d.pair, prog: 0, proof: { sim: d.sim, d3: d.d3, pcb: d.pcb }, spark: [], logo: false, cover: false });
  const drawPv = () => {
    const c = $('#pv');
    c.innerHTML = card(pvObj(), { preview: true });
    if (logo) $('.logo', c).src = logo;
    if (banner) $('.bg', c).src = banner;
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
    b.innerHTML = d.links.map((u, i) => `<div>${I[detect(u)]}<span>${esc(u)}</span><button class="copy-ca" data-rm="${i}" aria-label="Remove">${I.x}</button></div>`).join('');
  };
  const addLink = () => {
    const i = $('#lk'); let u = i.value.trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    d.links.push(u); i.value = ''; picked = 'globe'; save(); drawLinks(); syncPick(); drawPv();
  };
  const syncPick = () => {
    $$('[data-pick]').forEach(b => b.classList.toggle('on', b.dataset.pick === picked));
    const e = $('#lk-i'); if (e) e.innerHTML = I[picked];
  };
  function body() {
    $('#steps').innerHTML = STEPS.map((s, i) => `<button data-step="${i + 1}" class="${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}">${i + 1}. ${s}</button>`).join('');
    const b = $('#sbody');
    if (done) {
      b.innerHTML = `<div class="empty"><b>${esc(d.name || 'Project')} is live in this preview</b><span>Nothing was published. In production it would now appear in Explore.</span><a class="btn sm" href="/" data-l>Back to Explore</a></div>`;
      return;
    }
    if (step === 1) b.innerHTML = `<div class="form">
      <div class="f"><label for="f-name">Project name</label><input class="input" id="f-name" maxlength="40" value="${esc(d.name)}" placeholder="Sixth Sense Labs"></div>
      <div class="f"><label for="f-pitch">One line</label><input class="input" id="f-pitch" maxlength="90" value="${esc(d.pitch)}" placeholder="What the machine does, for whom"><small>Shown on cards. 90 characters.</small></div>
      <div class="f"><label for="f-brief">Brief</label><textarea class="ta" id="f-brief" placeholder="The problem, the machine, how far along you are, what the raise pays for.">${esc(d.brief)}</textarea><small>The brief is your project page. Four sentences are enough.</small></div>
      <div class="two"><label class="drop" id="d-logo"><input type="file" accept="image/*" data-up="logo"><b>Logo</b><span>Square, 512 px or more</span></label>
      <label class="drop" id="d-ban"><input type="file" accept="image/*" data-up="banner"><b>Banner</b><span>1500 x 500 px</span></label></div></div>`;
    if (step === 2) {
      b.innerHTML = `<div class="form">
      <div class="f"><span class="flabel">Links</span><div class="lk-icons">${LINK_ICONS.map(k => `<button data-pick="${k}" aria-label="${k}">${I[k]}</button>`).join('')}</div>
        <div class="lk-add"><span class="lk-i" id="lk-i">${I.globe}</span><input class="input" id="lk" placeholder="Paste a URL, the platform is detected"><button class="btn" id="lk-add" style="height:46px">Add</button></div>
        <div class="lk-list" id="lks"></div></div>
      <div class="f"><span class="flabel">Proof of work</span><small>Each filled proof adds a tab to your page and a badge to your card. Empty ones stay hidden.</small></div>
      <div class="two">
        <div class="f"><label for="f-sim">Simulation</label><input class="input" id="f-sim" value="${esc(d.sim)}" placeholder="SimArena scene link"></div>
        <div class="f"><label for="f-d3">3D model</label><input class="input" id="f-d3" value="${esc(d.d3)}" placeholder="GLB or viewer link"></div>
        <div class="f"><label for="f-pcb">PCB</label><input class="input" id="f-pcb" value="${esc(d.pcb)}" placeholder="Gerber or KiCad repo"></div>
        <div class="f"><label for="f-video">Video</label><input class="input" id="f-video" value="${esc(d.video)}" placeholder="The machine, running"></div>
      </div><div class="f"><label for="f-founder">Founder</label><input class="input" id="f-founder" value="${esc(d.founder)}" placeholder="Name or handle"><small>Projects with a named founder rank higher.</small></div></div>`;
      drawLinks(); syncPick();
    }
    if (step === 3) { b.innerHTML = `<div class="form">
      <div class="two"><div class="f"><label for="f-tick">Ticker</label><input class="input mono" id="f-tick" maxlength="10" value="${esc(d.ticker)}" placeholder="SENSE" autocapitalize="characters"><div class="hint" id="tick-h"></div></div>
      <div class="f"><label for="f-pair">Paired with</label><select class="input" id="f-pair">${['SOL', 'USDC', 'PEAQ', 'CODEC'].map(o => `<option ${d.pair === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div></div>
      <div class="f"><span class="flabel">Ignition</span><small>Optional and permanent. Lock supply in sell orders above the launch price, so the project funds itself as the market grows.</small>
        <div class="seg" style="justify-self:start"><button data-ign="0" class="${d.ignition ? '' : 'on'}">Off</button><button data-ign="1" class="${d.ignition ? 'on' : ''}">On</button></div></div>
      <div class="after-pub"><div class="eyebrow">After you publish</div><span><b>1.</b> Your page goes live with its proofs.</span><span><b>2.</b> You launch the token when you are ready.</span><span><b>3.</b> At 100 ${esc(d.pair)} on the curve it migrates to Raydium.</span></div></div>`; dupHint(); }
    if (step === 4) b.innerHTML = `<div class="form"><div class="flabel">Ready to publish</div>
      <div class="t-rows">
        <div>Project<b>${esc(d.name || '-')}</b></div><div>Ticker<b>${d.ticker ? '$' + esc(d.ticker) : '-'}</b></div>
        <div>Paired with<b>${esc(d.pair)}</b></div><div>Links<b>${d.links.length}</b></div>
        <div>Proofs<b>${[d.sim, d.d3, d.pcb, d.video].filter(Boolean).length} of 4</b></div><div>Ignition<b>${d.ignition ? 'On' : 'Off'}</b></div>
      </div><p class="t-note">Your draft is saved in this browser.</p></div>`;
    const a = document.createElement('div');
    a.className = 'f-actions';
    a.innerHTML = `<button class="btn" data-go="-1" ${step === 1 ? 'style="visibility:hidden"' : ''}>Back</button>` + (step < 4
      ? `<button class="btn primary" data-go="1">Continue</button>` : `<button class="btn primary" id="pub">${wallet ? 'Publish preview' : 'Sign in to publish'}</button>`);
    b.append(a);
    if (logo && $('#d-logo')) $('#d-logo').style.backgroundImage = `url(${logo})`;
    if (banner && $('#d-ban')) $('#d-ban').style.backgroundImage = `url(${banner})`;
  }
  const root = $v.firstElementChild;
  root.addEventListener('input', e => {
    const id = e.target.id, map = { 'f-name': 'name', 'f-pitch': 'pitch', 'f-brief': 'brief', 'f-sim': 'sim', 'f-d3': 'd3', 'f-pcb': 'pcb', 'f-video': 'video', 'f-founder': 'founder', 'f-pair': 'pair' };
    if (map[id]) { d[map[id]] = e.target.value; save(); drawPv(); }
    if (id === 'f-tick') { e.target.value = d.ticker = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); save(); dupHint(); drawPv(); }
    if (id === 'lk') { picked = detect(e.target.value); syncPick(); }
  });
  root.addEventListener('change', e => {
    const k = e.target.dataset.up; if (!k) return;
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { if (k === 'logo') logo = r.result; else banner = r.result; body(); drawPv(); };
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
    if (ig) { d.ignition = ig.dataset.ign === '1'; save(); body(); }
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
      <div class="eyebrow">Season one</div>
      <h1 class="display">Every trade is already counted</h1>
      <p class="mut">Points track your trading and holding from your wallet, on FOMO and PUMP too. Projects can add their own rewards on top.</p>
      ${wallet ? `<div class="pts"><span class="num">${int(me)}</span><span class="mut">points, rank #1,204</span></div>` : '<div><button class="btn primary" data-conn>Connect to see your points</button></div>'}
    </div><img src="/assets/art/medal.webp" alt="" decoding="async"></section>
    <div class="r-grid">
      <section class="panel block grainy"><div>
        <div class="head"><h2 class="display">How you earn</h2><span class="note">Sample numbers</span></div>
        <table><thead><tr><th>Action</th><th>Points</th></tr></thead><tbody>
          <tr><td>Trade on machine.fun<small>Any project, buy or sell</small></td><td>10 per $100</td></tr>
          <tr><td>Trade on FOMO or PUMP<small>Same wallet, counted automatically</small></td><td>5 per $100</td></tr>
          <tr><td>Hold a project<small>Counted daily on your balance</small></td><td>2 per $100 a day</td></tr>
          <tr><td>Back a bonding project<small>Buy before it migrates</small></td><td>x2 multiplier</td></tr>
          <tr><td>Project rewards<small>Set by each founder</small></td><td>Varies</td></tr>
        </tbody></table></div>
      </section>
      <section class="panel block grainy"><div>
        <div class="head"><h2 class="display">Leaderboard</h2><span class="note">Sample wallets</span></div>
        <table class="lb"><tbody>${list.map((r, i) => `<tr class="${r[0] === 'You' ? 'me' : ''}"><td>${r[0] === 'You' ? '1,204' : i + 1}</td><td class="mono">${esc(r[0])}</td><td>${int(r[1])}</td></tr>`).join('')}</tbody></table></div>
      </section>
    </div>
    <section class="panel block grainy"><div class="how">
      <div><b>What you get</b><p>Points decide your share when a season closes.</p></div>
      <div><b>When</b><p>Your counter updates after every trade. Seasons close on a date shown here.</p></div>
      <div><b>How to check</b><p>Every point links to the trade that earned it.</p></div>
    </div></section></div>`;
  };
  draw();
  const c = e => { if (e.target.closest('[data-conn]')) connect(); };
  v.addEventListener('click', c);
  document.addEventListener('wallet', draw);
  onLeave(() => { v.removeEventListener('click', c); document.removeEventListener('wallet', draw); });
}

/* changes */
function viewChanges() {
  const groups = ['Bugs', 'UX', 'Product'], labels = { Bugs: 'Bugs', UX: 'UX and design', Product: 'Product ideas' };
  let n = 0;
  $('#view').innerHTML = `<div class="wrap enter">
    <section class="panel ch-hero grainy"><img class="art" src="/assets/art/fly-macro.webp" alt=""><div class="eyebrow">By Grablab, for the machine.fun team</div>
      <h1 class="display">25 changes, all clickable</h1>
      <p>A working concept built on a public snapshot of your data from 1 Nov 2026. We use the product daily, this is how we would like it to feel. Everything runs without a wallet, and nothing is sent on chain.</p></section>
    ${groups.map(g => `<section class="panel block grainy"><div><div class="head"><h2 class="display">${labels[g]}</h2></div><div class="ch">
      ${CHANGES.filter(c => c.g === g).map(c => { n++; return `<details><summary><span class="n">${pad(n)}</span><b>${esc(c.t)}</b><a class="btn sm" href="${c.l}" data-l>See it</a></summary>
        <div class="body"><span>${esc(c.d)}</span>${c.img ? `<div><div class="eyebrow" style="margin-bottom:6px">Live site, 29 Oct</div><img src="/assets/before/${c.img}.webp" alt="Live site before" loading="lazy"></div>` : ''}</div></details>`; }).join('')}
    </div></div></section>`).join('')}</div>`;
}

/* router */
function saveY() {
  try { history.replaceState({ ...(history.state || {}), y: scrollY }, ''); } catch {}
}
function render() {
  cleanups.splice(0).forEach(f => f());
  $('.drawer')?.remove();
  const p = location.pathname;
  const m = p.match(/^\/project\/([^/]+)/);
  if (p === '/') viewHome();
  else if (m) renderProject(decodeURIComponent(m[1]));
  else if (p === '/launch') viewLaunch();
  else if (p === '/rewards') viewRewards();
  else if (p === '/changes') viewChanges();
  else { $('#view').innerHTML = `<div class="wrap enter"><section class="panel block"><div class="empty"><b>Nothing here</b><a class="btn sm" href="/" data-l>Back to Explore</a></div></section></div>`; }
  markNav();
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
}
let lastRef = null;
function go(url) {
  const u = new URL(url, location.href);
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
  if (e.pointerType !== 'mouse' || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.target.closest('button,input')) return;
  const a = e.target.closest('a[data-l]');
  if (!a) return;
  pressed = a; go(a.href);
});
document.addEventListener('click', e => {
  const t = e.target;
  const star = t.closest('[data-star]'), cp = t.closest('[data-copy]'), rem = t.closest('[data-remind]'), retry = t.closest('[data-retry]');
  if (star) { e.preventDefault(); e.stopPropagation(); toggleWatch(star.dataset.star); return; }
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
const prefetch = e => {
  const c = e.target.closest?.('[data-pre]');
  if (c && byRef.get(c.dataset.pre)?.mint) candles(c.dataset.pre);
};
document.addEventListener('pointerover', prefetch, { passive: true });
document.addEventListener('touchstart', prefetch, { passive: true });
document.addEventListener('keydown', e => {
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
  if (e.key === '/' && !typing) {
    const q = $('#q');
    if (q) { e.preventDefault(); q.focus(); q.getBoundingClientRect().top < 80 && scrollTo(0, scrollY - 100); }
    else if (location.pathname !== '/') { e.preventDefault(); go('/#explore'); requestAnimationFrame(() => $('#q')?.focus()); }
  }
  if (e.key === 'Escape' && typing) document.activeElement.blur();
});
addEventListener('popstate', () => route());
addEventListener('scroll', () => $('#top')?.classList.toggle('stuck', scrollY > 30), { passive: true });
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
