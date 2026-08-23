# Red Stamp

_Red Stamp_ is a self-contained browser prototype about security control at the
embassy of the Union of Veskar.

The first playable version includes:

- Two shifts and eleven visitors
- Appointment and special-clearance arrival paths
- Appointment records, identity checks, physical documents, metal detection,
  bag X-ray, questioning, secondary inspection, and liaison calls
- Ordinary citizens, emergencies, Veskarian personnel, contractors, spies, and
  supernatural anomalies
- Daily tolerance, persistent career standing, public pressure, command
  pressure, security breaches, delayed case outcomes, and campaign endings
- A sparse monumental checkpoint screen built from generated Veskarian
  environment art, character sprites, documents, X-ray panels, and animated
  inspection overlays
- Generated sprites are also used inside the case card, checkpoint hotspots,
  decision buttons, and overlay shortcuts so the interface stays visual during
  interaction
- Clickable hotspots for the visitor, record, papers, detector, X-ray, and
  interview; the embassy room remains visible while evidence opens in layers

## Run locally

No build step or dependencies are required. Open `index.html` directly, or
serve the folder for the most reliable browser behavior:

```bash
python3 -m http.server 4173
```

Then open <http://127.0.0.1:4173>.

## Project files

- `index.html` — page structure and accessible controls
- `styles.css` — the Veskarian embassy scene, responsive layout, and animation
- `app.js` — visitor data, inspections, decisions, consequences, and campaign
- `assets/generated/` — original visual assets used by the checkpoint and
  inspection overlays
- `DESIGN.md` — the living game design report
