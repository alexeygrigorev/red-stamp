# Character voice generation

Named visitors can get a distinct, Russian-accented spoken line (their
interrogation answer) generated with ElevenLabs. This documents the recipe
`scripts/generate-voice.mjs` encodes, including the dead ends, so the next
person (or the next session) doesn't re-spend API calls rediscovering them.

## The workflow

Three steps, one character at a time:

```
node --env-file=.env scripts/generate-voice.mjs design <slug>
```
Generates 3 preview takes into `tmp/voice-previews/<slug>/` (not committed —
`tmp/` is scratch) and prints each preview's `generated_voice_id`. Listen to
them and pick one.

```
node --env-file=.env scripts/generate-voice.mjs save <slug> <generated_voice_id>
```
Saves the chosen preview as a permanent voice via `POST /v1/text-to-voice`
and records `{ slug: { voice_id, label } }` in `scripts/voice-registry.json`.

```
node --env-file=.env scripts/generate-voice.mjs speak <slug> [tempo]
```
Renders the character's `lines` (defined per character in the script) through
the saved voice and writes them to `assets/audio/voices/<slug>/<line>.mp3`.
`tempo` defaults to `1.15` (see "Pacing" below).

There's also an escape hatch for iterating on one character without editing
`CHARACTERS`:

```
node --env-file=.env scripts/generate-voice.mjs design-custom <slug> "<voice_description>"
```
Same as `design`, but takes the description inline and reuses the
character's existing `previewText`. Writes to
`tmp/voice-previews/<slug>/custom-<timestamp>-*.mp3` instead of overwriting
`preview-*.mp3`. **Always use this instead of a one-off `fetch` script** —
it's the only path that gets the guidance_scale ceiling and the
telephone-artifact filter below applied automatically (see "Never bypass the
script" below).

Character slugs match the case `id` fields in `app.js` (e.g. `olya-merin`,
`director-vel`). All eleven named visitors have a voice profile (description
+ preview line + dialogue lines) defined in `CHARACTERS` in the script.

## What didn't work

The goal was a natural Russian-accented English voice per character (the
game's Veskarian embassy is Soviet-inspired). The obvious approach —
`POST /v1/text-to-voice/design` with a `voice_description` describing a heavy
Russian accent — kept producing voices that sounded straightforwardly
British/RP, regardless of how the description was worded:

- A short accent mention in the description: British.
- A long, explicit description (hard consonants, tapped Rs, flattened vowels,
  dropped articles, "Cold War Russian character") at default `guidance_scale`
  (5): British.
- The same long description at `guidance_scale: 25`: still generically
  English, just more clipped/robotic.
- Explicitly negating it ("NOT British, NOT posh, NOT RP, NOT American,
  distinctly Slavic/Eastern European", Moscow-born backstory) at
  `guidance_scale: 8`, default design model: still not a real Russian accent.

None of the wording changes were the fix. The default design model
(`eleven_multilingual_ttv_v2`) appears to have a strong bias toward RP
English that description text alone doesn't override.

## What worked

Switching the design call's `model_id` to `eleven_ttv_v3` (ElevenLabs'
newer voice-design model) is what actually produced a real Russian accent —
same style of description, `guidance_scale: 25`. This is the load-bearing
change, not the prompt wording. `DESIGN_MODEL` / `DESIGN_GUIDANCE_SCALE` in
the script are pinned to these values.

## Speech-generation model: use eleven_multilingual_v2, not eleven_v3

An earlier version of this doc said `speak()` needed `model_id: eleven_v3`
because a first pass found `eleven_multilingual_v2` lost the accent. That
was superseded: `eleven_v3` turned out to **hallucinate extra unscripted
words at the end of short lines and then cut off mid-hallucination** —
confirmed on Olya Merin's line, reproducing across a period-vs-semicolon
text change and a `voice_settings.stability` change (0.5 → 0.85, which had
*zero* effect on output — bytes were identical, suggesting ElevenLabs
caches by `(voice_id, text, model_id)` and ignores `voice_settings` for
that cache key). It sounded like a broken/abrupt ending, not a playback
bug — confirmed with a headless-browser test that the `<audio>` element's
`ended` event fires exactly at the file's full duration, so nothing in the
game is truncating playback; the audio content itself is incomplete.

Switching `speak()` to `model_id: eleven_multilingual_v2` fixed the
hallucination and the accent was still acceptable on a voice that was
*designed* via `eleven_ttv_v3` (the design step, not the speech step, is
where the accent actually gets baked in). `SPEECH_MODEL` is pinned to
`eleven_multilingual_v2`. All six characters resolved before this fix
(Olya, Mara, Milan, Radan, Director Vel, Sorin) were regenerated with it.

If accent quality regresses badly on some future character under
`eleven_multilingual_v2`, that's a real tradeoff to flag to the user —
don't silently switch back to `eleven_v3` to compensate, since the
hallucination bug makes it unusable for finished lines.

## The radio/telephone artifact — hard ceiling, not a tuning knob

At `guidance_scale` values above 8 (confirmed bad at 15, 25, and 40), voice
design frequently produces takes with an audible telephone/walkie-talkie
quality — band-limited, compressed, like a phone call. This is a real
recurring failure mode, not a one-off: it hit Irena, Nadiya, Sorin, and one
of Anton's variants across multiple sessions. **`guidance_scale` must never
exceed `MAX_SAFE_GUIDANCE_SCALE` (8) for any design call, including one-off
experiments.** Higher guidance does make the accent land more often, but
that tradeoff isn't available — raising the ceiling to chase accent
reliability was tried and explicitly rejected twice.

`MAX_SAFE_GUIDANCE_SCALE` is enforced in code, not just by convention:
`requestVoiceDesign()` clamps every call (`design`, `design-custom`, and any
future entry point) to this value and warns if something asked for more.

### Never bypass the script

Several early experiments in this project were one-off inline
`node -e "fetch(...)"` snippets instead of going through
`generate-voice.mjs`. That's how the guidance_scale ceiling got violated in
the first place — a hand-rolled `fetch` call has no access to the clamp or
the artifact filter below. If you need a variant `generate-voice.mjs`
doesn't support yet, extend the script (see `design-custom` for the
pattern) rather than writing a standalone request.

### Automatic artifact filtering

Beyond the ceiling, `writePreviews()` (used by both `design` and
`design-custom`) actively screens every preview and discards suspect takes
before they're ever written to a manifest or shown to anyone:

- The telephone effect band-limits audio — real phone/radio codecs cut
  content below ~300Hz and above ~3.4kHz. That shows up as unusually little
  energy in the sub-300Hz band.
- `isTelephoneArtifact()` measures this with
  `ffmpeg -af "lowpass=f=300,volumedetect"` and reads `mean_volume` from
  stderr.
- Threshold is `TELEPHONE_ARTIFACT_THRESHOLD_DB = -38`. Calibrated against a
  labeled sample: three takes the user confirmed as "radio/telephone"
  measured ≈ -43dB in that band; three takes approved as clean measured
  ≈ -27 to -33dB. -38 splits the two with margin. (A naive high-pass-above-
  4kHz check was tried first and rejected — normal speech also rolls off
  up there, so it didn't separate bad from good. The low-band check does.)
- If every preview in a batch gets filtered, the whole design call retries
  automatically (up to 3 attempts total) rather than surfacing nothing or a
  bad take.

This is a rough heuristic on a small calibration set, not a proven
classifier — if a telephone-sounding take ever slips through, tighten
`TELEPHONE_ARTIFACT_THRESHOLD_DB` (move it up, e.g. -35) rather than
loosening `guidance_scale`.

## Pacing

`eleven_multilingual_v2`'s native pace was already "a bit fast but okay"
per user feedback on Olya Merin's line, so `SPEECH_TEMPO = 1.0` — no
tempo stretch applied by default. `speak()` still runs every line through
an `ffmpeg atempo` pass (a pitch-preserving tempo stretch) so a future
character can get a per-line adjustment via the `speak <slug> <tempo>` CLI
arg without needing a code change; `ffmpeg` must be on `PATH`.

(This constant used to be `1.15` back when `SPEECH_MODEL` was `eleven_v3`,
which spoke slowly enough to need stretching and barely responded to
`voice_settings.speed` directly — a 1.15 request only shaved ~1% off
duration. That's moot now that speech generation uses
`eleven_multilingual_v2`, which paces normally on its own.)

## API key scope

The `ELEVENLABS_API_KEY` in `.env` is scoped down: `voices_read`,
`models_read`, and `user_read` are all denied (401
`missing_permissions`), so voice-library search/browsing and model listing
aren't available. The endpoints this script uses — sound generation, music,
text-to-voice design/create, text-to-speech — all work fine on this key.
