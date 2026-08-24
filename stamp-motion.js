/*
 * Red Stamp physical motion sidecar.
 *
 * The game already owns the .stamp-hit class. This file observes that hook,
 * but the parent may also call RedStampStampMotion.trigger(target) directly.
 */
(function installRedStampMotion(global) {
  "use strict";

  const document = global.document;
  if (!document) return;

  const DEFAULT_TARGET = ".security-desk";
  const STAMP_HOOK = "stamp-hit";
  const ACTIVE_CLASS = "stamp-motion-active";
  const AUTHORITY_CLASS = "stamp-motion-authority";
  const GATE_CLASS = "stamp-motion-gate";
  const DOCUMENT_ACTIVE_CLASS = "stamp-motion-document-active";
  const DOCUMENT_ISSUED_CLASS = "stamp-motion-document-issued";
  const INK_ISSUED_CLASS = "stamp-motion-ink-issued";
  const MOTION_DURATION = 820;
  const REDUCED_DURATION = 220;
  const timers = new WeakMap();
  const documentTimers = new WeakMap();
  const responseTimers = new WeakMap();
  let observer = null;

  const DOCUMENT_TYPES = [
    { header: "VESKAR / ENTRY CONTROL", title: "ENTRY AUTHORIZATION" },
    { header: "VESKAR / CLEARANCE OFFICE", title: "SERVICE PASS" },
    { header: "VESKAR / RED REGISTER", title: "TEMPORARY ACCESS" },
  ];

  function isElement(value) {
    return value && value.nodeType === 1;
  }

  function reducedMotion() {
    return Boolean(
      global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }

  function resolveTarget(target) {
    if (target == null) return document.querySelector(DEFAULT_TARGET);

    let element = target;
    if (typeof target === "string") element = document.querySelector(target);
    if (!isElement(element)) return null;

    if (element.matches(".desk-stamp-art")) {
      element = element.closest(".security-desk");
      if (!element) return null;
    }

    return element;
  }

  function ensureInk(target) {
    const panel = target.querySelector(".desk-panel") || target;
    let ink = Array.from(panel.children).find((child) => child.classList.contains("stamp-motion-ink"));

    if (!ink) {
      ink = document.createElement("span");
      ink.className = "stamp-motion-ink";
      ink.setAttribute("aria-hidden", "true");
      panel.appendChild(ink);
    }

    return ink;
  }

  function makeDocumentChild(className, text) {
    const child = document.createElement("span");
    child.className = className;
    if (text) child.textContent = text;
    return child;
  }

  function ensureDocument(target) {
    const panel = target.querySelector(".desk-panel") || target;
    let sheet = Array.from(panel.children).find((child) => child.classList.contains("stamp-motion-document"));

    if (!sheet) {
      sheet = document.createElement("div");
      sheet.className = "stamp-motion-document";
      sheet.setAttribute("aria-hidden", "true");

      sheet.append(
        makeDocumentChild("stamp-motion-document-fold"),
        makeDocumentChild("stamp-motion-document-header", "VESKAR / ENTRY CONTROL"),
        makeDocumentChild("stamp-motion-document-title", "ENTRY AUTHORIZATION"),
        makeDocumentChild("stamp-motion-document-lines"),
        makeDocumentChild("stamp-motion-document-seal", "V"),
        makeDocumentChild("stamp-motion-document-case", "CASE —"),
        makeDocumentChild("stamp-motion-document-footer", "SECURITY DESK / 2026"),
      );
      panel.insertBefore(sheet, panel.firstChild || null);
    }

    return sheet;
  }

  function documentHash(value) {
    return Array.from(value).reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7);
  }

  function updateDocument(sheet, target) {
    const caseNumber = target.querySelector("#deskCaseNumber")?.textContent?.trim() || "CASE —";
    const type = DOCUMENT_TYPES[documentHash(caseNumber) % DOCUMENT_TYPES.length];
    const header = sheet.querySelector(".stamp-motion-document-header");
    const title = sheet.querySelector(".stamp-motion-document-title");
    const caseLabel = sheet.querySelector(".stamp-motion-document-case");

    if (header) header.textContent = type.header;
    if (title) title.textContent = type.title;
    if (caseLabel) caseLabel.textContent = caseNumber.toUpperCase();
  }

  function restartClass(element, className) {
    element.classList.remove(className);
    // Reading layout forces a new animation interval on repeated stamps.
    void element.offsetWidth;
    element.classList.add(className);
  }

  function pulseClass(element, className, duration) {
    if (!element) return;

    const previousTimer = responseTimers.get(element);
    if (previousTimer) global.clearTimeout(previousTimer);

    restartClass(element, className);
    const timer = global.setTimeout(() => {
      element.classList.remove(className);
      responseTimers.delete(element);
    }, duration);
    responseTimers.set(element, timer);
  }

  function triggerAuthorityResponse(duration) {
    document
      .querySelectorAll(".scene-decision.admit, .decision-button.admit")
      .forEach((element) => pulseClass(element, AUTHORITY_CLASS, duration));

    const gate = document.querySelector(".entry-frame");
    if (gate) pulseClass(gate, GATE_CLASS, duration);
  }

  function trigger(target) {
    const stampTarget = resolveTarget(target);
    if (!stampTarget) return false;

    const previousTimer = timers.get(stampTarget);
    if (previousTimer) global.clearTimeout(previousTimer);

    const sheet = ensureDocument(stampTarget);
    const ink = ensureInk(stampTarget);
    updateDocument(sheet, stampTarget);

    const previousDocumentTimer = documentTimers.get(stampTarget);
    if (previousDocumentTimer) global.clearTimeout(previousDocumentTimer);

    sheet.classList.remove(DOCUMENT_ISSUED_CLASS);
    restartClass(sheet, DOCUMENT_ACTIVE_CLASS);
    ink.classList.remove(INK_ISSUED_CLASS);
    restartClass(stampTarget, ACTIVE_CLASS);

    const duration = reducedMotion() ? REDUCED_DURATION : MOTION_DURATION;
    triggerAuthorityResponse(duration);

    const timer = global.setTimeout(() => {
      stampTarget.classList.remove(ACTIVE_CLASS);
      timers.delete(stampTarget);
    }, duration);
    timers.set(stampTarget, timer);

    const documentTimer = global.setTimeout(() => {
      sheet.classList.remove(DOCUMENT_ACTIVE_CLASS);
      sheet.classList.add(DOCUMENT_ISSUED_CLASS);
      ink.classList.add(INK_ISSUED_CLASS);
      documentTimers.delete(stampTarget);
    }, duration);
    documentTimers.set(stampTarget, documentTimer);

    return true;
  }

  function hadClass(classAttribute, className) {
    return typeof classAttribute === "string" && classAttribute.split(/\s+/).includes(className);
  }

  function observeStampHook() {
    if (observer || !global.MutationObserver || !document.documentElement) return;

    observer = new global.MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "attributes" || mutation.attributeName !== "class") return;
        const target = mutation.target;
        if (!isElement(target) || !target.classList.contains(STAMP_HOOK)) return;
        if (hadClass(mutation.oldValue, STAMP_HOOK)) return;
        trigger(target);
      });
    });

    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
      attributeOldValue: true,
    });
  }

  function init() {
    observeStampHook();
    document.querySelectorAll(`.${STAMP_HOOK}`).forEach((target) => trigger(target));
  }

  global.RedStampStampMotion = {
    trigger,
    observe: observeStampHook,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})(window);
