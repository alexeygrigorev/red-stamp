# Typography & contrast audit — reference UI

Scope: the live "reference" checkpoint UI (`reference/desktop.html`,
`reference/mobile.html`, driven by `reference/reference-bridge.js`). This is
the visible current-surface game — not the hidden legacy overlay in
`app.js`.

Method: ran `npm run audit:gameplay` to drive the full seeded campaign on a
1440×900 desktop viewport and a mobile viewport, capturing full-page
screenshots at every screen (welcome, all 6 inspection sources, document
sheets, X-ray modes, outcomes, stamp animation, shift-end). Reviewed the
screenshots directly, pulled the actual inline `style="color:...background:..."`
values out of the two template files, and computed WCAG relative-luminance
contrast ratios for every distinct text color against its panel background.
A second pass used the Fable model purely for a creative/legibility read of
the same screenshots (typography feel, visual hierarchy, "distracting"
elements), independent of the contrast math.

## 1. Measured contrast failures (fixed)

All of the game's small meta/label/caption text (7–13px, heavy letter-spacing,
all-caps) used one of four muted tones. Checked against the checkpoint
panel background (`linear-gradient(#1a1411,#0d0a09)`, using the lighter
`#1a1411` end as the worst case):

| Color | Used for | Ratio before | Ratio after | New color |
|---|---|---|---|---|
| `#6e5f47` | "OPEN" row status (every unopened checklist item), default "NOT YET MARKED" caption, welcome-screen footer strip, keyboard-shortcut hint bar, "FILE COPY"/"CAM 02 · LIVE" captions, mobile shift sub-header | **2.94:1** | 5.12:1 | `#9a8560` |
| `#7a6748` | Row index numbers ("01"–"06") in the verification-card list | **3.35:1** | 5.12:1 | `#9a8560` (merged into the tier above) |
| `#8a7458` (as text; the same hex used as a hover `border-color` was left alone) | Percent signs, `RETURN`/`LIVE` hints, `SEAL`/`STAMP`/`STATUS`/`DECLARED`/`METAL` field labels, `HOLD`/`TURN BACK` sub-labels, "EXAMINER" speaker label, case-meta line, "CLICK AN OBJECT TO LOOK CLOSER" hints | **4.10:1** | 5.48:1 | `#a08a63` |
| `#6e7f5c` | "M" hotkey letter under the MATCH button | 4.21:1 | 5.46:1 | `#7c9468` |
| `#a06254` | "F" hotkey letter under the FLAG button | **3.79:1** | 4.91:1 | `#b47562` |

Bold ratios are the ones that failed WCAG AA for normal text (4.5:1) — all of
this text is 7–13px, well under the "large text" threshold where 3:1 would
apply, so 4.5:1 is the correct bar. `#6e5f47` was the worst offender by far,
and it happened to be the color used for the **"OPEN" status word on every
un-reviewed checklist row** — the single most-repeated, gameplay-relevant
piece of state text in the whole UI.

The section-label tier (`#a8916a`, e.g. "SHIFT TOLERANCE", "CAREER STANDING")
was already a comfortable 6.01:1 and was left unchanged; the fixes above were
picked to stay a visible step dimmer than that tier so the existing
label > hint > status hierarchy survives, just with a higher accessibility
floor.

**Applied to:** `reference/desktop.html`, `reference/mobile.html`, and
`reference/reference-bridge.js` (the bridge duplicates several of these
colors at runtime — e.g. it re-sets the "OPEN"/mark-status color on every
state sync — so both the static template and the bridge's live-update logic
were changed together; otherwise the bridge would have reverted the fix on
the first click).

## 2. Font-size experiment (applied)

You asked to try larger type for readability, checked on both your desktop
viewport and a Pixel 7A (≈412×915 CSS px, ~2.6 DPR — the closest standard
preset available, since Chrome doesn't ship an exact "Pixel 7a" viewport
entry). The reference UI's mobile canvas is a **fixed 390×844 design**,
scaled uniformly to fit whatever the actual viewport is (`data-fit`
transform in `reference-bridge.js`) — so testing at 412×915 doesn't change
any internal proportions vs. 390×844, only how large the whole scaled canvas
appears on your actual phone. What matters for breakage is the fixed-canvas
internal layout, which is what the audit's overflow/layout assertions check.

Applied: every `font-size` from 7px–11px across `desktop.html`, `mobile.html`,
and `reference-bridge.js` bumped by +1px (7→8, 8→9, 9→10, 10→11, 11→12).
This covers essentially every meta/label/caption in the UI — row labels,
status words, field labels, hint text, footer copy, the keyboard-shortcut
popover, hotkey letters. The large Staatliches display type (headlines,
stat numbers, 18px+ body/quote text) was left untouched; it was already
comfortably sized and legible.

Verification: re-ran `npm run audit:gameplay` after the edit. It asserts
(per case, per viewport) that the document never overflows horizontally or
vertically and that every interactive control keeps a "usable layout box"
inside the viewport — this is the automated safety net against the +1px
bump causing wrapping/clipping in the tightly fixed mobile canvas.
[RESULT — see below]

## 3. Fable's creative/legibility findings (not all acted on)

A second, independent pass focused on typography feel and "distracting for a
game" issues rather than measured contrast. Ranked, most important first:

1. **Verdict/finding text is visually the weakest thing on the most
   important screen.** The line that actually tells you what's wrong with a
   document ("CODE NOT FOUND · …") is a small dim caption in the corner,
   while decorative document art dominates. *Not acted on — would need a
   layout change (bigger type or a highlighted "finding" chip), out of scope
   for this pass.*
2. **Outcome modals ("SECURITY BREACH" vs. a win state) look identical** —
   no color valence for success vs. failure. *Not acted on.*
3. **Stamp animation can render underneath/behind the outcome modal**,
   clipped near the DENY ENTRY button — reads as a rendering bug, likely a
   sequencing/z-index issue between the admit-stamp animation and the
   case-closed modal. *Flagged for a follow-up fix — this is a real bug,
   not a style nit, and is outside the scope of a font/contrast pass.*
4. The primary admit button shows the game's own logo wordmark ("RED
   STAMP") large, with the actual meaning ("ADMIT ENTRY") as a tiny
   sub-label — flavorful but slows down the decisive click.
5. Per-document status tags ("IN ORDER / QUESTION IT / DISCREPANCY") are
   the puzzle's answer key but carry the same tiny weight as decorative
   titles.
6. The right-rail is a wall of equally-weighted tiny caps labels; nothing
   outranks anything except by color alone.
7. X-ray stage: the suspicious "UNRESOLVED MASS" item is distinguished from
   an ordinary "WALLET" only by a 3px dot — could use a visible flag/glow.
8. Document-footer captions sit directly on top of busy seal/QR texture on
   the ID card stage — could use a solid scrim band.
9. **Mobile stage-chip row clips labels mid-word at both edges** ("G…",
   "E") with no scroll affordance — reads as a layout bug. *Flagged for
   follow-up, not fixed here (needs a scroll-fade/peek treatment, not a
   font change).*
10. Hint lines ("Every sheet on this route must carry…") are dim enough
    they'll likely never be read.
11. Game-over screen stacks four overlapping headers ("GAME OVER" / "SHIFT
    COMPLETE" / "FINAL REPORT FILED" / status line) that repeat each other,
    and "GAME OVER" breaks the in-world bureaucratic fiction.
12. Mobile header abbreviations "TOL / CAREER" are cryptic.
13. Desktop question stage has a lot of dead black space; the visitor
    portrait is nearly invisible there.

Items 1, 2, 4, 5, 6, 10, 11, 12, 13 are layout/copy/hierarchy decisions, not
contrast or font-size problems — they're recorded here as a backlog, not
acted on in this pass. Items 3 and 9 look like actual bugs and are worth a
follow-up ticket.

## Before/after

Screenshots: `tmp/audit-gameplay/` (post-fix, full campaign, desktop +
mobile) and `tmp/audit-pixel7a/` (post-fix, Pixel-7A-dimensioned mobile
pass, welcome + a couple of representative stages).
