#!/usr/bin/env node
// Designs and generates character voice lines with the ElevenLabs Text-to-Voice
// and Text-to-Speech APIs. See docs/voice-generation.md for the recipe this
// script encodes and why each choice matters.
//
// Usage:
//   node --env-file=.env scripts/generate-voice.mjs design <character-slug>
//     Generates a few voice preview takes for review in tmp/voice-previews/<slug>/.
//   node --env-file=.env scripts/generate-voice.mjs save <character-slug> <generated_voice_id>
//     Saves a chosen preview as a permanent voice and records its voice_id.
//   node --env-file=.env scripts/generate-voice.mjs speak <character-slug>
//     Generates the character's dialogue lines using its saved voice_id, then
//     applies a 15% ffmpeg tempo bump (requires ffmpeg on PATH).

import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const previewDir = path.join(root, "tmp/voice-previews");
const voiceDir = path.join(root, "assets/audio/voices");
const registryPath = path.join(root, "scripts/voice-registry.json");

// Only the CLI entry point (main(), invoked when this file is run directly)
// requires the API key. Other scripts (e.g. scripts/build-voice-review.mjs)
// import CHARACTERS from this module for its metadata alone and must not be
// forced to set ELEVENLABS_API_KEY just to read a plain object.
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
const apiKey = process.env.ELEVENLABS_API_KEY;
if (isMainModule && !apiKey) {
  console.error("Missing ELEVENLABS_API_KEY. Run with: node --env-file=.env scripts/generate-voice.mjs ...");
  process.exit(1);
}

const DESIGN_MODEL = "eleven_ttv_v3";
// guidance_scale above 8 reliably produces a radio/telephone/walkie-talkie
// compression artifact (confirmed at 15, 25, and 40, on multiple characters)
// — unusable for the game, full stop. This is a HARD CEILING: every design
// call in this file, including one-off experiments, must clamp to it. Do not
// raise it to chase accent reliability — that tradeoff isn't ours to make
// again, the user has said no twice. See docs/voice-generation.md.
const MAX_SAFE_GUIDANCE_SCALE = 8;
const DESIGN_GUIDANCE_SCALE = MAX_SAFE_GUIDANCE_SCALE;
// eleven_v3 (alpha) hallucinated extra unscripted words at the end of short
// lines and then cut off mid-hallucination — sounded like a broken/abrupt
// ending, confirmed on Olya Merin's line across multiple regeneration
// attempts (different text, different voice_settings.stability, all still
// hallucinated). eleven_multilingual_v2 doesn't have this problem and the
// accent still comes through acceptably on a voice designed via eleven_ttv_v3.
// See docs/voice-generation.md.
const SPEECH_MODEL = "eleven_multilingual_v2";
// The raw multilingual_v2 pace was already "a bit fast but okay" per user
// feedback — no extra tempo bump needed (unlike eleven_v3, which spoke
// slowly enough to need the 1.15 stretch this constant used to be).
const SPEECH_TEMPO = 1.0;

// The accent clause that actually works. Anything shorter, or without the
// explicit "NOT British/RP/American" negation, drifts back to a generic RP
// English reading — see docs/voice-generation.md for the failed attempts.
// Accent reliability is inconsistent even with this wording (it lands for
// some characters, not others) — that's a separate, unresolved problem from
// the radio-artifact one this clause also guards against.
function accentClause(base) {
  return `${base} Speaks English with a heavy, unmistakable Russian accent: hard consonants, `
    + "tapped R sounds, flattened vowels, occasional dropped articles like the and a, and a "
    + "clipped, formal Eastern European cadence. This is a real, natural foreign accent, not a "
    + "caricature. NOT British, NOT posh, NOT RP English, NOT American — distinctly Slavic and "
    + "Eastern European. Natural, clean studio-quality voice recording, no radio effect, no "
    + "telephone effect, no walkie-talkie effect, no compression artifacts.";
}

// Each character: a voice description (accent/age/tone), a 100-1000 character
// preview line for the design step, and the dialogue lines to synthesize once
// a voice is chosen and saved. Slugs match the case `id` fields in app.js so
// generated files line up with `assets/audio/voices/<slug>/`.
export const CHARACTERS = {
  "olya-merin": {
    label: "Olya Merin",
    description: accentClause(
      "A Russian woman named Olya, thirty years old, born and raised in Moscow, who moved abroad "
      + "as an adult. Warm surface politeness over a nervous, evasive undertone, like she is "
      + "reciting a story she was told to repeat.",
    ),
    previewText:
      "My cousin. I do not remember the exact case number. The clerk told me to wait here by the window until my name was called. I only came to sign the papers, nothing more.",
    lines: {
      question: "My cousin. I do not remember the exact case number; the clerk told me to wait here.",
    },
  },
  "mara-velen": {
    label: "Mara Velen",
    description: accentClause(
      "A woman in her mid-thirties, a Veskarian citizen renewing a damaged identity card. Warm, "
      + "tired, ordinary, a little relieved to finally be at the window after a long queue.",
    ),
    previewText:
      "The corner of my identity card broke. My employer needs a valid card before tomorrow morning, or I will lose the position. I am sorry to make this so complicated for you.",
    lines: {
      question: "The corner of my identity card broke. My employer needs a valid card before tomorrow.",
    },
  },
  "irena-sava": {
    label: "Irena Sava",
    description: accentClause(
      "A mother in her mid-thirties requesting emergency travel for her sick child. Urgent, "
      + "pleading but composed, holding herself together under pressure.",
    ),
    previewText:
      "They told me to ask for the emergency desk. The hospital says we cannot wait for a normal appointment; my daughter does not have that kind of time. Please, I am asking you directly.",
    lines: {
      question: "They told me to ask for the emergency desk. The hospital says we cannot wait for a normal appointment.",
    },
  },
  "viktor-dalen": {
    label: "Viktor Dalen",
    description: accentClause(
      "A Veskarian soldier in his late thirties acting as a sealed courier. Low, deep voice, "
      + "clipped and disciplined military cadence, no warmth, used to giving short direct answers.",
    ),
    previewText:
      "State Affairs Directorate. Clearance code C-17. The order is for the fourth window, and I was told not to explain myself further than that to checkpoint staff.",
    lines: {
      question: "State Affairs Directorate. Clearance code C-17. The order is for the fourth window.",
    },
  },
  "radan-kest": {
    label: "Radan Kest",
    description: accentClause(
      "A contracted auxiliary team lead in his forties. Gruff, impatient, working-class tone, "
      + "slightly irritated as if rushed and inconvenienced by the checkpoint.",
    ),
    previewText:
      "The manifest is an old copy. We were told the embassy would not slow us down today, and now I am standing here explaining paperwork instead of finishing the job.",
    lines: {
      question: "The manifest is an old copy. We were told the embassy would not slow us down today.",
    },
  },
  "anton-ryl": {
    label: "Anton Ryl",
    description: accentClause(
      "A man of indeterminate age carrying unresolved special correspondence. Quiet, flat, "
      + "unsettlingly calm delivery, almost no emotion, a faintly menacing undertone underneath.",
    ),
    previewText:
      "The person who remembers the gate. You have already let them in once, whether or not you remember doing it. I am only here to finish what was already started.",
    lines: {
      question: "The person who remembers the gate. You have already let them in once.",
    },
  },
  "sorin-dask": {
    label: "Sorin Dask",
    description: accentClause(
      "An embassy engineer in his thirties called in for an emergency repair. Practical, "
      + "matter-of-fact tone, mildly distracted, technical and unbothered by the inspection.",
    ),
    previewText:
      "Facilities sent me. It is probably a replacement board; I have not opened the casing yet, and I would like to get back to the panel before the whole line goes down.",
    lines: {
      question: "Facilities. It is probably a replacement board; I have not opened the casing.",
    },
  },
  "director-vel": {
    label: "Director Vel Ordan",
    description: accentClause(
      "A senior Veskarian government official in his fifties on a priority arrival. Commanding, "
      + "impatient, used to being obeyed, a faint contempt toward bureaucratic delay.",
    ),
    previewText:
      "It is a personal device. You cannot delay a director over a technicality, and I expect this to be resolved before it becomes something either of us has to report upward.",
    lines: {
      question: "It is a personal device. You cannot delay a director over a technicality.",
    },
  },
  "nadiya-ost": {
    label: "Nadiya Ost",
    description: accentClause(
      "A woman in her thirties asking about a family document. Anxious, sincere, quietly "
      + "confused, a little frightened by what the paperwork seems to imply.",
    ),
    previewText:
      "I do not know. The registry office said I should ask the embassy before the record disappears completely, and nobody there would explain to me why it was changed.",
    lines: {
      question: "I do not know. The registry office said I should ask the embassy before the record disappears completely.",
    },
  },
  "milan-vek": {
    label: "Milan Vek",
    description: accentClause(
      "A former embassy guard in his fifties trying to use a revoked credential. Blustering, "
      + "defensive, overconfident, talks over people, a little too loud for the room.",
    ),
    previewText:
      "The guard office issued it. The director knows me personally, so call him if you want to waste both of our time standing here arguing about a piece of plastic.",
    lines: {
      question: "The guard office. The director knows me. Call him if you want to waste time.",
    },
  },
  "elias-rhy": {
    label: "Elias Rhy",
    description: accentClause(
      "A man of indeterminate age, a return visitor with special correspondence. Low, hollow, "
      + "unnervingly patient delivery, as if he has said these words before and will say them again.",
    ),
    previewText:
      "From you. You stamped it after I entered, and you will remember when the light goes out, even if you do not remember it right now while we are standing here.",
    lines: {
      question: "From you. You stamped it after I entered. You will remember when the light goes out.",
    },
  },
};

function loadRegistry() {
  if (!fs.existsSync(registryPath)) return {};
  return JSON.parse(fs.readFileSync(registryPath, "utf8"));
}

function saveRegistry(registry) {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
}

async function apiRequest(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}: ${detail.slice(0, 500)}`);
  }
  return response.json();
}

// Every design call — the per-character default and any ad hoc experiment —
// goes through this so the guidance_scale ceiling can't be bypassed again.
async function requestVoiceDesign(description, text, { guidanceScale = DESIGN_GUIDANCE_SCALE, referenceAudioBase64, promptStrength } = {}) {
  const clamped = Math.min(guidanceScale, MAX_SAFE_GUIDANCE_SCALE);
  if (guidanceScale > MAX_SAFE_GUIDANCE_SCALE) {
    console.warn(`guidance_scale ${guidanceScale} exceeds the ${MAX_SAFE_GUIDANCE_SCALE} radio-artifact ceiling — clamped to ${clamped}.`);
  }
  const body = {
    voice_description: description,
    text,
    auto_generate_text: false,
    model_id: DESIGN_MODEL,
    guidance_scale: clamped,
  };
  if (referenceAudioBase64) body.reference_audio_base64 = referenceAudioBase64;
  if (promptStrength !== undefined) body.prompt_strength = promptStrength;
  return apiRequest("https://api.elevenlabs.io/v1/text-to-voice/design", body);
}

// Telephone/radio/walkie-talkie artifact detector. That effect band-limits
// the audio (like real phone codecs), which shows up as unusually little
// energy below 300Hz — confirmed against a labeled sample: takes the user
// flagged as "radio/telephone" measured ~-43dB there, takes approved as
// clean measured ~-27 to -33dB. -38dB splits the two with margin. This is a
// real, if rough, spectral signal — not a wording/guidance_scale gamble.
const TELEPHONE_ARTIFACT_THRESHOLD_DB = -38;

async function lowBandMeanVolumeDb(file) {
  const { stderr } = await execFileAsync("ffmpeg", ["-i", file, "-af", "lowpass=f=300,volumedetect", "-f", "null", "-"]);
  const match = /mean_volume:\s*(-?[\d.]+)\s*dB/.exec(stderr || "");
  return match ? parseFloat(match[1]) : null;
}

async function isTelephoneArtifact(file) {
  const db = await lowBandMeanVolumeDb(file);
  return db !== null && db < TELEPHONE_ARTIFACT_THRESHOLD_DB;
}

// Writes previews, drops any that measure as a telephone/radio artifact, and
// retries the whole design call (up to 2 extra attempts) if every preview in
// a batch gets filtered — so a caller never has to see or choose a bad take.
async function writePreviews(slug, requestFn, prefix = "preview", attempt = 1) {
  const result = await requestFn();
  const dir = path.join(previewDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  const manifest = [];
  for (let index = 0; index < result.previews.length; index += 1) {
    const preview = result.previews[index];
    const file = path.join(dir, `${prefix}-${index + 1}.mp3`);
    fs.writeFileSync(file, Buffer.from(preview.audio_base_64, "base64"));
    const suspect = await isTelephoneArtifact(file).catch(() => false);
    if (suspect) {
      fs.rmSync(file);
      console.log(`preview ${index + 1}: discarded (telephone/radio artifact detected)`);
      continue;
    }
    manifest.push({ index: index + 1, generated_voice_id: preview.generated_voice_id, file });
    console.log(`preview ${index + 1}: ${file}`);
    console.log(`  generated_voice_id: ${preview.generated_voice_id}`);
  }
  if (manifest.length === 0) {
    if (attempt >= 3) throw new Error(`${slug}: 3 attempts all produced only telephone-artifact takes. Try a different description.`);
    console.log(`All previews were telephone-artifact takes — retrying (attempt ${attempt + 1}/3)...`);
    return writePreviews(slug, requestFn, prefix, attempt + 1);
  }
  fs.writeFileSync(path.join(dir, `${prefix}-manifest.json`), JSON.stringify(manifest, null, 2));
}

async function design(slug) {
  const character = CHARACTERS[slug];
  if (!character) throw new Error(`Unknown character: ${slug}`);
  return writePreviews(slug, () => requestVoiceDesign(character.description, character.previewText), "preview");
}

async function designCustom(slug, description) {
  if (!description) throw new Error("Usage: design-custom <slug> \"<voice_description>\" — reuses the character's previewText");
  const character = CHARACTERS[slug];
  if (!character) throw new Error(`Unknown character: ${slug}`);
  return writePreviews(slug, () => requestVoiceDesign(description, character.previewText), `custom-${Date.now()}`);
}

async function save(slug, generatedVoiceId) {
  const character = CHARACTERS[slug];
  if (!character) throw new Error(`Unknown character: ${slug}`);
  const result = await apiRequest("https://api.elevenlabs.io/v1/text-to-voice", {
    voice_name: `Red Stamp — ${character.label}`,
    voice_description: character.description,
    generated_voice_id: generatedVoiceId,
  });
  const registry = loadRegistry();
  registry[slug] = { voice_id: result.voice_id, label: character.label };
  saveRegistry(registry);
  console.log(`Saved voice_id for ${slug}: ${result.voice_id}`);
}

async function speak(slug, tempo = SPEECH_TEMPO) {
  const character = CHARACTERS[slug];
  if (!character) throw new Error(`Unknown character: ${slug}`);
  const registry = loadRegistry();
  const voiceId = registry[slug]?.voice_id;
  if (!voiceId) throw new Error(`No saved voice_id for ${slug}. Run "save" first.`);
  const dir = path.join(voiceDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const [lineKey, text] of Object.entries(character.lines)) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify({ text, model_id: SPEECH_MODEL }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`${response.status} ${response.statusText}: ${detail.slice(0, 500)}`);
    }
    const rawFile = path.join(dir, `${lineKey}.raw.mp3`);
    const file = path.join(dir, `${lineKey}.mp3`);
    fs.writeFileSync(rawFile, Buffer.from(await response.arrayBuffer()));
    // eleven_v3 mostly ignores voice_settings.speed, so the pacing bump is a
    // post-process ffmpeg tempo filter instead (pitch-preserving time-stretch).
    await execFileAsync("ffmpeg", ["-y", "-v", "error", "-i", rawFile, "-filter:a", `atempo=${tempo}`, file]);
    fs.rmSync(rawFile);
    console.log(`gen ${slug}/${lineKey}.mp3`);
  }
}

async function main() {
  const [command, slug, extra] = process.argv.slice(2);
  if (command === "design") return design(slug);
  if (command === "design-custom") return designCustom(slug, extra);
  if (command === "save") return save(slug, extra);
  if (command === "speak") return speak(slug, extra ? Number(extra) : SPEECH_TEMPO);
  console.error("Usage: generate-voice.mjs <design|design-custom|save|speak> <character-slug> [generated_voice_id | description]");
  process.exit(1);
}

if (isMainModule) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}
