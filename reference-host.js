"use strict";

(() => {
  const frame = document.querySelector("#reference-frame");
  const media = window.matchMedia("(max-width: 700px)");
  if (!frame) return;

  const toolBySource = {
    "01": "appointment",
    "02": "id",
    "03": "documents",
    "04": "detector",
    "05": "xray",
    "06": "question",
  };

  function debug() {
    return window.RedStampDebug;
  }

  function snapshot() {
    const api = debug();
    return api ? {
      state: api.getState(),
      shift: api.getCurrentShift(),
      caseData: api.getCurrentCase(),
      assets: api.getAssetMap(),
    } : null;
  }

  function dispatch(action, value) {
    const actions = debug()?.actions;
    if (!actions) return false;
    const handlers = {
      begin: () => actions.start(),
      restart: () => actions.restart(),
      inspect: () => actions.inspect(value),
      mark: () => actions.mark(value),
      submit: () => actions.submit(),
      secondary: () => actions.secondary(),
      liaison: () => actions.liaison(),
      admit: () => actions.resolve("admit"),
      deny: () => actions.resolve("deny"),
      back: () => actions.returnToWindow(),
      advance: () => actions.advance(),
    };
    const handler = handlers[action];
    if (!handler) return false;
    handler();
    if (action === "advance") {
      window.setTimeout(() => frame.contentWindow?.location.reload(), 90);
    }
    window.setTimeout(() => frame.contentWindow?.ReferenceBridge?.sync(), 0);
    return true;
  }

  function unlockAudio() {
    return debug()?.actions?.unlockAudio?.() || false;
  }

  function enableAudio() {
    return debug()?.actions?.enableAudio?.() || false;
  }

  function audioState() {
    return debug()?.getAudioState?.() || null;
  }

  let campaignLengthCache = null;
  function campaignLength() {
    if (campaignLengthCache === null) {
      const campaign = debug()?.getCampaign?.();
      campaignLengthCache = Array.isArray(campaign) ? campaign.length : 0;
    }
    return campaignLengthCache;
  }

  window.RedStampHost = {
    dispatch,
    snapshot,
    unlockAudio,
    enableAudio,
    audioState,
    campaignLength,
  };

  function sourcePath() {
    const hash = window.location.hash.toLowerCase();
    const variant = hash === "#a" ? "-a" : hash === "#b" ? "-b" : "";
    return `reference/${media.matches ? "mobile" : "desktop"}${variant}.html?ui=3`;
  }

  function mountReference() {
    const next = sourcePath();
    if (frame.getAttribute("src") === next) return;
    frame.src = next;
  }

  frame.addEventListener("load", () => {
    window.setTimeout(() => frame.contentWindow?.ReferenceBridge?.hydrate(), 80);
  });
  media.addEventListener?.("change", mountReference);
  window.addEventListener("hashchange", mountReference);
  window.addEventListener("resize", mountReference, { passive: true });
  mountReference();

  window.setInterval(() => {
    frame.contentWindow?.ReferenceBridge?.sync();
  }, 180);

  window.RedStampHost.toolBySource = toolBySource;
  window.RedStampHost.variantFromHash = () => {
    const hash = window.location.hash.toLowerCase();
    return hash === "#a" ? "a" : hash === "#b" ? "b" : "c";
  };
})();
