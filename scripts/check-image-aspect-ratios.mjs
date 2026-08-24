#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function readPngSize(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: file is missing`);
    return null;
  }

  const buffer = fs.readFileSync(absolutePath);
  if (buffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || buffer.length < 24) {
    failures.push(`${relativePath}: not a readable PNG`);
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function checkRatio(relativePath, expectedRatio, tolerance = 0.001) {
  const size = readPngSize(relativePath);
  if (!size) return;
  const actualRatio = size.width / size.height;
  if (Math.abs(actualRatio - expectedRatio) > tolerance) {
    failures.push(
      `${relativePath}: ${size.width}x${size.height} has ratio ${actualRatio.toFixed(5)}, expected ${expectedRatio.toFixed(5)}`,
    );
    return;
  }
  console.log(`OK ${relativePath} ${size.width}x${size.height} (${actualRatio.toFixed(5)})`);
}

const dossierAssets = [
  ["assets/generated/doc-identity-page.png", 972 / 1618],
  ["assets/generated/doc-appointment-page.png", 1054 / 1492],
  ["assets/generated/doc-clearance-page.png", 2 / 3],
  ["assets/generated/doc-emergency-page.png", 2 / 3],
  ["assets/generated/doc-legal-page.png", 2 / 3],
  ["assets/generated/doc-correspondence-page.png", 2 / 3],
];

for (const [relativePath, expectedRatio] of dossierAssets) checkRatio(relativePath, expectedRatio);

const characterIds = [
  "mara", "irena", "viktor", "radan", "olya", "anton", "sorin-dask",
  "director-vel-ordan", "nadiya-ost", "milan-vek", "elias-rhy",
];
for (const id of characterIds) {
  for (const suffix of ["visitor.png", "visitor-scene.png"]) {
    const relativePath = `assets/generated/${id}-${suffix}`;
    const size = readPngSize(relativePath);
    if (!size) continue;
    if (size.width < 400 || size.height < 1000) {
      failures.push(`${relativePath}: unexpectedly small character source ${size.width}x${size.height}`);
    }
    console.log(`OK ${relativePath} ${size.width}x${size.height} (natural ratio)`);
  }

  const facePath = `assets/generated/${id}-face.png`;
  const faceSize = readPngSize(facePath);
  if (faceSize) {
    if (faceSize.width < 700 || faceSize.height < 900) {
      failures.push(`${facePath}: unexpectedly small dedicated face source ${faceSize.width}x${faceSize.height}`);
    }
    console.log(`OK ${facePath} ${faceSize.width}x${faceSize.height} (dedicated face)`);
  }
}

checkRatio("assets/generated/mara-visitor-blink.png", 849 / 1853);

const xrayIds = [
  "mara-velen", "irena-sava", "viktor-dalen", "radan-kest", "olya-merin",
  "anton-ryl", "sorin-dask", "director-vel", "nadiya-ost", "milan-vek", "elias-rhy",
];
for (const id of xrayIds) checkRatio(`assets/generated/xray-${id}.png`, 3 / 2);

const css = ["styles.css", "dossier-viewer.css", "immersive-console.css", "detector-person.css"]
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");
if (/object-fit\s*:\s*fill\b/.test(css)) {
  failures.push("CSS contains object-fit: fill; use contain/cover so assets cannot be geometrically stretched");
}

if (failures.length) {
  console.error("\nImage aspect-ratio validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("\nImage aspect-ratio validation passed.");
}
