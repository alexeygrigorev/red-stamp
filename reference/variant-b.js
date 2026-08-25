"use strict";

(() => {
  const BACKGROUND = "../assets/generated/ui-variants/b/checkpoint-background.png";

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

  function ensureColumn(view, kind) {
    let column = view.querySelector(`:scope > .variant-evidence-column[data-kind="${kind}"]`);
    if (column) return column;
    column = document.createElement("aside");
    column.className = "variant-evidence-column";
    column.dataset.kind = kind;
    column.innerHTML = `
      <div class="variant-evidence-kicker"></div>
      <div class="variant-evidence-status"></div>
      <div class="variant-evidence-title"></div>
      <p class="variant-evidence-detail"></p>
      <div class="variant-evidence-prompt"><strong>DECISION PROMPT</strong><span></span></div>
      <div class="variant-evidence-mark"></div>`;
    view.append(column);
    return column;
  }

  function updateColumn(column, { kicker, result, prompt, mark }) {
    const status = result?.status || "REVIEW";
    column.dataset.tone = tone(status);
    column.querySelector(".variant-evidence-kicker").textContent = kicker;
    column.querySelector(".variant-evidence-status").textContent = `SOURCE RETURN · ${status}`;
    column.querySelector(".variant-evidence-title").textContent = result?.title || "CHECK REQUIRED";
    column.querySelector(".variant-evidence-detail").textContent = result?.detail || "Review the source and compare it with the declared route.";
    column.querySelector(".variant-evidence-prompt span").textContent = prompt;
    column.querySelector(".variant-evidence-mark").textContent = `VERIFICATION CARD · ${mark ? mark.toUpperCase() : "NOT MARKED"}`;
  }

  function sync() {
    const snapshot = host()?.snapshot?.();
    if (!snapshot?.state?.started) return;
    document.documentElement.dataset.uiVariant = "b";

    const threshold = document.querySelector('[data-ref-view="threshold"]');
    const thresholdImage = threshold?.querySelector(":scope > img:first-child");
    if (thresholdImage && !thresholdImage.src.endsWith("/checkpoint-background.png")) {
      thresholdImage.src = BACKGROUND;
    }

    const identity = document.querySelector('[data-ref-view="identity"]');
    if (identity) {
      updateColumn(ensureColumn(identity, "identity"), {
        kicker: "STEP 02 / FACE + IDENTITY",
        result: snapshot.caseData?.idCheck,
        prompt: "Does the record identity agree with the live visitor? Mark the evidence, not the final verdict.",
        mark: snapshot.state.checklistMarks?.id,
      });
    }

    const detector = document.querySelector('[data-ref-view="detector"]');
    if (detector) {
      const detectorSrc = assetUrl(snapshot.assets?.detector);
      if (detectorSrc) {
        for (const image of detector.querySelectorAll("img")) image.src = detectorSrc;
      }
      updateColumn(ensureColumn(detector, "detector"), {
        kicker: "STEP 04 / PERSON + GATE",
        result: snapshot.caseData?.detector,
        prompt: "A gate return describes detected metal. Compare carried objects with the declared purpose before marking.",
        mark: snapshot.state.checklistMarks?.detector,
      });
    }
  }

  window.setInterval(sync, 180);
  sync();
})();
