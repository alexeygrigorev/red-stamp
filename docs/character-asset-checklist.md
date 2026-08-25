# Character asset checklist

Every new named visitor gets a complete asset set before being added to a
case. The `<slug>` is lowercase and stable, for example `mara-velen`.

## Required assets

| Asset | Filename | Use | Target |
| --- | --- | --- | --- |
| Full-body portrait | `assets/generated/<slug>-visitor.png` | ID fallback, inspection shortcuts, detector person layer | Transparent PNG; face and hands readable; no matte fringe |
| Scene cutout | `assets/generated/<slug>-visitor-scene.png` | Main checkpoint, case card, visitor/ask hotspots | Transparent PNG; full silhouette with comfortable margins; never stretched |
| Face/shoulders portrait | `assets/generated/<slug>-face.png` | Identity cards, appointment papers, clearance papers, legal papers, and correspondence papers | Newly rendered face/shoulders image; do not use a CSS crop of the full body |
| Metal-detector plate | `assets/generated/detector-<slug>.png` | Character-specific gate inspection | 1536×1024 (3:2); full detector composition with the correct visitor silhouette, posture, clothing, carried metal, and scan lighting; no HTML body composite |
| Personal X-ray | `assets/generated/xray-<slug>.png` | Bag X-ray inspection and the case-specific clue | 1536×1024 (3:2); character-specific contents and subtle clue |

## Animation asset

For a recurring visitor, add at least one real motion frame:

`assets/generated/<slug>-visitor-blink.png`

The frame must preserve the base portrait’s dimensions and transparent
silhouette. More elaborate visitors can add a small gesture frame set later,
but animation should never be faked by moving a static image alone.

## Shared systems

- **Documents:** shared document-family backgrounds with live case text and
  the visitor’s dedicated face/shoulders asset.
- **Decision stamp:** one shared physical stamp plus the generated document and
  ink animation.

The detector is deliberately not a shared system anymore. A generic frame with
a CSS-filtered body silhouette makes every visitor feel like the same person.
Each character receives a composed detector plate. The runtime can use the old
frame composite only as a temporary fallback while the character batch is
being generated.

## Character generation pipeline

Mara Velen and the main inspector cutout are the canonical style anchor for every named visitor. Every image
generation request must include a reference image: use the matching Mara asset
for the asset being generated—`mara-visitor.png` for a full-body render,
`mara-visitor-scene.png` for a checkpoint cutout, `mara-face.png` for a
document portrait, `detector-mara-velen.png` for a detector plate, and
`xray-mara-velen.png` for a scan plate. Include the current character asset as
an identity/wardrobe reference as well, so style can change without losing the
person, props, or case clue. Accepted sharpness references such as Viktor Dalen
and Anton Ryl may be included as quality bars, but Mara remains the authority.
A character may change face, clothing, posture, age, carried objects, and
palette accents, but must retain the same Veskarian painterly rendering:
controlled dark edges, hand-painted material texture, restrained red/brass rim
light, and a low-key charcoal background. Do not use an older visitor as the
style authority just because that visitor has similar clothing.

Before registration, review a five-image character strip (scene, portrait,
face, detector, and X-ray) beside the Mara strip. Reject the batch if one
asset looks like a different illustration model, has a different edge/matte
treatment, uses a different light direction, or loses identity across views.
When a visitor fails this comparison, regenerate the complete character
family—not only the asset where the mismatch was first noticed. Irena Sava,
Radan Kest, Nadiya Ost, and Olya Merin have been brought through this stricter
style-lock pass; the regenerated Mara family is now the sharpness anchor for
future batches.

Radan Kest’s redraw is the reference implementation of that rule: his scene,
full-body, and face assets were regenerated as one family against the main
inspector/Mara rendering, while retaining his cropped hair, beard, stocky build,
and security-team role. His matte charcoal field clothing replaces the older
glossier tactical treatment. Future redraws should follow the same order and
must not leave one old-style view registered beside two new ones.

Use this order for every new named visitor:

1. **Style anchor:** send the approved Mara dark-background character render,
   the embassy background, and the current character brief as references. Keep
   the same painterly Veskarian material language, edge treatment, and light
   direction; change the person, clothing, posture, and story.
2. **Scene cutout:** generate the full-body visitor and a separate checkpoint
   cutout with comfortable transparent margins.
3. **Face shot:** generate a new face-and-shoulders image for documents. Do not
   crop the body render with CSS or use a full torso in an ID portrait.
4. **Detector plate:** generate a complete 3:2 detector image using the same
   character as reference. Show the person standing naturally inside the gate,
   with their actual silhouette, clothing, hairstyle, posture, and carried
   metal. If a scenario changes the declared equipment, the scan clue may
   change, but the person must remain unmistakably the same.
5. **X-ray plate:** generate the character-specific bag contents separately.
   The good/bad distinction must be subtle: an extra shape, count, serial tag,
   or unusual placement—not a giant red warning.
6. **Motion frame:** add a blink or small gesture frame for recurring visitors.
7. **Dark-edge cleanup:** remove white matte pixels and checkerboard residue;
   inspect every transparent asset over the actual dark embassy background.
8. **Registration:** add scene, portrait, face, detector, and X-ray paths to
   `CHARACTER_ART`/`xray-art.js`, then record the declared, observed, and
   concealed evidence in the case data.
9. **Validation:** check natural aspect ratios, no stretching, matching
   identity across all assets, and desktop/mobile screenshots before merging.
   Run `npm run audit:visitor-backgrounds` and review its full-background and
   head-crop contact sheets before accepting a new or regenerated scene asset.

### Detector prompt contract

The detector prompt must describe a complete asset, not a request to paste a
sprite into a generic frame:

> Original Veskarian embassy metal-detector inspection plate, 3:2 landscape.
> Use the supplied character and dark embassy references. Show the same person
> standing naturally inside a worn charcoal detector arch, with their actual
> hairstyle, clothing, proportions, posture, and declared carried items. Use a
> restrained teal scan glow, dark red/brass edge lighting, and readable empty
> instrument space. No labels, no warning text, no extra people, no white
> background, no checkerboard, no stretched anatomy.

## Registration checklist

After generating the files:

1. Add the `scene`, `portrait`, `face`, and `detector` paths to the character registry in
   `app.js` or the dossier sidecar as appropriate.
2. Add the X-ray filename and comparison note to `xray-art.js`.
3. Add the visitor to the case data with a unique `id`, evidence, purpose,
   dialogue, expected decision, and scenario rule.
4. Use the shared Mara style reference and the embassy background when judging
   a new render. The face must be recognizably the same person in the scene,
   dossier, detector, and X-ray context.
5. Composite every transparent asset on the dark embassy background and check
   edges at desktop and phone size.
6. Run the gates:

   ```bash
   npm run test:assets
   npm run test:e2e
   ```

The image gate checks source dimensions, X-ray/dossier/detector ratios, and
rejects `object-fit: fill`. The browser gate checks that the face appears in the
dossier, the X-ray is loaded, the detector prefers the active visitor’s
dedicated plate when registered, and the mobile scene does not overflow.
