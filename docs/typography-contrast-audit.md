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

## 3. Fable's creative/legibility findings — now fixed

A second, independent pass focused on typography feel and "distracting for a
game" issues rather than measured contrast. All 13 findings below were acted
on except #13 (noted).

1. **Verdict/finding text had the weakest visual weight on the most
   important screen** — the line that tells you what's wrong with a document
   ("CODE NOT FOUND · …") was a plain, undifferentiated sentence.
   **Fixed:** `reference-bridge.js` now splits it into a bold, chip-boxed
   status word (`CODE NOT FOUND`) followed by the plain detail sentence, via
   a new `updateObserved()` that replaces the old plain-text `setSlot`.
2. **Outcome modals had no color valence** — a security breach and a clean
   win looked identical. **Fixed:** the outcome panel now carries
   `data-outcome-grade="good"/"bad"/"mixed"` (sourced from the game's own
   `shiftLog[].grade`, already computed in `app.js`) with matching border/
   kicker/title tinting — green for a clean result, red for an incident,
   the previous neutral cream for a mixed outcome.
3. **Stamp animation rendered simultaneously with the outcome modal**,
   clipped near the DENY ENTRY button. Root cause: `triggerStampMotion()`
   anchored the stamp card to the admit button, which sits at the right
   edge of the action rail — a 300px-wide card centered there overflows the
   viewport; and the 180ms state-sync loop was popping the outcome modal up
   before the ~980ms stamp animation finished. **Fixed both:** the stamp
   position is now clamped inside the viewport, and `updateOutcome()` holds
   the modal back (`stampMotionActive` flag) until the stamp animation
   completes, so the two never overlap.
4. Admit button showed the game's logo wordmark ("RED STAMP") large with
   the actual meaning ("ADMIT ENTRY") as a tiny sub-label. **Fixed:**
   "ADMIT ENTRY" bumped from 11px/600 weight to 13px/700 weight (10px on
   mobile) and brightened, without touching the RED STAMP branding — a
   rebalance, not a full inversion, to keep the game's own identity intact.
5. Document status tags ("IN ORDER / QUESTION IT / DISCREPANCY" — the
   puzzle's answer key) carried the same tiny weight as the decorative
   sheet titles above them. **Fixed:** bumped to font-weight 700 and a size
   at or above the title (12px desktop / 11px mobile, was 11px/10px).
6. Right-rail read as a wall of equally-weighted tiny caps labels.
   **Addressed indirectly** by #1, #5, and #7 — the verdict chip and the
   accent-colored item/status text now give the rail real hierarchy instead
   of one flat tone throughout; no separate structural change made.
7. X-ray "UNRESOLVED MASS" was distinguished from an ordinary "WALLET" only
   by a 3px dot. **Fixed:** the detector tray and satchel tray item names
   now render in their own severity accent color (red/gold/green, the same
   accent already used for the dot and the detail-panel border), on both
   viewports — so the flag is visible before you even open the item.
8. Document-footer captions on busy seal/QR art. **Checked, no change
   needed** — both desktop and mobile already render a solid
   `rgba(6,4,3,.94–.95)` scrim behind that text.
9. **Mobile stage-chip row clipped labels mid-word at both edges** with no
   scroll affordance, reading as a layout bug. **Fixed:** added a
   `mask-image` edge fade to the horizontally-scrolling chip row so a
   partially-visible chip reads as "more to scroll," not broken.
10. Hint lines were dim enough they'd likely never be read. **Fixed** by
    the contrast pass in §1 (`#8a7458` → `#a08a63`) plus the font-size bump.
11. Game-over screen stacked redundant headers — masthead and title both
    literally said "SHIFT COMPLETE," and "GAME OVER" broke the in-world
    bureaucratic fiction. **Fixed:** three distinct, non-redundant mastheads
    now cover the three end states — "CLEARANCE WITHDRAWN" (career hit
    zero), "CAMPAIGN COMPLETE" (final shift), "SHIFT CLOSED" (a normal
    shift break) — and the final-shift title changed from a second "SHIFT
    COMPLETE" to "POST SECURED."
12. Mobile header abbreviation "TOL" is cryptic. **Partially addressed** —
    added a `title="Shift tolerance"` tooltip; left the visible text as
    "TOL" since "TOLERANCE" is roughly 50% wider than "CAREER" (the other
    label sharing that row) and risks overflow on the fixed 390px canvas.
13. Desktop question stage has a lot of dead black space; the visitor
    portrait is nearly invisible there. **Not fixed** — this needs an actual
    layout change (resizing/repositioning the portrait), which is a bigger,
    riskier change than the rest of this pass and wasn't attempted.

## Verification

`npm run audit:gameplay` drives the full seeded 3-shift, 17-case campaign on
both viewports and asserts layout/overflow, accessible-name, and asset
coverage at every screen. One pre-existing assertion (`shift-end screen must
identify its terminal state`) checked for the literal string "GAME OVER" —
updated in `scripts/audit-gameplay.mjs` to match the new masthead copy from
§3.11.

Final run after all fixes: **13,547 checks passed, 0 failures** (both
1440×900 desktop and 390×844 mobile).

A separate one-off pass drove the same campaign at a Pixel-7A-sized viewport
(412×915 CSS px, ~2.6 DPR) to confirm the font-size bump holds up at your
actual phone's dimensions. As noted in §2, the mobile canvas is a fixed
390×844 design scaled to fit the real viewport, so this doesn't change
internal layout risk vs. the 390×844 checks above — it's a direct visual
check at your device's size. Result: same 0 layout failures.

## Before/after

Screenshots: `tmp/audit-gameplay/` (post-fix, full campaign, desktop +
mobile) and `tmp/audit-pixel7a/` (post-fix, Pixel-7A-dimensioned mobile
pass, welcome + a couple of representative stages).
