# Visitor background audit

Every registered `CHARACTER_ART` family is judged in the real current reference
frame, not on a checkerboard or in isolation. The audit mounts `index.html`
through a temporary local static server, starts a seeded shift, and renders each
registered character’s scene cutout, full-body portrait, and dedicated
face/shoulders asset over the current dark `checkpoint-background-v3.png`
checkpoint background. The current registry contains 11 characters and 33
audited image assets.

Run it from the project root:

```sh
npm run audit:visitor-backgrounds
```

The generated review files are written to the ignored directory
`tmp/visitor-background-audit/`:

- `background-contact-sheet.png` — every visitor in the full reference
  checkpoint scene using the registered scene cutout;
- `head-contact-sheet.png` — enlarged scene head crops for sharpness, identity,
  clipping, and edge review;
- `portrait-background-contact-sheet.png` and
  `portrait-head-contact-sheet.png` — the same full composite and enlarged
  head review for each registered full-body portrait;
- `face-background-contact-sheet.png` and `face-crop-contact-sheet.png` — the
  same full composite and enlarged face review for each dedicated
  face/shoulders asset;
- `<visitor>-background.png` and `<visitor>-head.png` — the backwards-compatible
  scene outputs;
- `<visitor>-portrait-background.png` and `<visitor>-portrait-head.png` — the
  full-body portrait outputs;
- `<visitor>-face-background.png` and `<visitor>-face-crop.png` — the dedicated
  face/shoulders outputs;
- `checkpoint-background.png` — the rendered current background by itself;
- `manifest.json` — viewport, all three source paths per character, alpha
  bounds, rendered bounds, crop bounds, objective matte telemetry, review
  flags, and any validation messages.

Each asset kind is intentionally mounted into the same explicit reference
visitor slot,
`[data-ref-view="threshold"] > [data-ref-slot="visitor-scene"]`, so the
composite is produced by the real checkpoint layout. For the scene, portrait,
and face passes alike, the Playwright wait checks that this slot’s `currentSrc`
equals the requested registered path and that its natural dimensions are
nonzero. This prevents a portrait or face pass from silently capturing the
previous scene image.

The command exits nonzero when a registered asset is missing, cannot be loaded,
has no usable transparent silhouette, is implausibly narrow or short, does not
render at its source dimensions, is substantially clipped by the reference
stage, or leaves the head/face crop too small or mostly outside the frame. The
contact sheets are still a human review gate: confirm that the background
remains legible behind the visitor, the visitor sits naturally in the threshold,
the face is readable, all three views preserve identity, and there is no matte,
checkerboard, or unexpected composited object.

## Matte-risk telemetry

For each transparent source asset, the browser canvas scan records:

- `semiTransparentPixels` — all pixels with alpha between 1 and 254;
- `edgeSemiTransparentPixels` — semi-transparent pixels adjacent to a pixel
  below the 16-alpha silhouette threshold;
- `brightFringePixels` — those edge pixels after compositing against the
  representative dark backing `#090807`, where resulting luminance is at least
  80;
- `brightFringeCoverage`, `brightFringeRatio`, and `maxCompositeLuma` — the
  normalized counts and brightest simulated edge result;
- `level` — `none`, `low`, `medium`, or `high` using stable count/ratio bands.

This is an objective triage signal for pale matte residue or a bright
semi-transparent fringe. It is advisory and does not replace visual judgment:
colored rim light can be intentional, while a fully opaque wrong-background
render can have no semi-transparent fringe at all. A `medium` or `high` flag, or
any visible halo in a contact sheet, requires human review and usually a
complete character-family redraw.

## Generation-pipeline step

After generating or redrawing any visitor asset:

1. Register the scene, portrait, and face paths in `CHARACTER_ART` (and the
   fallback map only when the visitor is intentionally generic).
2. Run `npm run test:assets` for source dimensions, aspect-ratio checks, and the
   real-background screenshot audit.
3. Review the appropriate full-composite and enlarged-crop contact sheets,
   including all three views for a changed character. Regenerate the complete
   family if the person is clipped, too small, visually detached from the
   background, visibly carries a different edge/style treatment from the Mara
   anchor, or loses identity between scene, portrait, and face.
4. Run `npm run test:e2e` before merging the asset registration.

The audit intentionally does not modify runtime code or generated assets. Its
screenshots are review artifacts only and are ignored by Git.

## Latest 11-character review

The latest seeded run audited all 33 registered assets. All assets loaded,
rendered, and produced full composites and crops; no automated clipping or
dimension failure was reported. The following are the concrete human-review
findings from the generated sheets:

| Character | Scene cutout | Full-body portrait | Face / shoulders | Edge telemetry | Finding |
| --- | --- | --- | --- | --- | --- |
| Anton Ryl | Pass | Pass | Pass | scene low (15), portrait low (15) | Readable and coherent; inspect the small warm edge rim at the hair/shoulder boundary. |
| Director Vel Ordan | Pass | Pass | Pass | scene low (53), portrait low (53) | Strong contrast and identity; review the warm semi-transparent rim, especially around the head and coat. |
| Elias Rhy | Pass | Pass | Pass | scene low (12), portrait low (12) | Face reads, but the dark lower coat recedes into the room; check separation at game size. |
| Irena Sava | Pass | Pass | Pass | none | Clean family after the redraw; face and scene remain readable against the dark room. |
| Mara Velen | Pass | Pass | Pass | face low (36) | Canonical style anchor; face has a small warm edge signal but no visible matte failure. |
| Milan Vek | Pass | Pass | Pass | scene low (33), portrait low (33) | Identity and silhouette hold; dark trousers/coat need a quick contrast check on dim displays. |
| Nadiya Ost | Pass | Pass | Pass | portrait low (5), face low (187) | Identity holds; enlarged face crop shows the most noticeable warm hair/shoulder fringe after Radan’s asset mismatch. |
| Olya Merin | Pass | Pass | Pass | scene low (6), portrait low (4), face low (3) | Readable red jacket and face; inspect the thin orange hair rim, otherwise coherent. |
| Radan Kest | Pass | Pass | **Fail human review** | none | Dedicated `radan-face.png` is a different render/identity (bald, different facial hair, circular marks) from the cropped-hair bearded scene and portrait. Redraw the complete Radan family before registration. |
| Sorin Dask | Pass | Pass | Pass | scene low (25), portrait low (25) | Good identity match; red shirt and orange rim remain visible without a clear matte halo. |
| Viktor Dalen | Pass | Pass | Pass | scene low (98), portrait low (98) | Readable and coherent; highest scene/portrait bright-edge count, so inspect the warm hair/shoulder rim at 1×. |

The low telemetry flags are review prompts, not automatic failures. Radan is a
human-review failure despite `none` telemetry because identity/style mismatch is
not reliably detectable from alpha edges.
