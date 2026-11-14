// Prints deck.html to PDF (16:9) and renders page thumbnails for checking.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'deck.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const out = path.join(__dirname, '..', 'HF-11-Years-Proposal-Hammad-Hanif-Bandukda.pdf');
  await p.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, pageRanges: '' });
  const thumbs = process.argv[2];
  if (thumbs) {
    fs.mkdirSync(thumbs, { recursive: true });
    const n = await p.evaluate(() => document.querySelectorAll('.page').length);
    for (let i = 0; i < n; i++) {
      const el = (await p.$$('.page'))[i];
      await el.screenshot({ path: path.join(thumbs, `p${String(i + 1).padStart(2, '0')}.png`) });
    }
  }
  await b.close();
  console.log('pdf', out, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB');
})();
