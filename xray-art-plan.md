# Red Stamp X-ray art plan

This is an art-generation sidecar for the eleven named visitors in `app.js`. It owns no runtime wiring and does not replace the existing generic scan assets. Every case gets a separate raster target so the parent can later select the correct image by case id.

## Source and existing references

The case data is the source of truth for the scan contents and outcomes:

- Shift 01 / Morning Intake: `mara-velen`, `irena-sava`, `viktor-dalen`, `radan-kest`, `olya-merin`, `anton-ryl`.
- Shift 02 / Red Weather: `sorin-dask`, `director-vel`, `nadiya-ost`, `milan-vek`, `elias-rhy`.

Existing X-ray references inspected:

- `assets/generated/xray-clear.png` — primary reference for the centered soft bag, zipper/handle framing, transparent fabric, scan noise, and cyan-green linework.
- `assets/generated/xray-threat.png` — useful only for the alternate object arrangement and density hierarchy. Its red device glow is explicitly not a target treatment.
- `assets/generated/xray-anomaly.png` — useful only for the old correspondence-bag geometry and layered/offset silhouette idea. Its red ghost figure and red frame are explicitly not a target treatment.

The current references are generic. Do not reuse them as the final art for a named visitor, and do not make a prohibited or supernatural case look like a different scanner mode.

## Shared style requirements

Use the same instrument for every target: a 1536 × 1024 landscape, top-down dual-energy bag scan with a dark blue-black field, a centered bag occupying roughly 80–88% of the frame, a thin scan bed/grid, zipper and handle contours, restrained phosphor noise, and transparent layered fabric. Keep the object edges in the existing muted blue-green/oxidized-green range, with density shown by line weight and slightly brighter green-gray fills.

All eleven images must share the same blue-black/green instrument treatment. The category is metadata, not a color filter. In particular:

- No obvious red threat tint, red object glow, red ghost silhouette, hazard triangle, exclamation icon, flame, blood, or generic danger overlay.
- No giant spotlight or high-contrast halo around the suspicious object. A bad clue should be a quiet shape, count, edge, serial band, missing outline, or shadow inconsistency.
- If a hairline calibration mark is retained from the existing reference, keep it nearly black and neutral; it must never identify the case outcome.
- Use no generated labels, captions, legible UI, or invented serial text inside the raster. The game UI and record provide that context.
- Keep every object physically plausible in the bag except the two anomaly clues. Avoid adding weapons, electronics, or documents not named in the case data.
- Role and wardrobe should change the bag silhouette and material, not the scan’s moral color: soft civilian tote/satchel, overfilled caregiver bag, rigid military field satchel, rugged auxiliary kit, flat legal folio, hard engineer tool case, structured director portfolio, and aged correspondence satchel.

Evidence language used below:

- **[COMPARE]** means the scan alone is deliberately ambiguous. The player must compare the object count, shape, authorization, serial, or missing item against the case record/manifest.
- **[CLOSE]** means the clue is a low-contrast detail intended to appear only after opening the scan or inspecting it closely: a taped edge, duplicated outline, tiny connector pattern, absent shadow, or faint second exposure.
- A clear case can still have a `[CLOSE]` inspection note; that note is a confirmation of ordinary construction, never a hidden threat.

## Case-by-case targets

### `mara-velen` — clear civilian

- Target: `assets/generated/xray-mara-velen.png`
- Silhouette: worn everyday zip satchel or soft commuter tote, relaxed fabric folds, civilian proportions.
- Prompt: “Top-down muted blue-green dual-energy scan of a worn civilian zip satchel on a blue-black instrument bed; phone, key ring, wallet, and folded umbrella arranged as ordinary separate masses, no concealed mass and no undeclared device, low-contrast phosphor linework, no red glow or danger overlay.”
- Flag: **clear**.
- **[COMPARE]** The four ordinary shapes should agree with the routine CIV-1840 visit; there is no fifth object to reconcile.
- **[CLOSE]** Umbrella ribs, phone camera cluster, and wallet seams may resolve on inspection, but must remain mundane.

### `irena-sava` — clear emergency parent

- Target: `assets/generated/xray-irena-sava.png`
- Silhouette: overfilled soft caregiver/travel tote with a broad base and folded child clothing creating gentle layers.
- Prompt: “Top-down overfilled caregiver travel tote in the same blue-black/green scanner treatment; medication bottles and blister pack, a small child’s metal toy, folded clothing, water bottle, and thin travel papers, no restricted item or hidden hard mass, soft pale medical-green density, no red alert tint.”
- Flag: **clear**.
- **[COMPARE]** Compare the medical/child-travel contents with emergency case MED-2207, guardian papers, and the hospital referral; the context makes the contents plausible rather than automatically safe.
- **[CLOSE]** The toy’s small metal core, bottle caps, and layered clothing should be visible only on closer inspection and remain harmless.

### `viktor-dalen` — authorized but alarming military courier

- Target: `assets/generated/xray-viktor-dalen.png`
- Silhouette: compact rigid military field satchel with reinforced corners and a narrow sealed-order compartment; angular contents, not a civilian tote.
- Prompt: “Top-down rigid military courier field satchel, blue-black bag with cool muted green scan lines; one sidearm, compact radio, field dressing, and one sealed order packet with a narrow cord seam, exactly one of each, no undeclared object, calm uniform exposure, no red weapon glow.”
- Flag: **authorized-but-alarming**.
- **[COMPARE]** The sidearm count and sealed packet must be checked against MIL-7710 and the record’s ‘sidearm authorized’ line; the alarm is real but authorized.
- **[CLOSE]** Let the radio antenna/knob pattern and field-dressing folds emerge only when zoomed; do not spotlight the pistol.

### `radan-kest` — prohibited auxiliary device

- Target: `assets/generated/xray-radan-kest.png`
- Silhouette: rugged tactical duffel with modular dividers, dense equipment clustered at one end, and a visible inner lining layer.
- Prompt: “Top-down rugged contracted-security duffel in the same restrained blue-green X-ray palette; one sidearm, heavy tools, secure-comms gear, and one flat dense data capsule tucked beneath the lining, the capsule a quiet extra rectangular mass with no glow, no generic threat overlay.”
- Flag: **prohibited** — undeclared/blacklisted capsule.
- **[COMPARE]** The sidearm and tools fit the AUX-4418 equipment line, but the extra capsule has no manifest entry and its serial must be compared with the blacklist.
- **[CLOSE]** The capsule’s taped-under-lining edge and a faint second serial band are the close-inspection clue; keep it nearly the same green-gray density as the tools.

### `olya-merin` — prohibited legal spy

- Target: `assets/generated/xray-olya-merin.png`
- Silhouette: slim structured legal folio/briefcase with stacked paper planes and a rigid spine; flatter and more orderly than a civilian bag.
- Prompt: “Top-down slim legal folio in muted archival blue-green scan lines; layered power-of-attorney papers, a thin ID/personal-item stack, and a photocopy-weight witness-form layer, with one narrow encrypted microdrive taped inside the folder spine as the only undeclared mass, no weapon, no red glow.”
- Flag: **prohibited** — undeclared microdrive and missing original witness form.
- **[COMPARE]** Compare the paper stack against LEG-5109: the required stamped original is not present, and the microdrive is not a declared document or device.
- **[CLOSE]** The microdrive is a slim dark rectangle aligned with the folio spine; its taped edge and tiny connector end should be discoverable only on close inspection.

### `anton-ryl` — supernatural correspondence anomaly

- Target: `assets/generated/xray-anton-ryl.png`
- Silhouette: aged narrow correspondence satchel/envelope case with worn seams, deliberately echoing the anomaly reference without its red treatment.
- Prompt: “Top-down aged correspondence satchel in the shared blue-black/green instrument treatment; one sealed letter, while the claimed small key is absent from the scan, with the letter outlined but casting no shadow and a very faint offset person-shaped absence behind the bag, no physical contraband, no red ghost or danger overlay.”
- Flag: **supernatural**.
- **[COMPARE]** Compare the single letter and absent claimed key with COR-0000’s one-package record and missing sponsor; the package count is correct but the record cannot explain the absence.
- **[CLOSE]** The letter’s missing cast shadow and the faint second silhouette/negative exposure are the supernatural clue; keep both barely legible until close inspection.

### `sorin-dask` — authorized but alarming engineer module

- Target: `assets/generated/xray-sorin-dask.png`
- Silhouette: compact hard-sided engineer tool case with fitted recesses, cable loops, and long tool silhouettes.
- Prompt: “Top-down hard engineer tool case, blue-black shell with cool cyan-green instrument lines; soldering iron, diagnostic probe, cables, and ordinary repair tools, plus one small black scanner module nested among them as a single unlisted-looking extra mass, no prohibited weapon, no red alert tint.”
- Flag: **authorized-but-alarming** — review item cleared by Facilities.
- **[COMPARE]** Compare the extra module with ENG-1182’s diagnostic-tool list and the Facilities serial confirmation; it is initially unlisted but becomes authorized after verification.
- **[CLOSE]** The module’s tiny connector row and spare-board edge should be visible only on close inspection, without a spotlight or warning color.

### `director-vel` — prohibited recording device

- Target: `assets/generated/xray-director-vel.png`
- Silhouette: structured leather executive portfolio with clean rectangular document layers and a shallow inner pocket.
- Prompt: “Top-down structured executive portfolio in the same calm blue-black/green scan; thin clearance card, official papers, phone, and one compact audio recorder tucked beneath the inner folio, the recorder only a slightly denser rectangle with twin microphone holes, no red glow or status overlay.”
- Flag: **prohibited** — recording equipment forbidden by the priority file.
- **[COMPARE]** The portfolio contents must be compared with DIR-9011’s explicit ‘no recording devices’ restriction; the device is not dangerous-looking and the visitor is otherwise authorized.
- **[CLOSE]** The paired microphone apertures, small dial, and hidden-under-paper edge are the close-inspection clue.

### `nadiya-ost` — clear civilian

- Target: `assets/generated/xray-nadiya-ost.png`
- Silhouette: soft family-document handbag with a broad, slightly sagging base and a separate paper sleeve.
- Prompt: “Top-down soft family-document handbag in the established blue-black/green instrument look; phone, wallet, notebook, and one small framed photograph, each a distinct ordinary mass with no extra device or restricted object, quiet scan noise, no red tint.”
- Flag: **clear**.
- **[COMPARE]** The four personal shapes fit the routine FAM-2403 registry request and do not conflict with its required identity card/payment receipt paperwork.
- **[CLOSE]** The photograph’s nested frame and notebook coil may be resolved on close inspection; they must not resemble a second device.

### `milan-vek` — prohibited former-guard kit

- Target: `assets/generated/xray-milan-vek.png`
- Silhouette: worn rigid guard utility case with reinforced base, one dense weapon channel, and a shallow credential pocket.
- Prompt: “Top-down worn guard utility case in the same blue-black/green scan treatment; one service pistol, one spare magazine, one flat old credential shape, and a compact access-card duplicator with a near-duplicate card slot, no red weapon glow, no generic danger overlay.”
- Flag: **prohibited** — unauthorized weapon and access-card duplicator.
- **[COMPARE]** Compare the pistol and credential shapes with revoked GUA-6671: the weapon has no current authorization, and the duplicator is not a replacement token.
- **[CLOSE]** The duplicator’s paired card-slot outline and repeated credential-sized geometry are the close clue; keep the duplicate shape subtle but unambiguous after zoom.

### `elias-rhy` — supernatural return anomaly

- Target: `assets/generated/xray-elias-rhy.png`
- Silhouette: plain document satchel/envelope case, flatter and cleaner than Anton’s aged bag, with an empty interior pocket.
- Prompt: “Top-down plain document satchel on the shared blue-black/green scanner bed; one red-stamped page rendered as a subdued paper shape with only a tiny desaturated seal mark, and one mismatched key, the page visible inside an empty-looking pocket with no corresponding visitor shadow, no physical contraband, no red glow.”
- Flag: **supernatural**.
- **[COMPARE]** Compare the single page against COR-0001: it has no ministry, serial, date, or issuing record even though the case file says one page exists.
- **[CLOSE]** The page’s edge remains present while its expected shadow/body silhouette is absent, producing a quiet empty-space mismatch visible only on close inspection.

## Generation and handoff checklist

For each target, generate one raster at the shared canvas size and preserve the filename exactly. Review at normal UI size and at 200%: at normal size the bag and declared contents must read; at 200% the specified `[CLOSE]` clue must be findable without a red highlight. Confirm that every prohibited, undeclared, or supernatural distinction is carried by the listed object/absence and record comparison, not by a global tint or threat graphic. Keep the three existing generic X-rays untouched as references.
