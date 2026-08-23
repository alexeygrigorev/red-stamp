/**
 * Per-case X-ray raster targets for Red Stamp.
 *
 * The image files are kept in this sidecar so each case can select its own
 * scan without duplicating the visual policy in app.js. The raster files are
 * generated separately and validated before they are committed.
 */

const XRAY_ART = Object.freeze({
  "mara-velen": {
    filename: "assets/generated/xray-mara-velen.png",
    flag: "clear",
    prompt: "Top-down worn civilian zip satchel; phone, key ring, wallet, and folded umbrella, no concealed mass or undeclared device, muted blue-green dual-energy scan on a blue-black bed, no red glow.",
    compare: "CIV-1840 record: four ordinary shapes agree with the routine visit.",
    close: "Umbrella ribs, phone camera cluster, and wallet seams remain mundane on close inspection.",
  },
  "irena-sava": {
    filename: "assets/generated/xray-irena-sava.png",
    flag: "clear",
    prompt: "Top-down overfilled caregiver travel tote; medication, child’s metal toy, folded clothing, water bottle, and thin travel papers, no restricted item or hidden hard mass, the same calm blue-black/green instrument treatment, no red alert tint.",
    compare: "MED-2207 emergency record: medical and child-travel contents fit the hospital referral and guardian request.",
    close: "Toy core, bottle caps, and clothing layers are harmless details visible only when inspected closely.",
  },
  "viktor-dalen": {
    filename: "assets/generated/xray-viktor-dalen.png",
    flag: "authorized-but-alarming",
    prompt: "Top-down rigid military courier field satchel; one sidearm, compact radio, field dressing, and one sealed order packet, exactly one of each, no undeclared object, cool muted green scan lines on blue-black, no red weapon glow.",
    compare: "MIL-7710 record: compare the one sidearm and sealed packet with the authorized weapon line and current order.",
    close: "Radio antenna/knob pattern and field-dressing folds resolve only on closer inspection.",
  },
  "radan-kest": {
    filename: "assets/generated/xray-radan-kest.png",
    flag: "prohibited",
    prompt: "Top-down rugged contracted-security duffel; one sidearm, heavy tools, secure-comms gear, and one flat dense data capsule tucked beneath the lining, a quiet extra rectangular mass, no red glow or generic threat overlay.",
    compare: "AUX-4418 manifest: the capsule has no equipment entry and its serial must be checked against the blacklist.",
    close: "Taped-under-lining edge and a faint second serial band are visible only on close inspection.",
  },
  "olya-merin": {
    filename: "assets/generated/xray-olya-merin.png",
    flag: "prohibited",
    prompt: "Top-down slim legal folio; layered power-of-attorney papers, thin ID/personal-item stack, photocopy-weight witness-form layer, and one narrow encrypted microdrive taped inside the spine, no weapon, same blue-black/green scan, no red glow.",
    compare: "LEG-5109 record: the stamped original witness form is missing and the microdrive is not a declared item.",
    close: "Microdrive edge and tiny connector end appear only when the folder spine is inspected closely.",
  },
  "anton-ryl": {
    filename: "assets/generated/xray-anton-ryl.png",
    flag: "supernatural",
    prompt: "Top-down aged correspondence satchel; one sealed letter while the claimed small key is absent from the scan, the letter casts no shadow and a very faint offset person-shaped absence sits behind the bag, shared blue-black/green treatment, no red ghost or danger overlay.",
    compare: "COR-0000 record: compare the single letter and absent claimed key with the one-package record and missing sponsor.",
    close: "Missing letter shadow and faint second silhouette/negative exposure are barely legible until close inspection.",
  },
  "sorin-dask": {
    filename: "assets/generated/xray-sorin-dask.png",
    flag: "authorized-but-alarming",
    prompt: "Top-down hard engineer tool case; soldering iron, diagnostic probe, cables, repair tools, and one small black scanner module nested among them as a single unlisted-looking extra mass, no prohibited weapon, cool cyan-green scan on blue-black, no red alert tint.",
    compare: "ENG-1182 and Facilities record: the extra module is initially unlisted but its serial clears after verification.",
    close: "Tiny connector row and spare-board edge appear only on close inspection, without a spotlight.",
  },
  "director-vel": {
    filename: "assets/generated/xray-director-vel.png",
    flag: "prohibited",
    prompt: "Top-down structured executive portfolio; thin clearance card, official papers, phone, and one compact audio recorder tucked beneath the inner folio, recorder shown as a slightly denser rectangle with twin microphone holes, no red glow.",
    compare: "DIR-9011 restriction: compare the quiet recorder shape with the explicit no-recording-devices rule.",
    close: "Paired microphone apertures, small dial, and hidden-under-paper edge are visible only on close inspection.",
  },
  "nadiya-ost": {
    filename: "assets/generated/xray-nadiya-ost.png",
    flag: "clear",
    prompt: "Top-down soft family-document handbag; phone, wallet, notebook, and one small framed photograph, each an ordinary distinct mass with no extra device or restricted object, quiet blue-black/green scan noise, no red tint.",
    compare: "FAM-2403 record: four personal shapes fit the routine registry request and required paperwork.",
    close: "Nested photo frame and notebook coil resolve on close inspection but do not become a second device.",
  },
  "milan-vek": {
    filename: "assets/generated/xray-milan-vek.png",
    flag: "prohibited",
    prompt: "Top-down worn guard utility case; one service pistol, one spare magazine, one flat old credential shape, and a compact access-card duplicator with a near-duplicate card slot, same blue-black/green treatment, no red weapon glow or danger overlay.",
    compare: "GUA-6671 record: revoked credential, unauthorized pistol, and duplicator do not match a replacement-pass request.",
    close: "Paired card-slot outline and repeated credential-sized geometry are the subtle close-inspection clue.",
  },
  "elias-rhy": {
    filename: "assets/generated/xray-elias-rhy.png",
    flag: "supernatural",
    prompt: "Top-down plain document satchel; one red-stamped page rendered with only a tiny desaturated seal mark and one mismatched key, page visible inside an empty-looking pocket with no corresponding visitor shadow, shared blue-black/green scanner treatment, no red glow or physical contraband.",
    compare: "COR-0001 record: the page has no ministry, serial, date, or issuing origin despite being listed.",
    close: "Page edge remains visible while its expected shadow/body silhouette is absent, a quiet empty-space mismatch visible only on close inspection.",
  },
});

// Loaded as a classic browser script so the game can select a case-specific
// scan without introducing a bundler or module timing dependency.
window.RedStampXrayArt = XRAY_ART;
