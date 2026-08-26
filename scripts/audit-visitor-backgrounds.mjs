#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = process.env.VISITOR_BACKGROUND_AUDIT_DIR
  ? path.resolve(process.env.VISITOR_BACKGROUND_AUDIT_DIR)
  : path.join(root, "tmp", "visitor-background-audit");
const viewport = { width: 1440, height: 900 };
const seed = 424242;
const alphaThreshold = 16;
const renderedAssetSelector = '[data-ref-view="threshold"] > [data-ref-slot="visitor-scene"]';

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // The temporary static server is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Temporary static server did not start at ${url}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function dataUri(buffer) {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function parseObjectBlock(source, declaration) {
  const match = source.match(new RegExp(`const ${declaration} = \\{([\\s\\S]*?)\\n\\};`));
  if (!match) throw new Error(`Could not find ${declaration} in app.js`);
  return match[1];
}

function parseCharacterArt(source) {
  const block = parseObjectBlock(source, "CHARACTER_ART");
  const art = new Map();
  const entries = /"([^"]+)":\s*\{([\s\S]*?)\n\s*\},?/g;
  for (const match of block.matchAll(entries)) {
    const assets = {};
    for (const field of match[2].matchAll(/\b(scene|portrait|face):\s*"([^"]+)"/g)) {
      assets[field[1]] = field[2];
    }
    art.set(match[1], assets);
  }
  if (!art.size || ![...art.values()].some((assets) => assets.scene)) {
    throw new Error("CHARACTER_ART contains no scene assets");
  }
  return art;
}

function parseFallbackScenes(source) {
  const block = parseObjectBlock(source, "VISITOR_ART");
  const scenes = new Map();
  const entries = /([a-zA-Z_$][\w$]*):\s*"([^"]+)"/g;
  for (const match of block.matchAll(entries)) scenes.set(match[1], match[2]);
  return scenes;
}

function safeSlug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function absoluteAssetPath(assetPath) {
  if (!assetPath.startsWith("assets/")) {
    throw new Error(`Visitor scene must be rooted at assets/: ${assetPath}`);
  }
  const absolute = path.resolve(root, assetPath);
  if (!absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Visitor scene escapes the project root: ${assetPath}`);
  }
  return absolute;
}

function referenceAssetUrl(frame, assetPath) {
  return new URL(`../${assetPath}`, frame.url()).href;
}

function overlap(startA, endA, startB, endB) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function rectVisibility(rect, stage) {
  const visibleWidth = overlap(rect.x, rect.x + rect.width, stage.x, stage.x + stage.width);
  const visibleHeight = overlap(rect.y, rect.y + rect.height, stage.y, stage.y + stage.height);
  return {
    width: visibleWidth,
    height: visibleHeight,
    fraction: rect.width > 0 && rect.height > 0
      ? (visibleWidth * visibleHeight) / (rect.width * rect.height)
      : 0,
  };
}

function visibleCrop(rect, stage) {
  const x = Math.max(rect.x, stage.x);
  const y = Math.max(rect.y, stage.y);
  const right = Math.min(rect.x + rect.width, stage.x + stage.width);
  const bottom = Math.min(rect.y + rect.height, stage.y + stage.height);
  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  };
}

function makeHeadCrop(stage, image, alpha) {
  const scaleX = image.width / alpha.naturalWidth;
  const scaleY = image.height / alpha.naturalHeight;
  const upper = alpha.upperBounds;
  const centerX = image.x + ((upper.minX + upper.maxX + 1) / 2) * scaleX;
  const headWidth = Math.max(upper.width * scaleX, image.width * 0.16);
  const headHeight = Math.max((upper.maxY - alpha.bounds.minY + 1) * scaleY, image.height * 0.1);
  const cropWidth = Math.min(Math.max(headWidth * 2.4, image.width * 0.55), image.width * 1.5);
  const cropHeight = Math.min(Math.max(headHeight * 2.2, image.height * 0.25), image.height * 0.42);
  const raw = {
    x: centerX - cropWidth / 2,
    y: image.y + alpha.bounds.minY * scaleY - headHeight * 0.2,
    width: cropWidth,
    height: cropHeight,
  };
  return visibleCrop(raw, stage);
}

async function inspectAlpha(frame, assetUrl) {
  return frame.evaluate(async ({ assetUrl, alphaThreshold }) => {
    const image = new Image();
    image.src = assetUrl;
    await new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", () => reject(new Error(`Could not load ${assetUrl}`)), { once: true });
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Could not create a canvas for alpha inspection");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;
    let alphaPixels = 0;
    let semiTransparentPixels = 0;
    let edgeSemiTransparentPixels = 0;
    let brightFringePixels = 0;
    let maxCompositeLuma = 0;
    const darkBackdrop = { r: 9, g: 8, b: 7 };
    const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const pixelAlpha = (x, y) => pixels[(y * canvas.width + x) * 4 + 3];
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const pixel = (y * canvas.width + x) * 4;
        const alpha = pixels[pixel + 3];
        if (alpha > 0 && alpha < 255) semiTransparentPixels += 1;
        if (alpha < alphaThreshold) continue;
        alphaPixels += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        if (alpha >= 250) continue;

        let touchesTransparent = false;
        for (let offsetY = -1; offsetY <= 1 && !touchesTransparent; offsetY += 1) {
          for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if (offsetX === 0 && offsetY === 0) continue;
            const neighborX = x + offsetX;
            const neighborY = y + offsetY;
            if (neighborX < 0 || neighborX >= canvas.width || neighborY < 0 || neighborY >= canvas.height) {
              touchesTransparent = true;
              break;
            }
            if (pixelAlpha(neighborX, neighborY) < alphaThreshold) {
              touchesTransparent = true;
              break;
            }
          }
        }
        if (!touchesTransparent) continue;
        edgeSemiTransparentPixels += 1;
        const coverage = alpha / 255;
        const compositeRed = pixels[pixel] * coverage + darkBackdrop.r * (1 - coverage);
        const compositeGreen = pixels[pixel + 1] * coverage + darkBackdrop.g * (1 - coverage);
        const compositeBlue = pixels[pixel + 2] * coverage + darkBackdrop.b * (1 - coverage);
        const compositeLuma = luma(compositeRed, compositeGreen, compositeBlue);
        maxCompositeLuma = Math.max(maxCompositeLuma, compositeLuma);
        if (compositeLuma >= 80) brightFringePixels += 1;
      }
    }
    if (maxX < 0 || maxY < 0) {
      return {
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        alphaPixels: 0,
        coverage: 0,
        matteRisk: {
          backdrop: "#090807",
          semiTransparentPixels,
          edgeSemiTransparentPixels,
          brightFringePixels,
          brightFringeCoverage: 0,
          brightFringeRatio: 0,
          maxCompositeLuma,
          level: "none",
        },
        bounds: null,
        upperBounds: null,
      };
    }
    const upperLimit = minY + Math.max(1, Math.round((maxY - minY + 1) * 0.2));
    let upperMinX = canvas.width;
    let upperMaxX = -1;
    let upperMinY = canvas.height;
    let upperMaxY = -1;
    for (let y = minY; y <= Math.min(maxY, upperLimit); y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < alphaThreshold) continue;
        upperMinX = Math.min(upperMinX, x);
        upperMaxX = Math.max(upperMaxX, x);
        upperMinY = Math.min(upperMinY, y);
        upperMaxY = Math.max(upperMaxY, y);
      }
    }
    return {
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      alphaPixels,
      coverage: alphaPixels / (image.naturalWidth * image.naturalHeight),
      matteRisk: {
        backdrop: "#090807",
        semiTransparentPixels,
        edgeSemiTransparentPixels,
        brightFringePixels,
        brightFringeCoverage: brightFringePixels / (image.naturalWidth * image.naturalHeight),
        brightFringeRatio: brightFringePixels / Math.max(1, edgeSemiTransparentPixels),
        maxCompositeLuma,
        level: brightFringePixels >= 2000 || brightFringePixels / Math.max(1, edgeSemiTransparentPixels) >= 0.2
          ? "high"
          : brightFringePixels >= 250 || brightFringePixels / Math.max(1, edgeSemiTransparentPixels) >= 0.06
            ? "medium"
            : brightFringePixels > 0 ? "low" : "none",
      },
      bounds: {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      },
      upperBounds: upperMaxX >= 0
        ? {
          minX: upperMinX,
          minY: upperMinY,
          maxX: upperMaxX,
          maxY: upperMaxY,
          width: upperMaxX - upperMinX + 1,
          height: upperMaxY - upperMinY + 1,
        }
        : null,
    };
  }, { assetUrl, alphaThreshold });
}

async function makeUpscaledCrop(page, sourceBuffer, crop, outputPath) {
  const source = dataUri(sourceBuffer);
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#090807"><canvas id="crop"></canvas></body></html>`);
  const outputSize = await page.evaluate(async ({ source, crop }) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.querySelector("#crop");
    const ratio = crop.width / crop.height;
    const maxWidth = 640;
    const maxHeight = 420;
    const width = Math.round(Math.min(maxWidth, maxHeight * ratio));
    const height = Math.round(width / ratio);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.fillStyle = "#090807";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
    return { width, height };
  }, { source, crop });
  const buffer = await page.locator("#crop").screenshot({ animations: "disabled", scale: "css" });
  await writeFile(outputPath, buffer);
  return { buffer, ...outputSize };
}

async function makeContactSheet(page, entries, outputPath, title, columns) {
  const tiles = entries.map((entry) => `
    <figure>
      <div class="tile-label">${escapeHtml(entry.label)}</div>
      <img src="${dataUri(entry.buffer)}" alt="${escapeHtml(entry.label)}" />
      <figcaption>${escapeHtml(entry.asset)}</figcaption>
    </figure>`).join("");
  await page.setContent(`<!doctype html>
    <html><head><style>
      :root{color-scheme:dark;background:#090807}
      *{box-sizing:border-box}
      body{margin:0;padding:24px;background:#090807;color:#dfd0ad;font:13px/1.35 'IBM Plex Mono',monospace}
      h1{margin:0 0 18px;color:#ead9ad;font:42px/.95 Staatliches,Impact,sans-serif;letter-spacing:.06em}
      p{margin:0 0 18px;color:#a99570;letter-spacing:.08em;text-transform:uppercase}
      main{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:18px;max-width:1440px;margin:0 auto}
      figure{position:relative;margin:0;border:1px solid #514333;background:#100d0b;box-shadow:0 12px 26px #0008;overflow:hidden}
      figure img{display:block;width:100%;height:auto;background:#050403}
      .tile-label{position:absolute;z-index:1;left:0;right:0;top:0;padding:8px 10px;background:linear-gradient(#090807dd,transparent);color:#f1dfb2;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
      figcaption{padding:8px 10px;color:#aa956f;font-size:11px;letter-spacing:.04em;overflow-wrap:anywhere}
    </style></head><body>
      <h1>${escapeHtml(title)}</h1>
      <p>Current checkpoint background · ${viewport.width} × ${viewport.height} reference viewport</p>
      <main>${tiles}</main>
    </body></html>`);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));
  await page.screenshot({ path: outputPath, fullPage: true, animations: "disabled", scale: "css" });
}

const auditedAssetKinds = [
  {
    key: "scene",
    label: "SCENE CUTOUT",
    compositeSuffix: "background",
    cropSuffix: "head",
  },
  {
    key: "portrait",
    label: "FULL-BODY PORTRAIT",
    compositeSuffix: "portrait-background",
    cropSuffix: "portrait-head",
  },
  {
    key: "face",
    label: "FACE / SHOULDERS",
    compositeSuffix: "face-background",
    cropSuffix: "face-crop",
  },
];

function assetPathFor(visitor, kind) {
  return kind.key === "scene" ? visitor.asset : visitor[kind.key];
}

function addAssetIssue(record, assetRecord, kind, message) {
  assetRecord.issues.push(message);
  record.issues.push(kind.key === "scene" ? message : `${kind.label}: ${message}`);
}

function manifestRecord(record) {
  const {
    sceneBuffer,
    headBuffer,
    portraitBuffer,
    portraitHeadBuffer,
    faceBuffer,
    faceCropBuffer,
    ...publicRecord
  } = record;
  return publicRecord;
}

async function setAuditSnapshot(page, visitorCaseData, scene, face) {
  await page.evaluate(({ scene, visitorCaseData, visitorFace }) => {
    const host = window.RedStampHost;
    if (!host.__visitorBackgroundAuditBaseSnapshot) {
      host.__visitorBackgroundAuditBaseSnapshot = host.snapshot;
    }
    const baseSnapshot = host.__visitorBackgroundAuditBaseSnapshot;
    host.snapshot = () => {
      const snapshot = baseSnapshot();
      if (!snapshot) return snapshot;
      return {
        ...snapshot,
        caseData: visitorCaseData || snapshot.caseData,
        assets: {
          ...snapshot.assets,
          scene,
          ...(visitorFace ? { face: visitorFace } : {}),
        },
      };
    };
  }, { scene, visitorCaseData, visitorFace: face });
}

async function waitForReferenceAsset(page, assetUrl) {
  await page.waitForFunction(({ selector, assetUrl: expectedUrl }) => {
    const image = document.querySelector("#reference-frame")?.contentWindow?.document.querySelector(selector);
    return Boolean(image?.complete && image.currentSrc === expectedUrl && image.naturalWidth > 0);
  }, {
    selector: renderedAssetSelector,
    assetUrl,
  });
}

function sceneMapping(source, campaign) {
  const characterArt = parseCharacterArt(source);
  const fallbackScenes = parseFallbackScenes(source);
  const casesById = new Map();
  for (const shift of campaign) {
    for (const caseData of shift.cases || []) {
      if (!casesById.has(caseData.id)) casesById.set(caseData.id, caseData);
    }
  }

  const unique = new Map();
  const add = (id, name, assets, caseData) => {
    const scene = typeof assets === "string" ? assets : assets?.scene;
    if (!scene) return;
    const existing = unique.get(scene);
    if (existing) {
      if (name && !existing.names.includes(name)) existing.names.push(name);
      if (id && !existing.ids.includes(id)) existing.ids.push(id);
      if (typeof assets !== "string" && assets) existing.registered = true;
      if (!existing.portrait && assets?.portrait) existing.portrait = assets.portrait;
      if (!existing.face && assets?.face) existing.face = assets.face;
      if (!existing.caseData && caseData) existing.caseData = caseData;
      return;
    }
    unique.set(scene, {
      asset: scene,
      portrait: typeof assets === "string" ? null : assets.portrait || null,
      face: typeof assets === "string" ? null : assets.face || null,
      registered: typeof assets !== "string",
      caseData: caseData || null,
      ids: id ? [id] : [],
      names: name ? [name] : [],
    });
  };

  for (const [id, art] of characterArt) {
    const caseData = casesById.get(id);
    add(id, caseData?.name || id, art, caseData);
  }
  for (const [id, caseData] of casesById) {
    const art = characterArt.get(id);
    const asset = art?.scene || fallbackScenes.get(caseData.look) || fallbackScenes.get("civilian");
    if (!asset) throw new Error(`Missing visitor scene mapping for ${id}`);
    add(id, caseData.name || id, {
      scene: asset,
      portrait: art?.portrait || null,
      face: art?.face || null,
    }, caseData);
  }
  if (!unique.size) throw new Error("No visitor scene assets were found in the app mapping");
  return [...unique.values()].sort((left, right) => left.asset.localeCompare(right.asset));
}

async function main() {
  const appSource = await readFile(path.join(root, "app.js"), "utf8");
  await mkdir(outputRoot, { recursive: true });
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: root,
    stdio: "ignore",
  });
  let browser;
  const issues = [];
  const records = [];

  try {
    await waitForServer(`${baseUrl}/index.html`);
    browser = await chromium.launch({
      headless: true,
      ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/?seed=${seed}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => Boolean(window.RedStampDebug?.getCampaign));
    const campaign = await page.evaluate(() => window.RedStampDebug.getCampaign());
    const visitors = sceneMapping(appSource, campaign);
    const frame = await (async () => {
      for (let attempt = 0; attempt < 50; attempt += 1) {
        const candidate = page.frames().find((item) => /\/reference\/desktop\.html(?:$|\?)/.test(item.url()));
        if (candidate) return candidate;
        await sleep(100);
      }
      throw new Error("The current desktop reference frame did not mount");
    })();

    await frame.locator('[data-ref-action="begin"]').waitFor();
    await page.evaluate(() => window.RedStampDebug.actions.start());
    await page.waitForFunction(() => window.RedStampDebug.getState().started === true);
    await frame.locator('[data-ref-view="threshold"]').waitFor({ state: "visible" });
    await frame.evaluate(() => window.ReferenceBridge?.sync());
    await page.waitForTimeout(250);

    const stage = frame.locator('[data-ref-view="threshold"]');
    const background = stage.locator(":scope > img").first();
    const backgroundSrc = await background.getAttribute("src");
    const backgroundUrl = await background.evaluate((image) => image.currentSrc);
    if (!backgroundSrc?.endsWith("checkpoint-background-v3.png") || !backgroundUrl.endsWith("/reference/assets/checkpoint-background-v3.png")) {
      issues.push(`Current reference frame is not using checkpoint-background-v3.png: ${backgroundSrc || backgroundUrl || "missing"}`);
    }
    await background.screenshot({
      path: path.join(outputRoot, "checkpoint-background.png"),
      animations: "disabled",
      scale: "css",
    });
    const cropPage = await browser.newPage({ viewport: { width: 700, height: 500 }, deviceScaleFactor: 1 });

    for (const visitor of visitors) {
      const record = {
        ...visitor,
        slug: safeSlug(visitor.ids[0] || visitor.names[0]),
        sceneFile: path.relative(root, absoluteAssetPath(visitor.asset)),
        status: "pending",
        issues: [],
        reviewFlags: [],
        assets: {},
      };
      records.push(record);

      for (const kind of auditedAssetKinds) {
        const assetPath = assetPathFor(visitor, kind);
        const assetRecord = {
          asset: assetPath,
          sourceFile: assetPath ? path.relative(root, absoluteAssetPath(assetPath)) : null,
          compositeFile: assetPath ? `tmp/visitor-background-audit/${record.slug}-${kind.compositeSuffix}.png` : null,
          cropFile: assetPath ? `tmp/visitor-background-audit/${record.slug}-${kind.cropSuffix}.png` : null,
          status: "pending",
          issues: [],
          reviewFlags: [],
        };
        record.assets[kind.key] = assetRecord;

        if (!assetPath) {
          if (visitor.registered) addAssetIssue(record, assetRecord, kind, `CHARACTER_ART has no registered ${kind.label.toLowerCase()} asset`);
          else assetRecord.status = "skipped";
          continue;
        }

        try {
          const absolute = absoluteAssetPath(assetPath);
          await access(absolute, fsConstants.R_OK);
          const assetUrl = referenceAssetUrl(frame, assetPath);
          const alpha = await inspectAlpha(frame, assetUrl);
          assetRecord.alpha = alpha;
          assetRecord.renderedSelector = renderedAssetSelector;
          assetRecord.renderedAssetPath = assetPath;
          if (kind.key === "scene") record.alpha = alpha;

          if (!alpha.bounds || !alpha.upperBounds || alpha.alphaPixels < 1000) {
            addAssetIssue(record, assetRecord, kind, "Asset has no usable alpha silhouette");
          } else {
            if (kind.key !== "face" && alpha.bounds.width / alpha.naturalWidth < 0.18) {
              addAssetIssue(record, assetRecord, kind, "Silhouette is implausibly narrow");
            }
            if (kind.key !== "face" && alpha.bounds.height / alpha.naturalHeight < 0.55) {
              addAssetIssue(record, assetRecord, kind, "Silhouette is implausibly short");
            }
            if (alpha.bounds.minY > alpha.naturalHeight * 0.12) {
              addAssetIssue(record, assetRecord, kind, "Silhouette has an excessive transparent top margin");
            }
          }

          if (alpha.matteRisk.level !== "none") {
            const flag = `Matte telemetry ${alpha.matteRisk.level}: ${alpha.matteRisk.brightFringePixels} bright semi-transparent edge pixels`;
            assetRecord.reviewFlags.push(flag);
            record.reviewFlags.push(`${kind.label}: ${flag}`);
          }

          await setAuditSnapshot(page, visitor.caseData, assetPath, visitor.face);
          await frame.evaluate(() => window.ReferenceBridge?.sync());
          const visitorImage = stage.locator(':scope > [data-ref-slot="visitor-scene"]').first();
          await visitorImage.waitFor({ state: "visible" });
          await waitForReferenceAsset(page, assetUrl);

          const stageBox = await stage.boundingBox();
          const imageBox = await visitorImage.boundingBox();
          const backgroundNatural = await background.evaluate((image) => ({
            complete: image.complete,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          }));
          const imageNatural = await visitorImage.evaluate((image) => ({
            complete: image.complete,
            currentSrc: image.currentSrc,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          }));
          if (!stageBox || !imageBox) {
            addAssetIssue(record, assetRecord, kind, "Reference stage or visitor image has no rendered bounds");
          } else if (alpha.bounds && alpha.upperBounds) {
            const sceneContent = {
              x: imageBox.x + alpha.bounds.minX * imageBox.width / alpha.naturalWidth,
              y: imageBox.y + alpha.bounds.minY * imageBox.height / alpha.naturalHeight,
              width: alpha.bounds.width * imageBox.width / alpha.naturalWidth,
              height: alpha.bounds.height * imageBox.height / alpha.naturalHeight,
            };
            const headContent = {
              x: imageBox.x + alpha.upperBounds.minX * imageBox.width / alpha.naturalWidth,
              y: imageBox.y + alpha.upperBounds.minY * imageBox.height / alpha.naturalHeight,
              width: alpha.upperBounds.width * imageBox.width / alpha.naturalWidth,
              height: alpha.upperBounds.height * imageBox.height / alpha.naturalHeight,
            };
            const sceneVisibility = rectVisibility(sceneContent, stageBox);
            const headVisibility = rectVisibility(headContent, stageBox);
            const rendered = {
              stage: stageBox,
              image: imageBox,
              sceneContent,
              headContent,
              sceneVisibility,
              headVisibility,
              backgroundNatural,
              imageNatural,
            };
            assetRecord.rendered = rendered;
            if (kind.key === "scene") record.rendered = rendered;
            if (!backgroundNatural.complete || backgroundNatural.naturalWidth === 0) {
              addAssetIssue(record, assetRecord, kind, "Checkpoint background did not render");
            }
            if (!imageNatural.complete || imageNatural.naturalWidth !== alpha.naturalWidth) {
              addAssetIssue(record, assetRecord, kind, "Rendered image dimensions do not match the source asset");
            }
            if (imageNatural.currentSrc !== assetUrl) {
              addAssetIssue(record, assetRecord, kind, "Rendered selector did not mount the requested asset");
            }
            if (imageBox.width < stageBox.width * 0.08 || imageBox.height < stageBox.height * 0.5) {
              addAssetIssue(record, assetRecord, kind, "Rendered asset is too small for the checkpoint frame");
            }
            if (sceneVisibility.fraction < 0.7) {
              addAssetIssue(record, assetRecord, kind, `Rendered silhouette is clipped (${Math.round(sceneVisibility.fraction * 100)}% visible)`);
            }
            if (headVisibility.fraction < 0.75) {
              addAssetIssue(record, assetRecord, kind, `Rendered head/face is clipped (${Math.round(headVisibility.fraction * 100)}% visible)`);
            }
            if (headContent.width < 24 || headContent.height < 24) {
              addAssetIssue(record, assetRecord, kind, "Rendered head/face bounds are too small to review");
            }

            const crop = makeHeadCrop(stageBox, imageBox, alpha);
            const compositeBuffer = await stage.screenshot({ animations: "disabled", scale: "css" });
            const compositePath = path.join(outputRoot, `${record.slug}-${kind.compositeSuffix}.png`);
            const cropPath = path.join(outputRoot, `${record.slug}-${kind.cropSuffix}.png`);
            await writeFile(compositePath, compositeBuffer);
            const cropRelative = {
              x: Math.max(0, crop.x - stageBox.x),
              y: Math.max(0, crop.y - stageBox.y),
              width: Math.min(crop.width, stageBox.x + stageBox.width - crop.x),
              height: Math.min(crop.height, stageBox.y + stageBox.height - crop.y),
            };
            if (cropRelative.width < 40 || cropRelative.height < 40) {
              addAssetIssue(record, assetRecord, kind, "Head/face crop is too small after clipping to the reference frame");
            } else {
              const cropOutput = await makeUpscaledCrop(cropPage, compositeBuffer, cropRelative, cropPath);
              assetRecord.crop = {
                source: cropRelative,
                output: { width: cropOutput.width, height: cropOutput.height },
              };
            }
            assetRecord.composite = {
              width: Math.round(stageBox.width),
              height: Math.round(stageBox.height),
            };
            if (kind.key === "scene") {
              record.headCrop = assetRecord.crop || null;
              record.sceneBuffer = compositeBuffer;
              record.headBuffer = assetRecord.crop ? await readFile(cropPath) : null;
            } else if (kind.key === "portrait") {
              record.portraitBuffer = compositeBuffer;
              record.portraitHeadBuffer = assetRecord.crop ? await readFile(cropPath) : null;
            } else if (kind.key === "face") {
              record.faceBuffer = compositeBuffer;
              record.faceCropBuffer = assetRecord.crop ? await readFile(cropPath) : null;
            }
          }
          assetRecord.status = assetRecord.issues.length ? "invalid" : "passed";
        } catch (error) {
          assetRecord.status = "invalid";
          addAssetIssue(record, assetRecord, kind, error instanceof Error ? error.message : String(error));
        }
      }
      record.status = record.issues.length ? "invalid" : "passed";
      if (record.issues.length) {
        issues.push(`${record.names.join(" / ")} (${record.asset}): ${record.issues.join("; ")}`);
      }
    }

    await cropPage.close();
    const contactSheets = [
      {
        bufferKey: "sceneBuffer",
        file: "background-contact-sheet.png",
        title: "VISITOR / CHECKPOINT BACKGROUND AUDIT",
        columns: 3,
        assetKey: "scene",
      },
      {
        bufferKey: "headBuffer",
        file: "head-contact-sheet.png",
        title: "VISITOR / HEAD CROP AUDIT",
        columns: 4,
        assetKey: "scene",
      },
      {
        bufferKey: "portraitBuffer",
        file: "portrait-background-contact-sheet.png",
        title: "VISITOR / FULL-BODY PORTRAIT AUDIT",
        columns: 3,
        assetKey: "portrait",
      },
      {
        bufferKey: "portraitHeadBuffer",
        file: "portrait-head-contact-sheet.png",
        title: "VISITOR / FULL-BODY PORTRAIT HEAD CROP AUDIT",
        columns: 4,
        assetKey: "portrait",
      },
      {
        bufferKey: "faceBuffer",
        file: "face-background-contact-sheet.png",
        title: "VISITOR / FACE-SHOULDERS BACKGROUND AUDIT",
        columns: 3,
        assetKey: "face",
      },
      {
        bufferKey: "faceCropBuffer",
        file: "face-crop-contact-sheet.png",
        title: "VISITOR / ENLARGED FACE CROP AUDIT",
        columns: 4,
        assetKey: "face",
      },
    ];
    for (const sheet of contactSheets) {
      await makeContactSheet(
        page,
        records.filter((record) => record[sheet.bufferKey]).map((record) => ({
          label: record.names.join(" / "),
          asset: record.assets[sheet.assetKey]?.asset || record.asset,
          buffer: record[sheet.bufferKey],
        })),
        path.join(outputRoot, sheet.file),
        sheet.title,
        sheet.columns,
      );
    }
    await writeFile(path.join(outputRoot, "manifest.json"), JSON.stringify({
      generatedAt: new Date().toISOString(),
      viewport,
      seed,
      background: "reference/assets/checkpoint-background-v3.png",
      assetKinds: auditedAssetKinds.map(({ key, label, compositeSuffix, cropSuffix }) => ({
        key,
        label,
        compositeSuffix,
        cropSuffix,
      })),
      visitors: records.map(manifestRecord),
      issues,
    }, null, 2));
    console.log(`Audited ${records.length} characters × ${auditedAssetKinds.length} registered asset kinds.`);
    for (const record of records) {
      const summary = auditedAssetKinds.map((kind) => {
        const asset = record.assets[kind.key];
        const matte = asset?.alpha?.matteRisk?.level || "n/a";
        return `${kind.key}=${asset?.status || "missing"},matte=${matte}`;
      }).join("; ");
      console.log(`- ${record.names.join(" / ")}: ${summary}`);
    }
    await page.close();
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }

  if (issues.length) {
    console.error(`Visitor background audit failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Visitor background audit passed for ${records.length} distinct registered characters.`);
  console.log(`Review sheets: ${path.relative(root, outputRoot)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
