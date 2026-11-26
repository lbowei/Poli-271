"""Generate jeans technical-flat SVGs and inject them into website/index.html.

Run:  python3 tools/flats.py
Markup between <!--@flat:NAME--> and <!--@end--> markers is replaced.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "website" / "index.html"


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def pt(p):
    return f"{f(p[0])},{f(p[1])}"


def cr(points):
    """Catmull-Rom spline through points -> cubic Bezier segments (no initial M)."""
    d = []
    n = len(points)
    for i in range(n - 1):
        p0 = points[i - 1] if i > 0 else points[i]
        p1, p2 = points[i], points[i + 1]
        p3 = points[i + 2] if i + 2 < n else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{pt(c1)} {pt(c2)} {pt(p2)}")
    return " ".join(d)


def mirror(points):
    return [(200 - x, y) for x, y in points]


KNEE_Y, HEM_Y = 175, 292

FITS = {
    #            hip  crotch thigh  inner@thigh  knee(out,in)  hem(out,in)
    "straight": dict(hip=34, cy=80, thigh=32, xit=95, knee=(37, 90), hem=(38, 90)),
    "slim":     dict(hip=34, cy=80, thigh=33, xit=95, knee=(43, 89), hem=(51, 86)),
    "wide":     dict(hip=35, cy=78, thigh=31, xit=96, knee=(24, 95), hem=(12, 97)),
    "barrel":   dict(hip=34, cy=81, thigh=30, xit=96, knee=(19, 94), hem=(40, 88)),
    "flare":    dict(hip=35, cy=79, thigh=33, xit=95, knee=(42, 89), hem=(21, 95)),
    "baggy":    dict(hip=33, cy=86, thigh=27, xit=96, knee=(21, 96), hem=(18, 97)),
}


def x_at(seam_knee, seam_hem, y):
    return seam_knee + (seam_hem - seam_knee) * (y - KNEE_Y) / (HEM_Y - KNEE_Y)


def jeans(p, ox=0.0, oy=0.0, draw_class=""):
    hip, cy, thigh, xit = p["hip"], p["cy"], p["thigh"], p["xit"]
    ko, ki = p["knee"]
    ho, hi = p["hem"]

    l_out = [(46, 15), (hip, 53), (thigh, 95), (ko, KNEE_Y), (ho, HEM_Y)]
    l_in = [(100, cy), (xit, cy + 20), (ki, KNEE_Y), (hi, HEM_Y)]
    r_out, r_in = mirror(l_out), mirror(l_in)

    body = (
        f"M{pt(l_out[0])} L{pt(r_out[0])} {cr(r_out)} "
        f"L{pt(r_in[-1])} {cr(list(reversed(r_in)))} "
        f"{cr(l_in)} L{pt(l_out[-1])} {cr(list(reversed(l_out)))} Z"
    )

    # hem stitch, inset from both seams
    hy = HEM_Y - 6
    hem_l = (x_at(ho, ho, hy) if False else x_at(ko, ho, hy)) + 2.2, x_at(ki, hi, hy) - 2.2
    hem_stitch = (
        f"M{f(hem_l[0])},{hy} L{f(hem_l[1])},{hy} "
        f"M{f(200 - hem_l[1])},{hy} L{f(200 - hem_l[0])},{hy}"
    )

    scoop_end = (hip + 1.4, 49)
    scoop_l = f"M68,15.5 C66,33 53,45.5 {pt(scoop_end)}"
    scoop_r = f"M132,15.5 C134,33 147,45.5 {pt((200 - scoop_end[0], 49))}"
    scoop_st_l = f"M71.5,15.5 C69.5,36 56,50 {pt((hip + 1.9, 53.2))}"
    scoop_st_r = f"M128.5,15.5 C130.5,36 144,50 {pt((200 - hip - 1.9, 53.2))}"

    fly_y = cy - 22
    fly = f"M111,16 L111,{f(fly_y)} Q111,{f(cy - 10)} 101,{f(cy - 6)}"
    cf = f"M100,15.5 L100,{f(cy - 1)}"

    loops = "".join(
        f'<rect class="fl-loop" x="{f(x - 1.7)}" y="2.4" width="3.4" height="15.6" rx="0.8"/>'
        for x in (55, 83, 117, 145)
    )
    rivets = "".join(
        f'<circle class="fl-rivet" cx="{f(x)}" cy="{f(y)}" r="1.5"/>'
        for x, y in ((hip + 2.6, 47.6), (200 - hip - 2.6, 47.6), (49.6, 19.2), (60.4, 19.2))
    )

    g = f'<g transform="translate({f(ox)},{f(oy)})" class="{draw_class}">'
    g += f'<path class="fl-body fl-draw" pathLength="1" d="{body}"/>'
    g += '<path class="fl-band fl-draw" pathLength="1" d="M44,4 L156,4 L154,15.5 L46,15.5 Z"/>'
    g += f'<path class="fl-detail fl-draw" pathLength="1" d="{scoop_l}"/>'
    g += f'<path class="fl-detail fl-draw" pathLength="1" d="{scoop_r}"/>'
    g += f'<path class="fl-detail fl-draw" pathLength="1" d="{cf}"/>'
    g += '<path class="fl-detail fl-draw" pathLength="1" d="M49.2,18.4 L60.8,18.4 L61.2,31.2 L49.6,31.8 Z"/>'
    g += (
        '<g class="fl-stitches">'
        '<path class="fl-stitch" d="M46,12.6 L154,12.6 M45.2,6.6 L154.8,6.6"/>'
        f'<path class="fl-stitch" d="{scoop_st_l} {scoop_st_r}"/>'
        f'<path class="fl-stitch" d="{fly}"/>'
        '<path class="fl-stitch" d="M49.8,21.2 L60.6,21.2"/>'
        f'<path class="fl-stitch" d="{hem_stitch}"/>'
        "</g>"
    )
    g += loops
    g += '<circle class="fl-button" cx="100" cy="9.6" r="2.5"/>'
    g += rivets
    g += "</g>"
    geo = dict(cy=cy, hem=(ho, hi), hem_y=HEM_Y, hip=hip, hem_stitch_y=hy, hem_l=hem_l)
    return g, geo


def fit_svg(name):
    g, _ = jeans(FITS[name])
    return (
        f'<svg class="flat" viewBox="-6 -2 212 300" role="img" aria-labelledby="fit-{name}-title">'
        f'<title id="fit-{name}-title">{name.title()} fit technical flat</title>{g}</svg>'
    )


def mono(x, y, text, anchor="start", cls="tp-label"):
    return f'<text class="{cls}" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}">{text}</text>'


def hero_svg():
    ox, oy = 70, 14
    g, geo = jeans(FITS["straight"], ox, oy, "hero-jeans")
    cy = geo["cy"] + oy
    parts = [g]
    a = []  # annotations

    # Front rise dimension (left)
    x = 30
    a.append(f'<path class="tp-dim" d="M{x},{4 + oy} L{x},{f(cy)} M{x - 4},{4 + oy} L{x + 4},{4 + oy} M{x - 4},{f(cy)} L{x + 4},{f(cy)}"/>')
    a.append(f'<path class="tp-guide" d="M{x + 5},{4 + oy} L{ox + 43},{4 + oy} M{x + 5},{f(cy)} L{ox + 99},{f(cy)}"/>')
    a.append(mono(x - 7, (4 + oy + cy) / 2 - 3, "FRONT", "end"))
    a.append(mono(x - 7, (4 + oy + cy) / 2 + 6, "RISE", "end"))

    # Inseam dimension (left, lower)
    a.append(f'<path class="tp-dim" d="M{x},{f(cy + 8)} L{x},{geo["hem_y"] + oy} M{x - 4},{f(cy + 8)} L{x + 4},{f(cy + 8)} M{x - 4},{geo["hem_y"] + oy} L{x + 4},{geo["hem_y"] + oy}"/>')
    mid = (cy + 8 + geo["hem_y"] + oy) / 2
    a.append(mono(x - 7, mid - 3, "IN-", "end"))
    a.append(mono(x - 7, mid + 6, "SEAM", "end"))

    # Leg opening (bottom, right leg)
    ho, hi = geo["hem"]
    r_out, r_in = 200 - ho + ox, 200 - hi + ox
    y = geo["hem_y"] + oy + 12
    a.append(f'<path class="tp-dim" d="M{f(r_in)},{y} L{f(r_out)},{y} M{f(r_in)},{y - 4} L{f(r_in)},{y + 4} M{f(r_out)},{y - 4} L{f(r_out)},{y + 4}"/>')
    a.append(mono((r_in + r_out) / 2, y + 13, "LEG OPENING", "middle"))

    # Callouts (right side)
    lx = 300
    callouts = [
        ((154 + ox, 9 + oy), 22, ["CONTOURED", "WAISTBAND"]),
        ((200 - geo["hip"] - 2.6 + ox, 47.6 + oy), 62, ["COPPER", "RIVETS"]),
        ((111 + ox, 40 + oy), 104, ["J-STITCH", "FLY"]),
        ((165.5 + ox, 140 + oy), 166, ["TWIN-NEEDLE", "OUTSEAM"]),
        ((200 - geo["hem_l"][0] - 8 + ox, geo["hem_stitch_y"] + oy), 262, ["CHAIN-STITCH", "HEM"]),
    ]
    for i, ((px, py), ty, lines) in enumerate(callouts):
        a.append(
            f'<g class="tp-callout" style="--i:{i}">'
            f'<circle class="tp-dot" cx="{f(px)}" cy="{f(py)}" r="2.2"/>'
            f'<path class="tp-leader" d="M{f(px)},{f(py)} L{lx - 34},{f(ty)} L{lx - 6},{f(ty)}"/>'
            + mono(lx, ty + 2.5, lines[0])
            + mono(lx, ty + 11.5, lines[1])
            + "</g>"
        )
    parts.append('<g class="tp-annotations">' + "".join(a) + "</g>")
    return (
        '<svg class="techpack-svg" viewBox="0 0 380 340" role="img" aria-labelledby="hero-flat-title">'
        '<title id="hero-flat-title">Technical flat of a straight-leg jean with construction callouts</title>'
        + "".join(parts)
        + "</svg>"
    )


def inject(html, name, svg):
    pat = re.compile(rf"(<!--@flat:{name}-->)(.*?)(<!--@end-->)", re.S)
    if not pat.search(html):
        raise SystemExit(f"marker @flat:{name} not found")
    return pat.sub(lambda m: m.group(1) + svg + m.group(3), html, count=1)


OG = ROOT / "tools" / "og.html"

if __name__ == "__main__":
    html = INDEX.read_text()
    html = inject(html, "hero", hero_svg())
    for name in FITS:
        html = inject(html, name, fit_svg(name))
    INDEX.write_text(html)
    if OG.exists():
        OG.write_text(inject(OG.read_text(), "hero", hero_svg()))
    print("injected:", ["hero", *FITS], "+ og.html" if OG.exists() else "")
