# Red Stamp

_Red Stamp_ is a self-contained browser prototype about security control at the
embassy of the Union of Veskar.

The first playable version includes:

- Three randomized shifts and seventeen cases built from eleven named visitors
- Appointment and special-clearance arrival paths
- Appointment records, identity checks, physical documents, metal detection,
  bag X-ray, questioning, secondary inspection, and liaison calls
- Ordinary citizens, emergencies, Veskarian personnel, contractors, spies, and
  supernatural anomalies
- Daily tolerance, persistent career standing, public pressure, command
  pressure, security breaches, delayed case outcomes, and campaign endings
- A single-screen checkpoint instrument built from generated Veskarian
  environment art, character sprites, documents, X-ray panels, and animated
  inspection overlays
- A larger game-oriented typography pass, a generated Veskarian emblem/icon,
  and a generated desk-level stamp impact plate
- Generated sprites are also used inside the case card, checkpoint hotspots,
  decision buttons, and overlay shortcuts so the interface stays visual during
  interaction
- Clickable hotspots for the visitor, record, papers, detector, X-ray, and
  interview; the embassy room remains visible while evidence opens in layers
- Every run has a visible seed. Supplying `?seed=424242` replays the same case
  order and scenario variants; a new campaign gets a fresh seed

## Gameplay UI options

The current gameplay surface is `#c` (or no hash). Use `#a` for the guided
review layout or `#b` for the evidence-desk layout. Once a shift begins, the
small UI switcher at the top lets you move between CURRENT, A, and B without
losing the case state.

## Run locally

No build step or dependencies are required. Open `index.html` directly, or
serve the folder for the most reliable browser behavior:

```bash
python3 -m http.server 4173
```

Then open <http://127.0.0.1:4173>.

The project also has a browser smoke suite. It launches Playwright Chromium,
checks the seeded campaign, dedicated dossier face assets, per-character
X-rays, keyboard controls, and the 390px mobile layout:

```bash
npm install
npm run test:images
npm run test:e2e
```

## Project files

- `index.html` — page structure and accessible controls
- `styles.css` — the Veskarian embassy scene, responsive layout, and animation
- `immersive-console.css` — the framed physical workstation treatment
- `app.js` — visitor data, inspections, decisions, consequences, and campaign
- `scripts/playwright-smoke.mjs` — repeatable desktop/mobile browser checks
- `assets/generated/` — original visual assets used by the checkpoint and
  inspection overlays
- `DESIGN.md` — the living game design report
- `docs/character-asset-checklist.md` — required assets for every new visitor
- `docs/declared-concealed-evidence.md` — the declared/observed/resolved
  evidence model and randomized character truth rules
- `docs/immersion-reference.md` — research notes and the interaction grammar
