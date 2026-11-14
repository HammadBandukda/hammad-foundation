// Export every final SVG to transparent PNG @1x/@2x/@4x, plus a square favicon set.
//   node final/export.cjs
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const dir = path.join(__dirname, 'svg'); const out = path.join(__dirname, 'png'); const fav = path.join(__dirname, 'favicon');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(fav, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const render = async (svgText, w, h, file) => {
    await p.setViewportSize({ width: Math.ceil(w), height: Math.ceil(h) });
    const s = svgText.replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`);
    await p.setContent(`<html><body style="margin:0;background:transparent">${s}</body></html>`);
    await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: Math.ceil(w), height: Math.ceil(h) } });
  };
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.svg'))) {
    const s = fs.readFileSync(path.join(dir, f), 'utf8');
    const [, , vw, vh] = s.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const base = 512 / vh; // @1x = 512 px tall
    for (const k of [1, 2, 4]) await render(s, vw * base * k, 512 * k, path.join(out, f.replace('.svg', `@${k}x.png`)));
  }
  // favicon: icon mark centred in a square
  const icon = fs.readFileSync(path.join(dir, 'HF11_icon_fullcolour.svg'), 'utf8').replace('viewBox="-40 -40 1080 1860"', 'viewBox="-390 -40 1860 1860"');
  const simple = fs.readFileSync(path.join(dir, 'HF11_favicon_simplified.svg'), 'utf8');
  for (const px of [16, 32]) await render(simple, px, px, path.join(fav, `favicon-${px}.png`));
  for (const px of [48, 180, 192, 512]) await render(simple, px, px, path.join(fav, `favicon-${px}.png`));
  await b.close();
  console.log('png', fs.readdirSync(out).length, 'favicon', fs.readdirSync(fav).length);
})();
