#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // The static server is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Static server did not start at ${url}`);
}

function referenceFrame(page) {
  const frame = page.frames().find((candidate) => candidate.url().includes("/reference/"));
  assert.ok(frame, "The unpacked reference frame must be mounted");
  return frame;
}

async function startRun(page, baseUrl, seed) {
  await page.goto(`${baseUrl}/?seed=${seed}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(450);
  let frame = referenceFrame(page);
  await frame.locator('[data-ref-action="begin"]').waitFor();
  assert.equal(await frame.locator('[data-ref-action="begin"]').count(), 1, "Welcome must have one begin control");
  assert.equal(
    await frame.locator('[data-ref-slot="visitor-name"]').evaluate((element) => getComputedStyle(element).fontFamily),
    "Staatliches, sans-serif",
    "Reference heading font must come from the unpacked font bundle",
  );

  // The welcome page is the iframe surface. A neutral first gesture must
  // unlock its title theme before BEGIN SHIFT changes the music to checkpoint.
  await frame.locator("body").click({ position: { x: 16, y: 16 } });
  await page.waitForFunction(() => window.RedStampDebug?.getAudioState?.().currentKey === "title");

  await frame.locator('[data-ref-action="begin"]').click();
  await page.waitForFunction(() => window.RedStampDebug?.getState().started === true);
  await page.waitForTimeout(350);
  frame = referenceFrame(page);
  assert.equal(await frame.locator('[data-ref-action="begin"]').count(), 0, "Welcome must close after beginning");
  assert.notEqual((await frame.locator('[data-ref-slot="visitor-name"]').innerText()).trim(), "VISITOR");
  assert.equal(await page.evaluate(() => window.RedStampDebug.getState().started), true);
  const initialVisualState = await page.evaluate(() => ({
    state: window.RedStampDebug.getState(),
    assets: window.RedStampDebug.getAssetMap(),
  }));
  assert.equal(await frame.locator('[data-ref-slot="tolerance-value"]').count(), 1, "Tolerance must have one independent live slot");
  assert.equal(await frame.locator('[data-ref-slot="career-value"]').count(), 1, "Career must have one independent live slot");
  assert.equal(
    await frame.locator('[data-ref-slot="visitor-scene"]').first().evaluate((element, asset) => element.src.endsWith(asset), initialVisualState.assets.scene),
    true,
    "Reference scene must use the current campaign visitor asset",
  );
  assert.equal(
    await frame.locator('[data-ref-slot="visitor-face"]').first().evaluate((element, asset) => element.src.endsWith(asset), initialVisualState.assets.face),
    true,
    "Reference face must use the current campaign visitor asset",
  );
  assert.match(
    await frame.locator('[data-ref-action="admit"]').first().innerText(),
    /RED\s*STAMP/,
    "Admit action must retain its meaningful red-stamp title",
  );
  assert.match(
    await frame.locator('[data-ref-action="secondary"]').first().innerText(),
    /SECONDARY\s*INSPECTION/,
    "Secondary action must retain its meaningful inspection title",
  );
  assert.match(
    await frame.locator('[data-ref-action="deny"]').first().innerText(),
    /DENY\s*ENTRY/,
    "Deny action must retain its meaningful entry title",
  );
  return frame;
}

async function exerciseDesktop(page, baseUrl) {
  let frame = await startRun(page, baseUrl, 424242);
  for (const [source, tool] of Object.entries({
    "01": "appointment",
    "02": "id",
    "03": "documents",
    "04": "detector",
    "05": "xray",
    "06": "question",
  })) {
    await frame.locator(`[data-ref-source="${source}"]`).click();
    await page.waitForTimeout(160);
    assert.equal(
      await page.evaluate((name) => window.RedStampDebug.getState().revealed[name] === true, tool),
      true,
      `${tool} source click must reveal the existing game result`,
    );
    await frame.locator('[data-ref-action="mark-review"]').click();
    await page.waitForTimeout(120);
    assert.equal(
      await page.evaluate((name) => window.RedStampDebug.getState().checklistMarks[name], tool),
      "review",
      `${tool} mark must write to the existing checklist state`,
    );
  }

  await frame.locator('[data-ref-source="05"]').click();
  await page.waitForTimeout(160);
  const xrayAsset = await page.evaluate(() => window.RedStampDebug.getAssetMap().xray);
  assert.equal(
    await frame.locator('[data-ref-slot="xray-scan"]').first().evaluate((element, asset) => element.src.endsWith(asset), xrayAsset),
    true,
    "Reference scan must use the current campaign X-ray asset",
  );
  await frame.locator('[data-ref-action="xray-hint"]').click();
  assert.match(
    await frame.locator("#reference-xray-hint").innerText(),
    /Unknown mass is a finding, not a verdict/,
    "X-ray hint must explain that an unknown mass is a finding",
  );

  await frame.locator('[data-ref-action="secondary"]').first().click();
  await page.waitForTimeout(140);
  assert.equal(await page.evaluate(() => window.RedStampDebug.getState().secondaryUsed), true);
  await page.keyboard.press("l");
  await page.waitForTimeout(140);
  assert.equal(await page.evaluate(() => window.RedStampDebug.getState().liaisonCalled), true);

  await frame.locator('[data-ref-action="admit"]').first().click();
  await frame.locator("#reference-stamp-motion").waitFor();
  assert.equal(
    await frame.locator('[data-ref-action="admit"].reference-stamp-action').count(),
    1,
    "Admit action must replay the visible stamp impact",
  );
  await frame.locator("#reference-outcome").waitFor();
  assert.equal(await page.evaluate(() => window.RedStampDebug.getState().resolved), true);
  const resolvedState = await page.evaluate(() => window.RedStampDebug.getState());
  assert.equal(
    await frame.locator('[data-ref-slot="career-value"]').innerText(),
    String(resolvedState.career),
    "Career metric must follow the existing game state after a decision",
  );
  assert.equal(await frame.locator("#reference-outcome").count(), 1, "Decision must produce a visible reference outcome");
  await frame.locator('#reference-outcome [data-ref-action="advance"]').click();
  await page.waitForTimeout(500);
  frame = referenceFrame(page);
  assert.equal(await page.evaluate(() => window.RedStampDebug.getState().caseIndex), 1, "Continue must advance the campaign case");
  assert.equal(await frame.locator('[data-ref-action="begin"]').count(), 0, "Next case must keep the visitor queue active");
  const nextAssets = await page.evaluate(() => window.RedStampDebug.getAssetMap());
  assert.equal(
    await frame.locator('[data-ref-slot="visitor-scene"]').first().evaluate((element, asset) => element.src.endsWith(asset), nextAssets.scene),
    true,
    "Next visitor must replace the reference scene asset",
  );
  await page.screenshot({ path: "/tmp/red-stamp-reference-desktop.png", fullPage: true });
}

async function exerciseMobile(browser, baseUrl) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  try {
    const frame = await startRun(page, baseUrl, 1337);
    const dimensions = await frame.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
    }));
    assert.ok(dimensions.documentWidth <= dimensions.width + 1, `Mobile reference overflows horizontally: ${JSON.stringify(dimensions)}`);
    assert.ok(dimensions.documentHeight <= dimensions.height + 1, `Mobile reference overflows vertically: ${JSON.stringify(dimensions)}`);
    await frame.locator('[data-ref-source="02"]').click();
    await page.waitForTimeout(160);
    assert.equal(await page.evaluate(() => window.RedStampDebug.getState().revealed.id), true);
    await page.screenshot({ path: "/tmp/red-stamp-reference-mobile.png", fullPage: true });
  } finally {
    await page.close();
  }
}

async function main() {
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: root,
    stdio: "ignore",
  });
  let browser;
  try {
    await waitForServer(`${baseUrl}/index.html`);
    browser = await chromium.launch({
      headless: true,
      ...(existsSync("/usr/bin/chromium-browser") ? { executablePath: "/usr/bin/chromium-browser" } : {}),
      args: ["--no-sandbox"],
    });
    const desktop = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
    await exerciseDesktop(desktop, baseUrl);
    await desktop.close();
    await exerciseMobile(browser, baseUrl);
    console.log("Reference UI smoke checks passed.");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
