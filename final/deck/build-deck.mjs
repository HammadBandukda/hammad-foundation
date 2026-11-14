// Builds the submission deck (16:9, 1920×1080 pages) as HTML; export.cjs prints it to PDF.
//   node final/deck/build-deck.mjs && node final/deck/print.cjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FINAL = join(here, "..");
const ROOT = join(FINAL, "..");
const svgFile = (n) => readFileSync(join(FINAL, "svg", n), "utf8").replace(/<\?xml[^>]*>/, "");
// inline an SVG sized to a box (keeps aspect)
const S = (n, w, h, extra = "") => svgFile(n).replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" ${extra}`);
const img = (rel) => `../../${rel}`;
const C = { emblem: "#259D48", deep: "#0F6030", gold: "#C9A13B", navy: "#020D19", nav: "#03B441", lime: "#CCFF00", blue: "#1F5FBF" };

// emblem only (vector) for pillar crops
const emblemSvg = readFileSync(join(ROOT, "vector/hf-emblem.svg"), "utf8");
const emblemInner = emblemSvg.match(/<g id="emblem">([\s\S]*?)<\/g>\s*<\/svg>/)[1];
const quadrant = (qx, qy, size, id) => `<svg viewBox="${qx} ${qy} 1042 1042" width="${size}" height="${size}"><defs><clipPath id="${id}"><rect x="${qx}" y="${qy}" width="1042" height="1042"/></clipPath></defs><g clip-path="url(#${id})">${emblemInner}</g></svg>`;

const page = (body, { bg = "#fff", cls = "" } = {}) => `<section class="page ${cls}" style="background:${bg}">${body}</section>`;
const kicker = (t, c = C.deep) => `<p class="kicker" style="color:${c}">${t}</p>`;
const foot = (n, dark = false) => `<p class="foot" style="color:${dark ? "#CFE3D6" : "#6B7C70"}">Hammad Foundation · 11 Years · Proposal by Hammad Hanif Bandukda · ${String(n).padStart(2, "0")}</p>`;

// ---------- mockups (flat vector) ----------
const tshirt = (fill, markSvg, label) => `<figure class="mock"><svg viewBox="0 0 400 420" width="360" height="378">
  <path d="M120 20 L160 8 Q200 40 240 8 L280 20 L390 80 L350 160 L310 140 L310 410 L90 410 L90 140 L50 160 L10 80 Z" fill="${fill}" stroke="#0002" stroke-width="2"/>
  <path d="M160 8 Q200 40 240 8" fill="none" stroke="#0003" stroke-width="6"/></svg>
  <div class="mock-inset" style="left:205px;top:110px;width:70px;height:134px">${markSvg}</div><figcaption>${label}</figcaption></figure>`;
const vest = `<figure class="mock"><svg viewBox="0 0 400 420" width="360" height="378">
  <path d="M110 20 L170 20 Q200 70 230 20 L290 20 L330 120 L330 410 L70 410 L70 120 Z" fill="${C.lime}" stroke="#0003" stroke-width="2"/>
  <rect x="70" y="300" width="260" height="22" fill="#C9C9C9"/><rect x="70" y="340" width="260" height="22" fill="#C9C9C9"/>
  <path d="M170 20 Q200 70 230 20 L230 410 L170 410 Z" fill="#0001"/></svg>
  <div class="mock-inset" style="left:226px;top:110px;width:60px;height:115px">${S("HF11_stacked_green.svg", 60, 115)}</div>
  <p class="mock-text" style="left:86px;top:250px;color:${C.deep}">VOLUNTEER</p><figcaption>Hi-vis vest (lime) · one colour, deep green</figcaption></figure>`;

const pages = [];
// 01 cover
pages.push(page(`
  <div class="cover">
    <div class="cover-mark">${S("HF11_stacked_reversed.svg", 470, 900)}</div>
    <div class="cover-text">
      ${kicker("Logo design competition · 2027", "#F2D27A")}
      <h1 style="color:#fff">11 Years<br><span class="urdu" style="color:#F2D27A">۱۱ سال</span></h1>
      <p class="lede" style="color:#CFE3D6">An anniversary mark for Hammad Foundation that sits beside the logo people already know, and holds up the four promises it was built on.</p>
      <p class="by" style="color:#CFE3D6">Proposal by Hammad Hanif Bandukda<br>November 2026</p>
    </div>
  </div>${foot(1, true)}`, { bg: C.deep }));
// 02 brief
pages.push(page(`${kicker("The brief")}<h2>Mark eleven years. Keep the logo.</h2>
  <blockquote>“We are not changing our existing logo. We are simply looking to add something that reflects Hammad Foundation completing 11 years.”<cite>Media team, 3 November 2026</cite></blockquote>
  <div class="cols3">
    <div><h3>Keep</h3><p>The quartered emblem, exactly as it is: roti, tools, tap and heart.</p></div>
    <div><h3>Continue</h3><p>The anniversary series: green, gold and a “Years” device, as in 2025 and 2026.</p></div>
    <div><h3>Work everywhere</h3><p>Website, signboards, banners, billboards, T-shirts, hi-vis vests, campaigns and social posts.</p></div>
  </div>${foot(2)}`));
// 03 series
pages.push(page(`${kicker("Their own series")}<h2>Nine, ten… eleven</h2>
  <div class="series">
    <div class="series-item"><div class="num">9</div><p><b>2025 · Years of Change.</b> The emblem became the bowl of the 9.</p></div>
    <div class="series-item"><img src="${img("reference/hf-10-years-logo.png")}" style="height:300px"><p><b>2026 · Decade of Change.</b> The emblem became the 0.</p></div>
    <div class="series-item"><div class="num gold">11</div><p><b>2027.</b> Eleven has no round digit. Put the emblem beside “11” and it reads <b>“110”</b>.</p></div>
  </div>
  <p class="note">Vignelli's Abdi İbrahim 100 drew the 0 as the company's emblem: the anniversary becomes part of the brand instead of a number placed next to it. Eleven needs a new way to do the same.</p>${foot(3)}`));
// 04 idea
pages.push(page(`<div class="split">
  <div class="split-text">${kicker("The idea")}<h2>Eleven years hold up the emblem</h2>
    <p class="lede">The two 1s stand under the emblem and are carved by its own circle, so they cradle it. The number grows out of the emblem's geometry, and the emblem stays whole.</p>
    <ul class="ticks"><li>Reads as 11, never 110</li><li>The emblem is untouched</li><li>Gold numeral, as in the 10 Years mark</li><li>The “Years” ribbon continues the series</li></ul>
  </div>
  <div class="split-art">${S("HF11_stacked_fullcolour.svg", 470, 900)}</div></div>${foot(4)}`));
// 05 pillars
pages.push(page(`${kicker("What the emblem holds")}<h2>Four promises in one circle</h2>
  <div class="pillars">
    ${[["Food", "خوراک", "Roti Bank · Ramadan Bachat Camp", 0, 0], ["Skills", "ہنر", "Skill Valley · Rozgar Program", 1042, 0], ["Water", "پانی", "Water Plants · Water Dam", 0, 1042], ["Health", "صحت", "Medical Complex · medical camps", 1042, 1042]]
      .map(([n, u, p, qx, qy], i) => `<div class="pillar">${quadrant(qx, qy, 230, "q" + i)}<h3>${n} <span class="urdu-sm">${u}</span></h3><p>${p}</p></div>`).join("")}
  </div>
  <p class="note">Eleven years of these four promises is what the mark celebrates. The quadrants also work as programme icons (page 18).</p>${foot(5)}`));
// 06 mark
pages.push(page(`<div class="hero-mark">${S("HF11_stacked_fullcolour.svg", 500, 960)}</div>${foot(6)}`));
// 07 construction
pages.push(page(`<div class="split">
  <div class="split-text">${kicker("Construction")}<h2>Built from the emblem's geometry</h2>
  <ul class="specs">
    <li><b>D</b> = emblem diameter (the unit)</li>
    <li>The tops of the 1s follow a circle of <b>1.09 D</b>, concentric with the emblem: a constant gap of 0.045 D</li>
    <li>Each 1: stem 0.23 D wide with a flag; numeral height 1.24 D</li>
    <li>Gap between the 1s: 0.044 D</li>
    <li>Ribbon: 0.76 D × 0.15 D, notched ends; label Montserrat ExtraBold</li>
    <li>All type converted to outlines</li>
  </ul></div>
  <div class="split-art"><svg viewBox="-80 -80 1160 2150" width="500" height="926">
    <g opacity="0.35">${svgFile("HF11_stacked_fullcolour.svg").replace(/^[\s\S]*?<title>[^<]*<\/title>/, "").replace(/<\/svg>\s*$/, "")}</g>
    <circle cx="500" cy="500" r="500" fill="none" stroke="#C0392B" stroke-width="5" stroke-dasharray="18 12"/>
    <circle cx="500" cy="500" r="545" fill="none" stroke="${C.deep}" stroke-width="5" stroke-dasharray="18 12"/>
    <line x1="0" y1="500" x2="1000" y2="500" stroke="#C0392B" stroke-width="4"/>
    <text x="500" y="470" text-anchor="middle" font-size="60" fill="#C0392B" font-family="Montserrat">D</text>
    <text x="1060" y="1000" font-size="54" fill="${C.deep}" font-family="Montserrat">1.09 D</text>
    <line x1="-40" y1="1780" x2="1040" y2="1780" stroke="#888" stroke-width="3" stroke-dasharray="10 8"/>
  </svg></div></div>${foot(7)}`));
// 08 languages
pages.push(page(`${kicker("Two languages")}<h2>11 Years · <span class="urdu">۱۱ سال</span></h2>
  <p class="lede narrow">In Urdu, ۱ is a single vertical stroke, so plain stems read as ۱۱ and as 11 at once. The Urdu version drops the flags and carries سال on the ribbon.</p>
  <div class="row-center">${S("HF11_stacked_fullcolour.svg", 260, 500)}${S("HF11_stacked_urdu_fullcolour.svg", 260, 500)}<div style="width:40px"></div>${S("HF11_horizontal_urdu_fullcolour.svg", 760, 280)}</div>
  <p class="note">Urdu set in Noto Nastaliq Urdu (open licence). To be checked by a native reader before release.</p>${foot(8)}`));
// 09 colour
const sw = [["Deep green", C.deep, "15 96 48", "84 0 50 62", "PMS 7727 C*"], ["Emblem green", C.emblem, "37 157 72", "76 0 54 38", "PMS 355 C*"], ["Gold (flat)", C.gold, "201 161 59", "0 20 71 21", "PMS 7562 C*"], ["Navy", C.navy, "2 13 25", "92 48 0 90", "PMS Black 6 C*"], ["White", "#FFFFFF", "255 255 255", "0 0 0 0", "—"]];
pages.push(page(`${kicker("Colour")}<h2>Green and gold, flat</h2>
  <div class="swatches">${sw.map(([n, h, rgb, cmyk, pms]) => `<div class="sw"><div class="chip" style="background:${h}"></div><h3>${n}</h3><p>HEX ${h}<br>RGB ${rgb}<br>CMYK ${cmyk}<br>${pms}</p></div>`).join("")}</div>
  <p class="note">Flat gold for print, screen print and embroidery: no gradients needed. *Pantone values are nearest matches; confirm against a swatch book with the printer.</p>${foot(9)}`));
// 10 variations
const tile = (n, bg, w = 180, h = 345, cap = "") => `<figure class="tile" style="background:${bg}">${S(n, w, h)}<figcaption>${cap}</figcaption></figure>`;
pages.push(page(`${kicker("Variations")}<h2>One mark, every format</h2>
  <div class="tiles">
    ${tile("HF11_stacked_fullcolour.svg", "#fff", 170, 326, "Stacked · full colour")}
    ${tile("HF11_stacked_reversed.svg", C.navy, 170, 326, "Stacked · reversed")}
    ${tile("HF11_stacked_green.svg", "#fff", 170, 326, "One colour · green")}
    ${tile("HF11_stacked_black.svg", "#fff", 170, 326, "One colour · black")}
    ${tile("HF11_stacked_white.svg", C.deep, 170, 326, "One colour · white")}
    ${tile("HF11_icon_fullcolour.svg", "#fff", 170, 292, "Icon (no ribbon)")}
    ${tile("HF11_favicon_simplified.svg", "#fff", 150, 150, "Favicon · 16–48 px")}
  </div>
  <div class="row-center" style="margin-top:28px">${S("HF11_horizontal_fullcolour.svg", 900, 240)}</div>${foot(10)}`));
// 11 lockups
pages.push(page(`${kicker("Lockups")}<h2>Beside the master logo</h2>
  <div class="stack-gap">
    <div class="row-center">${S("HF11_lockup_with_master_logo.svg", 860, 500)}</div>
    <p class="note narrow">Master logo | gold divider | 11 Years mark. Divider = 0.024 D; gap either side = 0.2 D. The master logo shown is rebuilt from the emblem for this proposal: swap in the official vector file.</p>
  </div>${foot(11)}`));
// 12 rules
const misuse = (inner, cap) => `<figure class="mis"><div class="mis-art">${inner}</div><figcaption>✕ ${cap}</figcaption></figure>`;
pages.push(page(`${kicker("Usage")}<h2>Clear space, size, misuse</h2>
  <div class="rules">
    <div class="rule-col"><h3>Clear space</h3><div class="cs">${S("HF11_stacked_fullcolour.svg", 150, 288)}</div><p>Keep 0.25 D clear on every side (a quarter of the emblem's width).</p>
      <h3>Minimum size</h3><p>Stacked: 20 mm / 120 px tall<br>Icon: 12 mm / 64 px<br>Below 48 px: the simplified favicon<br>Embroidery: icon only, 25 mm+</p>
      <h3>Usage window</h3><p>1 January – 31 December 2027</p></div>
    <div class="mis-grid">
      ${misuse(S("HF11_stacked_fullcolour.svg", 120, 230, 'style="transform:scaleX(1.6)"'), "Stretch")}
      ${misuse(S("HF11_stacked_fullcolour.svg", 120, 230, 'style="filter:hue-rotate(160deg)"'), "Recolour")}
      ${misuse(S("HF11_stacked_fullcolour.svg", 120, 230, 'style="filter:drop-shadow(8px 8px 6px #0008)"'), "Add effects")}
      ${misuse(S("HF11_stacked_fullcolour.svg", 120, 230, 'style="transform:rotate(-14deg)"'), "Rotate")}
      ${misuse(`<div style="background:url(${img("reference/site/photos/Hero-image-8.jpg")}) center/cover;padding:6px">${S("HF11_stacked_green.svg", 110, 210)}</div>`, "Place on busy photos without a tile")}
      ${misuse(S("HF11_icon_fullcolour.svg", 120, 206) + `<p style="margin:0;font:700 12px Montserrat;color:#c00">emblem placed beside the 11 → “110”</p>`, "Move the emblem off the 11")}
    </div>
  </div>${foot(12)}`));
// 13 backgrounds
const bgs = [["#fff", "HF11_stacked_fullcolour.svg", "White"], ["#F8F8F8", "HF11_stacked_fullcolour.svg", "Light grey"], [C.nav, "HF11_stacked_reversed.svg", "Nav green"], [C.deep, "HF11_stacked_reversed.svg", "Deep green"], [C.navy, "HF11_stacked_reversed.svg", "Navy"], ["#111", "HF11_stacked_reversed.svg", "Black"], [C.lime, "HF11_stacked_green.svg", "Hi-vis lime"], [C.blue, "HF11_stacked_reversed.svg", "Royal blue"], [`url(${img("reference/site/photos/Hero-image-1.jpg")}) center/cover`, "HF11_stacked_reversed.svg", "Photo"]];
pages.push(page(`${kicker("Tested")}<h2>On every background it will meet</h2>
  <div class="bggrid">${bgs.map(([b, f, n]) => `<figure><div class="bgcell" style="background:${b}">${S(f, 120, 230)}</div><figcaption>${n}</figcaption></figure>`).join("")}</div>
  <p class="note">Full colour on light; reversed (white ribbon) on dark and photos; one-colour green on hi-vis lime.</p>${foot(13)}`));
// 14 digital
pages.push(page(`${kicker("Applications · digital")}<h2>Website and social</h2>
  <div class="digital">
    <div class="browser"><div class="bar"><span></span><span></span><span></span><div class="tab"><img src="../favicon/favicon-32.png" width="16" height="16"> Hammad Foundation</div></div>
      <div class="site-head" style="background:${C.nav}">${S("HF11_horizontal_reversed.svg", 300, 84)}<nav>About · Projects · HFSF · Campaigns · Donate</nav></div>
      <div class="site-body" style="background:url(${img("reference/site/photos/Hero-image-8.jpg")}) center/cover"></div></div>
    <div class="phones">
      <div class="post" style="background:${C.deep}">${S("HF11_stacked_reversed.svg", 150, 288)}<p>11 years of food, skills, water and health.<br><b>Hath mai hath.</b></p></div>
      <div class="avatars"><div class="avatar">${S("HF11_favicon_simplified.svg", 120, 120)}</div><div class="avatar white">${S("HF11_icon_fullcolour.svg", 90, 155)}</div><p>Profile pictures</p></div>
    </div>
  </div>${foot(14)}`));
// 15 apparel
pages.push(page(`${kicker("Applications · apparel")}<h2>What volunteers wear</h2>
  <div class="row-center gap40">
    ${tshirt("#FFFFFF", S("HF11_stacked_green.svg", 70, 134), "Volunteer T-shirt · one-colour screen print")}
    ${tshirt(C.deep, S("HF11_stacked_white.svg", 70, 134), "Dark T-shirt · white print")}
    ${vest}
    <figure class="mock"><div class="idcard"><div class="id-top" style="background:${C.deep}">${S("HF11_horizontal_reversed.svg", 240, 68)}</div><div class="id-photo"></div><p class="id-name">VOLUNTEER</p><p class="id-sub">Roti Bank · 2027</p></div><figcaption>Volunteer ID card</figcaption></figure>
  </div>${foot(15)}`));
// 16 signage & events
pages.push(page(`${kicker("Applications · signage & events")}<h2>Where the foundation shows up</h2>
  <div class="signs">
    <figure class="mock"><div class="signboard" style="background:${C.deep}">${S("HF11_horizontal_reversed.svg", 330, 92)}<div class="sb-title">SKILL VALLEY</div><div class="sb-sub">Free skill courses for youth · +92 331 1110871</div></div><figcaption>Project signboard</figcaption></figure>
    <figure class="mock"><div class="billboard"><div class="bb-face" style="background:linear-gradient(120deg, ${C.deep}, #0B4A25)">${S("HF11_stacked_reversed.svg", 170, 326)}<div><p class="bb-h">Eleven years.<br>Four promises.</p><p class="bb-s">Food · Skills · Water · Health</p></div></div><div class="bb-legs"></div></div><figcaption>Roadside billboard</figcaption></figure>
    <figure class="mock"><div class="bib"><div class="bib-top" style="background:${C.deep}">${S("HF11_horizontal_reversed.svg", 260, 72)}</div><div class="bib-num">1111</div><div class="bib-foot">PAKISTAN'S BIGGEST MARATHON · 2027</div></div><figcaption>Marathon race bib</figcaption></figure>
  </div>${foot(16)}`));
// 17 merch
pages.push(page(`${kicker("Applications · print & merch")}<h2>Small things people keep</h2>
  <div class="row-center gap40">
    <figure class="mock"><div class="stickers">
      <div class="st round" style="background:${C.deep}">${S("HF11_stacked_reversed.svg", 92, 176)}</div>
      <div class="st round" style="background:#fff">${S("HF11_stacked_urdu_fullcolour.svg", 92, 176)}</div>
      <div class="st sq">${S("HF11_favicon_simplified.svg", 130, 130)}</div>
      <div class="st round" style="background:${C.gold}">${S("HF11_stacked_white.svg", 92, 176)}</div>
    </div><figcaption>Sticker sheet</figcaption></figure>
    <figure class="mock"><svg viewBox="0 0 300 380" width="300" height="380"><path d="M90 70 Q90 10 150 10 Q210 10 210 70" fill="none" stroke="${C.deep}" stroke-width="12"/><rect x="30" y="70" width="240" height="300" rx="6" fill="#EDE6D3"/></svg><div class="mock-inset" style="left:90px;top:130px;width:120px;height:230px">${S("HF11_stacked_green.svg", 120, 230)}</div><figcaption>Canvas tote · one colour</figcaption></figure>
    <figure class="mock"><div class="cert"><div class="cert-in">${S("HF11_icon_fullcolour.svg", 80, 138)}<p class="c1">Certificate of Completion</p><p class="c2">Skill Valley · Class of 2027</p><div class="c3"></div></div></div><figcaption>Graduate certificate</figcaption></figure>
  </div>${foot(17)}`));
// 18 system thinking
pages.push(page(`${kicker("System thinking")}<h2>One emblem, every programme</h2>
  <p class="lede narrow">The four quadrants become pillar icons, and every programme sign follows one template, so the blue, green and white signboards of today become one family.</p>
  <div class="pillars small">
    ${[["Food", 0, 0, "Roti Bank"], ["Skills", 1042, 0, "Skill Valley"], ["Water", 0, 1042, "Water Plants"], ["Health", 1042, 1042, "Medical Complex"]].map(([n, qx, qy, prog], i) => `<div class="prog"><div class="prog-ic">${quadrant(qx, qy, 120, "p" + i)}</div><div><p class="prog-hf">HAMMAD FOUNDATION</p><p class="prog-name">${prog.toUpperCase()}</p></div></div>`).join("")}
  </div>
  <p class="note">The UN SDG wheel and Rotary's Areas of Focus work the same way: one circle, many causes.</p>${foot(18)}`));
// 19 files
pages.push(page(`<div class="split">
  <div class="split-text">${kicker("Files", "#F2D27A")}<h2 style="color:#fff">Everything in this submission</h2>
  <ul class="specs light">
    <li>Stacked, icon and horizontal marks, in full colour, reversed, green, black and white (SVG, outlined)</li>
    <li>Urdu versions: stacked and horizontal</li>
    <li>Lockup with the master logo</li>
    <li>PNG, transparent, @1x / @2x / @4x</li>
    <li>Favicon set: 16–512 px + ICO</li>
    <li>Colour specs: HEX · RGB · CMYK · Pantone</li>
  </ul>
  <p class="lede" style="color:#fff">Thank you.<br><span style="color:#F2D27A">Hath mai hath do, Hammad ka sath do.</span></p>
  <p class="by" style="color:#CFE3D6">Hammad Hanif Bandukda</p></div>
  <div class="split-art">${S("HF11_stacked_reversed.svg", 420, 805)}</div></div>${foot(19, true)}`, { bg: C.deep }));

const css = `
@font-face{font-family:Montserrat;src:url(../fonts/Montserrat-ExtraBold.ttf);font-weight:800}
@font-face{font-family:Montserrat;src:url(../fonts/Montserrat-Black.ttf);font-weight:900}
@font-face{font-family:Nastaliq;src:url(../fonts/NotoNastaliqUrdu-Bold.ttf);font-weight:700}
@page{size:1920px 1080px;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:Montserrat,'Segoe UI',sans-serif;color:${C.navy}}
.page{width:1920px;height:1080px;position:relative;overflow:hidden;padding:96px 120px;page-break-after:always;display:flex;flex-direction:column}
.kicker{font:800 22px Montserrat;letter-spacing:.14em;text-transform:uppercase;margin:0 0 12px}
h1{font:900 150px/1 Montserrat;margin:0 0 30px}
h2{font:900 68px/1.05 Montserrat;margin:0 0 30px;letter-spacing:-.01em}
h3{font:800 26px Montserrat;margin:0 0 8px}
p{font:500 24px/1.45 Montserrat;margin:0}
.lede{font:500 32px/1.4 Montserrat;max-width:900px;margin-bottom:28px}
.narrow{max-width:1200px}
.note{font:500 22px/1.45 Montserrat;color:#4F6357;margin-top:auto;max-width:1400px}
.by{font:500 24px/1.5 Montserrat;margin-top:40px}
.foot{position:absolute;left:120px;bottom:40px;font:500 16px Montserrat}
.urdu{font-family:Nastaliq;font-weight:700;font-size:.9em}
.urdu-sm{font-family:Nastaliq;font-size:22px;color:${C.deep};margin-left:8px}
.cover{display:flex;align-items:center;gap:110px;height:100%}
.cover-mark{flex:0 0 470px}
.split{display:flex;gap:100px;align-items:center;height:100%}
.split-text{flex:1}
.split-art{flex:0 0 auto;display:flex;align-items:center;justify-content:center}
blockquote{font:600 40px/1.35 Montserrat;margin:10px 0 60px;max-width:1400px;border-left:10px solid ${C.gold};padding-left:36px}
blockquote cite{display:block;font:500 22px Montserrat;color:#4F6357;margin-top:16px;font-style:normal}
.cols3{display:grid;grid-template-columns:repeat(3,1fr);gap:60px}
.series{display:grid;grid-template-columns:repeat(3,1fr);gap:60px;align-items:end;margin-top:20px}
.series-item{display:flex;flex-direction:column;gap:24px;align-items:flex-start}
.num{font:900 300px/1 Montserrat;color:${C.deep}}.num.gold{color:${C.gold}}
.ticks{padding:0;margin:0;list-style:none;display:grid;gap:14px}.ticks li{font:600 28px Montserrat;padding-left:44px;position:relative}.ticks li:before{content:"✓";position:absolute;left:0;color:${C.emblem}}
.pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:50px;margin-top:10px}
.pillar{display:flex;flex-direction:column;gap:12px}.pillar svg{border-radius:12px}
.hero-mark{display:flex;align-items:center;justify-content:center;height:100%}
.specs{padding-left:28px;display:grid;gap:12px}.specs li{font:500 26px/1.4 Montserrat}.specs.light li{color:#fff}
.row-center{display:flex;align-items:center;justify-content:center;gap:24px}.gap40{gap:48px;margin-top:20px}
.swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:36px}.chip{height:300px;border-radius:14px;border:1px solid #D5DED7;margin-bottom:18px}.sw p{font-size:20px}
.tiles{display:grid;grid-template-columns:repeat(7,1fr);gap:18px;align-items:stretch}
.tile{margin:0;border:1px solid #D5DED7;border-radius:12px;padding:16px 8px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:10px}
.tile figcaption{font:600 15px Montserrat;color:#4F6357;text-align:center;background:#fff;border-radius:6px;padding:2px 6px}
.stack-gap{display:flex;flex-direction:column;gap:40px;align-items:center}
.rules{display:grid;grid-template-columns:520px 1fr;gap:60px}.rule-col p{font-size:21px;margin-bottom:22px}
.cs{display:inline-block;padding:38px;outline:3px dashed ${C.gold};margin:6px 0 16px}
.mis-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.mis{margin:0;border:1px solid #D5DED7;border-radius:12px;padding:14px;display:flex;flex-direction:column;align-items:center;gap:10px}
.mis-art{height:240px;display:flex;align-items:center;justify-content:center;flex-direction:column;overflow:hidden}
.mis figcaption{font:700 18px Montserrat;color:#B03A2E;text-align:center}
.bggrid{display:grid;grid-template-columns:repeat(9,1fr);gap:16px}.bggrid figure{margin:0}.bgcell{height:320px;border-radius:12px;border:1px solid #D5DED7;display:flex;align-items:center;justify-content:center}
.bggrid figcaption{font:600 16px Montserrat;color:#4F6357;margin-top:8px;text-align:center}
.digital{display:grid;grid-template-columns:1.6fr 1fr;gap:50px}
.browser{border-radius:14px;overflow:hidden;box-shadow:0 18px 50px #0003;border:1px solid #ccc}
.bar{background:#E8EAE6;height:52px;display:flex;align-items:center;gap:10px;padding:0 18px}.bar span{width:14px;height:14px;border-radius:50%;background:#C9CDC6}
.tab{margin-left:20px;background:#fff;border-radius:10px 10px 0 0;padding:10px 18px;font:600 16px Montserrat;display:flex;gap:8px;align-items:center;align-self:flex-end}
.site-head{height:110px;display:flex;align-items:center;gap:40px;padding:0 30px}.site-head nav{font:700 18px Montserrat;color:#fff}
.site-body{height:430px}
.phones{display:flex;flex-direction:column;gap:30px}
.post{border-radius:18px;height:470px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px}.post p{color:#fff;font:600 24px/1.35 Montserrat;text-align:center}
.avatars{display:flex;align-items:center;gap:24px}.avatar{width:120px;height:120px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${C.deep}}.avatar.white{background:#fff;border:1px solid #ccc}
.mock{margin:0;position:relative;display:flex;flex-direction:column;align-items:center;gap:12px}.mock figcaption{font:600 18px Montserrat;color:#4F6357;text-align:center;max-width:360px}
.mock-inset{position:absolute;display:flex;align-items:center;justify-content:center}
.mock-text{position:absolute;font:900 34px Montserrat;margin:0}
.idcard{width:280px;height:410px;border-radius:16px;background:#fff;box-shadow:0 14px 40px #0003;overflow:hidden;display:flex;flex-direction:column;align-items:center}
.id-top{width:100%;height:110px;display:flex;align-items:center;justify-content:center}.id-photo{width:130px;height:150px;background:#DDE3DC;border-radius:10px;margin:26px 0 16px}
.id-name{font:900 30px Montserrat;color:${C.deep}}.id-sub{font:600 18px Montserrat;color:#4F6357}
.signs{display:grid;grid-template-columns:1fr 1.3fr 0.8fr;gap:50px;align-items:end}
.signboard{border-radius:10px;padding:30px;height:320px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 14px 40px #0003;width:100%}
.sb-title{font:900 64px Montserrat;color:#F2D27A}.sb-sub{font:600 18px Montserrat;color:#CFE3D6}
.billboard{display:flex;flex-direction:column;align-items:center;width:100%}.bb-face{width:100%;height:330px;border:12px solid #333;display:flex;align-items:center;gap:30px;padding:0 36px}
.bb-h{font:900 52px/1.05 Montserrat;color:#fff}.bb-s{font:700 22px Montserrat;color:#F2D27A;margin-top:12px}.bb-legs{width:60%;height:80px;border-left:18px solid #555;border-right:18px solid #555}
.bib{width:340px;height:300px;background:#fff;border-radius:12px;box-shadow:0 14px 40px #0003;overflow:hidden;display:flex;flex-direction:column;align-items:center}
.bib-top{width:100%;height:96px;display:flex;align-items:center;justify-content:center}.bib-num{font:900 120px/1.2 Montserrat;color:${C.navy}}.bib-foot{font:800 13px Montserrat;color:${C.deep};letter-spacing:.06em}
.stickers{width:420px;height:420px;background:#F1F1EE;border-radius:14px;display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:24px;box-shadow:0 14px 40px #0002}
.st{display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px #0002}.st.round{border-radius:50%}.st.sq{border-radius:28px;overflow:hidden;background:${C.deep}}
.cert{width:520px;height:370px;background:#FBF8EF;border:2px solid ${C.gold};padding:14px;box-shadow:0 14px 40px #0002}
.cert-in{border:1px solid ${C.gold};height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.c1{font:900 30px Montserrat;color:${C.deep}}.c2{font:600 18px Montserrat;color:#4F6357}.c3{width:180px;border-top:2px solid #999;margin-top:20px}
.pillars.small{grid-template-columns:repeat(2,1fr);gap:28px 60px;margin-top:10px}
.prog{display:flex;align-items:center;gap:24px;background:${C.deep};border-radius:14px;padding:18px 26px}
.prog-ic{background:#fff;border-radius:10px;padding:6px;display:flex}.prog-hf{font:800 18px Montserrat;color:#3FD06B;letter-spacing:.06em}.prog-name{font:900 40px Montserrat;color:#fff}
`;
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Hammad Foundation · 11 Years · Proposal</title><style>${css}</style></head><body>${pages.join("\n")}</body></html>`;
writeFileSync(join(here, "deck.html"), html);
console.log("pages", pages.length);
