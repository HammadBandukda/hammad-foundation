// Refinement of AI-1 (Hammad's stacked mark): the 11 holds the emblem.
// Geometry in units where the emblem diameter D = 1000.
//   node final/build.mjs   ->  final/svg/*.svg + final/preview.html
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
mkdirSync(join(here, "svg"), { recursive: true });

export const COL = {
  emblem: "#259D48",   // measured from the 2084 px master
  deep: "#0F6030",
  gold: "#C9A13B",     // flat gold for print
  goldHi: "#F2D27A",
  goldLo: "#A4802A",
  navy: "#020D19",
  white: "#FFFFFF",
  black: "#111111",
};

// ---- vector emblem (traced) ----
const emblemSrc = readFileSync(join(root, "vector/hf-emblem.svg"), "utf8");
const emblemInner = emblemSrc.match(/<g id="emblem">([\s\S]*?)<\/g>\s*<\/svg>/)[1];
// recolour hook: one-colour versions swap the green and the white base
function emblem(x, y, d, { art = COL.emblem, base = COL.white } = {}) {
  const s = d / 2084;
  const inner = emblemInner.replace(/fill="#FFFFFF"/, `fill="${base}"`).replace(/fill="#259D48"/, `fill="${art}"`);
  return `<g id="emblem" transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
}

// ---- the 11: two stems with flags, tops cut by an arc concentric with the emblem ----
const CX = 500, CY = 500, R = 545;            // emblem centre, cut radius (emblem r 500 + 45 gap)
const yArc = (x) => CY + Math.sqrt(R * R - (x - CX) ** 2);
function one(xl, xs, xr, yb, fh = 95) {
  const f = (v) => v.toFixed(1);
  return `M${f(xr)} ${f(yb)}H${f(xs)}V${f(yArc(xs) + fh + 45)}L${f(xl)} ${f(yArc(xl) + fh)}V${f(yArc(xl))}A${R} ${R} 0 0 0 ${f(xr)} ${f(yArc(xr))}Z`;
}
const YB = 1780;
export const ELEVEN = [one(150, 252, 478, YB), one(522, 624, 850, YB)];

function eleven(fill, id = "eleven") {
  return `<g id="${id}" fill="${fill}">${ELEVEN.map((d, i) => `<path id="${id}-${i + 1}" d="${d}"/>`).join("")}</g>`;
}

// ---- "Years" device ----
function ribbon({ fill, text, label = "YEARS", y = 1840, urdu = false }) {
  const w = 760, h = 150, x = CX - w / 2, n = 46;
  const d = `M${x} ${y}H${x + w}L${x + w - n} ${y + h / 2}L${x + w} ${y + h}H${x}L${x + n} ${y + h / 2}Z`;
  const font = urdu
    ? `font-family="'Noto Nastaliq Urdu', serif" font-weight="700" font-size="104" direction="rtl"`
    : `font-family="'Montserrat', 'Arial Black', sans-serif" font-weight="800" font-size="96" letter-spacing="18"`;
  const ty = urdu ? y + 118 : y + 108;
  return `<g id="years-ribbon"><path d="${d}" fill="${fill}"/><text x="${CX}" y="${ty}" text-anchor="middle" ${font} fill="${text}">${label}</text></g>`;
}
function rule({ color, text, label = "YEARS", y = 1840 }) {
  return `<g id="years-rule"><rect x="160" y="${y + 10}" width="680" height="16" fill="${color}"/>
  <text x="${CX}" y="${y + 150}" text-anchor="middle" font-family="'Montserrat', 'Arial Black', sans-serif" font-weight="800" font-size="104" letter-spacing="22" fill="${text}">${label}</text></g>`;
}

// ---- marks ----
export function mark(t, { urdu = false } = {}) {
  // t: treatment
  const T = {
    t1: { eleven: COL.deep, ribbon: (u) => ribbon({ fill: COL.gold, text: COL.white, urdu: u, label: u ? "سال" : "YEARS" }) },
    t2: { eleven: COL.gold, ribbon: (u) => ribbon({ fill: COL.deep, text: COL.white, urdu: u, label: u ? "سال" : "YEARS" }) },
    t3: { eleven: COL.deep, ribbon: () => rule({ color: COL.gold, text: COL.deep }) },
    mono: { eleven: COL.deep, ribbon: (u) => ribbon({ fill: COL.deep, text: COL.white, urdu: u, label: u ? "سال" : "YEARS" }), art: COL.deep },
    rev: { eleven: COL.white, ribbon: (u) => ribbon({ fill: COL.gold, text: COL.navy, urdu: u, label: u ? "سال" : "YEARS" }) },
  }[t];
  const em = t === "mono" ? emblem(0, 0, 1000, { art: COL.deep }) : emblem(0, 0, 1000);
  return `${em}${eleven(T.eleven)}${T.ribbon(urdu)}`;
}

export function svg(body, w, h, title, vb = `0 0 ${w} ${h}`, pad = 0) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
}

const out = [];
const MARK_VB = "-60 -60 1120 2140";
for (const [k, name] of [["t1", "T1 · Green 11 + gold ribbon"], ["t2", "T2 · Gold 11 + green ribbon"], ["t3", "T3 · Green 11 + gold rule"]]) {
  const file = `AI1-refine-${k}.svg`;
  writeFileSync(join(here, "svg", file), svg(mark(k), 560, 1070, `11 Years, AI-1 refinement ${name}`, MARK_VB));
  out.push([file, name]);
}

// preview page
const html = `<!doctype html><meta charset="utf-8"><title>AI-1 refinement</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Noto+Nastaliq+Urdu:wght@700&display=swap">
<body style="margin:0;padding:24px;font:14px sans-serif;background:#eef1ed;display:flex;gap:24px;flex-wrap:wrap">
${out.map(([f, n]) => `<figure style="margin:0;display:grid;gap:8px">
  <div style="display:flex;gap:12px;align-items:flex-end">
    <div style="background:#fff;padding:16px">${readFileSync(join(here, "svg", f), "utf8").replace(/width="560" height="1070"/, 'width="220" height="420"')}</div>
    <div style="background:#020D19;padding:16px">${readFileSync(join(here, "svg", f), "utf8").replace(/width="560" height="1070"/, 'width="220" height="420"')}</div>
    <div style="display:grid;gap:8px">
      <div style="background:#fff;padding:4px;height:70px">${readFileSync(join(here, "svg", f), "utf8").replace(/width="560" height="1070"/, 'width="37" height="70"')}</div>
      <div style="background:#fff;padding:2px;height:32px">${readFileSync(join(here, "svg", f), "utf8").replace(/width="560" height="1070"/, 'width="17" height="32"')}</div>
    </div>
  </div><figcaption>${n}</figcaption></figure>`).join("")}
</body>`;
writeFileSync(join(here, "preview.html"), html);
console.log("wrote", out.length, "marks");
