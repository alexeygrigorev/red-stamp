# Current-surface gameplay audit

`npm run audit:gameplay` is the end-to-end Playwright audit for the current
iframe-based reference game. It starts `index.html`, waits for the mounted
`reference/desktop.html` or `reference/mobile.html` frame, and drives the
visible `data-ref-*` surface. It does not start or assert against the obsolete
legacy overlay as the game UI.

Run it from the project root:

```sh
npm run audit:gameplay
```

Use a different deterministic campaign when needed:

```sh
AUDIT_SEED=424242 npm run audit:gameplay
```

The command launches its own temporary Python static server and Chromium
instance. Review artifacts are written to the ignored directory
`tmp/audit-gameplay/`:

- `manifest.json` — viewport/case coverage, screenshots, passed checks, and
  structured failures;
- `desktop-*.png` and `mobile-*.png` — welcome, every visitor window, the six
  first-case inspection stages, representative outcomes, stamp motion,
  shift-end screens, and game over;
- the case window captures are the dark-background review pass for every
  seeded campaign visitor.

## Coverage contract

The harness traverses every case in the seeded three-shift campaign on both
1440×900 desktop and 390×844 mobile viewports. For every case it checks the
visitor scene and current asset mapping, then opens all six sources:

1. `01 · ROUTE / FILE` — appointment;
2. `02 · FACE / ID` — identity comparison;
3. `03 · PAPERS` — all three document sheets;
4. `04 · PERSON / GATE` — every detector tray item;
5. `05 · BAG / SCAN` — density scan, open-bag mode, every generated bag item,
   and the `?` explanation;
6. `06 · STATEMENT` — the question log and a question choice.

Each source is marked with Match, Flag, or Review, all six marks are checked in
state, and findings are submitted before authority actions are used. The audit
exercises the visible terminal actions (Red Stamp/admit, Secondary Inspection,
and Deny Entry), calls the visible liaison action when present, advances cases,
checks stamp motion, and checks shift-end, final game-over, and restart
behavior.

## Failure policy

The process exits nonzero when any check fails. Failures include:

- a control that cannot be clicked or a state transition that does not occur;
- a missing active stage, missing asset, failed image request, or stale label;
- a visible interactive surface without native/ARIA keyboard semantics or an
  accessible name;
- document overflow, controls without usable layout boxes, or stretched images;
- state mismatches for reveal, marks, submission, authority, resolution,
  advancement, shift-end, game-over, or restart.

The current-surface audit records a missing submit control and the missing
visible liaison control as findings when they are absent. After recording those
findings it uses `window.RedStampDebug.actions.submit()` or an engine-only
next-shift recovery action only to keep the complete seeded campaign traversal
running; those recovery calls are reported separately in `manifest.json` and do
not count as current-surface coverage.

This is a review harness, not an asset generator or runtime fixer. It does not
modify `app.js`, reference HTML/bridge files, character assets, or voice files.
