// Hammad Foundation · 11 Years: final mark system (refined from Hammad's AI-1, treatment T2).
// Geometry units: emblem diameter D = 1000. All text is outlined (see text2path.py).
//   python3 final/text2path.py && node final/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const OUT = join(here, "svg");
mkdirSync(OUT, { recursive: true });

export const COL = {
  emblem: "#259D48", deep: "#0F6030", gold: "#C9A13B", navy: "#020D19", white: "#FFFFFF", black: "#111111",
};
const TXT = JSON.parse(readFileSync(join(here, "text-paths.json"), "utf8"));

// ---------- emblem (vector trace) ----------
const emblemSrc = readFileSync(join(root, "vector/hf-emblem.svg"), "utf8");
const baseG = emblemSrc.match(/<g id="emblem-base"[\s\S]*?<\/g>/)[0];
const artG = emblemSrc.match(/<g id="emblem-art"[\s\S]*?<\/g>/)[0];
function emblem({ art = COL.emblem, base = COL.white, x = 0, y = 0, d = 1000 } = {}) {
  const s = d / 2084;
  const b = base ? baseG.replace('fill="#FFFFFF"', `fill="${base}"`) : "";
  const a = artG.replace('fill="#259D48"', `fill="${art}"`);
  return `<g id="emblem" transform="translate(${x} ${y}) scale(${s})">${b}${a}</g>`;
}

// ---------- the 11 ----------
const CX = 500, CY = 500, R = 545, YB = 1780;
const yArc = (x) => CY + Math.sqrt(R * R - (x - CX) ** 2);
const f1 = (v) => v.toFixed(1);
function oneLatin(xl, xs, xr, fh = 95) {
  return `M${f1(xr)} ${YB}H${f1(xs)}V${f1(yArc(xs) + fh + 45)}L${f1(xl)} ${f1(yArc(xl) + fh)}V${f1(yArc(xl))}A${R} ${R} 0 0 0 ${f1(xr)} ${f1(yArc(xr))}Z`;
}
// Urdu ۱: a plain stroke, slightly tapered toward the foot, no flag. Reads as ۱۱ and as 11.
function oneUrdu(xl, xr, taper = 22) {
  return `M${f1(xr - taper)} ${YB}H${f1(xl + taper)}L${f1(xl)} ${f1(yArc(xl))}A${R} ${R} 0 0 0 ${f1(xr)} ${f1(yArc(xr))}Z`;
}
const ELEVEN = { latin: [oneLatin(150, 252, 478), oneLatin(522, 624, 850)], urdu: [oneUrdu(232, 470), oneUrdu(530, 768)] };
const eleven = (fill, script = "latin") => `<g id="eleven" fill="${fill}">${ELEVEN[script].map((d, i) => `<path id="eleven-${i + 1}" d="${d}"/>`).join("")}</g>`;

// ---------- outlined text ----------
function txt(key, cx, baseline, { anchor = "middle", k = 1 } = {}) {
  const t = TXT[key];
  const x = anchor === "middle" ? cx - (t.w * k) / 2 : anchor === "end" ? cx - t.w * k : cx;
  return { d: t.d, tf: `translate(${f1(x)} ${f1(baseline)}) scale(${k})`, w: t.w * k };
}

// ---------- the Years ribbon ----------
const RIB = { y: 1840, h: 150, w: 760, n: 46 };
function ribbonPath() {
  const { y, h, w, n } = RIB, x = CX - w / 2;
  return `M${x} ${y}H${x + w}L${x + w - n} ${y + h / 2}L${x + w} ${y + h}H${x}L${x + n} ${y + h / 2}Z`;
}
// knockout: the label is cut out of the ribbon (evenodd), so one-colour versions print one ink
function ribbon({ fill, text, script = "latin", knockout = false }) {
  const midY = RIB.y + RIB.h / 2;
  const label = script === "urdu" ? txt("saal", CX, midY + 46, { k: 1.45 }) : txt("years", CX, midY + TXT.years.asc / 2);
  if (knockout) {
    return `<g id="years-ribbon"><path fill="${fill}" fill-rule="evenodd" d="${ribbonPath()}"/><path fill="${fill}" fill-rule="evenodd" transform="${label.tf}" d="${label.d}" style="display:none"/></g>`;
  }
  return `<g id="years-ribbon"><path d="${ribbonPath()}" fill="${fill}"/><path id="years-label" transform="${label.tf}" d="${label.d}" fill="${text}"/></g>`;
}
// true knockout using a mask (kept simple and editable: ribbon + label as a mask)
function ribbonKO({ fill, script = "latin", id }) {
  const midY = RIB.y + RIB.h / 2;
  const label = script === "urdu" ? txt("saal", CX, midY + 46, { k: 1.45 }) : txt("years", CX, midY + TXT.years.asc / 2);
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="1800" width="1000" height="230"><rect x="0" y="1800" width="1000" height="230" fill="#fff"/><path transform="${label.tf}" d="${label.d}" fill="#000"/></mask></defs>
  <g id="years-ribbon"><path d="${ribbonPath()}" fill="${fill}" mask="url(#${id})"/></g>`;
}

// ---------- marks ----------
const VARIANTS = {
  fullcolour: { em: {}, eleven: COL.gold, rib: { fill: COL.deep, text: COL.white } },
  reversed: { em: {}, eleven: COL.gold, rib: { fill: COL.white, text: COL.deep } },
  green: { em: { art: COL.deep, base: null }, eleven: COL.deep, ko: COL.deep },
  black: { em: { art: COL.black, base: null }, eleven: COL.black, ko: COL.black },
  white: { em: { art: COL.white, base: null }, eleven: COL.white, ko: COL.white },
};
function stackedBody(v, script = "latin", withRibbon = true, idp = "m") {
  const V = VARIANTS[v];
  const rib = !withRibbon ? "" : V.ko ? ribbonKO({ fill: V.ko, script, id: `${idp}-ko-${v}-${script}` }) : ribbon({ ...V.rib, script });
  return `${emblem(V.em)}${eleven(V.eleven, script)}${rib}`;
}
const svg = (body, vb, w, h, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"><title>${title}</title>${body}</svg>\n`;

const written = [];
const write = (name, s) => { writeFileSync(join(OUT, name), s); written.push(name); };
const STACK_VB = "-40 -40 1080 2070", STACK_W = 540, STACK_H = 1035;
const ICON_VB = "-40 -40 1080 1860", ICON_W = 540, ICON_H = 930;

for (const v of Object.keys(VARIANTS)) {
  write(`HF11_stacked_${v}.svg`, svg(stackedBody(v), STACK_VB, STACK_W, STACK_H, `Hammad Foundation 11 Years: stacked, ${v}`));
  write(`HF11_icon_${v}.svg`, svg(stackedBody(v, "latin", false), ICON_VB, ICON_W, ICON_H, `Hammad Foundation 11 Years: icon, ${v}`));
}
write("HF11_stacked_urdu_fullcolour.svg", svg(stackedBody("fullcolour", "urdu"), STACK_VB, STACK_W, STACK_H, "Hammad Foundation ۱۱ سال: stacked, Urdu, full colour"));
write("HF11_stacked_urdu_reversed.svg", svg(stackedBody("reversed", "urdu"), STACK_VB, STACK_W, STACK_H, "Hammad Foundation ۱۱ سال: stacked, Urdu, reversed"));
write("HF11_stacked_urdu_green.svg", svg(stackedBody("green", "urdu"), STACK_VB, STACK_W, STACK_H, "Hammad Foundation ۱۱ سال: stacked, Urdu, one colour"));

// ---------- horizontal lockups (mark + wordmark) ----------
const WK = 2.6, GAP_X = 160, LINE_GAP = 210;
function wordmark(x0, colors, urdu = false) {
  if (urdu) {
    const t = txt("hf_urdu", x0, 1260, { anchor: "end", k: 1.55 });
    return `<g id="wordmark-urdu"><path transform="${t.tf}" d="${t.d}" fill="${colors[1]}"/></g>`;
  }
  const capH = TXT.hammad.asc * WK;
  const top = (2030 - 40 - (2 * capH + LINE_GAP)) / 2 - 20;
  const h = txt("hammad", x0, top + capH, { anchor: "start", k: WK });
  const f = txt("foundation", x0, top + 2 * capH + LINE_GAP, { anchor: "start", k: WK });
  return { svg: `<g id="wordmark"><path id="wm-hammad" transform="${h.tf}" d="${h.d}" fill="${colors[0]}"/><path id="wm-foundation" transform="${f.tf}" d="${f.d}" fill="${colors[1]}"/></g>`, w: Math.max(h.w, f.w) };
}
const WM_COL = { fullcolour: [COL.emblem, COL.deep], reversed: [COL.white, COL.white], green: [COL.deep, COL.deep], black: [COL.black, COL.black], white: [COL.white, COL.white] };
for (const v of Object.keys(VARIANTS)) {
  const wm = wordmark(1000 + GAP_X, WM_COL[v]);
  const W = 1000 + GAP_X + wm.w + 40;
  write(`HF11_horizontal_${v}.svg`, svg(`${stackedBody(v, "latin", true, "h")}${wm.svg}`, `-40 -40 ${f1(W + 40)} 2070`, Math.round((W + 80) / 4), Math.round(2070 / 4), `Hammad Foundation 11 Years: horizontal lockup, ${v}`));
}
{ // Urdu: mark on the right, wordmark to its left (right-to-left reading order)
  const t = TXT.hf_urdu, k = 1.55, ww = t.w * k;
  const shift = ww + GAP_X;
  const body = `<g transform="translate(${f1(shift)} 0)">${stackedBody("fullcolour", "urdu", true, "hu")}</g>${wordmark(ww, [COL.deep, COL.deep], true)}`;
  write("HF11_horizontal_urdu_fullcolour.svg", svg(body, `-40 -40 ${f1(shift + 1080)} 2070`, Math.round((shift + 1080) / 4), Math.round(2070 / 4), "Hammad Foundation ۱۱ سال: horizontal lockup, Urdu"));
}

// ---------- lockup with the master logo (stand-in rebuilt from the emblem + wordmark; swap for the official vector) ----------
{
  const sq = 2030, r = 260;
  const k = 0.8, capH = TXT.hammad.asc * k;
  const h = txt("hammad", sq / 2, 1430, { k }), f = txt("foundation", sq / 2, 1430 + capH + 110, { k });
  const master = `<g id="master-logo-standin"><rect x="0" y="0" width="${sq}" height="${sq}" rx="${r}" fill="${COL.deep}"/>${emblem({ x: (sq - 1000) / 2, y: 170, d: 1000 })}<path transform="${h.tf}" d="${h.d}" fill="#3FD06B"/><path transform="${f.tf}" d="${f.d}" fill="${COL.white}"/></g>`;
  const divX = sq + 200;
  const body = `<g transform="translate(0 0)">${master}</g><rect id="divider" x="${divX}" y="120" width="24" height="1790" fill="${COL.gold}"/><g transform="translate(${divX + 224} 0)">${stackedBody("fullcolour", "latin", true, "ml")}</g>`;
  write("HF11_lockup_with_master_logo.svg", svg(body, `-40 -40 ${divX + 224 + 1080} 2110`, Math.round((divX + 224 + 1120) / 5), Math.round(2110 / 5), "Hammad Foundation master logo (stand-in) with the 11 Years mark"));
}
console.log("wrote", written.length, "files"); console.log(written.join("\n"));
