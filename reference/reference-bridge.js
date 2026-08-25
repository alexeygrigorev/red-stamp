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

  let stampMotionTimer = null;
  let welcomeAudioLoading = false;
  let welcomeAudioStartedAt = 0;
  let sceneTransitionTimer = null;

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
    const result = host()?.dispatch?.(action, value);
    if (action === "admit" && result !== false) triggerStampMotion();
    return result;
  }

  function forwardWelcomeGesture() {
    host()?.unlockAudio?.();
  }

  function audioState() {
    return host()?.audioState?.() || null;
  }

  function ensureWelcomeAudioStyle() {
    if (document.querySelector("#reference-welcome-audio-style")) return;
    const style = document.createElement("style");
    style.id = "reference-welcome-audio-style";
    style.textContent = `
      #reference-welcome-audio{position:fixed;right:clamp(12px,2vw,24px);bottom:clamp(12px,2vw,22px);z-index:110;font-family:'IBM Plex Mono',monospace}
      #reference-welcome-audio button{width:42px;height:42px;display:grid;place-items:center;padding:0;border:1px solid rgba(200,162,95,.72);border-radius:50%;background:rgba(10,7,6,.78);box-shadow:0 8px 22px rgba(0,0,0,.5),inset 0 1px 0 rgba(226,190,133,.14);color:#dacca4;cursor:pointer;transition:background 160ms ease,border-color 160ms ease,transform 160ms ease}
      #reference-welcome-audio button:hover{background:rgba(47,29,24,.94);border-color:#e1b86d;transform:translateY(-1px)}
      #reference-welcome-audio button:focus-visible{outline:2px solid #e1b86d;outline-offset:3px}
      #reference-welcome-audio [data-audio-icon]{display:grid;place-items:center}
      #reference-welcome-audio [data-audio-icon] svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7}
      #reference-welcome-audio [data-audio-spinner]{display:none;width:15px;height:15px;border:2px solid rgba(220,202,164,.24);border-top-color:#e1b86d;border-radius:50%;animation:reference-audio-spin .8s linear infinite}
      #reference-welcome-audio.is-loading [data-audio-icon]{display:none}
      #reference-welcome-audio.is-loading [data-audio-spinner]{display:block}
      @keyframes reference-audio-spin{to{transform:rotate(360deg)}}
      @media (max-width:700px){#reference-welcome-audio{top:14px;right:12px;bottom:auto}#reference-welcome-audio button{width:38px;height:38px}}
      @media (prefers-reduced-motion:reduce){#reference-welcome-audio [data-audio-spinner]{animation:none}#reference-welcome-audio.is-loading [data-audio-spinner]{border-color:#f4dfc9}}
    `;
    document.head.append(style);
  }

  function ensureWelcomeAudioControl() {
    ensureWelcomeAudioStyle();
    let control = document.querySelector("#reference-welcome-audio");
    if (control) return control;
    control = document.createElement("section");
    control.id = "reference-welcome-audio";
    control.innerHTML = `
      <button data-ref-action="enable-audio" type="button" aria-label="Enable music" title="Enable music">
        <span data-audio-icon aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 9.5a4 4 0 0 1 0 5"/><path d="M19.5 7a7.5 7.5 0 0 1 0 10"/></svg></span>
        <span data-audio-spinner aria-hidden="true"></span>
      </button>`;
    document.body.append(control);
    return control;
  }

  function updateWelcomeAudio(state) {
    if (state?.started) {
      document.querySelector("#reference-welcome-audio")?.remove();
      welcomeAudioLoading = false;
      return;
    }
    const status = audioState();
    const active = Boolean(!status?.muted && status?.currentKey === "title" && status?.playing && status?.readyState >= 2);
    if (active) {
      document.querySelector("#reference-welcome-audio")?.remove();
      welcomeAudioLoading = false;
      return;
    }
    const control = ensureWelcomeAudioControl();
    const button = control.querySelector("button");
    control.classList.toggle("is-loading", welcomeAudioLoading);
    if (welcomeAudioLoading && Date.now() - welcomeAudioStartedAt > 4500) {
      welcomeAudioLoading = false;
      control.classList.remove("is-loading");
    }
    const label = welcomeAudioLoading ? "Starting music" : "Enable music";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.toggleAttribute("aria-busy", welcomeAudioLoading);
  }

  function enableWelcomeAudio() {
    welcomeAudioLoading = true;
    welcomeAudioStartedAt = Date.now();
    const control = ensureWelcomeAudioControl();
    control.classList.add("is-loading");
    const button = control.querySelector("button");
    button.setAttribute("aria-label", "Starting music");
    button.setAttribute("title", "Starting music");
    button.setAttribute("aria-busy", "true");
    host()?.enableAudio?.();
    // The parent resolves HTMLAudioElement.play() asynchronously. Refresh
    // once after that promise has had a chance to settle so the control can
    // confirm playback without waiting for the periodic bridge sync.
    window.setTimeout(() => sync(), 80);
  }

  function ensureSceneTransitionStyle() {
    if (document.querySelector("#reference-scene-transition-style")) return;
    const style = document.createElement("style");
    style.id = "reference-scene-transition-style";
    style.textContent = `
      #reference-scene-transition{position:fixed;inset:0;z-index:105;background:#050403;opacity:0;pointer-events:none}
      #reference-scene-transition.is-running{animation:reference-scene-crossfade 1100ms cubic-bezier(.22,.61,.36,1) both}
      @keyframes reference-scene-crossfade{0%{opacity:0}26%{opacity:.94}100%{opacity:0}}
      @media (prefers-reduced-motion:reduce){#reference-scene-transition.is-running{animation-duration:320ms}}
    `;
    document.head.append(style);
  }

  function playSceneTransition() {
    ensureSceneTransitionStyle();
    let curtain = document.querySelector("#reference-scene-transition");
    if (!curtain) {
      curtain = document.createElement("div");
      curtain.id = "reference-scene-transition";
      curtain.setAttribute("aria-hidden", "true");
      document.body.append(curtain);
    }
    window.clearTimeout(sceneTransitionTimer);
    curtain.classList.remove("is-running");
    void curtain.offsetWidth;
    curtain.classList.add("is-running");
    sceneTransitionTimer = window.setTimeout(() => curtain.remove(), 1200);
  }

  function ensureStampMotionStyle() {
    if (document.querySelector("#reference-stamp-motion-style")) return;
    const style = document.createElement("style");
    style.id = "reference-stamp-motion-style";
    style.textContent = `
      #reference-stamp-motion{position:fixed;inset:0;z-index:90;overflow:hidden;pointer-events:none}
      #reference-stamp-motion [data-stamp-flash]{position:absolute;inset:0;background:radial-gradient(circle at var(--stamp-x) var(--stamp-y),rgba(223,66,44,.28),rgba(223,66,44,0) 23%);opacity:0}
      #reference-stamp-motion [data-stamp-paper]{position:absolute;left:var(--stamp-x);top:var(--stamp-y);width:min(300px,44vw);height:min(132px,17vh);border:1px solid rgba(226,190,133,.8);background:linear-gradient(135deg,rgba(247,224,174,.98),rgba(166,126,83,.98));box-shadow:0 16px 32px rgba(0,0,0,.76),inset 0 0 0 4px rgba(109,44,31,.13);color:#5c2b25;opacity:0;transform:translate(-50%,-50%) rotate(-8deg) scale(.52);transform-origin:50% 50%}
      #reference-stamp-motion [data-stamp-paper]::before{position:absolute;inset:9px;border:1px solid rgba(112,49,37,.42);content:""}
      #reference-stamp-motion [data-stamp-paper]::after{position:absolute;right:12px;bottom:13px;width:34px;height:34px;border:2px solid rgba(142,31,28,.62);border-radius:50%;content:"V";font:700 21px/30px Georgia,serif;text-align:center;transform:rotate(-12deg)}
      #reference-stamp-motion [data-stamp-paper-title]{position:absolute;top:18px;left:20px;font:700 12px/1 'IBM Plex Mono',monospace;letter-spacing:.16em}
      #reference-stamp-motion [data-stamp-paper-lines]{position:absolute;top:45px;left:20px;width:54%;height:28px;background:repeating-linear-gradient(to bottom,rgba(76,47,37,.52) 0 1px,transparent 1px 7px)}
      #reference-stamp-motion [data-stamp-art]{position:absolute;left:calc(var(--stamp-x) + min(26px,3vw));top:calc(var(--stamp-y) - min(8px,1vh));width:clamp(92px,11vw,148px);height:auto;opacity:0;filter:drop-shadow(0 12px 9px rgba(0,0,0,.74));transform:translate(-50%,-80%) rotate(11deg) scale(.68);transform-origin:50% 92%}
      #reference-stamp-motion [data-stamp-ink]{position:absolute;left:var(--stamp-x);top:var(--stamp-y);padding:7px 12px;border:3px solid rgba(143,31,28,.78);color:rgba(143,31,28,.78);font:700 clamp(13px,1.6vw,21px)/1 'Staatliches',sans-serif;letter-spacing:.12em;opacity:0;transform:translate(-50%,-50%) rotate(-7deg) scale(.25,.42);filter:blur(.2px)}
      #reference-stamp-motion.reference-stamp-motion-active [data-stamp-flash]{animation:reference-stamp-flash 900ms ease-out both}
      #reference-stamp-motion.reference-stamp-motion-active [data-stamp-paper]{animation:reference-stamp-paper 900ms cubic-bezier(.18,.82,.26,1) both}
      #reference-stamp-motion.reference-stamp-motion-active [data-stamp-art]{animation:reference-stamp-slam 900ms cubic-bezier(.16,.78,.24,1) both}
      #reference-stamp-motion.reference-stamp-motion-active [data-stamp-ink]{animation:reference-stamp-ink 900ms cubic-bezier(.19,.8,.28,1) both}
      [data-ref-action="admit"].reference-stamp-action{animation:reference-stamp-button 900ms ease-out both}
      @keyframes reference-stamp-flash{0%,100%{opacity:0}24%{opacity:1}58%{opacity:.16}}
      @keyframes reference-stamp-paper{0%{opacity:0;transform:translate(-50%,18%) rotate(-12deg) scale(.52)}22%{opacity:1;transform:translate(-50%,-44%) rotate(-8deg) scale(.82)}44%,100%{opacity:.94;transform:translate(-50%,-50%) rotate(-4deg) scale(1)}}
      @keyframes reference-stamp-slam{0%{opacity:0;transform:translate(-50%,-145%) rotate(13deg) scale(.68)}18%{opacity:1;transform:translate(-50%,-104%) rotate(9deg) scale(.76)}38%{opacity:1;transform:translate(-50%,-27%) rotate(-3deg) scale(1.02)}48%{opacity:1;transform:translate(-50%,-18%) rotate(-1deg) scale(.94)}60%{opacity:.9;transform:translate(-50%,-25%) rotate(-2deg) scale(.98)}78%{opacity:.34;transform:translate(-50%,-34%) rotate(0) scale(.92)}100%{opacity:0;transform:translate(-50%,-42%) rotate(1deg) scale(.86)}}
      @keyframes reference-stamp-ink{0%,30%{opacity:0;transform:translate(-50%,-50%) rotate(-7deg) scale(.25,.42)}43%{opacity:.92;transform:translate(-50%,-50%) rotate(-4deg) scale(1.08,.76)}55%{opacity:.82;transform:translate(-50%,-50%) rotate(-5deg) scale(.98,.84)}100%{opacity:0;transform:translate(-50%,-50%) rotate(-4deg) scale(1,.7)}}
      @keyframes reference-stamp-button{0%,100%{transform:translateY(0);filter:none}38%{transform:translateY(3px);filter:brightness(1.24)}52%{transform:translateY(0);filter:brightness(1.06)} }
      @media (prefers-reduced-motion:reduce){#reference-stamp-motion [data-stamp-flash]{animation:none;opacity:.32}#reference-stamp-motion [data-stamp-paper]{animation:none;opacity:.94;transform:translate(-50%,-50%) rotate(-4deg) scale(1)}#reference-stamp-motion [data-stamp-art]{animation:none;opacity:.96;transform:translate(-50%,-25%) rotate(-2deg) scale(.96)}#reference-stamp-motion [data-stamp-ink]{animation:none;opacity:.78;transform:translate(-50%,-50%) rotate(-4deg) scale(1,.7)}[data-ref-action="admit"].reference-stamp-action{animation:none;transform:translateY(0);filter:brightness(1.08)}}
    `;
    document.head.append(style);
  }

  function triggerStampMotion() {
    const action = document.querySelector('[data-ref-action="admit"]');
    if (!action) return;
    ensureStampMotionStyle();

    const rect = action.getBoundingClientRect();
    let motion = document.querySelector("#reference-stamp-motion");
    if (!motion) {
      motion = document.createElement("div");
      motion.id = "reference-stamp-motion";
      motion.setAttribute("aria-hidden", "true");
      motion.innerHTML = `
        <div data-stamp-flash></div>
        <div data-stamp-paper>
          <span data-stamp-paper-title>ENTRY AUTHORIZED</span>
          <span data-stamp-paper-lines></span>
        </div>
        <img data-stamp-art alt="">
        <div data-stamp-ink>ADMITTED</div>`;
      document.body.append(motion);
    }

    motion.style.setProperty("--stamp-x", `${Math.round(rect.left + rect.width * 0.72)}px`);
    motion.style.setProperty("--stamp-y", `${Math.round(rect.top + rect.height * 0.5)}px`);
    const stampArt = motion.querySelector("[data-stamp-art]");
    if (stampArt) {
      stampArt.src = window.matchMedia?.("(max-width: 700px)").matches
        ? "assets/23c7730c-fd90-4c8a-86bb-695cb8503df6.webp"
        : "assets/779ea657-4ce2-498c-a617-9f5eaa498dc3.webp";
    }

    action.classList.remove("reference-stamp-action");
    motion.classList.remove("reference-stamp-motion-active");
    void action.offsetWidth;
    void motion.offsetWidth;
    action.classList.add("reference-stamp-action");
    motion.classList.add("reference-stamp-motion-active");
    if (stampMotionTimer) window.clearTimeout(stampMotionTimer);
    stampMotionTimer = window.setTimeout(() => {
      action.classList.remove("reference-stamp-action");
      motion.remove();
      stampMotionTimer = null;
    }, 980);
  }

  function slots(name) {
    return [...document.querySelectorAll(`[data-ref-slot="${name}"]`)];
  }

  function setSlot(name, value) {
    for (const element of slots(name)) element.textContent = value == null ? "" : String(value);
  }

  function updateActionHeader(tool) {
    const source = slots("source-label")[0];
    const row = source?.parentElement?.parentElement;
    row?.toggleAttribute("hidden", !tool);
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

      // Use direct row columns. The step number contains a nested interpolation
      // span, so indexing every descendant overwrote the meaningful row title
      // (FACE / ID, PERSON / GATE) with OPEN or REVIEW.
      const columns = [...row.children].filter((element) => element.tagName === "SPAN");
      if (columns.length >= 4) {
        columns[2].textContent = status;
        columns[2].style.color = mark ? MARK_INK[mark] : "#6e5f47";
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
    updateWelcomeAudio(state);
    if (!state.started) {
      updateOutcome(state);
      return;
    }

    const tool = state.selectedTool;
    const result = resultFor(caseData, tool);
    const mark = tool ? state.checklistMarks?.[tool] : null;
    setSlot("source-label", tool ? TOOL_LABEL[tool] : "");
    setSlot("mark-label", mark ? MARK_LABEL[mark] : tool ? "NOT YET MARKED" : "");
    updateActionHeader(tool);
    setSlot("observed", currentObservation(caseData, state));
    setSlot("task", result?.detail || "Open every source, mark what you found, then file the card.");
    setSlot("marked-label", `${Object.keys(state.checklistMarks || {}).length} / 6 MARKED`);
    setSlot("card-state", state.checklistSubmitted ? "CARD READY TO FILE" : "CARD NOT FILED");
    setSlot("case-id", `CASE ${caseData?.caseNumber || "—"}`);
    setSlot("case-title", (caseData?.service || "VISITOR AT WINDOW").toUpperCase());
    setSlot("case-meta", `${String(caseData?.modeLabel || caseData?.mode || "VISITOR").toUpperCase()} · QUEUE ${caseData?.queue || "—"}`);
    setSlot("case-log-id", `INTERVIEW LOG · ${caseData?.caseNumber || "—"}`);
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

    const audioControl = event.target.closest?.('[data-ref-action="enable-audio"]');
    if (audioControl) {
      event.preventDefault();
      event.stopPropagation();
      enableWelcomeAudio();
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
    if (action === "begin") {
      playSceneTransition();
      return dispatch("begin");
    }
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

  // Welcome music lives in the parent game engine, while the visible welcome
  // button lives in this iframe. Forward the first gesture across that seam
  // so the browser can unlock the title theme before BEGIN SHIFT changes the
  // music state to the checkpoint loop.
  document.addEventListener("pointerdown", forwardWelcomeGesture, { once: true, capture: true });
  document.addEventListener("keydown", forwardWelcomeGesture, { once: true, capture: true });

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
