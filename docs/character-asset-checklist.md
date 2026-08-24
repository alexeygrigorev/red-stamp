# Character asset checklist

Every new named visitor gets a complete asset set before being added to a
case. The `<slug>` is lowercase and stable, for example `mara-velen`.

## Required assets

| Asset | Filename | Use | Target |
| --- | --- | --- | --- |
| Full-body portrait | `assets/generated/<slug>-visitor.png` | ID fallback, inspection shortcuts, detector person layer | Transparent PNG; face and hands readable; no matte fringe |
| Scene cutout | `assets/generated/<slug>-visitor-scene.png` | Main checkpoint, case card, visitor/ask hotspots | Transparent PNG; full silhouette with comfortable margins; never stretched |
| Face/shoulders portrait | `assets/generated/<slug>-face.png` | Identity cards, appointment papers, clearance papers, legal papers, and correspondence papers | Newly rendered face/shoulders image; do not use a CSS crop of the full body |
| Personal X-ray | `assets/generated/xray-<slug>.png` | Bag X-ray inspection and the case-specific clue | 1536×1024 (3:2); character-specific contents and subtle clue |

## Animation asset

For a recurring visitor, add at least one real motion frame:

`assets/generated/<slug>-visitor-blink.png`

The frame must preserve the base portrait’s dimensions and transparent
silhouette. More elaborate visitors can add a small gesture frame set later,
but animation should never be faked by moving a static image alone.

## No separate asset required

- **Metal detector silhouette:** composed at runtime from the visitor’s
  full-body portrait over the detector frame.
- **Documents:** shared document-family backgrounds with live case text and
  the visitor’s dedicated face/shoulders asset.
- **Decision stamp:** one shared physical stamp plus the generated document and
  ink animation.

## Registration checklist

After generating the files:

1. Add the `scene`, `portrait`, and `face` paths to the character registry in
   `app.js` or the dossier sidecar as appropriate.
2. Add the X-ray filename and comparison note to `xray-art.js`.
3. Add the visitor to the case data with a unique `id`, evidence, purpose,
   dialogue, expected decision, and scenario rule.
4. Use the shared Mara style reference and the embassy background when judging
   a new render. The face must be recognizably the same person in the scene,
   dossier, and detector.
5. Composite every transparent asset on the dark embassy background and check
   edges at desktop and phone size.
6. Run the gates:

   ```bash
   npm run test:images
   npm run test:e2e
   ```

The image gate checks source dimensions, X-ray/dossier ratios, and rejects
`object-fit: fill`. The browser gate checks that the face appears in the
dossier, the X-ray is loaded, the detector uses the active visitor, and the
mobile scene does not overflow.
