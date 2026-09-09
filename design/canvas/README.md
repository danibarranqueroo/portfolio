# Design canvas working files

Source for the published design canvas. **Edit these**, then re-seed and
republish — never hand-edit the seeded output, which is a 2.4 MB generated
payload and is deliberately not committed.

- `*.dc.html` — one artboard each. `Main.dc.html` is the entry artboard.
- `canvas.json` — layout, titles, sticky notes, launch view.

Regenerate all six from the shared template with `python3 gen.py`; the palette
tables at the top of that file are the only place colours are defined.

Once a temperature is chosen, the winning palette moves into
`src/styles/global.css` as the Tailwind v4 `@theme` tokens, and the losing
artboards come off the canvas.
