import json, os

PAL = {
  "warm": {
    "light": dict(bg="#fbf1c7", surface="#f2e5bc", text="#3c3836", muted="#7c6f64",
                  accent="#bc5c00", alt1="#4c7a5d", alt2="#904180", rule="#e3d5ad"),
    "dark":  dict(bg="#1d2021", surface="#282828", text="#d4be98", muted="#a89984",
                  accent="#e78a4e", alt1="#a9b665", alt2="#d3869b", rule="#3c3836"),
  },
  "cool": {
    "light": dict(bg="#f4f9fc", surface="#e7f1f8", text="#0f1b61", muted="#59689a",
                  accent="#7f00e0", alt1="#0e7490", alt2="#5aa7c4", rule="#d5e5f0"),
    "dark":  dict(bg="#0b1020", surface="#151d36", text="#dfe6ff", muted="#96a4d2",
                  accent="#b388ff", alt1="#7fd4e8", alt2="#aadcec", rule="#242d4d"),
  },
}

FONTS = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&'
         'family=IBM+Plex+Sans:wght@400;500;600&'
         'family=IBM+Plex+Mono:wght@400;500&display=swap">')

def tokens(p, sel):
    return sel + " {\n" + "".join(f"      --{k}: {v};\n" for k, v in p.items()) + "    }"

def css(temp):
    return f"""{FONTS}
  <style>
    {tokens(PAL[temp]['light'], ':root')}
    {tokens(PAL[temp]['dark'], '.page.dark')}

    * {{ box-sizing: border-box; }}
    body {{ margin: 0; }}
    a {{ color: var(--accent); text-decoration: none; }}
    a:hover {{ color: var(--text); text-decoration: underline; text-underline-offset: 3px; }}

    .page {{
      background: var(--bg); color: var(--text);
      font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
      font-size: 16px; line-height: 1.65; min-height: 100%;
      -webkit-font-smoothing: antialiased;
    }}
    .wrap {{
      max-width: 660px; margin: 0 auto; padding: 56px 40px 72px;
      display: flex; flex-direction: column; gap: 56px;
    }}

    .top {{ display: flex; justify-content: space-between; align-items: baseline; gap: 24px; }}
    .mark {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 13px; font-weight: 500; letter-spacing: 0.14em;
      color: var(--accent);
      border: 1px solid var(--rule); padding: 5px 8px; border-radius: 3px;
    }}
    .nav {{ display: flex; flex-wrap: wrap; gap: 18px; }}
    .nav a {{ font-size: 14px; color: var(--muted); }}
    .nav a:hover {{ color: var(--accent); text-decoration: none; }}

    .eyebrow {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--muted); margin: 0;
    }}
    h1.name {{
      font-family: Newsreader, Georgia, serif; font-weight: 500;
      font-size: 68px; line-height: 1.02; letter-spacing: -0.02em;
      margin: 14px 0 0; text-wrap: balance;
    }}
    .lede {{
      font-size: 19px; line-height: 1.6; color: var(--text);
      margin: 22px 0 0; max-width: 52ch; text-wrap: pretty;
    }}
    .muted {{ color: var(--muted); }}

    .sect {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--muted); margin: 0 0 20px; padding-bottom: 10px;
      border-bottom: 1px solid var(--rule);
    }}

    .links {{ display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 30px; }}
    .btn {{
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--accent); color: var(--bg);
      padding: 11px 18px; border-radius: 4px;
      font-size: 15px; font-weight: 500;
    }}
    .btn:hover {{ color: var(--bg); opacity: 0.88; text-decoration: none; }}
    .lnk {{ font-size: 15px; color: var(--muted); }}
    .lnk:hover {{ color: var(--accent); }}

    .rows {{ list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0; }}
    .row {{
      display: grid; grid-template-columns: 116px 1fr; gap: 20px;
      padding: 13px 0; border-bottom: 1px solid var(--rule); align-items: baseline;
    }}
    .row:last-child {{ border-bottom: none; }}
    .row-k {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted);
    }}
    .row-v {{ font-size: 15px; }}

    .roles {{ display: flex; flex-direction: column; gap: 44px; }}
    .role {{ display: grid; grid-template-columns: 14px 1fr; gap: 22px; }}
    .spine {{ border-left: 1px solid var(--rule); position: relative; }}
    .spine::before {{
      content: ""; position: absolute; left: -4px; top: 9px;
      width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
    }}
    .role-body {{ display: flex; flex-direction: column; gap: 12px; }}
    .role-h {{ display: flex; flex-direction: column; gap: 4px; }}
    .role-co {{ font-family: Newsreader, Georgia, serif; font-size: 27px; font-weight: 500; line-height: 1.2; }}
    .role-meta {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 12.5px; color: var(--muted); letter-spacing: 0.03em;
    }}
    .impacts {{ list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }}
    .impact {{ display: grid; grid-template-columns: 92px 1fr; gap: 16px; align-items: baseline; }}
    .metric {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 15px; font-weight: 500; color: var(--accent);
    }}
    .impact-t {{ font-size: 15px; line-height: 1.55; color: var(--text); }}
    .tags {{ display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }}
    .tag {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 11.5px; color: var(--muted);
      border: 1px solid var(--rule); border-radius: 3px; padding: 3px 7px;
    }}

    .quotes {{ display: flex; flex-direction: column; gap: 48px; }}
    .quote {{ display: flex; flex-direction: column; gap: 18px; position: relative; }}
    .qmark {{
      font-family: Newsreader, Georgia, serif; font-size: 82px; line-height: 1;
      color: var(--accent); opacity: 0.22; height: 34px; margin: 0; user-select: none;
    }}
    .qtext {{
      font-family: Newsreader, Georgia, serif; font-size: 23px; line-height: 1.45;
      font-weight: 400; margin: 0; text-wrap: pretty;
    }}
    .qattr {{ display: flex; flex-direction: column; gap: 2px; padding-left: 15px; border-left: 2px solid var(--accent); }}
    .qname {{ font-size: 14.5px; font-weight: 600; }}
    .qrole {{
      font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace;
      font-size: 12px; color: var(--muted);
    }}
    .note {{
      font-size: 13px; color: var(--muted); border: 1px dashed var(--rule);
      border-radius: 4px; padding: 12px 14px; line-height: 1.5;
    }}
  </style>"""

def doc(temp, body, w, h):
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  {css(temp)}
</helmet>
<div class="page {{{{themeClass}}}}">
  <div class="wrap">
{body}
  </div>
</div>
</x-dc>
<script data-dc-script data-props='{{"dark":{{"editor":"boolean","default":false,"section":"Theme"}},"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{
    return {{ themeClass: this.props.dark ? 'dark' : '' }};
  }}
}}
</script>
</body>
</html>
"""

NAV = """    <header class="top">
      <span class="mark">DB</span>
      <nav class="nav">
        <a href="#">About</a>
        <a href="#">Experience</a>
        <a href="#">Projects</a>
        <a href="#">Recommendations</a>
        <a href="#">Contact</a>
      </nav>
    </header>"""

LANDING = NAV + """

    <section>
      <p class="eyebrow">Cloud security engineer</p>
      <h1 class="name">Daniel<br>Barranquero</h1>
      <p class="lede">[ONE SENTENCE: what you do, who for, and why it matters. Written last, once the rest of the site exists.]</p>
      <div class="links">
        <a class="btn" href="#">Read the CV</a>
        <a class="lnk" href="#">GitHub</a>
        <a class="lnk" href="#">LinkedIn</a>
        <a class="lnk" href="#">Email</a>
      </div>
    </section>

    <section>
      <h2 class="sect">Currently</h2>
      <ul class="rows">
        <li class="row"><span class="row-k">Role</span><span class="row-v">[ROLE] at [COMPANY]</span></li>
        <li class="row"><span class="row-k">Focus</span><span class="row-v">[PRIMARY AREA OF WORK]</span></li>
        <li class="row"><span class="row-k">Open source</span><span class="row-v">[PROJECT] &mdash; [YOUR INVOLVEMENT]</span></li>
        <li class="row"><span class="row-k">Based in</span><span class="row-v">[CITY]</span></li>
      </ul>
    </section>

    <p class="note">Placeholder content. Bracketed text marks a real fact still to be supplied &mdash; nothing here is invented.</p>"""

def role(co, meta, impacts, tags):
    lis = "\n".join(
        f'            <li class="impact"><span class="metric">{m}</span>'
        f'<span class="impact-t">{t}</span></li>' for m, t in impacts)
    tg = "\n".join(f'            <span class="tag">{t}</span>' for t in tags)
    return f"""      <article class="role">
        <div class="spine"></div>
        <div class="role-body">
          <div class="role-h">
            <h3 class="role-co">{co}</h3>
            <p class="role-meta">{meta}</p>
          </div>
          <ul class="impacts">
{lis}
          </ul>
          <div class="tags">
{tg}
          </div>
        </div>
      </article>"""

EXPERIENCE = NAV + """

    <section>
      <p class="eyebrow">Experience</p>
      <h1 class="name" style="font-size: 46px;">What I&rsquo;ve<br>shipped</h1>
      <p class="lede">[TWO LINES ON HOW YOU WORK &mdash; the thread connecting these roles, not a restatement of them.]</p>
    </section>

    <section>
      <h2 class="sect">Roles</h2>
      <div class="roles">
""" + "\n\n".join([
    role("[COMPANY ONE]", "[ROLE TITLE] &middot; [START] &ndash; present",
         [("[N]&times;", "[IMPACT: what changed, and what it was worth.]"),
          ("[N] hrs", "[IMPACT: time or toil removed, and for whom.]"),
          ("[N]", "[IMPACT: scale &mdash; accounts, findings, services covered.]")],
         ["[TECH]", "[TECH]", "[TECH]", "[TECH]"]),
    role("[COMPANY TWO]", "[ROLE TITLE] &middot; [START] &ndash; [END]",
         [("[N]%", "[IMPACT: a number you can defend in an interview.]"),
          ("[N]", "[IMPACT: something that outlived your time there.]")],
         ["[TECH]", "[TECH]", "[TECH]"]),
]) + """
      </div>
    </section>

    <section>
      <h2 class="sect">Open source</h2>
      <ul class="rows">
        <li class="row"><span class="row-k">[PROJECT]</span><span class="row-v">[WHAT YOU CONTRIBUTED, AND WHY IT MATTERED]</span></li>
        <li class="row"><span class="row-k">[PROJECT]</span><span class="row-v">[WHAT YOU CONTRIBUTED, AND WHY IT MATTERED]</span></li>
      </ul>
    </section>

    <p class="note">Layout only. Metrics are the load-bearing element here &mdash; the design assumes every impact line leads with a number.</p>"""

def quote(text, name, role_):
    return f"""      <figure class="quote">
        <p class="qmark">&ldquo;</p>
        <blockquote class="qtext">{text}</blockquote>
        <figcaption class="qattr">
          <span class="qname">{name}</span>
          <span class="qrole">{role_}</span>
        </figcaption>
      </figure>"""

RECS = NAV + """

    <section>
      <p class="eyebrow">Recommendations</p>
      <h1 class="name" style="font-size: 46px;">In other<br>people&rsquo;s words</h1>
      <p class="lede">[ONE LINE OF FRAMING &mdash; who these people are to you, and over what period.]</p>
    </section>

    <section>
      <div class="quotes">
""" + "\n\n".join([
    quote("[QUOTE ONE &mdash; the strongest thing a senior engineer said about working with you. Two or three sentences; longer than this reads as padding.]",
          "[NAME]", "[ROLE] &middot; [COMPANY]"),
    quote("[QUOTE TWO &mdash; ideally about a different quality than the first, so the two do not overlap.]",
          "[NAME]", "[ROLE] &middot; [COMPANY]"),
    quote("[QUOTE THREE &mdash; optional. Three is plenty; more starts to read defensive.]",
          "[NAME]", "[ROLE] &middot; [COMPANY]"),
]) + """
      </div>
    </section>

    <p class="note">Every quote needs the author&rsquo;s permission before it ships. Where the recommendation already exists publicly on LinkedIn, link it.</p>"""

PAGES = [("Landing", LANDING, 900, 780), ("Experience", EXPERIENCE, 900, 1240),
         ("Recommendations", RECS, 900, 1040)]

for page, body, w, h in PAGES:
    for temp in ("warm", "cool"):
        name = "Main" if (page == "Landing" and temp == "warm") else f"{page}{temp.capitalize()}"
        open(f"{name}.dc.html", "w").write(doc(temp, body, w, h))
        print(f"wrote {name}.dc.html  ({page} / {temp})")

GAP_X, GAP_Y = 1000, 0
arts, y = [], 0
for page, body, w, h in PAGES:
    for i, temp in enumerate(("warm", "cool")):
        name = "Main" if (page == "Landing" and temp == "warm") else f"{page}{temp.capitalize()}"
        arts.append({"file": f"{name}.dc.html", "x": i * GAP_X, "y": y, "w": w, "h": h,
                     "title": f"{page} — {temp.capitalize()}"})
    y += h + 150

canvas = {
  "artboards": arts,
  "annotations": [
    {"id": "brief", "x": -430, "y": 0, "w": 360,
     "text": "Same layout, same type, two palettes.\nOnly the colour changes — so what you are\npicking here is temperature, nothing else.\n\nType is identical in all six:\nNewsreader (display), IBM Plex Sans (body),\nIBM Plex Mono (metadata + metrics)."},
    {"id": "dark-note", "x": -430, "y": 250, "w": 360,
     "text": "Each artboard has a Dark toggle above it.\nDark mode is a token swap, no JavaScript —\nthe real site uses CSS light-dark()."},
    {"id": "craft", "x": -430, "y": 930, "w": 360,
     "text": "Experience and Recommendations are where\nthe craft budget goes. Everything else\nstays deliberately quiet.\n\nExperience assumes every impact line\nleads with a number."},
  ],
  "launch": {"view": "canvas"},
}
json.dump(canvas, open("canvas.json", "w"), indent=2)
print("wrote canvas.json")
