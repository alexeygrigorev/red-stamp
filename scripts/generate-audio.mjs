#!/usr/bin/env node
// Generates game audio with the ElevenLabs Sound Effects and Music APIs.
// Usage: node --env-file=.env scripts/generate-audio.mjs [sfx|music|all] [--force]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sfxDir = path.join(root, "assets/audio/sfx");
const musicDir = path.join(root, "assets/audio/music");

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY. Run with: node --env-file=.env scripts/generate-audio.mjs");
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.find((arg) => arg.startsWith("--only="))?.slice("--only=".length);
const target = args.find((arg) => !arg.startsWith("--")) || "all";

// Sound effects: short, punchy, Cold War bureaucratic checkpoint sfx.
const SFX = [
  {
    file: "stamp.mp3",
    text: "Foley recording of a single rubber office date stamp being pressed down hard onto a paper document on a wooden desk: a wooden handle knock, an ink pad squelch, and a distinct paper-on-desk slap, all in one quick hit, unmistakably a rubber stamp, not a hammer, not a gunshot, not a generic thud",
    duration: 1.0,
    promptInfluence: 0.75,
  },
  {
    file: "admit.mp3",
    text: "A heavy steel gate lock releases and a mechanical bolt thunks open, low and authoritative, short and final",
    duration: 1.5,
  },
  {
    file: "deny.mp3",
    text: "A harsh short security buzzer alarm, one sharp electronic blast, tense and unpleasant, like a game show wrong-answer buzzer but colder and more industrial",
    duration: 1.0,
  },
  {
    file: "scan.mp3",
    text: "A quiet electronic security scanner passing over an object: a soft low electrical hum that rises and fades gently, like an old machine warming up, no beeping, no siren, no synth tone, no sweep, no sharp or piercing sounds, subtle and unobtrusive background technology sound",
    duration: 1.2,
    promptInfluence: 0.7,
  },
  {
    file: "detector-alarm.mp3",
    text: "A metal detector alarm, two sharp rising electronic beeps close together, security checkpoint",
    duration: 1.0,
  },
  {
    file: "xray-scan.mp3",
    text: "A low mechanical x-ray scanner hum and whir moving across a conveyor belt, ending in a soft electronic chime",
    duration: 3.0,
  },
  {
    file: "paper-handling.mp3",
    text: "Paper documents being shuffled and a folder opening, close-up foley, dry office paper texture",
    duration: 1.5,
  },
  {
    file: "question.mp3",
    text: "A short blip of radio static and intercom crackle, one quick burst, cold bureaucratic communication device",
    duration: 0.6,
  },
  {
    file: "click.mp3",
    text: "A tiny crisp minimal UI button click, plastic and mechanical, very short",
    duration: 0.5,
  },
  {
    file: "case-transition.mp3",
    text: "A metal filing cabinet drawer sliding shut with a solid thunk, close-up foley, office archive",
    duration: 1.2,
  },
  {
    file: "tension-sting.mp3",
    text: "A single dark low orchestral hit with ominous sustained strings, cold war spy thriller sting, no melody, unsettling",
    duration: 2.5,
  },
];

// Music: longer ambient loops for the checkpoint atmosphere.
const MUSIC = [
  {
    file: "checkpoint-loop.mp3",
    prompt:
      "Instrumental dark ambient Cold War bureaucratic tension loop for a browser game. Slow droning analog synth pads, a distant subtle ticking clock rhythm, sparse low brass stabs, sovietera industrial minimalism, restrained and oppressive, seamless loop, no melody, no percussion hits, no vocals",
    lengthMs: 90000,
  },
  {
    file: "title-theme.mp3",
    prompt:
      "Instrumental Cold War pulp spy-thriller title theme, bold brass fanfare motif over a driving low string ostinato, red alert propaganda newsreel energy, dramatic and authoritarian, short and memorable melodic hook, no vocals",
    lengthMs: 45000,
  },
  {
    file: "high-tension.mp3",
    prompt:
      "Instrumental tense ambient layer, low dissonant string drone building slowly, distant metallic percussion accents, alarm-adjacent unease, designed to loop under gameplay when danger rises, no melody, no vocals",
    lengthMs: 60000,
  },
  {
    file: "debrief-sting.mp3",
    prompt:
      "Instrumental short somber resolution phrase, low strings and a single distant piano note, cold and quiet, end-of-shift melancholy, no percussion, no vocals",
    lengthMs: 12000,
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
  const dest = path.join(sfxDir, file);
  if (fs.existsSync(dest) && !force) {
    console.log(`skip  sfx/${file} (exists, use --force to regenerate)`);
    return;
  }
  console.log(`gen   sfx/${file}`);
  const audio = await requestAudio("https://api.elevenlabs.io/v1/sound-generation", {
    text,
    duration_seconds: duration,
    prompt_influence: promptInfluence,
  });
  fs.writeFileSync(dest, audio);
}

async function generateMusic({ file, prompt, lengthMs }) {
  const dest = path.join(musicDir, file);
  if (fs.existsSync(dest) && !force) {
    console.log(`skip  music/${file} (exists, use --force to regenerate)`);
    return;
  }
  console.log(`gen   music/${file}`);
  const audio = await requestAudio("https://api.elevenlabs.io/v1/music", {
    prompt,
    music_length_ms: lengthMs,
    force_instrumental: true,
  });
  fs.writeFileSync(dest, audio);
}

async function main() {
  fs.mkdirSync(sfxDir, { recursive: true });
  fs.mkdirSync(musicDir, { recursive: true });

  if (target === "sfx" || target === "all") {
    for (const item of SFX.filter((item) => !only || item.file === only)) {
      await generateSfx(item);
    }
  }
  if (target === "music" || target === "all") {
    for (const item of MUSIC.filter((item) => !only || item.file === only)) {
      await generateMusic(item);
    }
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
