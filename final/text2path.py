"""Shape text with HarfBuzz and convert it to SVG path outlines (no live fonts in the final files).

Writes final/text-paths.json: {key: {"d": path, "w": advance width, "asc": cap/ascent}}
Each path is laid out at font size `size` with its baseline at y=0 and its left edge at x=0.
"""
import json
import os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = {
    "black": os.path.join(HERE, "fonts/Montserrat-Black.ttf"),
    "xbold": os.path.join(HERE, "fonts/Montserrat-ExtraBold.ttf"),
    "urdu": os.path.join(HERE, "fonts/NotoNastaliqUrdu-Bold.ttf"),
}
_cache = {}


def load(name):
    if name not in _cache:
        path = FONTS[name]
        blob = hb.Blob.from_file_path(path)
        face = hb.Face(blob)
        font = hb.Font(face)
        tt = TTFont(path)
        _cache[name] = (font, tt, tt["head"].unitsPerEm)
    return _cache[name]


def shape(text, fontname, size, tracking=0.0):
    font, tt, upem = load(fontname)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    glyphset = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    scale = size / upem
    svgpen = SVGPathPen(glyphset)
    x = 0.0
    n = len(buf.glyph_infos)
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        gname = order[info.codepoint]
        dx = (x + pos.x_offset) * scale
        dy = pos.y_offset * scale
        # flip y: font units are y-up, SVG is y-down
        tpen = TransformPen(svgpen, (scale, 0, 0, -scale, dx, -dy))
        glyphset[gname].draw(tpen)
        x += pos.x_advance
        if tracking and i < n - 1:
            x += tracking / scale
    os2 = tt["OS/2"]
    cap = getattr(os2, "sCapHeight", 0) or os2.sTypoAscender
    return {"d": svgpen.getCommands(), "w": round(x * scale, 2), "asc": round(cap * scale, 2)}


TEXTS = {
    "years": ("YEARS", "xbold", 96, 18),
    "years_rule": ("YEARS", "xbold", 104, 22),
    "saal": ("سال", "urdu", 104, 0),
    "hammad": ("HAMMAD", "black", 300, 4),
    "foundation": ("FOUNDATION", "black", 300, 4),
    "hf_urdu": ("حماد فاؤنڈیشن", "urdu", 300, 0),
}

if __name__ == "__main__":
    out = {k: shape(*v) for k, v in TEXTS.items()}
    with open(os.path.join(HERE, "text-paths.json"), "w") as f:
        json.dump(out, f)
    for k, v in out.items():
        print(k, "w", v["w"], "asc", v["asc"], "len", len(v["d"]))
