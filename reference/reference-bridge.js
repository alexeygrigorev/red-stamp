"use strict";

(() => {
  const SOURCE_TO_TOOL = {
    "01": "appointment",
    "02": "id",
    "03": "documents",
    "04": "detector",
    "05": "xray",
    "06": "question",
  };

  const TOOL_LABEL = {
    appointment: "01 · ROUTE / FILE",
    id: "02 · FACE / ID",
    documents: "03 · PAPERS",
    detector: "04 · PERSON / GATE",
    xray: "05 · BAG / SCAN",
    question: "06 · STATEMENT",
  };

  const RESULT_KEY = {
    appointment: "record",
    id: "idCheck",
    documents: "documents",
    detector: "detector",
    xray: "xray",
    question: "question",
  };

  const MARK_LABEL = {
    match: "CLEARED",
    flag: "FLAGGED",
    review: "HELD FOR REVIEW",
  };

  const MARK_INK = {
    match: "#8ea86e",
    flag: "#d8523c",
    review: "#c8a25f",
  };

  function host() {
    try {
      return window.parent !== window ? window.parent.RedStampHost : null;
    } catch {
      return null;
    }
  }

  function snapshot() {
    return host()?.snapshot?.() || null;
  }

  function dispatch(action, value) {
    return host()?.dispatch?.(action, value);
  }

  function slots(name) {
    return [...document.querySelectorAll(`[data-ref-slot="${name}"]`)];
  }

  function setSlot(name, value) {
    for (const element of slots(name)) element.textContent = value == null ? "" : String(value);
  }

  function referenceAsset(asset) {
    if (!asset) return null;
    return new URL(`../${asset}`, document.baseURI).href;
  }

  function setVisitorImage(name, asset) {
    const src = referenceAsset(asset);
    if (!src) return;
    for (const image of slots(name)) image.src = src;
  }

  function resultFor(caseData, tool) {
    const result = caseData?.[RESULT_KEY[tool]];
    if (!result) return null;
    if (tool === "question") {
      return {
        status: result.consistency,
        title: "STATEMENT CAPTURED",
        detail: `${result.prompt} “${result.answer}”`,
      };
    }
    return result;
  }

  function currentObservation(caseData, state) {
    const tool = state?.selectedTool;
    const result = resultFor(caseData, tool);
    if (result) return `${result.status} · ${result.detail}`;
    return `Visitor at the window. ${caseData?.claimedPurpose || caseData?.purpose || "Awaiting declared purpose."}`;
  }

  function updateMetrics(state) {
    const tolerance = Math.round(state?.dailyTolerance ?? 100);
    const career = Math.round(state?.career ?? 100);
    setSlot("tolerance-value", tolerance);
    setSlot("career-value", career);

    for (const value of slots("tolerance-value")) {
      const bar = value.parentElement?.nextElementSibling?.firstElementChild;
      if (bar) bar.style.width = `${tolerance}%`;
    }
    for (const value of slots("career-value")) {
      const bar = value.parentElement?.nextElementSibling?.firstElementChild;
      if (bar) bar.style.width = `${career}%`;
    }
  }

  function updateCurrentCase(caseData, state) {
    const destination = caseData?.service ? `${caseData.service} / ${caseData.window || "—"}` : "—";
    const appointment = caseData?.mode === "appointment"
      ? `${caseData.time || "—"} / WINDOW ${caseData.window || "—"}`
      : "NONE — restricted";
    const detectorStatus = caseData?.detector?.status || "REVIEW";
    const xrayStatus = caseData?.xray?.status || "SCAN REVIEW";
    const hasUnknownMass = /dense|unknown|unresolved|discrepancy|review/i.test(caseData?.xray?.detail || "");

    setSlot("file-bearer", caseData?.name || "VISITOR");
    setSlot("file-number", caseData?.caseNumber || "—");
    setSlot("file-destination", destination);
    setSlot("file-appointment", appointment);
    setSlot("gate-status", detectorStatus === "CLEAR" ? "GATE CLEAR · NO ALARM" : `GATE · ${detectorStatus}`);
    setSlot("scan-summary", hasUnknownMass ? `${xrayStatus} · UNKNOWN MASS` : `${xrayStatus} · CONTENTS REVIEWED`);
    setVisitorImage("xray-scan", nextAsset(caseData, "xray"));
  }

  function nextAsset(caseData, tool) {
    if (!caseData) return null;
    const assets = host()?.snapshot?.()?.assets;
    return tool === "xray" ? assets?.xray : null;
  }

  function updateQuestionLog(caseData, state) {
    if (state.selectedTool !== "question") return;
    const log = document.querySelector("[data-log]");
    if (!log || !caseData?.question) return;
    log.replaceChildren();
    const entries = [
      ["EXAMINER", caseData.question.prompt, "flex-end", "#8a7458", "#3a2c22", "rgba(200,162,95,.06)", "#cdbe9c", "15px"],
      [caseData.name?.toUpperCase() || "VISITOR", caseData.question.answer, "flex-start", "#b0705c", "#6d2b26", "rgba(142,31,28,.12)", "#e3d2a9", "18px"],
    ];
    for (const [speaker, text, align, who, border, background, ink, size] of entries) {
      const line = document.createElement("div");
      line.style.cssText = `display:flex;flex-direction:column;gap:4px;align-items:${align}`;
      const label = document.createElement("span");
      label.textContent = speaker;
      label.style.cssText = `font-size:9px;font-weight:600;letter-spacing:.26em;color:${who}`;
      const bubble = document.createElement("div");
      bubble.textContent = text;
      bubble.style.cssText = `max-width:82%;padding:11px 14px;border:1px solid ${border};background:${background};font-size:${size};line-height:1.45;color:${ink};font-style:${align === "flex-start" ? "italic" : "normal"};text-wrap:pretty`;
      line.append(label, bubble);
      log.append(line);
    }
  }

  function updateRows(state) {
    const rows = [...document.querySelectorAll("[data-ref-source]")];
    for (const row of rows) {
      const tool = SOURCE_TO_TOOL[row.dataset.refSource];
      const mark = tool ? state?.checklistMarks?.[tool] : null;
      const status = mark ? MARK_LABEL[mark] : state?.revealed?.[tool] ? "REVIEW" : "OPEN";
      row.dataset.refMark = mark || "open";
      row.setAttribute("aria-label", `${tool || "source"} ${status}`);

      const textNodes = row.querySelectorAll("span");
      if (textNodes.length >= 4) {
        textNodes[2].textContent = status;
        textNodes[2].style.color = mark ? MARK_INK[mark] : "#6e5f47";
      }

      if (mark === "flag") {
        row.style.borderColor = "#8e1f1c";
        row.style.background = "linear-gradient(#2e1815,#1b100e)";
      } else if (mark === "match") {
        row.style.borderColor = "#6f8c58";
        row.style.background = "rgba(120,160,100,.12)";
      } else if (mark === "review") {
        row.style.borderColor = "#c8a25f";
        row.style.background = "rgba(200,162,95,.12)";
      }
    }
  }

  function updateOutcome(state) {
    const resolved = Boolean(state?.resolved);
    let panel = document.querySelector("#reference-outcome");
    if (!resolved) {
      panel?.remove();
      return;
    }

    const last = state.shiftLog?.[state.shiftLog.length - 1];
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "reference-outcome";
      panel.innerHTML = `
        <div data-outcome-card>
          <div data-outcome-kicker>CASE CLOSED / RED STAMP</div>
          <div data-outcome-title></div>
          <p data-outcome-copy></p>
          <button data-ref-action="advance" type="button">CONTINUE <span>→</span></button>
        </div>`;
      document.body.append(panel);
      const style = document.createElement("style");
      style.textContent = `
        #reference-outcome{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:rgba(4,3,2,.82);font-family:'IBM Plex Mono',monospace;color:#c0b49b}
        #reference-outcome [data-outcome-card]{width:min(620px,calc(100vw - 36px));padding:28px 30px 30px;border:1px solid #6b5a3f;background:linear-gradient(#241a16,#0c0807);box-shadow:0 28px 80px rgba(0,0,0,.9)}
        #reference-outcome [data-outcome-kicker]{font-size:10px;font-weight:600;letter-spacing:.28em;color:#d8523c}
        #reference-outcome [data-outcome-title]{margin-top:10px;font-family:'Staatliches',sans-serif;font-size:52px;line-height:.95;letter-spacing:.08em;color:#e9d9b1}
        #reference-outcome p{margin:16px 0 24px;font-size:14px;line-height:1.55;color:#dacca4}
        #reference-outcome button{border:2px solid #8e1f1c;background:linear-gradient(#7d1f19,#480e0b);padding:12px 20px;font-family:'Staatliches',sans-serif;font-size:24px;letter-spacing:.12em;color:#f4dfc9;cursor:pointer;box-shadow:inset 0 2px 0 rgba(255,190,170,.28),0 4px 0 #290a08}
        #reference-outcome button span{font-family:'IBM Plex Mono',monospace;font-size:16px}
      `;
      document.head.append(style);
    }
    panel.querySelector("[data-outcome-title]").textContent = last?.title || "CASE CLOSED";
    panel.querySelector("[data-outcome-copy]").textContent = `${String(last?.decision || state.finalDecision || "decision").toUpperCase()} recorded. The next visitor is waiting outside the checkpoint.`;
  }

  function toggleXrayHint() {
    const existing = document.querySelector("#reference-xray-hint");
    if (existing) {
      existing.remove();
      return;
    }
    const hint = document.createElement("div");
    hint.id = "reference-xray-hint";
    hint.textContent = "Unknown mass is a finding, not a verdict. Compare the scan silhouette with the declared contents.";
    hint.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:70;max-width:min(360px,calc(100vw - 36px));padding:12px 14px;border:1px solid #6e7f7c;background:rgba(4,12,12,.94);color:#a8ddd2;font:12px/1.45 'IBM Plex Mono',monospace;box-shadow:0 12px 28px rgba(0,0,0,.7)";
    document.body.append(hint);
  }

  function sync(next = snapshot()) {
    if (!next?.state) return;
    const { state, caseData, assets } = next;
    if (!state.started) {
      updateOutcome(state);
      return;
    }

    const tool = state.selectedTool;
    const result = resultFor(caseData, tool);
    const mark = tool ? state.checklistMarks?.[tool] : null;
    setSlot("source-label", tool ? TOOL_LABEL[tool] : "AT THE WINDOW");
    setSlot("mark-label", mark ? MARK_LABEL[mark] : tool ? "NOT YET MARKED" : "NOTHING TO MARK HERE");
    setSlot("observed", currentObservation(caseData, state));
    setSlot("task", result?.detail || "Open every source, mark what you found, then file the card.");
    setSlot("marked-label", `${Object.keys(state.checklistMarks || {}).length} / 6 MARKED`);
    setSlot("card-state", state.checklistSubmitted ? "CARD READY TO FILE" : "CARD NOT FILED");
    setSlot("case-id", `CASE ${caseData?.caseNumber || "—"}`);
    setSlot("case-title", (caseData?.service || "VISITOR AT WINDOW").toUpperCase());
    setSlot("case-purpose", `Declared: ${caseData?.claimedPurpose || caseData?.purpose || "No purpose recorded."}`);
    setSlot("visitor-name", (caseData?.name || "VISITOR").toUpperCase());
    setSlot("visitor-quote", caseData?.question?.answer ? `“${caseData.question.answer}”` : "Awaiting statement.");
    setSlot("asked-label", state.revealed?.question ? "1 / 1 QUESTION PUT" : "0 / 1 QUESTION PUT");
    updateMetrics(state);
    updateCurrentCase(caseData, state);
    updateRows(state);
    setVisitorImage("visitor-scene", assets?.scene);
    setVisitorImage("visitor-face", assets?.face);
    setVisitorImage("xray-scan", assets?.xray);
    updateQuestionLog(caseData, state);
    updateOutcome(state);
  }

  function hydrate() {
    const next = snapshot();
    if (next?.state?.started && !document.querySelector("[data-ref-action=begin]")) return;
    if (next?.state?.started && document.querySelector("[data-ref-action=begin]")) {
      document.querySelector("[data-ref-action=begin]").click();
    }
    sync(next);
  }

  document.addEventListener("click", (event) => {
    const hint = event.target.closest?.("[data-ref-action=xray-hint]");
    if (hint) {
      event.preventDefault();
      event.stopPropagation();
      toggleXrayHint();
      return;
    }

    if (!event.isTrusted) return;
    const actionElement = event.target.closest?.("[data-ref-action]");
    const sourceElement = event.target.closest?.("[data-ref-source]");
    if (!actionElement && !sourceElement) return;
    if (sourceElement && !actionElement) {
      const tool = SOURCE_TO_TOOL[sourceElement.dataset.refSource];
      if (tool) dispatch("inspect", tool);
      return;
    }
    const action = actionElement.dataset.refAction;
    if (action === "begin") return dispatch("begin");
    if (action === "mark-match") return dispatch("mark", "match");
    if (action === "mark-flag") return dispatch("mark", "flag");
    if (action === "mark-review") return dispatch("mark", "review");
    if (action === "back-window") return dispatch("back");
    if (action === "admit") return dispatch("admit");
    if (action === "secondary") return dispatch("secondary");
    if (action === "deny") return dispatch("deny");
    if (action === "advance") return dispatch("advance");
    if (action.startsWith("paper-")) return dispatch("inspect", "documents");
    if (action === "show-scan" || action === "open-bag") return dispatch("inspect", "xray");
  });

  window.addEventListener("keydown", (event) => {
    if (!event.isTrusted) return;
    const key = event.key.toLowerCase();
    if (key === "a") dispatch("admit");
    if (key === "d") dispatch("deny");
    if (key === "s") dispatch("secondary");
    if (key === "l") dispatch("liaison");
    if (key === "w" || event.key === "Escape") dispatch("back");
  });

  window.ReferenceBridge = { hydrate, sync };
  window.setInterval(sync, 180);
})();
