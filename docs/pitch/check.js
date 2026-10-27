// Playwright self-check: screenshots of the 3D page and every deck slide into docs/pitch/_check/ (git-ignored).
// node docs/pitch/check.js [slides e.g. 1,7,11]   (needs the local server on 8099 and global playwright: NODE_PATH set by run)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, '_check'); fs.mkdirSync(OUT, { recursive: true });
const want = (process.argv[2] || '').split(',').filter(Boolean).map(Number);
(async () => {
  const b = await chromium.launch({ headless: false, channel: 'chrome', args: ['--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto('http://localhost:8099/docs/pitch/anatomy.html?tour=1'); await p.waitForTimeout(9000);
  await p.screenshot({ path: path.join(OUT, 'anatomy.png') }); console.log('anatomy ok');
  await p.goto('http://localhost:8099/docs/pitch/index.html#1'); await p.waitForTimeout(2500);
  const n = await p.evaluate(() => document.querySelectorAll('.slide').length);
  for (let i = 1; i <= n; i++){ if (want.length && !want.includes(i)) continue;
    await p.evaluate(k => { location.hash = '#' + k; }, i); await p.waitForTimeout(i === 7 ? 9000 : 1800);
    const over = await p.evaluate(() => { const s = document.querySelector('.slide.on'); const r = s.getBoundingClientRect(); let bad = []; s.querySelectorAll('*').forEach(e => { const q = e.getBoundingClientRect(); if (q.width && (q.bottom > innerHeight + 2 || q.right > innerWidth + 2)) bad.push(e.tagName + '.' + e.className); }); return bad.slice(0, 5); });
    await p.screenshot({ path: path.join(OUT, `s${String(i).padStart(2, '0')}.png`) }); console.log('slide', i, over.length ? 'OVERFLOW ' + over.join(' ') : 'ok'); }
  await b.close();
})();
