"use strict";

(() => {
  const BACKGROUND = "../assets/generated/ui-variants/a/checkpoint-background.png";

  function host() {
    try {
      return window.parent !== window ? window.parent.RedStampHost : null;
    } catch {
      return null;
    }
  }

  function tone(status = "") {
    if (/clear|match|confirmed|order/i.test(status)) return "clear";
    if (/flag|alarm|fraud|denied|threat|discrep/i.test(status)) return "alert";
    return "review";
  }

  function assetUrl(asset) {
    return asset ? new URL(`../${asset}`, document.baseURI).href : "";
  }

  function ensureGuide(view, kind) {
    let guide = view.querySelector(`:scope > .variant-inspection-guide[data-kind="${kind}"]`);
    if (guide) return guide;
    guide = document.createElement("section");
    guide.className = "variant-inspection-guide";
    guide.dataset.kind = kind;
    guide.innerHTML = `
      <div>
        <div class="variant-guide-step"></div>
        <div class="variant-guide-mark"></div>
      </div>
      <div>
        <div class="variant-guide-status"></div>
        <div class="variant-guide-title"></div>
        <p class="variant-guide-detail"></p>
      </div>
      <div class="variant-guide-sequence"></div>`;
    view.append(guide);
    return guide;
  }

  function updateGuide(guide, { step, label, result, mark, sequence }) {
    const status = result?.status || "REVIEW";
    guide.dataset.tone = tone(status);
    guide.querySelector(".variant-guide-step").innerHTML = `${step}<strong>${label}</strong>`;
    guide.querySelector(".variant-guide-status").textContent = `FINDING · ${status}`;
    guide.querySelector(".variant-guide-title").textContent = result?.title || "CHECK REQUIRED";
    guide.querySelector(".variant-guide-detail").textContent = result?.detail || "Review this source before marking the verification card.";
    guide.querySelector(".variant-guide-mark").textContent = `CARD · ${mark ? mark.toUpperCase() : "NOT MARKED"}`;
    guide.querySelector(".variant-guide-sequence").innerHTML = sequence
      .map((item, index) => `<span><b>${index + 1}</b> ${item}</span>`)
      .join("");
  }

  function sync() {
    const snapshot = host()?.snapshot?.();
    if (!snapshot?.state?.started) return;
    document.documentElement.dataset.uiVariant = "a";

    const threshold = document.querySelector('[data-ref-view="threshold"]');
    const thresholdImage = threshold?.querySelector(":scope > img:first-child");
    if (thresholdImage && !thresholdImage.src.endsWith("/checkpoint-background.png")) {
      thresholdImage.src = BACKGROUND;
    }

    const identity = document.querySelector('[data-ref-view="identity"]');
    if (identity) {
      updateGuide(ensureGuide(identity, "identity"), {
        step: "STEP 02",
        label: "COMPARE",
        result: snapshot.caseData?.idCheck,
        mark: snapshot.state.checklistMarks?.id,
        sequence: ["CHECK RECORD", "CHECK LIVE", "MARK EVIDENCE"],
      });
    }

    const detector = document.querySelector('[data-ref-view="detector"]');
    if (detector) {
      const detectorSrc = assetUrl(snapshot.assets?.detector);
      if (detectorSrc) {
        for (const image of detector.querySelectorAll("img")) image.src = detectorSrc;
      }
      updateGuide(ensureGuide(detector, "detector"), {
        step: "STEP 04",
        label: "GATE READ",
        result: snapshot.caseData?.detector,
        mark: snapshot.state.checklistMarks?.detector,
        sequence: ["READ RETURN", "COMPARE OBJECTS", "MARK EVIDENCE"],
      });
    }
  }

  window.setInterval(sync, 180);
  sync();
})();
