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
  const MOTION_DURATION = 820;
  const REDUCED_DURATION = 220;
  const timers = new WeakMap();
  const responseTimers = new WeakMap();
  let observer = null;

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

    ensureInk(stampTarget);
    restartClass(stampTarget, ACTIVE_CLASS);

    const duration = reducedMotion() ? REDUCED_DURATION : MOTION_DURATION;
    triggerAuthorityResponse(duration);

    const timer = global.setTimeout(() => {
      stampTarget.classList.remove(ACTIVE_CLASS);
      timers.delete(stampTarget);
    }, duration);
    timers.set(stampTarget, timer);

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
