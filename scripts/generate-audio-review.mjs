#!/usr/bin/env node
// One-off review batch: candidate replacements for the detector-clear (scan.mp3)
// and detector-alarm sfx, which the user reported as "very annoying" when heard
// repeatedly across a full playthrough. Follows the same call pattern as
// scripts/generate-audio.mjs but writes to tmp/sfx-review/ and never touches
// the live assets/audio/sfx files.
// Usage: node --env-file=.env scripts/generate-audio-review.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "tmp/sfx-review");

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY. Run with: node --env-file=.env scripts/generate-audio-review.mjs");
  process.exit(1);
}

const CANDIDATES = [
  // --- detector-alarm candidates: original is "two sharp rising electronic
  // beeps close together" — harsh and beepy. Try fewer beeps, lower pitch,
  // shorter duration, and a non-beep alternative for variety. ---
  {
    file: "detector-alarm-single-soft-beep.mp3",
    text: "A single short soft electronic alert beep for a security checkpoint, rounded and mellow tone, not harsh or piercing, low-medium pitch, brief and unobtrusive, like a gentle notification chime rather than a siren",
    duration: 0.6,
    promptInfluence: 0.6,
  },
  {
    file: "detector-alarm-low-buzz.mp3",
    text: "A short low electronic buzz for a security alert, no beep tone at all, a dull rounded electric vibration pulse, muted and soft-edged, brief, security checkpoint equipment, not a siren, not sharp, not piercing",
    duration: 0.6,
    promptInfluence: 0.6,
  },
  {
    file: "detector-alarm-low-double-beep.mp3",
    text: "Two low-pitched soft electronic beeps close together for a security checkpoint alert, deep rounded tone, muffled and gentle, not sharp or piercing, quieter and lower than a typical alarm",
    duration: 0.8,
    promptInfluence: 0.6,
  },
  {
    file: "detector-alarm-soft-click-tone.mp3",
    text: "A single soft muted electronic click-tone alert, short percussive tap with a faint low tone underneath, security checkpoint equipment, minimal and unobtrusive, no siren, no harsh beep, no piercing frequencies",
    duration: 0.5,
    promptInfluence: 0.6,
  },

  // --- detector-clear candidates: original scan.mp3 hum was already approved,
  // but may have grown grating from being heard on nearly every case. Try
  // shorter/quieter/more minimal variants. ---
  {
    file: "detector-clear-minimal.mp3",
    text: "A very brief, quiet electronic scanner tick: an extremely subtle, soft low electrical pulse, barely audible, no hum swell, no beep, no siren, no sweep, minimal and unobtrusive background technology sound",
    duration: 0.5,
    promptInfluence: 0.7,
  },
  {
    file: "detector-clear-short-hum.mp3",
    text: "A quiet electronic security scanner passing over an object: a very soft low electrical hum that rises and fades gently but quickly, like a brief pulse of an old machine, no beeping, no siren, no synth tone, no sharp or piercing sounds, faint and understated",
    duration: 0.7,
    promptInfluence: 0.7,
  },
];

async function requestAudio(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}: ${detail.slice(0, 500)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function generateSfx({ file, text, duration, promptInfluence = 0.4 }) {
  const dest = path.join(outDir, file);
  console.log(`gen   sfx-review/${file}`);
  const audio = await requestAudio("https://api.elevenlabs.io/v1/sound-generation", {
    text,
    duration_seconds: duration,
    prompt_influence: promptInfluence,
  });
  fs.writeFileSync(dest, audio);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const item of CANDIDATES) {
    await generateSfx(item);
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
