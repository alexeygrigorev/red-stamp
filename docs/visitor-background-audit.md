# Visitor background audit

The scene cutout is judged in the real current reference frame, not on a
checkerboard or in isolation. The audit mounts `index.html` through a temporary
local static server, starts a seeded shift, and renders each distinct visitor
scene asset from the existing `CHARACTER_ART`/`VISITOR_ART` mapping over the
current `checkpoint-background-v3.png` checkpoint background.

Run it from the project root:

```sh
npm run audit:visitor-backgrounds
```

The generated review files are written to the ignored directory
`tmp/visitor-background-audit/`:

- `background-contact-sheet.png` — every visitor in the full reference
  checkpoint scene, with the current frame composition and background;
- `head-contact-sheet.png` — enlarged crops of the upper/head region for a
  quick sharpness, identity, clipping, and edge check;
- `<visitor>-background.png` and `<visitor>-head.png` — individually named
  source images for closer review;
- `checkpoint-background.png` — the rendered current background by itself;
- `manifest.json` — viewport, source asset, alpha bounds, rendered bounds, and
  any validation messages.

The command exits nonzero when a mapped scene file is missing, cannot be
loaded, has no usable transparent silhouette, is implausibly narrow or short,
does not render at its source dimensions, is substantially clipped by the
reference stage, or leaves the head crop too small or mostly outside the
frame. The contact sheets are still a human review gate: confirm that the
background remains legible behind the visitor, the visitor sits naturally in
the threshold, the face is readable, and there is no matte, checkerboard, or
unexpected composited object.

## Generation-pipeline step

After generating or redrawing a visitor’s scene cutout:

1. Register the scene path in `CHARACTER_ART` (and the fallback map only when
   the visitor is intentionally generic).
2. Run `npm run test:assets` for source dimensions, aspect-ratio checks, and
   the real-background screenshot audit.
3. Review both contact sheets and the individual head crop for the changed
   visitor. Regenerate the scene if the person is clipped, too small, visually
   detached from the background, or visibly carries a different edge/style
   treatment from the Mara anchor.
4. Run `npm run test:e2e` before merging the asset registration.

The audit intentionally does not modify runtime code or generated assets. Its
screenshots are review artifacts only and are ignored by Git.
