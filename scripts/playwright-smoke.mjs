#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chromiumPath = process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser";
let baseUrl = "";

async function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : 0;
      probe.close(() => resolve(port));
    });
  });
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/index.html`);
      if (response.ok) return;
    } catch {
      // The static server is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Static server did not start at ${baseUrl}`);
}

async function readCampaign(page) {
  return page.evaluate(() => window.RedStampDebug?.getCampaign());
}

async function assertNoStretching(page) {
  const imageFits = await page.evaluate(() => [...document.images].map((image) => ({
    src: image.currentSrc || image.src,
    loaded: image.complete && image.naturalWidth > 0,
    objectFit: getComputedStyle(image).objectFit,
  })));
  const stretched = imageFits.filter((image) => image.loaded && image.objectFit === "fill");
  assert.deepEqual(stretched, [], `Images must never use object-fit: fill: ${JSON.stringify(stretched)}`);
}

async function startRun(page, seed) {
  await page.goto(`${baseUrl}/?seed=${seed}&debug=1`, { waitUntil: "networkidle" });
  assert.equal(await page.locator("#overlay").evaluate((element) => element.classList.contains("is-open")), true);
  assert.match(await page.locator("#overlayStats").textContent(), /03\s+SHIFTS/);
  assert.match(await page.locator("#overlayStats").textContent(), /17\s+CASES/);
  await page.locator('#overlay [data-action="start"]').click();
  await page.waitForFunction(() => {
    const overlay = document.querySelector("#overlay");
    return overlay && !overlay.classList.contains("is-open") && getComputedStyle(overlay).opacity === "0";
  });
  await page.locator("#caseTitle").waitFor({ state: "attached" });
  assert.notEqual((await page.locator("#caseTitle").textContent()).trim(), "No active visitor");
  await assertNoStretching(page);
}

async function inspectIdentityAndPages(page) {
  await page.locator('[data-action="inspect"][data-tool="id"]').first().click();
  await page.locator("#inspectionOverlay.is-open").waitFor();
  assert.equal(await page.locator(".rs-dossier-page--identity").count(), 1);
  const identityImage = await page.locator(".rs-dossier-base-image").evaluate((image) => ({
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    objectFit: getComputedStyle(image).objectFit,
  }));
  assert.ok(identityImage.naturalWidth > 0 && identityImage.naturalHeight > 0, "Identity page must load");
  assert.notEqual(identityImage.objectFit, "fill");
  const faceImage = await page.locator(".rs-dossier-portrait-frame img").evaluate((image) => ({
    src: image.currentSrc || image.src,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    objectFit: getComputedStyle(image).objectFit,
  }));
  assert.match(faceImage.src, /assets\/generated\/.*-face\.png/);
  assert.ok(faceImage.naturalWidth > 0 && faceImage.naturalHeight > 0, "ID must show the visitor face");
  assert.equal(faceImage.objectFit, "cover", "ID portrait should crop into its frame, never stretch");

  const firstPage = await page.locator(".rs-dossier-page-mark").textContent();
  await page.locator('[data-dossier-action="next"]').click();
  await page.waitForFunction((previous) => document.querySelector(".rs-dossier-page-mark")?.textContent !== previous, firstPage);
  assert.notEqual(await page.locator(".rs-dossier-page-mark").textContent(), firstPage);
  await page.locator('[data-action="close-inspection"]').last().click();
  await page.locator("#inspectionOverlay").waitFor({ state: "hidden" });
}

async function inspectXrayAndShortcuts(page) {
  const currentCase = await page.evaluate(() => window.RedStampDebug.getState().caseIndex);
  const caseData = (await page.evaluate(() => window.RedStampDebug.getCampaign()))[0].cases[currentCase];
  await page.locator('[data-action="inspect"][data-tool="detector"]').first().click();
  await page.locator("#inspectionOverlay.is-open").waitFor();
  assert.equal(await page.locator("#inspectionOverlay").getAttribute("data-tool"), "detector");
  const detectorAsset = page.locator(".rs-detector-art");
  const detectorPerson = page.locator(".rs-detector-person");
  if (await detectorAsset.count()) {
    const detectorPlate = await detectorAsset.evaluate((image) => ({
      src: image.currentSrc || image.src,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }));
    assert.match(detectorPlate.src, /assets\/generated\/detector-.*\.png/);
    assert.ok(detectorPlate.naturalWidth > 0 && detectorPlate.naturalHeight > 0, "Dedicated detector plate must load");
  } else {
    const detectorFallback = await detectorPerson.evaluate((image) => ({
      src: image.currentSrc || image.src,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    }));
    assert.match(detectorFallback.src, /assets\/generated\/.*visitor\.png/);
    assert.ok(detectorFallback.naturalWidth > 0 && detectorFallback.naturalHeight > 0, "Detector fallback must load the active visitor silhouette");
  }
  await page.keyboard.press("Escape");
  await page.locator("#inspectionOverlay").waitFor({ state: "hidden" });

  await page.locator('[data-action="inspect"][data-tool="xray"]').first().click();
  await page.locator("#inspectionOverlay.is-open").waitFor();
  assert.equal(await page.locator("#inspectionOverlay").getAttribute("data-tool"), "xray");
  const xrayImage = await page.locator("#inspectionOverlayVisual img").evaluate((image) => ({
    src: image.currentSrc || image.src,
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    objectFit: getComputedStyle(image).objectFit,
  }));
  assert.ok(xrayImage.naturalWidth > 0 && xrayImage.naturalHeight > 0, "X-ray must load");
  assert.equal(xrayImage.objectFit, "contain");
  assert.match(xrayImage.src, new RegExp(`xray-${caseData.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  await page.keyboard.press("Escape");
  await page.locator("#inspectionOverlay").waitFor({ state: "hidden" });

  await page.keyboard.press("2");
  await page.locator("#inspectionOverlay.is-open").waitFor();
  assert.equal((await page.evaluate(() => window.RedStampDebug.getState())).revealed.id, true);
  await page.keyboard.press("Escape");
  await page.locator("#inspectionOverlay").waitFor({ state: "hidden" });

  await page.locator('[data-action="resolve"][data-decision="admit"]').first().click();
  await page.waitForTimeout(420);
  await page.screenshot({ path: "/tmp/red-stamp-stamp-impact.png", fullPage: true });
  await page.waitForFunction(() => document.querySelector(".stamp-motion-document")?.classList.contains("stamp-motion-document-issued"));
  const stampState = await page.locator(".security-desk").evaluate((desk) => ({
    document: Boolean(desk.querySelector(".stamp-motion-document")),
    ink: desk.querySelector(".stamp-motion-ink")?.classList.contains("stamp-motion-ink-issued"),
    impact: desk.querySelector(".stamp-motion-impact")?.getAttribute("src") || "",
  }));
  assert.equal(stampState.document, true, "Admit must create a physical authorization document");
  assert.equal(stampState.ink, true, "Admit must leave red ink on the authorization document");
  assert.match(stampState.impact, /assets\/generated\/red-stamp-impact\.png/, "Admit must use the generated stamp impact plate");
}

async function checkMobile(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await startRun(page, 1337);
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
  }));
  assert.ok(overflow.documentWidth <= overflow.viewport + 1, `Mobile layout overflows: ${JSON.stringify(overflow)}`);
  assert.ok(overflow.documentHeight <= overflow.viewportHeight + 1, `Mobile page becomes a vertical document: ${JSON.stringify(overflow)}`);

  const composition = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { top: box.top, right: box.right, bottom: box.bottom, left: box.left, width: box.width, height: box.height };
    };
    return {
      caseCard: rect(".scene-case-card"),
      visitor: rect(".visitor-stage"),
      desk: rect(".security-desk"),
      evidence: rect(".scene-hotspots"),
      authority: rect(".scene-actions"),
    };
  });
  assert.ok(composition.caseCard && composition.visitor && composition.desk && composition.evidence && composition.authority, "Mobile cabinet controls must be present");
  assert.ok(composition.caseCard.bottom <= composition.visitor.top + 4, `Case strip must clear visitor aperture: ${JSON.stringify(composition)}`);
  assert.ok(composition.desk.top >= composition.visitor.top + composition.visitor.height * 0.58, `Desk must stay below the visitor's torso: ${JSON.stringify(composition)}`);
  assert.ok(composition.evidence.top >= composition.desk.bottom - 2, `Evidence tray must sit below the desk: ${JSON.stringify(composition)}`);
  assert.ok(composition.authority.top >= composition.evidence.bottom - 2, `Authority rail must sit below evidence tray: ${JSON.stringify(composition)}`);
  await page.screenshot({ path: "/tmp/red-stamp-mobile.png", fullPage: true });
  await page.locator('[data-action="inspect"][data-tool="id"]').first().click();
  await page.locator("#inspectionOverlay.is-open").waitFor();
  const modalBox = await page.locator(".inspection-modal").boundingBox();
  assert.ok(modalBox && modalBox.width <= 390, `Inspection modal exceeds mobile width: ${JSON.stringify(modalBox)}`);
  assert.ok(await page.locator(".rs-dossier-page--identity").count());
  await page.keyboard.press("Escape");
  await page.close();
}

async function checkRadanPolarity(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const outcomes = new Set();
  try {
    for (let seed = 100; seed < 124; seed += 1) {
      await page.goto(`${baseUrl}/?seed=${seed}&debug=1`, { waitUntil: "networkidle" });
      const campaign = await readCampaign(page);
      campaign.flatMap((shift) => shift.cases)
        .filter((caseData) => caseData.id === "radan-kest")
        .forEach((caseData) => outcomes.add(caseData.expected));
      if (outcomes.has("admit") && outcomes.has("deny")) break;
    }
  } finally {
    await page.close();
  }
  assert.ok(outcomes.has("admit") && outcomes.has("deny"), `Radan needs both clean and compromised seeded scenarios: ${JSON.stringify([...outcomes])}`);
}

async function main() {
  const port = await findFreePort();
  baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: root,
    stdio: "ignore",
  });
  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch({
      headless: true,
      executablePath: chromiumPath,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await startRun(page, 424242);
    const firstCampaign = await readCampaign(page);
    assert.equal(firstCampaign.length, 3);
    assert.deepEqual(firstCampaign.map((shift) => shift.cases.length), [6, 5, 6]);
    assert.ok(firstCampaign.flatMap((shift) => shift.cases).every((caseData) => caseData.variantLabel));
    assert.ok(firstCampaign.flatMap((shift) => shift.cases).every((caseData) => (
      Array.isArray(caseData.evidenceLedger?.declared)
      && Array.isArray(caseData.evidenceLedger?.observed)
      && Object.prototype.hasOwnProperty.call(caseData.evidenceLedger || {}, "concealed")
    )), "Every case must carry a declared/observed/concealed evidence ledger");
    await checkRadanPolarity(browser);
    await page.screenshot({ path: "/tmp/red-stamp-desktop.png", fullPage: true });
    await inspectIdentityAndPages(page);
    await inspectXrayAndShortcuts(page);

    await page.reload({ waitUntil: "networkidle" });
    await page.locator('#overlay [data-action="start"]').click();
    const sameSeedCampaign = await readCampaign(page);
    assert.deepEqual(sameSeedCampaign, firstCampaign, "A supplied seed must make a run replayable");

    const secondPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    await startRun(secondPage, 424243);
    const secondCampaign = await readCampaign(secondPage);
    assert.notDeepEqual(secondCampaign, firstCampaign, "Different seeds must produce a different case order or variant set");
    await secondPage.close();
    await checkMobile(browser);

    console.log("Playwright smoke checks passed.");
    console.log("Screenshots: /tmp/red-stamp-desktop.png /tmp/red-stamp-mobile.png");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
