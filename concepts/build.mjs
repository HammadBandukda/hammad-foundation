// Builds the four 11 Years concept sketches (A–D) as standalone, layered SVGs
// and the comparison page that shows them.
//   node concepts/build.mjs
// Output: concepts/svg/*.svg (Figma / Illustrator ready) and concepts/index.html

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const C = {
  green: "#279C49",      // emblem green (10 Years mark)
  deep: "#0F6030",       // outline green
  navy: "#020D19",
  white: "#FFFFFF",
  goldHi: "#F6DE8F",
  gold: "#D2AB48",
  goldLo: "#A4802A",
  goldShade: "#7A5E1C",  // extrusion / ribbon tails
};

// ---------- shared defs (ids prefixed per file so pages can inline many) ----------
const defs = (p) => `
  <defs>
    <linearGradient id="${p}-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.goldHi}"/>
      <stop offset="0.45" stop-color="${C.gold}"/>
      <stop offset="1" stop-color="${C.goldLo}"/>
    </linearGradient>
    <linearGradient id="${p}-ribbon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.goldLo}"/>
      <stop offset="0.3" stop-color="${C.gold}"/>
      <stop offset="0.55" stop-color="${C.goldHi}"/>
      <stop offset="0.8" stop-color="${C.gold}"/>
      <stop offset="1" stop-color="${C.goldLo}"/>
    </linearGradient>
    <clipPath id="${p}-disc"><circle cx="100" cy="100" r="87"/></clipPath>
  </defs>`;

// ---------- the master emblem, redrawn in a 200×200 box ----------
function emblem(p, x, y, size) {
  const s = size / 200;
  const W = C.white, G = C.green;
  return `
  <g id="emblem" transform="translate(${x} ${y}) scale(${s})">
    <circle id="emblem-ring" cx="100" cy="100" r="99" fill="${G}"/>
    <circle cx="100" cy="100" r="91" fill="${W}"/>
    <g id="emblem-quadrants" clip-path="url(#${p}-disc)">
      <rect x="100" y="0" width="100" height="100" fill="${G}"/>
      <rect x="0" y="100" width="100" height="100" fill="${G}"/>
      <path d="M100 0V200M0 100H200" stroke="${W}" stroke-width="5"/>
    </g>
    <g id="icon-roti" transform="rotate(-14 58 64)" stroke="${G}" stroke-width="3.6" fill="${W}">
      <ellipse cx="58" cy="76" rx="31" ry="12"/>
      <ellipse cx="58" cy="68" rx="31" ry="12"/>
      <ellipse cx="58" cy="60" rx="31" ry="12"/>
      <g fill="${G}" stroke="none">
        <circle cx="44" cy="58" r="1.8"/><circle cx="54" cy="54" r="1.8"/><circle cx="66" cy="56" r="1.8"/>
        <circle cx="50" cy="63" r="1.8"/><circle cx="62" cy="63" r="1.8"/><circle cx="74" cy="61" r="1.8"/>
      </g>
    </g>
    <g id="icon-tools" stroke="${W}" stroke-linecap="round" fill="none">
      <path d="M124 40L146 62" stroke-width="5"/>
      <path d="M147 63L161 77" stroke-width="12"/>
      <path d="M126 82L150 54" stroke-width="7"/>
      <circle cx="157" cy="46" r="9.5" stroke-width="6"/>
      <path d="M157 46L168 35" stroke="${G}" stroke-width="7"/>
      <circle cx="124" cy="85" r="3" fill="${G}" stroke="none"/>
    </g>
    <g id="icon-tap" fill="${W}">
      <rect x="18" y="122" width="7" height="18" rx="1.5"/>
      <path d="M25 125H66Q82 125 82 141V150H70V142Q70 137 65 137H25Z"/>
      <rect x="48" y="112" width="6" height="14"/>
      <rect x="38" y="108" width="26" height="6" rx="3"/>
      <path d="M76 157C76 157 68 167 68 172A8 8 0 0 0 84 172C84 167 76 157 76 157Z"/>
    </g>
    <g id="icon-heart" fill="none" stroke="${G}" stroke-linejoin="round" stroke-linecap="round">
      <path d="M142 176C108 154 108 126 124 121C133 118 140 124 142 130C144 124 151 118 160 121C176 126 176 154 142 176Z" stroke-width="5"/>
      <path d="M114 146H130L135 136L141 160L147 128L152 146H170" stroke-width="3.6"/>
    </g>
  </g>`;
}

// ---------- the gold "1", modelled on the 10 Years numeral ----------
// unit box 50 × 100; flag at top-left. mirror flips the flag to the right.
const ONE = "M20 0H50V100H20V32L2 40V14Z";
function one(p, x, y, h, { mirror = false, id = "one", face = null } = {}) {
  const fill = face || `url(#${p}-gold)`, ext = face ? C.goldShade : C.goldShade, line = face ? C.white : C.deep;
  const s = h / 100;
  const m = mirror ? `translate(50 0) scale(-1 1)` : "";
  return `
  <g id="${id}" transform="translate(${x} ${y}) scale(${s})">
    <g transform="${m}">
      <path id="${id}-extrude" d="${ONE}" transform="translate(${mirror ? -4 : 4} 3)" fill="${ext}" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/>
      <path id="${id}-face" d="${ONE}" fill="${fill}" stroke="${line}" stroke-width="2.4" stroke-linejoin="round"/>
      ${face ? "" : `<path d="M23 6V96" stroke="${C.goldHi}" stroke-width="1.6" opacity="0.7"/>`}
    </g>
  </g>`;
}
const oneWidth = (h) => h * 0.5;

// ---------- the gold ribbon with "Years" ----------
function ribbon(p, cx, cy, w, { label = "Years", lead = "" } = {}) {
  const h = w * 0.13, sag = w * 0.07, L = cx - w / 2, R = cx + w / 2;
  const tail = w * 0.09;
  const fs = h * 0.9;
  const leadSvg = lead ? lead : "";
  return `
  <g id="ribbon">
    <path id="ribbon-tail-left" d="M${L + tail * 0.4} ${cy + h * 0.15}L${L - tail} ${cy + h * 0.3}L${L - tail * 0.45} ${cy + h * 0.8}L${L - tail} ${cy + h * 1.35}L${L + tail * 0.4} ${cy + h * 1.2}Z" fill="${C.goldShade}"/>
    <path id="ribbon-tail-right" d="M${R - tail * 0.4} ${cy + h * 0.15}L${R + tail} ${cy + h * 0.3}L${R + tail * 0.45} ${cy + h * 0.8}L${R + tail} ${cy + h * 1.35}L${R - tail * 0.4} ${cy + h * 1.2}Z" fill="${C.goldShade}"/>
    <path id="ribbon-band" d="M${L} ${cy}Q${cx} ${cy + sag * 2} ${R} ${cy}V${cy + h}Q${cx} ${cy + h + sag * 2} ${L} ${cy + h}Z" fill="url(#${p}-ribbon)" stroke="${C.goldShade}" stroke-width="1.2"/>
    ${leadSvg}
    <text id="ribbon-years" x="${cx + (lead ? w * 0.09 : 0)}" y="${cy + sag + h * 0.78}" text-anchor="middle" font-family="'Dancing Script', 'Brush Script MT', cursive" font-weight="700" font-size="${fs}" fill="${C.white}" stroke="${C.goldShade}" stroke-width="0.6" paint-order="stroke">${label}</text>
  </g>`;
}

function svg(p, w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">
  <title>${title}</title>${defs(p)}${body}
</svg>`;
}

// ---------- the four directions ----------
const concepts = [
  {
    key: "a",
    file: "A-two-pillars.svg",
    name: "Two Pillars",
    pitch: "Two gold 1s stand on either side of the emblem like a gateway, or two hands holding it up.",
    idea: "Hath mai hath: the foundation held between two hands.",
    reads: "Symmetric and calm, with the strongest sense of a crest.",
    risk: "With the emblem in the middle it can read as “101”. The 1s need to touch the emblem, not sit apart like digits.",
    build(p) {
      const W = 420, H = 312, eS = 190, ex = (W - eS) / 2, ey = 36;
      const h = 230, ow = oneWidth(h);
      return svg(p, W, H, `
  ${one(p, ex - ow + 30, 20, h, { id: "one-left" })}
  ${one(p, ex + eS - 30, 20, h, { mirror: true, id: "one-right" })}
  ${emblem(p, ex, ey, eS)}
  ${ribbon(p, W / 2, 228, 340)}`, "11 Years, direction A: Two Pillars");
    },
  },
  {
    key: "b",
    file: "B-rising-skyline.svg",
    name: "Rising Skyline",
    pitch: "The emblem sits in front and the two 1s rise behind it, side by side, like towers or a growth chart.",
    idea: "Upward growth toward “Transforming Pakistan by 2050”.",
    reads: "The 1s stay next to each other, so “11” reads first and the emblem never sits in a digit slot.",
    risk: "The emblem covers the lower half of the numerals, so the 1s must be tall enough to show their flags clearly at small sizes.",
    build(p) {
      const W = 420, H = 360, h = 250, ow = oneWidth(h), gap = 14;
      const x1 = W / 2 - ow - gap / 2 + 6, x2 = W / 2 + gap / 2 + 6;
      const eS = 196, ex = (W - eS) / 2, ey = 122;
      return svg(p, W, H, `
  ${one(p, x1, 16 + h * 0.08, h * 0.92, { id: "one-left" })}
  ${one(p, x2, 16, h, { id: "one-right" })}
  ${emblem(p, ex, ey, eS)}
  ${ribbon(p, W / 2, 268, 350)}`, "11 Years, direction B: Rising Skyline");
    },
  },
  {
    key: "c",
    file: "C-seal-on-the-step.svg",
    name: "Seal on the Step",
    pitch: "The second 1 is a step taller than the first, and the emblem sits on top of it as a seal.",
    idea: "One more step up from the 10 Years mark.",
    reads: "A clear “11” with a rising rhythm; the emblem works like the dot on an i and becomes the visual crown.",
    risk: "The smallest emblem of the four, so its icons blur first at favicon size.",
    build(p) {
      const W = 420, H = 372;
      const h1 = 150, h2 = 200, base = 322, ow2 = oneWidth(h2);
      const x1 = 118, x2 = x1 + oneWidth(h1) + 14;
      const eS = 136, ecx = x2 + ow2 * 0.55, ex = ecx - eS / 2, ey = base - h2 - eS * 0.82;
      return svg(p, W, H, `
  ${one(p, x1, base - h1, h1, { id: "one-left" })}
  ${one(p, x2, base - h2, h2, { id: "one-right" })}
  ${emblem(p, ex, ey, eS)}
  ${ribbon(p, W / 2 + 6, base - 46, 330)}`, "11 Years, direction C: Seal on the Step");
    },
  },
  {
    key: "d",
    file: "D-ribbon-wrap.svg",
    name: "Ribbon Wrap",
    pitch: "The emblem keeps its 10 Years position and size. A gold ring frames it, and the ribbon carries “11 Years”.",
    idea: "The closest sibling to the 10 Years mark, so the two read as a series.",
    reads: "The emblem is the hero again; the number lives on the ribbon, so it can never read as “110”.",
    risk: "The “11” is smaller than in A–C, so the number is less dominant from a distance.",
    build(p) {
      const W = 420, H = 340, eS = 206, ex = (W - eS) / 2, ey = 30, cx = W / 2, cy = ey + eS / 2;
      const rw = 380, rcy = 214;
      const nh = 46, nx = cx - rw * 0.215, ny = rcy + 13;
      const lead = `
    <g id="ribbon-11">
      ${one(p, nx, ny, nh, { id: "rib-one-a", face: C.deep })}
      ${one(p, nx + oneWidth(nh) + 3, ny + 1, nh, { id: "rib-one-b", face: C.deep })}
    </g>`;
      return svg(p, W, H, `
  <circle id="gold-ring" cx="${cx}" cy="${cy}" r="${eS / 2 + 13}" fill="url(#${p}-gold)" stroke="${C.deep}" stroke-width="2.5"/>
  ${emblem(p, ex, ey, eS)}
  ${ribbon(p, cx, rcy, rw, { lead })}`, "11 Years, direction D: Ribbon Wrap");
    },
  },
];

// ---------- write standalone SVGs ----------
mkdirSync(join(here, "svg"), { recursive: true });
for (const c of concepts) {
  writeFileSync(join(here, "svg", c.file), c.build(c.key) + "\n");
}

// ---------- page ----------
const ref = readFileSync(join(here, "..", "reference", "hf-10-years-logo.png")).toString("base64");
let n = 0;
const inst = (c) => c.build(`${c.key}${n++}`).replace(/ width="\d+" height="\d+"/, "");
const sizes = [
  { h: 70, label: "70 px header" },
  { h: 32, label: "32 px" },
  { h: 16, label: "16 px favicon" },
];

const conceptSection = (c, i) => `
  <section class="concept" id="dir-${c.key}" aria-labelledby="h-${c.key}">
    <header class="concept-head">
      <p class="tag">Direction ${c.key.toUpperCase()}</p>
      <h2 id="h-${c.key}">${c.name}</h2>
      <p class="pitch">${c.pitch}</p>
    </header>
    <div class="stages">
      <figure class="stage stage-light">${inst(c)}<figcaption>Colour, on white</figcaption></figure>
      <figure class="stage stage-navy">${inst(c)}<figcaption>On navy #020D19</figcaption></figure>
    </div>
    <div class="concept-foot">
      <dl class="notes">
        <div><dt>Story</dt><dd>${c.idea}</dd></div>
        <div><dt>How it reads</dt><dd>${c.reads}</dd></div>
        <div><dt>Watch out</dt><dd>${c.risk}</dd></div>
      </dl>
      <div class="sizes" aria-label="Size test">
        ${sizes.map((s) => `
        <figure class="size">
          <div class="size-pair">
            <span class="chip chip-light" style="height:${s.h}px">${inst(c)}</span>
            <span class="chip chip-navy" style="height:${s.h}px">${inst(c)}</span>
          </div>
          <figcaption>${s.label}</figcaption>
        </figure>`).join("")}
      </div>
    </div>
    <p class="file">concepts/svg/${c.file}</p>
  </section>`;

const html = `<title>HF 11 Years Concepts</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Onest:wght@400;500;700;800&display=swap">
<style>
/* Layout: a sketchbook sheet — brief strip, then one wide row per direction, then a 70 px line-up. */
:root {
  --bg: #F3F6F2;
  --sheet: #FFFFFF;
  --fg: #0D2117;
  --muted: #4F6357;
  --line: #D5DED7;
  --green: #0F6030;
  --gold: #9A7623;
  --navy: #020D19;
  --display: "Onest", "Segoe UI", system-ui, sans-serif;
  --body: "Onest", "Segoe UI", system-ui, sans-serif;
  --script: "Dancing Script", "Brush Script MT", cursive;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #08130D; --sheet: #0F1E16; --fg: #E4ECE6; --muted: #9DB0A3; --line: #22382B; --green: #5CC383; --gold: #E0C06A; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #08130D; --sheet: #0F1E16; --fg: #E4ECE6; --muted: #9DB0A3; --line: #22382B; --green: #5CC383; --gold: #E0C06A; color-scheme: dark }

* { box-sizing: border-box; }
body { background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 15px; line-height: 1.55; }
.wrap { max-width: 1120px; margin: 0 auto; padding-block: 40px 72px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: grid; gap: 40px; }
h1, h2 { font-family: var(--display); text-wrap: balance; margin: 0; }
h1 { font-size: clamp(30px, 5vw, 46px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; }
h1 em { font-family: var(--script); font-style: normal; font-weight: 700; color: var(--gold); font-size: 1.12em; }
h2 { font-size: 26px; font-weight: 800; letter-spacing: -0.01em; }
p { margin: 0; }
.tag { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); }

.intro { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 32px; align-items: center; }
.intro-text { display: grid; gap: 14px; max-width: 62ch; }
.intro-text .lede { font-size: 17px; color: var(--muted); }
.trap { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 16px; align-items: center;
  background: var(--sheet); border: 1px solid var(--line); border-radius: 10px; padding: 16px; }
.trap img { width: 120px; height: 120px; object-fit: contain; background: #fff; border-radius: 6px; }
.trap p { font-size: 14px; color: var(--muted); }
.trap strong { color: var(--fg); }
.rules { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 0; list-style: none; }
.rules li { font-size: 13px; border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; color: var(--muted); }

.concept { background: var(--sheet); border: 1px solid var(--line); border-radius: 14px; padding: 28px; display: grid; gap: 22px; }
.concept-head { display: grid; gap: 6px; max-width: 70ch; }
.pitch { color: var(--muted); }
.stages { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.stage { margin: 0; border-radius: 10px; padding: 18px 18px 10px; display: grid; gap: 6px; justify-items: center; }
.stage svg { width: 100%; max-width: 380px; height: auto; display: block; }
.stage figcaption { font-size: 12px; letter-spacing: 0.04em; }
.stage-light { background: #FFFFFF; border: 1px solid var(--line); color: #4F6357; }
.stage-navy { background: var(--navy); color: #9FB0C4; }
.concept-foot { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 28px; align-items: start; }
.notes { margin: 0; display: grid; gap: 12px; }
.notes div { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 12px; }
.notes dt { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); padding-top: 2px; }
.notes dd { margin: 0; }
.notes div:last-child dd { color: var(--gold); }
.sizes { display: flex; gap: 18px; align-items: flex-end; }
.size { margin: 0; display: grid; gap: 6px; justify-items: start; }
.size figcaption { font-size: 11px; color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.size-pair { display: flex; gap: 6px; align-items: flex-end; }
.chip { display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; padding: 3px; }
.chip svg { height: 100%; width: auto; display: block; }
.chip-light { background: #FFFFFF; border: 1px solid var(--line); }
.chip-navy { background: var(--navy); }
.file { font-size: 12px; color: var(--muted); font-family: ui-monospace, "SF Mono", Menlo, monospace; }

.lineup { display: grid; gap: 16px; }
.lineup-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.lineup-cell { margin: 0; background: var(--navy); border-radius: 10px; padding: 14px 10px 10px; display: grid; gap: 8px; justify-items: center; }
.lineup-cell svg, .lineup-cell img { height: 70px; width: auto; display: block; }
.lineup-cell figcaption { font-size: 12px; color: #9FB0C4; text-align: center; }
.next { color: var(--muted); max-width: 70ch; }
.next strong { color: var(--fg); }

@media (max-width: 820px) {
  .intro, .concept-foot { grid-template-columns: 1fr; }
  .lineup-row { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
}
@media (max-width: 560px) {
  .stages { grid-template-columns: 1fr; }
  .concept { padding: 18px; }
  .notes div { grid-template-columns: 1fr; gap: 2px; }
  .sizes { flex-wrap: wrap; }
  .trap { grid-template-columns: 1fr; }
}
</style>

<main class="wrap">
  <section class="intro">
    <div class="intro-text">
      <p class="tag">Hammad Foundation · logo competition · due before 20 Nov 2026</p>
      <h1>Four ways to say 11 <em>Years</em></h1>
      <p class="lede">First sketches for the anniversary mark that sits beside the existing logo. Each direction keeps the emblem, the gold numerals and the “Years” ribbon so it reads as the sequel to the 10 Years mark.</p>
      <ul class="rules">
        <li>Emblem unchanged</li><li>Gold and green palette</li><li>“Years” ribbon</li><li>Legible at 70 px</li>
      </ul>
    </div>
    <div class="trap">
      <img src="data:image/png;base64,${ref}" alt="The existing 10 Years mark: a gold 1 beside the quartered emblem, which acts as the 0.">
      <p><strong>The problem.</strong> In the 10 Years mark the round emblem stands in for the 0. “11” has no zero, and putting the emblem after “11” reads as “110”. Every direction below gives the emblem a new job.</p>
    </div>
  </section>

  ${concepts.map(conceptSection).join("\n")}

  <section class="lineup" aria-labelledby="h-lineup">
    <p class="tag">Side by side</p>
    <h2 id="h-lineup">At header height, next to the 10 Years mark</h2>
    <div class="lineup-row">
      <figure class="lineup-cell"><img src="data:image/png;base64,${ref}" alt="10 Years mark at 70 px"><figcaption>10 Years (current)</figcaption></figure>
      ${concepts.map((c) => `<figure class="lineup-cell">${inst(c)}<figcaption>${c.key.toUpperCase()} · ${c.name}</figcaption></figure>`).join("\n      ")}
    </div>
    <p class="next"><strong>Next:</strong> pick one or two directions. They go into section 03 of the Figma board, then get refined in section 04 (horizontal header lockup, single-colour and reversed versions, favicon crop).</p>
  </section>
</main>
`;
writeFileSync(join(here, "index.html"), html);
console.log("wrote", concepts.length, "svgs and index.html");
