#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactRoot = path.join(root, "tmp", "audit-gameplay");
const manifestPath = path.join(artifactRoot, "manifest.json");
const seed = Number.parseInt(process.env.AUDIT_SEED || "424242", 10) >>> 0;
const requestedViewport = process.env.AUDIT_VIEWPORT || "";
const viewports = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

const sources = [
  { source: "01", tool: "appointment", label: "ROUTE / FILE" },
  { source: "02", tool: "id", label: "FACE / ID" },
  { source: "03", tool: "documents", label: "PAPERS" },
  { source: "04", tool: "detector", label: "PERSON / GATE" },
  { source: "05", tool: "xray", label: "BAG / SCAN" },
  { source: "06", tool: "question", label: "STATEMENT" },
];

const marks = ["match", "flag", "review", "review", "match", "flag"];
const markLabels = { match: "MATCH", flag: "FLAG", review: "REVIEW" };
const expectedMarkState = { match: "match", flag: "flag", review: "review" };

const report = {
  generatedAt: new Date().toISOString(),
  command: "npm run audit:gameplay",
  seed,
  viewports: [],
  coverage: {
    sources: Object.fromEntries(sources.map(({ tool }) => [tool, { cases: 0, viewports: [] }])),
    marks: { match: 0, flag: 0, review: 0 },
    subviews: { documentSheets: 0, detectorTrayItems: 0, bagItems: 0, xrayModes: 0, questionChoices: 0 },
    authority: { admit: 0, deny: 0, secondary: 0, liaison: 0 },
    submit: { currentSurface: 0, engineRecovery: 0 },
    caseAdvances: 0,
    stampAnimations: 0,
    shiftEnds: 0,
    shiftEndRecovery: 0,
    gameOver: 0,
    restart: 0,
  },
  screenshots: [],
  checks: { passed: 0, failed: 0 },
  failures: [],
};
const uniqueFindings = new Set();

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

function contextText(context) {
  return Object.entries(context || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`)
    .join(" ");
}

function fail(category, message, context = {}) {
  const dedupe = category === "assertion" && /keyboard\/screen-reader operable/.test(message)
    ? `${category}:${context.viewport || ""}:${context.surface || message}`
    : null;
  if (dedupe && uniqueFindings.has(dedupe)) return;
  if (dedupe) uniqueFindings.add(dedupe);
  report.checks.failed += 1;
  report.failures.push({
    id: `F${String(report.failures.length + 1).padStart(3, "0")}`,
    category,
    message,
    context,
  });
}

function pass() {
  report.checks.passed += 1;
}

async function check(label, operation, context = {}) {
  try {
    const value = await operation();
    pass();
    return value;
  } catch (error) {
    fail("assertion", `${label}: ${errorText(error)}`, context);
    return null;
  }
}

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

async function waitForServer(url) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // The temporary static server is still starting.
    }
    await sleep(100);
  }
  throw new Error(`Static server did not start at ${url}`);
}

function currentFrame(page) {
  return page.frames().find((frame) => /\/reference\/(?:desktop|mobile)(?:-[ab])?\.html/.test(frame.url())) || null;
}

async function waitForFrame(page, timeout = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const frame = currentFrame(page);
    if (frame) return frame;
    await page.waitForTimeout(50);
  }
  throw new Error("Current reference iframe did not mount");
}

async function waitForCondition(label, operation, timeout = 8000) {
  const startedAt = Date.now();
  let lastError = null;
  while (Date.now() - startedAt < timeout) {
    try {
      const value = await operation();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(60);
  }
  throw new Error(`${label} timed out${lastError ? `: ${errorText(lastError)}` : ""}`);
}

async function pageState(page) {
  return page.evaluate(() => window.RedStampDebug?.getState?.() || null);
}

async function pageCampaign(page) {
  return page.evaluate(() => window.RedStampDebug?.getCampaign?.() || []);
}

async function visibleCount(locator) {
  return locator.evaluateAll((elements) => elements.filter((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return !element.hidden && style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }).length);
}

async function visibleElements(locator) {
  return locator.evaluateAll((elements) => elements.filter((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return !element.hidden && style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }));
}

async function clickSurface(locator, label, context = {}) {
  try {
    const count = await visibleCount(locator);
    if (count === 0) throw new Error("no visible surface");
    await locator.first().click({ timeout: 3000 });
    pass();
    return true;
  } catch (error) {
    fail("broken-control", `${label}: ${errorText(error)}`, context);
    return false;
  }
}

async function capture(page, viewportId, name) {
  const filename = `${viewportId}-${name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.png`;
  const absolute = path.join(artifactRoot, filename);
  try {
    await page.screenshot({ path: absolute, fullPage: true });
    report.screenshots.push(path.relative(root, absolute));
    return path.relative(root, absolute);
  } catch (error) {
    fail("screenshot", `Could not capture ${filename}: ${errorText(error)}`, { viewport: viewportId, name });
    return null;
  }
}

async function assertFrameLayout(page, frame, viewport, phase, context = {}) {
  const dimensions = await frame.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    clientWidth: document.documentElement.clientWidth,
    clientHeight: document.documentElement.clientHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    visibleRoot: [...document.querySelectorAll("[data-fit]")].some((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }),
  }));
  const fullContext = { viewport: viewport.id, phase, ...context };
  await check("reference root must be visible", () => {
    if (!dimensions.visibleRoot) throw new Error("no visible data-fit root");
  }, fullContext);
  await check("reference document must not overflow horizontally", () => {
    if (dimensions.scrollWidth > dimensions.clientWidth + 1) throw new Error(JSON.stringify(dimensions));
  }, fullContext);
  await check("reference document must not overflow vertically", () => {
    if (dimensions.scrollHeight > dimensions.clientHeight + 1) throw new Error(JSON.stringify(dimensions));
  }, fullContext);

  const controls = await frame.locator("[data-ref-source]:visible, [data-ref-action]:visible, [data-ref-generated]:visible, [data-reference-shortcuts-toggle]:visible").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      key: element.dataset.refSource || element.dataset.refAction || element.dataset.refGenerated || element.dataset.referenceShortcutsToggle || element.tagName,
      text: element.innerText?.trim().replace(/\s+/g, " ").slice(0, 80),
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }));
  for (const control of controls) {
    await check(`${control.key} must have a usable layout box`, () => {
      if (control.width <= 0 || control.height <= 0) throw new Error(JSON.stringify(control));
      const horizontalScroller = viewport.id === "mobile"
        && (control.key === "back-window" || (control.key.length === 2 && /^0[1-6]$/.test(control.key)));
      const outsideHorizontalViewport = control.right < -1 || control.left > dimensions.clientWidth + 1;
      const outsideVerticalViewport = control.bottom < -1 || control.top > dimensions.clientHeight + 1;
      if (outsideVerticalViewport || (!horizontalScroller && outsideHorizontalViewport)) {
        throw new Error(`outside viewport ${JSON.stringify(control)}`);
      }
    }, fullContext);
  }
  return dimensions;
}

async function assertVisibleImages(frame, expectedAsset, context = {}) {
  await waitForCondition("visible image assets", async () => {
    const loaded = await frame.locator("img:visible").evaluateAll((elements) => elements.map((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0));
    return loaded.length > 0 && loaded.every(Boolean);
  }, 4000).catch(() => {});
  const images = await frame.locator("img:visible").evaluateAll((elements) => elements.map((image) => {
    const rect = image.getBoundingClientRect();
    return {
      src: image.currentSrc || image.src,
      alt: image.alt,
      slot: image.dataset.refSlot || "",
      loaded: image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      objectFit: getComputedStyle(image).objectFit,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    };
  }));
  if (!images.length) {
    fail("missing-asset", "Visible stage has no images", context);
    return images;
  }
  for (const image of images) {
    if (!image.loaded) {
      fail("missing-asset", `Image did not load: ${image.src}`, { ...context, slot: image.slot });
    } else {
      pass();
    }
    if (image.objectFit === "fill" && ["xray-scan", "visitor-face"].includes(image.slot)) {
      fail("layout", `Image uses object-fit: fill: ${image.src}`, { ...context, slot: image.slot });
    }
  }
  if (expectedAsset) {
    const matching = images.filter((image) => image.src.endsWith(expectedAsset));
    if (!matching.length) {
      fail("state-mismatch", `Active stage did not render expected asset ${expectedAsset}`, context);
    } else {
      pass();
    }
  }
  return images;
}

async function assertAccessibleSurfaces(frame, viewport, phase, context = {}) {
  // The bridge applies role/tabindex/label attributes on its sync tick. Give
  // that current-surface enhancement a moment to land before auditing it.
  await sleep(240);
  const surfaces = await frame.locator("[data-ref-source]:visible, [data-ref-action]:visible, [data-ref-generated]:visible").evaluateAll((elements) => elements.map((element) => {
    const native = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(element.tagName);
    const role = element.getAttribute("role");
    const tabIndex = element.tabIndex;
    const text = element.innerText?.trim().replace(/\s+/g, " ");
    const key = element.dataset.refGenerated
      ? `generated:${element.dataset.refGenerated}:${text.slice(0, 60)}`
      : element.dataset.refSource
      ? `source:${element.dataset.refSource}`
      : element.dataset.refAction
        ? `action:${element.dataset.refAction}`
        : `generated:${element.className}`;
    return {
      key,
      native,
      role,
      tabIndex,
      accessibleName: element.getAttribute("aria-label") || text,
    };
  }));
  const seen = new Set();
  for (const surface of surfaces) {
    if (seen.has(surface.key)) continue;
    seen.add(surface.key);
    await check(`${surface.key} must be keyboard/screen-reader operable`, () => {
      if (!surface.native && !surface.role && surface.tabIndex < 0) {
        throw new Error(`non-semantic ${surface.key}`);
      }
      if (!surface.accessibleName) throw new Error(`${surface.key} has no accessible name`);
    }, { viewport: viewport.id, phase, ...context, surface: surface.key });
  }
}

async function assertLabels(frame, viewport, phase, context = {}) {
  const rows = await frame.locator('[data-ref-source]:visible').evaluateAll((elements) => elements.map((element) => ({
    source: element.dataset.refSource,
    text: element.innerText.trim().replace(/\s+/g, " "),
  })));
  for (const expected of sources) {
    const row = rows.find((candidate) => candidate.source === expected.source);
    const aliases = {
      "01": [expected.label, "FILE", "APPOINTMENT"],
      "02": [expected.label, "FACE", "RECORD"],
      "03": [expected.label, "PAPERS", "DOCUMENTS"],
      "04": [expected.label, "GATE"],
      "05": [expected.label, "X-RAY", "SCAN"],
      "06": [expected.label, "ASK", "STATEMENT"],
    }[expected.source];
    await check(`source ${expected.source} must be present with meaningful label`, () => {
      if (!row) throw new Error("missing visible source row");
      if (!aliases.some((alias) => row.text.includes(alias))) throw new Error(`got ${row.text}`);
    }, { viewport: viewport.id, phase, ...context, source: expected.source });
  }
  const bodyText = await frame.locator("body").innerText();
  await check("reference must not expose stale numbered review labels", () => {
    if (/\b[1-6]\s+REVIEW\b/i.test(bodyText)) throw new Error("found numbered REVIEW label");
  }, { viewport: viewport.id, phase, ...context });
  await check("current reference must not expose the deferred variant picker", async () => {
    if (await visibleCount(frame.locator("#reference-variant-switcher"))) throw new Error("variant picker is visible");
  }, { viewport: viewport.id, phase, ...context });

  for (const [action, label] of [["admit", /RED\s*STAMP.*ADMIT ENTRY/s], ["secondary", /SECONDARY\s*INSPECTION/s], ["deny", /DENY\s*ENTRY/s]]) {
    const actionText = await frame.locator(`[data-ref-action="${action}"]:visible`).first().innerText().catch(() => "");
    await check(`${action} authority label must remain meaningful`, () => {
      if (!label.test(actionText)) throw new Error(`got ${actionText}`);
    }, { viewport: viewport.id, phase, ...context, action });
  }
}

async function auditWelcome(page, frame, viewport) {
  const context = { viewport: viewport.id, phase: "welcome" };
  await check("audit must mount the current reference iframe", () => {
    if (!/\/reference\/(?:desktop|mobile)\.html/.test(frame.url())) throw new Error(frame.url());
  }, context);
  await check("welcome must expose exactly one current-surface begin control", async () => {
    const count = await visibleCount(frame.locator('[data-ref-action="begin"]'));
    if (count !== 1) throw new Error(`count=${count}`);
  }, context);
  await check("welcome must say BEGIN SHIFT", async () => {
    const text = await frame.locator('[data-ref-action="begin"]').first().innerText();
    if (!/BEGIN SHIFT/i.test(text)) throw new Error(text);
  }, context);
  await check("welcome must begin in protocol standby", async () => {
    const text = await frame.locator("body").innerText();
    if (!/PROTOCOL STANDBY/i.test(text)) throw new Error("standby label missing");
  }, context);
  await assertFrameLayout(page, frame, viewport, "welcome");
  await assertVisibleImages(frame, null, context);
  await capture(page, viewport.id, "welcome");

  const audioButton = frame.locator('#reference-welcome-audio [data-ref-action="enable-audio"]');
  if (await visibleCount(audioButton)) {
    await clickSurface(audioButton, "welcome audio control", context);
    await check("welcome audio must start the title track after its gesture", async () => {
      await waitForCondition("title audio", async () => page.evaluate(() => {
        const audio = window.RedStampDebug?.getAudioState?.();
        return audio?.currentKey === "title" && audio.playing && audio.readyState >= 2 && audio.currentTime > 0;
      }), 6000);
    }, context);
  } else {
    fail("missing-control", "Welcome audio control is not available on the welcome surface", context);
  }

  const transitionWasPresent = { value: false };
  const begin = frame.locator('[data-ref-action="begin"]');
  try {
    await begin.click({ timeout: 3000 });
    transitionWasPresent.value = await visibleCount(frame.locator("#reference-scene-transition")) > 0;
    pass();
  } catch (error) {
    fail("broken-control", `BEGIN SHIFT could not be clicked: ${errorText(error)}`, context);
  }
  await check("BEGIN SHIFT must start the engine", async () => {
    await waitForCondition("started state", async () => (await pageState(page))?.started === true);
  }, context);
  await check("BEGIN SHIFT must create the scene transition", () => {
    if (!transitionWasPresent.value) throw new Error("transition curtain was not observed");
  }, context);
  frame = await waitForFrame(page);
  await waitForCondition("active reference surface", async () => await visibleCount(frame.locator('[data-ref-source="01"]')) > 0);
  await check("welcome begin control must disappear after start", async () => {
    if (await visibleCount(frame.locator('[data-ref-action="begin"]'))) throw new Error("begin remains visible");
  }, context);
  await check("active reference must say PROTOCOL ACTIVE", async () => {
    const state = await pageState(page);
    const text = await frame.locator("body").innerText();
    if (!state?.started || !/PROTOCOL ACTIVE/i.test(text)) throw new Error(text.slice(0, 300));
  }, context);
  await assertFrameLayout(page, frame, viewport, "active");
  await assertLabels(frame, viewport, "active");
  await assertAccessibleSurfaces(frame, viewport, "active");
  await check("BEGIN SHIFT must switch to checkpoint music", async () => {
    await waitForCondition("checkpoint audio", async () => page.evaluate(() => {
      const audio = window.RedStampDebug?.getAudioState?.();
      return audio?.currentKey === "checkpoint" && audio.playing && audio.readyState >= 2;
    }), 6000);
  }, context);
  await capture(page, viewport.id, "active-start");
  return { page, frame };
}

async function inspectDocumentSheets(frame, page, context) {
  const papers = frame.locator('[data-ref-action^="paper-"]:visible');
  const count = await visibleCount(papers);
  await check("documents stage must expose three document sheets", () => {
    if (count !== 3) throw new Error(`count=${count}`);
  }, context);
  for (let index = 0; index < 3; index += 1) {
    const paper = frame.locator(`[data-ref-action="paper-${index}"]:visible`);
    if (!(await clickSurface(paper, `document sheet ${index + 1}`, { ...context, sheet: index + 1 }))) continue;
    await check("document sheet detail must open", async () => {
      await waitForCondition("document close control", async () => await visibleCount(frame.locator('[data-ref-action="close-paper"]')) > 0);
    }, { ...context, sheet: index + 1 });
    report.coverage.subviews.documentSheets += 1;
    await capture(page, context.viewport, `${context.caseSlug}-03-paper-${index + 1}`);
    await clickSurface(frame.locator('[data-ref-action="close-paper"]:visible'), "close document sheet", { ...context, sheet: index + 1 });
    await waitForCondition("document sheet close", async () => await visibleCount(frame.locator('[data-ref-action="close-paper"]')) === 0).catch((error) => fail("state-mismatch", errorText(error), { ...context, sheet: index + 1 }));
  }
}

async function inspectDetectorTray(frame, page, context) {
  const tray = frame.locator('[data-ref-view="detector"]:visible [data-ref-generated="detector-item"]:visible');
  const count = await visibleCount(tray);
  await check("detector stage must expose its surrendered-object tray", () => {
    if (count < 1) throw new Error(`count=${count}`);
  }, context);
  for (let index = 0; index < count; index += 1) {
    const item = frame.locator('[data-ref-view="detector"]:visible [data-ref-generated="detector-item"]:visible').nth(index);
    if (!(await clickSurface(item, `detector tray item ${index + 1}`, { ...context, item: index + 1 }))) continue;
    await check("detector tray detail must open", async () => {
      await waitForCondition("detector close control", async () => await visibleCount(frame.locator('[data-ref-action="close-item"]')) > 0);
    }, { ...context, item: index + 1 });
    report.coverage.subviews.detectorTrayItems += 1;
    await clickSurface(frame.locator('[data-ref-action="close-item"]:visible'), "close detector item", { ...context, item: index + 1 });
    await waitForCondition("detector item close", async () => await visibleCount(frame.locator('[data-ref-action="close-item"]')) === 0).catch((error) => fail("state-mismatch", errorText(error), { ...context, item: index + 1 }));
  }
}

async function inspectXrayModes(frame, page, context) {
  for (const action of ["show-scan", "open-bag"]) {
    if (!(await clickSurface(frame.locator(`[data-ref-action="${action}"]:visible`), `X-ray ${action}`, context))) continue;
    await check(`X-ray ${action} must leave a readable scan surface`, async () => {
      const text = await frame.locator("body").innerText();
      if (action === "show-scan" && !/DENSITY SCAN/i.test(text)) throw new Error(text.slice(0, 220));
      if (action === "open-bag") {
        const bagMode = context.viewport === "mobile"
          ? /SATCHEL ON PLATE|TAP AN OBJECT|UNRESOLVED MASS/i.test(text)
          : /SATCHEL EMPTIED|CLICK AN OBJECT TO LOOK CLOSER/i.test(text);
        if (!bagMode) throw new Error(text.slice(0, 320));
      }
    }, context);
    report.coverage.subviews.xrayModes += 1;

    if (action === "open-bag") {
      const items = frame.locator('[data-ref-view="xray"]:visible [data-ref-generated="bag-item"]:visible');
      const count = await visibleCount(items);
      await check("bag mode must expose every surrendered object", () => {
        if (count < 1) throw new Error(`count=${count}`);
      }, context);
      for (let index = 0; index < count; index += 1) {
        const item = frame.locator('[data-ref-view="xray"]:visible [data-ref-generated="bag-item"]:visible').nth(index);
        if (!(await clickSurface(item, `bag item ${index + 1}`, { ...context, item: index + 1 }))) continue;
        await check("bag item detail must open", async () => {
          await waitForCondition("bag item close control", async () => await visibleCount(frame.locator('[data-ref-action="close-bag-item"]')) > 0);
        }, { ...context, item: index + 1 });
        report.coverage.subviews.bagItems += 1;
        await clickSurface(frame.locator('[data-ref-action="close-bag-item"]:visible'), "close bag item", { ...context, item: index + 1 });
        await waitForCondition("bag item close", async () => await visibleCount(frame.locator('[data-ref-action="close-bag-item"]')) === 0).catch((error) => fail("state-mismatch", errorText(error), { ...context, item: index + 1 }));
      }
      await clickSurface(frame.locator('[data-ref-action="show-scan"]:visible'), "return to density scan", context);
    }
  }
  const hint = frame.locator('[data-ref-action="xray-hint"]:visible');
  if (await clickSurface(hint, "X-ray hint", context)) {
    await check("X-ray hint must open its explanation", async () => {
      if (await visibleCount(frame.locator("#reference-xray-hint")) !== 1) throw new Error("hint missing");
      const text = await frame.locator("#reference-xray-hint").innerText();
      if (!/Unknown mass is a finding, not a verdict/i.test(text)) throw new Error(text);
    }, context);
    await clickSurface(hint, "close X-ray hint", context);
    await check("X-ray hint must close again", async () => {
      if (await visibleCount(frame.locator("#reference-xray-hint"))) throw new Error("hint remains open");
    }, context);
  }
  await capture(page, context.viewport, `${context.caseSlug}-05-xray`);
}

async function inspectQuestionChoices(frame, context) {
  const choices = frame.locator('[data-ref-generated="question-choice"]:visible');
  const count = await visibleCount(choices);
  await check("question stage must expose question choices", () => {
    if (count < 1) throw new Error(`count=${count}`);
  }, context);
  if (count) {
    if (await clickSurface(choices.first(), "question choice", context)) report.coverage.subviews.questionChoices += 1;
  }
}

async function auditSource(page, frame, source, mark, viewport, caseData, caseOrdinal, deep) {
  const context = {
    viewport: viewport.id,
    caseOrdinal,
    caseId: caseData.id,
    caseSlug: caseData.id,
    source: source.source,
    tool: source.tool,
  };
  const row = frame.locator(`[data-ref-source="${source.source}"]:visible`);
  if (!(await clickSurface(row, `open source ${source.source}`, context))) return;
  await check(`${source.tool} source must become selected and revealed`, async () => {
    await waitForCondition(`${source.tool} state`, async () => {
      const state = await pageState(page);
      return state?.selectedTool === source.tool && state.revealed?.[source.tool] === true;
    });
  }, context);
  report.coverage.sources[source.tool].cases += 1;
  if (!report.coverage.sources[source.tool].viewports.includes(viewport.id)) report.coverage.sources[source.tool].viewports.push(viewport.id);

  await check(`${source.tool} must render its active stage view`, async () => {
    const expected = {
      appointment: '[data-ref-slot="file-bearer"]:visible',
      id: '[data-ref-view="identity"]:visible',
      documents: '[data-ref-action="paper-0"]:visible',
      detector: '[data-ref-view="detector"]:visible',
      xray: '[data-ref-slot="xray-scan"]:visible',
      question: '[data-log]:visible',
    }[source.tool];
    if (source.tool === "appointment" && await visibleCount(frame.locator(expected)) === 0) {
      const text = await frame.locator("body").innerText();
      if (!/APPOINTMENT|WHAT YOU SEE/i.test(text)) throw new Error(`missing ${expected}`);
    } else if (!expected || await visibleCount(frame.locator(expected)) === 0) {
      throw new Error(`missing ${expected}`);
    }
  }, context);
  await check(`${source.tool} source label must match the current stage`, async () => {
    const text = await frame.locator("body").innerText();
    const aliases = {
      appointment: [source.label, "APPOINTMENT", "FILE"],
      id: [source.label, "RECORD", "FACE"],
      documents: [source.label, "PAPERS", "DOCUMENTS"],
      detector: [source.label, "GATE"],
      xray: [source.label, "DENSITY SCAN", "X-RAY"],
      question: [source.label, "INTERVIEW LOG", "ASK"],
    }[source.tool];
    if (!aliases.some((alias) => text.includes(alias))) throw new Error(`got ${text.slice(0, 260)}`);
  }, context);

  const assets = await page.evaluate(() => window.RedStampDebug.getAssetMap());
  const expectedAsset = source.tool === "id" ? assets.face : source.tool === "xray" ? assets.xray : null;
  await assertVisibleImages(frame, expectedAsset, context);
  if (deep && source.tool === "documents") await inspectDocumentSheets(frame, page, context);
  if (deep && source.tool === "detector") await inspectDetectorTray(frame, page, context);
  if (deep && source.tool === "xray") await inspectXrayModes(frame, page, context);
  if (deep && source.tool === "question") await inspectQuestionChoices(frame, context);

  await assertFrameLayout(page, frame, viewport, `stage-${source.source}`, context);
  await assertAccessibleSurfaces(frame, viewport, `stage-${source.source}`, context);
  if (caseOrdinal === 1) await capture(page, viewport.id, `stage-${source.source}-${source.tool}`);

  const markAction = frame.locator(`[data-ref-action="mark-${mark}"]:visible`);
  if (await clickSurface(markAction, `${markLabels[mark]} mark`, context)) {
    await check(`${source.tool} must store its ${mark} mark`, async () => {
      await waitForCondition(`${source.tool} mark`, async () => (await pageState(page))?.checklistMarks?.[source.tool] === expectedMarkState[mark]);
    }, context);
    report.coverage.marks[mark] += 1;
  }

  const back = frame.locator('[data-ref-action="back-window"]:visible');
  if (await clickSurface(back, `return from ${source.tool}`, context)) {
    await check(`${source.tool} return must restore the window`, async () => {
      await waitForCondition(`${source.tool} return`, async () => (await pageState(page))?.selectedTool === null);
    }, context);
  }
}

async function submitFindings(page, frame, viewport, caseData, caseOrdinal) {
  const context = { viewport: viewport.id, caseOrdinal, caseId: caseData.id };
  await sleep(240);
  frame = currentFrame(page) || frame;
  const currentSubmit = frame.locator('[data-ref-action="submit"]:visible, [data-ref-action="submit-checklist"]:visible');
  if (await visibleCount(currentSubmit)) {
    if (await clickSurface(currentSubmit, "submit findings", context)) {
      await check("current-surface submit must file the checklist", async () => {
        await waitForCondition("checklist submitted", async () => (await pageState(page))?.checklistSubmitted === true);
      }, context);
      report.coverage.submit.currentSurface += 1;
    }
  } else {
    fail("missing-control", "Current reference surface has no submit findings control", context);
    const recovered = await page.evaluate(() => {
      const action = window.RedStampDebug?.actions?.submit;
      if (!action) return false;
      action();
      return true;
    });
    if (recovered) {
      await check("engine submit recovery must file the checklist", async () => {
        await waitForCondition("engine checklist submitted", async () => (await pageState(page))?.checklistSubmitted === true);
      }, context);
      report.coverage.submit.engineRecovery += 1;
    } else {
      fail("state-mismatch", "Neither current submit surface nor engine submit action is available", context);
    }
  }
  frame = currentFrame(page) || frame;
  await check("filed checklist must expose ready state", async () => {
    await waitForCondition("ready state", async () => {
      const current = currentFrame(page);
      if (!current) return false;
      const text = await current.locator("body").innerText();
      return /\bCARD READY TO FILE\b/i.test(text);
    });
  }, context);
  return frame;
}

async function callLiaison(page, frame, viewport, caseData, caseOrdinal) {
  const context = { viewport: viewport.id, caseOrdinal, caseId: caseData.id };
  await sleep(240);
  frame = currentFrame(page) || frame;
  const visibleLiaison = frame.locator('[data-ref-action="liaison"]:visible');
  if (await visibleCount(visibleLiaison)) {
    await clickSurface(visibleLiaison, "liaison authority", context);
  } else {
    fail("missing-control", "Liaison has no visible current-surface action; only the keyboard path is available", context);
    await frame.locator("body").press("l").catch(() => page.keyboard.press("l"));
  }
  await check("liaison must be recorded in game state", async () => {
    await waitForCondition("liaison state", async () => (await pageState(page))?.liaisonCalled === true);
  }, context);
  report.coverage.authority.liaison += 1;
}

async function useSecondary(page, frame, viewport, caseData, caseOrdinal) {
  const context = { viewport: viewport.id, caseOrdinal, caseId: caseData.id };
  if (!(await clickSurface(frame.locator('[data-ref-action="secondary"]:visible'), "secondary inspection", context))) return;
  await check("secondary inspection must be recorded in game state", async () => {
    await waitForCondition("secondary state", async () => (await pageState(page))?.secondaryUsed === true);
  }, context);
  report.coverage.authority.secondary += 1;
}

async function resolveCase(page, frame, viewport, caseData, caseOrdinal, decision) {
  const context = { viewport: viewport.id, caseOrdinal, caseId: caseData.id, decision };
  const action = frame.locator(`[data-ref-action="${decision}"]:visible`).first();
  if (!(await clickSurface(action, `${decision} authority action`, context))) return { frame, advanced: false };
  await check(`${decision} must resolve the current case`, async () => {
    await waitForCondition("resolved state", async () => {
      const state = await pageState(page);
      return state?.resolved === true && state.finalDecision === decision;
    });
  }, context);
  report.coverage.authority[decision] += 1;
  if (decision === "admit") {
    await check("admit must trigger the visible stamp animation", async () => {
      await waitForCondition("stamp animation", async () => await visibleCount(frame.locator("#reference-stamp-motion")) > 0, 1500);
    }, context);
    report.coverage.stampAnimations += 1;
    await capture(page, viewport.id, `${String(caseOrdinal).padStart(2, "0")}-${caseData.id}-stamp`);
  }
  await check("resolved case must expose a current-surface outcome", async () => {
    await waitForCondition("case outcome", async () => await visibleCount(frame.locator("#reference-outcome")) > 0);
  }, context);
  // The engine schedules its transition overlay 720 ms after resolution while
  // the reference bridge can expose its outcome sooner. Let the engine settle
  // before advancing so the next-case/shift-end state cannot be stale.
  await sleep(800);
  if (caseOrdinal <= 2) {
    await capture(page, viewport.id, `${String(caseOrdinal).padStart(2, "0")}-${caseData.id}-outcome`);
  }
  const advance = frame.locator('#reference-outcome [data-ref-action="advance"]:visible');
  const previous = await pageState(page);
  const wasLastCase = previous?.caseIndex === (await page.evaluate(() => window.RedStampDebug.getCurrentShift().cases.length - 1));
  if (!(await clickSurface(advance, "advance case", context))) return { frame, advanced: false };
  if (!wasLastCase) {
    await check("advance must open the next case", async () => {
      await waitForCondition("next case", async () => {
        const state = await pageState(page);
        return state?.started === true && state.caseIndex === previous.caseIndex + 1 && state.resolved === false;
      });
    }, context);
    report.coverage.caseAdvances += 1;
    // The current bridge remounts the reference document shortly after the
    // engine transition. Let that scheduled reload settle before retaining a
    // frame handle for the next set of assertions.
    await sleep(300);
    frame = await waitForFrame(page);
    await waitForCondition("next case reference rows", async () => {
      const nextFrame = currentFrame(page);
      if (!nextFrame) return false;
      return await visibleCount(nextFrame.locator('[data-ref-source="01"]')) > 0
        && await visibleCount(nextFrame.locator("#reference-outcome")) === 0;
    });
    frame = currentFrame(page) || frame;
    return { frame, advanced: true };
  }
  await check("last case advance must expose shift-end surface", async () => {
    await waitForCondition("shift end", async () => {
      const state = await pageState(page);
      return state?.started === false && state?.resolved === true && await visibleCount(frame.locator("#reference-shift-end")) > 0;
    });
  }, context);
  report.coverage.shiftEnds += 1;
  return { frame, advanced: true, shiftEnded: true };
}

async function auditShiftEnd(page, frame, viewport, campaignLength, context) {
  // Advancing the current-surface outcome schedules one final iframe reload.
  // Do not inspect the shift-end overlay until that remount has settled.
  await sleep(300);
  await waitForCondition("shift-end reference panel", async () => {
    const current = currentFrame(page);
    return current && await visibleCount(current.locator("#reference-shift-end")) > 0;
  });
  frame = currentFrame(page) || frame;
  const state = await pageState(page);
  const panel = frame.locator("#reference-shift-end");
  const finalShift = Number(state?.day) >= campaignLength || Number(state?.career) <= 0;
  await check("shift-end screen must identify its terminal state", async () => {
    const text = await panel.innerText();
    const expected = finalShift ? /CLEARANCE WITHDRAWN|CAMPAIGN COMPLETE/i : /SHIFT CLOSED/i;
    if (!expected.test(text)) throw new Error(text.slice(0, 300));
  }, context);
  await assertFrameLayout(page, frame, viewport, "shift-end", context);
  await assertAccessibleSurfaces(frame, viewport, "shift-end", context);
  const buttonText = await panel.locator("button:visible").first().innerText().catch(() => "");
  if (finalShift) {
    const panelText = await panel.innerText().catch(() => "");
    await check("final shift must identify the report as complete", () => {
      if (!/SHIFT COMPLETE|FINAL REPORT/i.test(buttonText + panelText)) throw new Error(buttonText);
    }, context);
    report.coverage.gameOver += 1;
    await capture(page, viewport.id, "game-over");
    const restart = panel.locator('[data-ref-action="restart"]:visible');
    if (await clickSurface(restart, "start new campaign", context)) {
      await check("game-over restart must start a new campaign", async () => {
        await waitForCondition("restart state", async () => {
          const restarted = await pageState(page);
          return restarted?.started === true && restarted.day === 1 && restarted.caseIndex === 0 && restarted.resolved === false;
        });
      }, context);
      report.coverage.restart += 1;
    }
    return { final: true, restarted: true };
  }

  await check("non-final shift must offer OPEN NEXT SHIFT", () => {
    if (!/OPEN NEXT SHIFT/i.test(buttonText)) throw new Error(`got ${buttonText || "(no button)"}`);
  }, context);
  await capture(page, viewport.id, `shift-${String(state?.day || 0).padStart(2, "0")}-complete`);
  const nextShift = panel.locator('[data-ref-action="advance"]:visible');
  if (!(await clickSurface(nextShift, "open next shift", context))) {
    fail("state-mismatch", "Could not advance from the visible shift-end surface", context);
    return { final: false, restarted: false };
  }
  let openedFromCurrentSurface = false;
  await check("next shift action must open the next shift", async () => {
    await waitForCondition("next shift", async () => {
      const next = await pageState(page);
      return next?.started === true && next.day === state.day + 1 && next.caseIndex === 0;
    }, 1500);
    openedFromCurrentSurface = true;
  }, context);
  if (!openedFromCurrentSurface) {
    // The current reference button is still audited above. If its bridge
    // dispatch does not reach the engine, use the engine-only action to keep
    // the rest of the deterministic campaign traversable.
    const recovered = await page.evaluate(() => {
      const action = document.querySelector('[data-action="next-shift"]');
      if (!action) return false;
      action.click();
      return true;
    }).catch(() => false);
    if (!recovered) {
      fail("state-mismatch", "Could not recover from non-final shift-end surface", context);
      return { final: false, restarted: false };
    }
    await check("engine recovery must open the next shift", async () => {
      await waitForCondition("recovered next shift", async () => {
        const next = await pageState(page);
        return next?.started === true && next.day === state.day + 1 && next.caseIndex === 0;
      });
    }, context);
    report.coverage.shiftEndRecovery += 1;
  }
  await sleep(300);
  frame = await waitForFrame(page);
  await waitForCondition("next shift reference rows", async () => {
    const nextFrame = currentFrame(page);
    if (!nextFrame) return false;
    return await visibleCount(nextFrame.locator('[data-ref-source="01"]')) > 0
      && await visibleCount(nextFrame.locator("#reference-shift-end")) === 0;
  });
  frame = currentFrame(page) || frame;
  return { final: false, restarted: false, frame };
}

async function auditViewport(baseUrl, viewport) {
  const browser = auditViewport.browser;
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  const viewportReport = { id: viewport.id, width: viewport.width, height: viewport.height, cases: [], diagnostics: [] };
  report.viewports.push(viewportReport);
  const seenRequests = new Set();
  page.on("pageerror", (error) => fail("runtime", `Reference page error: ${errorText(error)}`, { viewport: viewport.id }));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (!/\/reference\/|\/assets\//.test(url)) return;
    const failure = request.failure()?.errorText || "";
    if (failure === "net::ERR_ABORTED") return;
    const key = `failed:${url}:${failure}`;
    if (seenRequests.has(key)) return;
    seenRequests.add(key);
    fail("missing-asset", `Request failed: ${url}`, { viewport: viewport.id, error: failure || "unknown" });
  });
  page.on("response", (response) => {
    const url = response.url();
    if (response.status() < 400 || !/\/reference\/|\/assets\//.test(url)) return;
    const key = `response:${response.status()}:${url}`;
    if (seenRequests.has(key)) return;
    seenRequests.add(key);
    fail("missing-asset", `HTTP ${response.status()} for ${url}`, { viewport: viewport.id });
  });

  try {
    await page.goto(`${baseUrl}/?seed=${seed}`, { waitUntil: "domcontentloaded" });
    let frame = await waitForFrame(page);
    await waitForCondition("welcome begin", async () => await visibleCount(frame.locator('[data-ref-action="begin"]')) === 1);
    ({ frame } = await auditWelcome(page, frame, viewport));
    const campaign = await pageCampaign(page);
    const campaignLength = campaign.length;
    const totalCases = campaign.reduce((total, shift) => total + shift.cases.length, 0);
    viewportReport.campaignLength = campaignLength;
    viewportReport.totalCases = totalCases;
    let caseOrdinal = 0;
    let decisionCoverage = { admit: false, deny: false };
    let shiftEnd = false;
    let sawGameOver = false;
    let sawRestart = false;

    while (!shiftEnd && caseOrdinal < totalCases + campaignLength + 2) {
      const state = await pageState(page);
      const currentShift = campaign[state.day - 1];
      const caseData = currentShift?.cases?.[state.caseIndex];
      if (!caseData) {
        fail("state-mismatch", "Current engine state does not map to a campaign case", { viewport: viewport.id, state });
        break;
      }
      caseOrdinal += 1;
      const caseContext = { viewport: viewport.id, caseOrdinal, caseId: caseData.id, day: state.day, caseIndex: state.caseIndex };
      console.log(`[${viewport.id}] case ${caseOrdinal}/${totalCases}: day ${state.day} ${caseData.id}`);
      viewportReport.cases.push({ ordinal: caseOrdinal, day: state.day, index: state.caseIndex, id: caseData.id, expected: caseData.expected });
      await assertFrameLayout(page, frame, viewport, "case-start", caseContext);
      await assertLabels(frame, viewport, "case-start", caseContext);
      const assets = await page.evaluate(() => window.RedStampDebug.getAssetMap());
      await assertVisibleImages(frame, assets?.scene, caseContext);
      await capture(page, viewport.id, `${String(caseOrdinal).padStart(2, "0")}-${caseData.id}-window`);

      for (let index = 0; index < sources.length; index += 1) {
        await auditSource(page, frame, sources[index], marks[index], viewport, caseData, caseOrdinal, caseOrdinal === 1);
        frame = currentFrame(page) || frame;
      }

      frame = await submitFindings(page, frame, viewport, caseData, caseOrdinal);
      if (caseOrdinal === 1 || caseData.requiresSecondary) await useSecondary(page, frame, viewport, caseData, caseOrdinal);
      if (caseOrdinal === 1 || caseData.requiresLiaison) await callLiaison(page, frame, viewport, caseData, caseOrdinal);
      frame = currentFrame(page) || frame;

      let decision = caseData.expected === "admit" || caseData.expected === "deny" ? caseData.expected : "deny";
      if (!decisionCoverage.admit && campaign.some((shift) => shift.cases.some((candidate) => candidate.expected === "admit")) && caseData.expected !== "admit") {
        const futureAdmit = campaign.some((shift) => shift.cases.some((candidate) => candidate.id === caseData.id && candidate.expected === "admit"));
        if (!futureAdmit) decision = "admit";
      }
      if (!decisionCoverage.deny && caseData.expected === "deny") decision = "deny";
      if (!decisionCoverage.admit && caseData.expected === "admit") decision = "admit";
      decisionCoverage[decision] = true;
      const result = await resolveCase(page, frame, viewport, caseData, caseOrdinal, decision);
      frame = result.frame || currentFrame(page) || frame;
      if (result.shiftEnded) {
        shiftEnd = true;
        const endResult = await auditShiftEnd(page, frame, viewport, campaignLength, caseContext);
        if (endResult.final) {
          sawGameOver = true;
          sawRestart = endResult.restarted === true;
        }
        if (!endResult.final && endResult.frame) {
          frame = endResult.frame;
          shiftEnd = false;
        }
      } else if (!result.advanced) {
        break;
      }
    }
    if (!decisionCoverage.admit || !decisionCoverage.deny) {
      fail("coverage", "Campaign did not exercise both visible terminal authority decisions", { viewport: viewport.id, decisionCoverage });
    }
    await check("campaign traversal must not stop before the final game-over screen", () => {
      if (!sawGameOver || !sawRestart) throw new Error(`gameOver=${sawGameOver} restart=${sawRestart}`);
    }, { viewport: viewport.id });
  } catch (error) {
    fail("harness", `Viewport audit aborted: ${errorText(error)}`, { viewport: viewport.id });
  } finally {
    await page.close();
  }
}

async function writeManifest(extra = {}) {
  await mkdir(artifactRoot, { recursive: true });
  report.finishedAt = new Date().toISOString();
  report.status = report.failures.length ? "failed" : "passed";
  report.failureCount = report.failures.length;
  await writeFile(manifestPath, `${JSON.stringify({ ...report, ...extra }, null, 2)}\n`);
}

async function main() {
  await mkdir(artifactRoot, { recursive: true });
  const port = await findFreePort();
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
      ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
      args: ["--no-sandbox"],
    });
    auditViewport.browser = browser;
    const selectedViewports = requestedViewport
      ? viewports.filter((viewport) => viewport.id === requestedViewport)
      : viewports;
    if (!selectedViewports.length) throw new Error(`Unknown AUDIT_VIEWPORT=${requestedViewport}`);
    await Promise.all(selectedViewports.map((viewport) => auditViewport(baseUrl, viewport)));
  } catch (error) {
    fail("harness", errorText(error));
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
    await writeManifest({ baseUrl, artifactDirectory: path.relative(root, artifactRoot) });
  }

  console.log(`Gameplay audit ${report.status}: ${report.checks.passed} checks passed, ${report.failures.length} failures.`);
  console.log(`Manifest: ${path.relative(root, manifestPath)}`);
  if (report.failures.length) {
    for (const failure of report.failures.slice(0, 20)) {
      console.error(`${failure.id} [${failure.category}] ${failure.message} ${contextText(failure.context)}`.trim());
    }
    if (report.failures.length > 20) console.error(`… ${report.failures.length - 20} additional failures are in the manifest.`);
    process.exitCode = 1;
  }
}

main().catch(async (error) => {
  fail("harness", errorText(error));
  await writeManifest();
  console.error(error);
  process.exitCode = 1;
});
