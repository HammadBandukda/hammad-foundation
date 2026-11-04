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
    <linearGradient id="${p}-line" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.green}"/>
      <stop offset="1" stop-color="${C.deep}"/>
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

// ---------- the "1" as a tree trunk: same flag-and-stem silhouette, grown organic ----------
// unit box 68 × 100. The flag is a side branch; the foot flares into roots.
const TRUNK = "M24 2H44C44 36 45 64 48 80C51 90 58 95 66 100H38C36 97 35 95 34 93C33 95 32 97 30 100H4C11 95 16 89 18 80C20 64 21 46 22 36C16 33 9 28 3 18L9 13C13 20 18 24 22 25Z";
function trunk(p, x, y, h, { id = "trunk" } = {}) {
  const s = h / 100;
  return `
  <g id="${id}" transform="translate(${x} ${y}) scale(${s})">
    <path id="${id}-extrude" d="${TRUNK}" transform="translate(3 2)" fill="${C.goldShade}" stroke="${C.deep}" stroke-width="2.2" stroke-linejoin="round"/>
    <path id="${id}-face" d="${TRUNK}" fill="url(#${p}-gold)" stroke="${C.deep}" stroke-width="2.2" stroke-linejoin="round"/>
    <g id="${id}-bark" fill="none" stroke="${C.goldShade}" stroke-width="1.3" stroke-linecap="round" opacity="0.8">
      <path d="M30 12C29 30 30 50 28 70"/>
      <path d="M38 30C37 46 39 62 41 78"/>
      <path d="M26 84C24 90 20 94 14 97"/>
      <path d="M42 86C46 91 51 94 56 97"/>
    </g>
  </g>`;
}
const trunkWidth = (h) => h * 0.68;


// ---------- a "1" as a cupped hand: forearm = stem, thumb = flag ----------
// drawn for the left side of an emblem centred at (cx, cy) with radius r; mirror for the right.
function hand(p, cx, cy, r, { mirror = false, id = "hand" } = {}) {
  const pt = (deg, rad) => { const t = (deg * Math.PI) / 180; return [cx + rad * Math.cos(t), cy + rad * Math.sin(t)].map((v) => v.toFixed(1)); };
  const ri = r + 2;
  const [ax, ay] = pt(202, ri), [bx, by] = pt(100, ri);
  const sR = cx - r * 0.36, sL = cx - r * 0.82, bottom = cy + r * 1.95;
  const d = `M${ax} ${ay}A${ri} ${ri} 0 0 0 ${bx} ${by}`
    + `C${cx - r * 0.12} ${cy + r * 1.08} ${sR} ${cy + r * 1.1} ${sR} ${cy + r * 1.18}`
    + `V${bottom}H${sL}V${cy + r * 1.22}`
    + `C${cx - r * 1.12} ${cy + r * 1.02} ${cx - r * 1.3} ${cy + r * 0.55} ${cx - r * 1.28} ${cy + r * 0.05}`
    + `C${cx - r * 1.27} ${cy - r * 0.3} ${cx - r * 1.2} ${cy - r * 0.55} ${cx - r * 1.08} ${cy - r * 0.68}`
    + `Q${cx - r * 0.98} ${cy - r * 0.76} ${ax} ${ay}Z`;
  const m = mirror ? `translate(${2 * cx} 0) scale(-1 1)` : "";
  const crease = `M${cx - r * 1.1} ${cy + r * 0.42}Q${cx - r * 0.95} ${cy + r * 0.62} ${cx - r * 0.72} ${cy + r * 0.86}M${cx - r * 1.02} ${cy - r * 0.2}Q${cx - r * 1.08} ${cy + r * 0.05} ${cx - r * 1.06} ${cy + r * 0.2}`;
  return `
  <g id="${id}" transform="${m}">
    <path id="${id}-extrude" d="${d}" transform="translate(4 3)" fill="${C.goldShade}" stroke="${C.deep}" stroke-width="2.6" stroke-linejoin="round"/>
    <path id="${id}-face" d="${d}" fill="url(#${p}-gold)" stroke="${C.deep}" stroke-width="2.6" stroke-linejoin="round"/>
    <path id="${id}-creases" d="${crease}" fill="none" stroke="${C.goldShade}" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
  </g>`;
}


// ---------- monoline grove: the outline's two ends turn inward and rise as the "11" ----------
// shape: "hex" (pointy-top hexagon) or "circle". The emblem crowns the top where both lines start.
function lineGrove(p, shape) {
  const cx = 210, cy = 182, R = 138, sw = 20, sx = 23, stemTop = 128;
  const xl = cx - sx, xr = cx + sx;
  let left, right, yTurn;
  if (shape === "hex") {
    const v = (deg) => { const t = (deg * Math.PI) / 180; return [cx + R * Math.cos(t), cy + R * Math.sin(t)]; };
    const [tx, ty] = v(-90), [ulx, uly] = v(210), [llx, lly] = v(150), [bx, by] = v(90);
    yTurn = lly + ((by - lly) * (xl - llx)) / (bx - llx);
    left = `M${tx} ${ty}L${ulx.toFixed(1)} ${uly}L${llx.toFixed(1)} ${lly}L${xl} ${yTurn.toFixed(1)}`;
  } else {
    const dy = Math.sqrt(R * R - sx * sx);
    yTurn = cy + dy;
    left = `M${cx} ${cy - R}A${R} ${R} 0 0 0 ${xl} ${yTurn.toFixed(1)}`;
  }
  const mirror = `transform="translate(${2 * cx} 0) scale(-1 1)"`;
  const stem = (x) => `M${x} ${yTurn.toFixed(1)}V${stemTop}`;
  const twig = (x0, y0, x1, y1, id) => `
    <g id="${id}">
      <path d="M${x0} ${y0}L${x1} ${y1}" stroke="url(#${p}-gold)" stroke-width="${sw * 0.6}" stroke-linecap="round"/>
      <circle cx="${x1}" cy="${y1}" r="${sw * 0.5}" fill="${C.green}"/>
    </g>`;
  return `
  <g id="grove-outline" fill="none" stroke="url(#${p}-line)" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">
    <path id="outline-left" d="${left}"/>
    <path id="outline-right" d="${left}" ${mirror}/>
  </g>
  <g id="grove-twigs">
    ${twig(xl, 236, xl - 40, 210, "twig-left-low")}
    ${twig(xl, 178, xl - 32, 156, "twig-left-high")}
    ${twig(xr, 206, xr + 40, 180, "twig-right-low")}
    ${twig(xr, 262, xr + 30, 242, "twig-right-base")}
  </g>
  <linearGradient id="${p}-stem" gradientUnits="userSpaceOnUse" x1="${xl - 12}" y1="0" x2="${xr + 12}" y2="0">
    <stop offset="0" stop-color="${C.goldHi}"/><stop offset="0.5" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldLo}"/>
  </linearGradient>
  <g id="grove-11" fill="none" stroke="url(#${p}-stem)" stroke-width="${sw}" stroke-linecap="round">
    <path id="stem-left" d="${stem(xl)}"/>
    <path id="stem-right" d="${stem(xr)}"/>
  </g>
  ${emblem(p, cx - 54, cy - R - 26, 108)}
  ${ribbon(p, cx, 352, 330)}`;
}


// ---------- doorway: two 1-shaped openings cut into a deep-green tile, light beyond ----------
// door shapes in a 100-tall unit box: stem = [left, right] at the floor, w = unit width
const DOORS = {
  latin: { d: ONE, w: 50, stem: [20, 50] },
  // Urdu ۱: a pen stroke, broad and slightly hooked at the top, tapering toward the floor
  urdu: { d: "M9 2C17 0 30 0 38 3L36 10C32 40 27 72 24 100H10C12 72 14 42 16 15C11 13 6 10 4 7C3 5 5 3 9 2Z", w: 40, stem: [10, 24] },
  // mehrab: a tall pointed Mughal arch
  mehrab: { d: "M0 100V38C0 24 6 18 12 14C15 11 17 6 17 0C17 6 19 11 22 14C28 18 34 24 34 38V100Z", w: 34, stem: [0, 34] },
};
function doorway(p, { detail = true, shape = "latin", label = "Years" } = {}) {
  const W = 420, cx = 210, tx = 60, ty = 60, tw = 300, th = 300, tr = 44;
  const D = DOORS[shape];
  const dh = 186, s = dh / 100, dy = 118;
  const gap = shape === "latin" ? 100 * s * 0.53 : D.w * s + 26;
  const x1 = shape === "latin" ? cx - (gap + 50 * s) / 2 - 3.8 * s / 2 : cx - (gap + D.w * s) / 2, x2 = x1 + gap;
  const door = (x) => `<path d="${D.d}" transform="translate(${x.toFixed(1)} ${dy}) scale(${s})"/>`;
  const bottom = dy + dh;
  const stem = (x) => [x + D.stem[0] * s, x + D.stem[1] * s];
  const flare = shape === "latin" ? 26 : 12;
  const spill = (x) => { const [a, b] = stem(x); return `<path d="M${a} ${bottom}H${b}L${b + flare} ${ty + th}H${a - flare}Z" fill="url(#${p}-spill)"/>`; };
  const tower = (x, w, h) => `<rect x="${x}" y="${bottom - h}" width="${w}" height="${h}"/>`;
  const skyline = detail ? `
    <g id="skyline" fill="${C.green}" opacity="0.55">
      ${tower(x1 + 20 * s, 9, 34)}${tower(x1 + 20 * s + 11, 7, 52)}${tower(x1 + 20 * s + 20, 10, 26)}${tower(x1 + 20 * s + 32, 8, 62)}${tower(x1 + 20 * s + 42, 12, 38)}
      ${tower(x2 + 20 * s, 10, 44)}${tower(x2 + 20 * s + 12, 8, 70)}${tower(x2 + 20 * s + 22, 11, 30)}${tower(x2 + 20 * s + 35, 7, 56)}${tower(x2 + 20 * s + 44, 12, 24)}
      <path d="M${x2 + 20 * s + 2} ${bottom - 44}a9 9 0 0 1 18 0Z"/>
    </g>` : "";
  const person = (x) => `<g fill="${C.navy}"><circle cx="${x}" cy="${bottom + 9}" r="3.6"/><rect x="${x - 3.6}" y="${bottom + 13.5}" width="7.2" height="15" rx="3"/></g>`;
  const people = detail ? `<g id="figures">${person((stem(x1)[0] + stem(x1)[1]) / 2)}${person((stem(x2)[0] + stem(x2)[1]) / 2)}</g>` : "";
  return `
  <defs>
    <linearGradient id="${p}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11693A"/><stop offset="1" stop-color="#0A4524"/></linearGradient>
    <linearGradient id="${p}-sky" gradientUnits="userSpaceOnUse" x1="0" y1="${dy}" x2="0" y2="${bottom}">
      <stop offset="0" stop-color="${detail ? "#E7F2EC" : C.goldHi}"/><stop offset="0.6" stop-color="${detail ? "#FBF1D0" : C.gold}"/><stop offset="1" stop-color="${detail ? C.goldHi : C.goldLo}"/>
    </linearGradient>
    <linearGradient id="${p}-spill" gradientUnits="userSpaceOnUse" x1="0" y1="${bottom}" x2="0" y2="${ty + th}"><stop offset="0" stop-color="${C.goldHi}" stop-opacity="0.85"/><stop offset="1" stop-color="${C.goldHi}" stop-opacity="0"/></linearGradient>
    <clipPath id="${p}-doors">${door(x1)}${door(x2)}</clipPath>
    <clipPath id="${p}-tile"><rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="${tr}"/></clipPath>
  </defs>
  <rect id="wall" x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="${tr}" fill="url(#${p}-wall)"/>
  <g id="light-spill" clip-path="url(#${p}-tile)">${spill(x1)}${spill(x2)}</g>
  <g id="doorways-11" clip-path="url(#${p}-doors)">
    <rect x="${tx}" y="${dy}" width="${tw}" height="${dh}" fill="url(#${p}-sky)"/>
    ${skyline}
  </g>
  ${people}
  ${emblem(p, cx - 50, 8, 100)}
  ${ribbon(p, cx, 344, 330, { label, urdu: label !== "Years" })}`;
}

// almond leaf with a midrib; angle in degrees, 0 points right
function leaf(x, y, len, angle, color) {
  const w = len * 0.36;
  return `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 0C${len * 0.3} ${-w} ${len * 0.75} ${-w} ${len} 0C${len * 0.75} ${w} ${len * 0.3} ${w} 0 0Z" fill="${color}" stroke="${C.deep}" stroke-width="1.2"/><path d="M${len * 0.08} 0H${len * 0.85}" stroke="${C.white}" stroke-width="1.2" opacity="0.7"/></g>`;
}

// ---------- the gold ribbon with "Years" ----------
function ribbon(p, cx, cy, w, { label = "Years", lead = "", urdu = false } = {}) {
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
    <text id="ribbon-years" x="${cx + (lead ? w * 0.09 : 0)}" y="${cy + sag + h * (urdu ? 0.6 : 0.78)}" text-anchor="middle" ${urdu ? `direction="rtl" font-family="'Noto Nastaliq Urdu', serif" font-weight="700" font-size="${fs * 0.72}"` : `font-family="'Dancing Script', 'Brush Script MT', cursive" font-weight="700" font-size="${fs}"`} fill="${C.white}" stroke="${C.goldShade}" stroke-width="0.6" paint-order="stroke">${label}</text>
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
  {
    key: "e1",
    file: "E1-tree-canopy.svg",
    name: "Twin Trees · Canopy",
    pitch: "The two 1s become tree trunks. Their roots link at the base, and the emblem is the canopy they hold up together.",
    idea: "Planted together, growing together: hath mai hath in the roots, and the Green Initiatives and plantation drives in the trees.",
    reads: "A single tree shape at a glance. The two trunks and their side branches still carry the “11” underneath the crown.",
    risk: "The emblem covers the tops of the 1s, so “11” is the second read. Test it at 32 px before going further.",
    build(p) {
      const W = 420, H = 372, h = 190, base = 312, tw = trunkWidth(h);
      const x1 = W / 2 - tw + 8, x2 = W / 2 - 8;
      const eS = 176, ex = (W - eS) / 2, ey = 40;
      return svg(p, W, H, `
  <g id="leaves-back">
    ${[200, 228, 256, 284, 312, 340, 8, 36, 150, 172].map((d, i) => {
      const r = eS / 2 - 6, cx = ex + eS / 2, cy = ey + eS / 2, t = (d * Math.PI) / 180;
      return leaf(cx + r * Math.cos(t), cy + r * Math.sin(t), i % 2 ? 40 : 48, d, i % 3 ? C.green : C.deep);
    }).join("\n    ")}
  </g>
  ${trunk(p, x1, base - h, h, { id: "trunk-left" })}
  ${trunk(p, x2, base - h, h, { id: "trunk-right" })}
  ${emblem(p, ex, ey, eS)}
  ${ribbon(p, W / 2, base - 6, 330)}`, "11 Years, direction E1: Twin Trees, Canopy");
    },
  },
  {
    key: "e2",
    file: "E2-tree-grove.svg",
    name: "Twin Trees · Grove",
    pitch: "Two tall trunk-shaped 1s rise behind the emblem, each sprouting fresh leaves from its top, like Rising Skyline grown from the ground.",
    idea: "Growth you plant now and shade later: “Transforming Pakistan by 2050”, one year at a time.",
    reads: "“11” reads first, because both trunks stand clear above the emblem. The leaves make it a tree instead of a tower.",
    risk: "Leaves and bark add detail, so the small sizes need a simplified version with fewer leaves.",
    build(p) {
      const W = 420, H = 384, h = 250, tw = trunkWidth(h), gap = 8;
      const x1 = W / 2 - tw - gap / 2 + 10, x2 = W / 2 + gap / 2 - 4;
      const top1 = 62 + h * 0.08, top2 = 62;
      const eS = 190, ex = (W - eS) / 2, ey = 148;
      const lx1 = x1 + tw * 0.55, lx2 = x2 + tw * 0.55;
      return svg(p, W, H, `
  <g id="leaves-left">
    ${leaf(lx1 - 6, top1 + 6, 56, -150, C.green)}
    ${leaf(lx1 - 2, top1 + 2, 58, -110, C.deep)}
    ${leaf(lx1 + 2, top1 + 2, 54, -72, C.green)}
    ${leaf(lx1 + 6, top1 + 8, 44, -30, C.deep)}
  </g>
  <g id="leaves-right">
    ${leaf(lx2 - 6, top2 + 6, 60, -148, C.deep)}
    ${leaf(lx2 - 2, top2 + 2, 64, -108, C.green)}
    ${leaf(lx2 + 2, top2 + 2, 58, -70, C.deep)}
    ${leaf(lx2 + 8, top2 + 8, 48, -28, C.green)}
  </g>
  ${trunk(p, x1, top1, h * 0.92, { id: "trunk-left" })}
  ${trunk(p, x2, top2, h, { id: "trunk-right" })}
  ${emblem(p, ex, ey, eS)}
  ${ribbon(p, W / 2, 296, 350)}`, "11 Years, direction E2: Twin Trees, Grove");
    },
  },
  {
    key: "f",
    file: "F-two-hands.svg",
    name: "Two Hands",
    pitch: "Each 1 becomes a hand and forearm. The two hands cup the emblem from below and lift it up like a globe.",
    idea: "The foundation held up by its people: hath mai hath do, Hammad ka sath do. The emblem’s four quadrants become the world they carry.",
    reads: "Reads as care and support first. The two upright forearms carry the “11”, and the thumbs echo the flag of each 1.",
    risk: "“11” is the subtlest of all the directions. It may need “11” on the ribbon (as in D) to be read as a number.",
    build(p) {
      const W = 420, H = 372, r = 90, cx = W / 2, cy = 128;
      return svg(p, W, H, `
  ${hand(p, cx, cy, r, { id: "hand-left" })}
  ${hand(p, cx, cy, r, { mirror: true, id: "hand-right" })}
  ${emblem(p, cx - r, cy - r, r * 2)}
  ${ribbon(p, cx, 272, 350)}`, "11 Years, direction F: Two Hands");
    },
  },
  {
    key: "g1",
    file: "G1-line-grove-hexagon.svg",
    name: "Line Grove · Hexagon",
    pitch: "One line on each side traces a hexagon from the emblem down to the base, then turns inward and rises as a stem. The two stems are the “11”, with twigs branching off them.",
    idea: "Everything flows out from the foundation and grows back toward it. The year-11 growth comes from the ground the foundation has built.",
    reads: "The two gold stems sit side by side in the centre, so “11” reads clearly. The twigs turn them into saplings.",
    risk: "The hexagon is a new shape in the brand, so it sits a little apart from the round emblem.",
    build(p) {
      return svg(p, 420, 432, lineGrove(p, "hex"), "11 Years, direction G1: Line Grove, Hexagon");
    },
  },
  {
    key: "g2",
    file: "G2-line-grove-circle.svg",
    name: "Line Grove · Circle",
    pitch: "The same continuous line, traced as a circle that echoes the emblem’s round shape before turning inward as the “11”.",
    idea: "Everything flows out from the foundation and grows back toward it, and the circle ties the mark to the emblem and to the 10 Years silhouette.",
    reads: "Feels like a sibling of the emblem, as if the emblem’s ring has unwound into two growing stems.",
    risk: "A big ring around a small emblem can look like a second, larger emblem, so the line weight needs care.",
    build(p) {
      return svg(p, 420, 432, lineGrove(p, "circle"), "11 Years, direction G2: Line Grove, Circle");
    },
  },
  {
    key: "h1",
    file: "H1-doorway-skyline.svg",
    name: "Doorway · Skyline",
    pitch: "Two door-shaped 1s are cut into a deep-green tile, like the master logo’s square. Through them you see the sky and a city, with light spilling out onto two small figures.",
    idea: "Eleven years open the door to what comes next: the way through to “Transforming Pakistan by 2050”, walked by real people.",
    reads: "The openings are the numerals, so “11” reads as light against the dark wall. No font is needed.",
    risk: "The skyline and figures disappear below about 40 px, so H2 is the version for favicons and small use.",
    build(p) {
      return svg(p, 420, 420, doorway(p, { detail: true }), "11 Years, direction H1: Doorway, Skyline");
    },
  },
  {
    key: "h2",
    file: "H2-doorway-light.svg",
    name: "Doorway · Light",
    pitch: "The same two doorways, with nothing but gold light coming through. The bold, minimal version.",
    idea: "As H1, cut down to the essentials: dark wall, two bright 1s and the emblem on top.",
    reads: "The strongest “11” at small sizes, since two solid gold shapes on dark green survive even at 16 px.",
    risk: "With the scene removed it relies on the light alone, so the gold gradient must stay warm and clean when printed.",
    build(p) {
      return svg(p, 420, 420, doorway(p, { detail: false }), "11 Years, direction H2: Doorway, Light");
    },
  },
  {
    key: "h3",
    file: "H3-doorway-urdu.svg",
    name: "Doorway · ۱۱ Calligraphic",
    pitch: "The openings take the shape of the Urdu numeral ۱, a pen stroke that is broad at the top and tapers to the floor. The ribbon reads سال (years) in Nastaliq.",
    idea: "One mark that reads “11” in English and “۱۱” in Urdu. It roots the anniversary in the language of the people the foundation serves, and echoes the gold Urdu calligraphy on its website.",
    reads: "Two bright vertical strokes read as 11 to everyone. Urdu readers also see the calligraphic ۱۱ and the word سال.",
    risk: "The tapered strokes are thinner at the floor, so the light spill is narrower. Nastaliq on the ribbon needs a proper Urdu font when finalised.",
    build(p) {
      return svg(p, 420, 420, doorway(p, { detail: false, shape: "urdu", label: "سال" }), "11 Years, direction H3: Doorway, Urdu calligraphic");
    },
  },
  {
    key: "h4",
    file: "H4-doorway-mehrab.svg",
    name: "Doorway · Mehrab",
    pitch: "Two tall pointed Mughal arches, like the doorways of mosques and the Mazar-e-Quaid, cut into the green tile, with سال on the ribbon.",
    idea: "Pakistani heritage architecture as the way forward: two gateways that read as ۱۱ and 11.",
    reads: "Instantly local and dignified. The arches still read as two 1s because they are tall, narrow and side by side.",
    risk: "Arches lean toward a religious or monument feel. Check that it suits a civic foundation rather than reading as a mosque mark.",
    build(p) {
      return svg(p, 420, 420, doorway(p, { detail: false, shape: "mehrab", label: "سال" }), "11 Years, direction H4: Doorway, Mehrab");
    },
  },
];

// ---------- write standalone SVGs ----------

// ---------- numeral type test: "11" in six bold, minimal sans faces, set flat ----------
const TYPE_TEST = [
  { key: "bebas", name: "Bebas Neue", family: "'Bebas Neue'", weight: 400, size: 1.25, note: "Condensed and tall. Matches the competition poster and stays very legible small." },
  { key: "montserrat", name: "Montserrat Black", family: "'Montserrat'", weight: 900, size: 1.0, note: "Geometric, with a sharp flag on each 1. Already on the website, so it sits naturally in the system." },
  { key: "onest", name: "Onest ExtraBold", family: "'Onest'", weight: 800, size: 1.02, note: "The website’s main font. Plain, friendly and quietly modern." },
  { key: "archivo", name: "Archivo Black", family: "'Archivo Black'", weight: 400, size: 0.98, note: "Heavy grotesque with a strong flag on the 1. The most solid and confident." },
  { key: "outfit", name: "Outfit ExtraBold", family: "'Outfit'", weight: 800, size: 1.05, note: "Clean geometric with soft proportions. The quietest of the six." },
  { key: "unbounded", name: "Unbounded ExtraBold", family: "'Unbounded'", weight: 800, size: 0.82, note: "Wide and blocky. Big presence, but takes more room beside the emblem." },
];
const numeral = (f, x, y, size, fill, anchor = "middle", id = "numeral-11") =>
  `<text id="${id}" x="${x}" y="${y}" text-anchor="${anchor}" font-family="${f.family}, 'Arial Black', sans-serif" font-weight="${f.weight}" font-size="${(size * f.size).toFixed(1)}" fill="${fill}" letter-spacing="${(size * 0.02).toFixed(1)}">11</text>`;
function typeSpecimen(p, f) {
  return svg(p, 240, 150, `
  <rect id="specimen-bg" width="240" height="150" fill="${C.white}"/>
  ${numeral(f, 120, 120, 120, `url(#${p}-gold)`)}`, `11 in ${f.name}`);
}
function typeOnF(p, f) {
  const W = 420, H = 372, r = 90, cx = W / 2, cy = 128, rw = 350, rcy = 272;
  const lead = numeral(f, cx - rw * 0.155, rcy + rw * 0.07 + rw * 0.13 * 0.86, rw * 0.13 * 0.98, C.deep, "middle", "ribbon-11");
  return svg(p, W, H, `
  ${hand(p, cx, cy, r, { id: "hand-left" })}
  ${hand(p, cx, cy, r, { mirror: true, id: "hand-right" })}
  ${emblem(p, cx - r, cy - r, r * 2)}
  ${ribbon(p, cx, rcy, rw, { lead })}`, `F Two Hands with 11 in ${f.name}`);
}

mkdirSync(join(here, "svg"), { recursive: true });
mkdirSync(join(here, "svg", "type-test"), { recursive: true });
for (const f of TYPE_TEST) writeFileSync(join(here, "svg", "type-test", `F-11-${f.key}.svg`), typeOnF(`t${f.key}`, f) + "\n");
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

const ARCHIVED = new Set(["a", "b", "c", "d", "e2", "g1"]);
const shortlist = concepts.filter((c) => !ARCHIVED.has(c.key));
const archived = concepts.filter((c) => ARCHIVED.has(c.key));

const html = `<title>HF 11 Years Concepts</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bebas+Neue&family=Dancing+Script:wght@700&family=Montserrat:wght@900&family=Noto+Nastaliq+Urdu:wght@700&family=Onest:wght@400;500;700;800&family=Outfit:wght@800&family=Unbounded:wght@800&display=swap">
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
.lineup-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
.lineup-cell { margin: 0; background: var(--navy); border-radius: 10px; padding: 14px 10px 10px; display: grid; gap: 8px; justify-items: center; }
.lineup-cell svg, .lineup-cell img { height: 70px; width: auto; display: block; }
.lineup-cell figcaption { font-size: 12px; color: #9FB0C4; text-align: center; }
.next { color: var(--muted); max-width: 70ch; }
.archive { display: grid; gap: 14px; }
.typetest { display: grid; gap: 14px; }
.type-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.type-card { margin: 0; background: var(--sheet); border: 1px solid var(--line); border-radius: 14px; padding: 16px; display: grid; gap: 12px; }
.type-spec, .type-f { background: #FFFFFF; border: 1px solid var(--line); border-radius: 10px; padding: 8px; }
.type-spec svg, .type-f svg { width: 100%; height: auto; display: block; }
.type-spec svg { max-height: 140px; }
.type-small { display: flex; gap: 8px; }
.type-card figcaption { display: grid; gap: 4px; font-size: 14px; }
.type-card figcaption span { color: var(--muted); font-size: 13px; }
@media (max-width: 900px) { .type-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .type-grid { grid-template-columns: 1fr; } }
.archive-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.archive-cell { margin: 0; background: var(--sheet); border: 1px solid var(--line); border-radius: 10px; padding: 12px 10px 8px; display: grid; gap: 6px; justify-items: center; opacity: 0.75; }
.archive-cell svg { width: 100%; max-width: 130px; height: auto; display: block; }
.archive-cell figcaption { font-size: 12px; color: var(--muted); text-align: center; }
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
      <h1>${["Zero", "One", "Two", "Three", "Four", "Five", "Six"][shortlist.length]} ways to say 11 <em>Years</em></h1>
      <p class="lede">The shortlist for the anniversary mark that sits beside the existing logo, picked from nine first sketches. Every direction keeps the emblem, the gold numerals and the “Years” ribbon so it reads as the sequel to the 10 Years mark.</p>
      <ul class="rules">
        <li>Emblem unchanged</li><li>Gold and green palette</li><li>“Years” ribbon</li><li>Legible at 70 px</li>
      </ul>
    </div>
    <div class="trap">
      <img src="data:image/png;base64,${ref}" alt="The existing 10 Years mark: a gold 1 beside the quartered emblem, which acts as the 0.">
      <p><strong>The problem.</strong> In the 10 Years mark the round emblem stands in for the 0. “11” has no zero, and putting the emblem after “11” reads as “110”. Every direction below gives the emblem a new job.</p>
    </div>
  </section>

  ${shortlist.map(conceptSection).join("\n")}

  <section class="typetest" aria-labelledby="h-type">
    <p class="tag">Numeral type test</p>
    <h2 id="h-type">Six bold, minimal faces for the “11”</h2>
    <p class="next">Each face is set flat, with no outline or bevel. It appears as a gold specimen, on the F (Two Hands) ribbon, and at 70 px header height.</p>
    <div class="type-grid">
      ${TYPE_TEST.map((f, i) => `
      <figure class="type-card">
        <div class="type-spec">${typeSpecimen(`s${f.key}${i}`, f).replace(/ width="\d+" height="\d+"/, "")}</div>
        <div class="type-f">${typeOnF(`f${f.key}${i}`, f).replace(/ width="\d+" height="\d+"/, "")}</div>
        <div class="type-small"><span class="chip chip-light" style="height:70px">${typeOnF(`g${f.key}${i}`, f).replace(/ width="\d+" height="\d+"/, "")}</span><span class="chip chip-navy" style="height:70px">${typeOnF(`h${f.key}${i}`, f).replace(/ width="\d+" height="\d+"/, "")}</span></div>
        <figcaption><strong>${i + 1} · ${f.name}</strong><span>${f.note}</span></figcaption>
      </figure>`).join("")}
    </div>
    <p class="file">concepts/svg/type-test/F-11-*.svg</p>
  </section>

  <section class="lineup" aria-labelledby="h-lineup">
    <p class="tag">Side by side</p>
    <h2 id="h-lineup">At header height, next to the 10 Years mark</h2>
    <div class="lineup-row">
      <figure class="lineup-cell"><img src="data:image/png;base64,${ref}" alt="10 Years mark at 70 px"><figcaption>10 Years (current)</figcaption></figure>
      ${shortlist.map((c) => `<figure class="lineup-cell">${inst(c)}<figcaption>${c.key.toUpperCase()} · ${c.name}</figcaption></figure>`).join("\n      ")}
    </div>
    <p class="next"><strong>Next:</strong> refine the shortlist in section 04 of the Figma board: horizontal header lockup, single-colour and reversed versions, favicon crop, and a test beside the master logo.</p>
  </section>

  <section class="archive" aria-labelledby="h-archive">
    <p class="tag">Archived · 4 Nov 2026</p>
    <h2 id="h-archive">Set aside</h2>
    <p class="next">Explored and set aside. The SVGs stay in concepts/svg, and the Figma cards are in “03 · Archive”.</p>
    <div class="archive-row">
      ${archived.map((c) => `<figure class="archive-cell">${inst(c)}<figcaption>${c.key.toUpperCase()} · ${c.name}</figcaption></figure>`).join("\n      ")}
    </div>
  </section>
</main>
`;
writeFileSync(join(here, "index.html"), html);
console.log("wrote", concepts.length, "svgs and index.html");
