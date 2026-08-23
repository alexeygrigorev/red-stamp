"use strict";

/*
 * Red Stamp dossier sidecar.
 *
 * This file deliberately has no dependency on the game state or on a UI
 * framework. The parent can inject renderPage(...) into any element and own
 * the page navigation lifecycle.
 */
(function exposeDossier(global) {
  const TYPES = [
    "identity",
    "appointment",
    "clearance",
    "emergency",
    "legal",
    "correspondence",
  ];

  const ASSETS = Object.freeze({
    identity: "assets/generated/doc-identity-page.png",
    appointment: "assets/generated/doc-appointment-page.png",
    // Generation targets for the remaining dossier families. The parent can
    // add these files without changing the component API.
    clearance: "assets/generated/doc-clearance-page.png",
    emergency: "assets/generated/doc-emergency-page.png",
    legal: "assets/generated/doc-legal-page.png",
    correspondence: "assets/generated/doc-correspondence-page.png",
  });

  const PORTRAIT_ASSETS = Object.freeze({
    civilian: "assets/generated/civilian-visitor.png",
    soldier: "assets/generated/soldier-visitor.png",
    official: "assets/generated/official-visitor.png",
    worker: "assets/generated/worker-visitor.png",
    anomaly: "assets/generated/anomaly-visitor.png",
  });

  const TYPE_ALIASES = Object.freeze({
    id: "identity",
    passport: "identity",
    identitycard: "identity",
    "identity-card": "identity",
    record: "appointment",
    booking: "appointment",
    clearanceorder: "clearance",
    "clearance-order": "clearance",
    urgent: "emergency",
    medical: "emergency",
    notarial: "legal",
    correspondencefile: "correspondence",
    "correspondence-file": "correspondence",
  });

  const TYPE_META = Object.freeze({
    identity: Object.freeze({
      label: "IDENTITY CREDENTIAL",
      title: "VESKARIAN IDENTITY RECORD",
      subtitle: "PERSONAL PARTICULARS / SECURITY COPY",
      pages: 2,
      ratio: "972 / 1619",
    }),
    appointment: Object.freeze({
      label: "APPOINTMENT REGISTER",
      title: "EMBASSY APPOINTMENT FILE",
      subtitle: "PUBLIC ENTRY / SERVICE WINDOW RECORD",
      pages: 3,
      ratio: "1054 / 1492",
    }),
    clearance: Object.freeze({
      label: "SPECIAL CLEARANCE",
      title: "SPECIAL CLEARANCE ORDER",
      subtitle: "AUTHORIZED ROUTE / INTERNAL CONTROL COPY",
      pages: 3,
      ratio: "972 / 1619",
    }),
    emergency: Object.freeze({
      label: "EMERGENCY CHANNEL",
      title: "EMERGENCY ENTRY FILE",
      subtitle: "URGENT REQUEST / CONFIRMATION REQUIRED",
      pages: 3,
      ratio: "972 / 1619",
    }),
    legal: Object.freeze({
      label: "LEGAL & NOTARIAL",
      title: "LEGAL MATTER DOSSIER",
      subtitle: "CERTIFIED PAPERS / WITNESS CONTROL",
      pages: 3,
      ratio: "972 / 1619",
    }),
    correspondence: Object.freeze({
      label: "RESTRICTED CORRESPONDENCE",
      title: "CORRESPONDENCE CONTROL FILE",
      subtitle: "SEALED MATERIAL / RECIPIENT UNVERIFIED",
      pages: 3,
      ratio: "972 / 1619",
    }),
  });

  const TOOL_TYPES = Object.freeze({
    id: "identity",
    identity: "identity",
    passport: "identity",
    biometric: "identity",
    appointment: "appointment",
    record: "appointment",
    booking: "appointment",
  });

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function displayText(value, fallback = "—") {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "string") return value.trim() || fallback;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return fallback;
  }

  function firstText(...values) {
    for (const value of values) {
      const text = displayText(value, "");
      if (text) return text;
    }
    return "—";
  }

  function token(value) {
    return displayText(value, "")
      .toLowerCase()
      .replace(/[–—]/g, "-")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function normalizeType(value) {
    const normalized = token(value).replace(/\s+/g, "-");
    if (TYPES.includes(normalized)) return normalized;
    return TYPE_ALIASES[normalized] || null;
  }

  function normalizeTool(value) {
    return token(value).replace(/\s+/g, "-");
  }

  function resultObject(caseData, key) {
    return isRecord(caseData) && isRecord(caseData[key]) ? caseData[key] : {};
  }

  function recordRows(caseData) {
    const record = isRecord(caseData) && isRecord(caseData.record) ? caseData.record : {};
    if (Array.isArray(record.rows)) {
      return record.rows
        .map((row) => {
          if (Array.isArray(row)) {
            return { label: firstText(row[0], "FIELD"), value: firstText(row[1]) };
          }
          if (isRecord(row)) {
            return {
              label: firstText(row.label, row.name, "FIELD"),
              value: firstText(row.value, row.text, row.detail),
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    return Object.entries(record)
      .filter(([key]) => !["rows", "detail", "status"].includes(key))
      .slice(0, 8)
      .map(([label, value]) => ({
        label: label.replace(/([a-z])([A-Z])/g, "$1 $2"),
        value: displayText(value),
      }));
  }

  function evidenceText(caseData) {
    if (!isRecord(caseData)) return "";
    const record = isRecord(caseData.record) ? caseData.record : {};
    const values = [
      caseData.documentType,
      caseData.dossierType,
      caseData.mode,
      caseData.modeLabel,
      caseData.kind,
      caseData.role,
      caseData.service,
      caseData.caseNumber,
      caseData.purpose,
      record.status,
      record.detail,
      ...recordRows(caseData).flatMap((row) => [row.label, row.value]),
    ];
    for (const key of ["documents", "idCheck", "secondary", "liaison"]) {
      const result = resultObject(caseData, key);
      values.push(result.status, result.title, result.detail);
    }
    return values.map((value) => displayText(value, "")).join(" ").toLowerCase();
  }

  function documentTypeForCase(caseData, tool) {
    const caseObject = isRecord(caseData) ? caseData : {};
    const normalizedTool = normalizeTool(tool);

    // An identity tool is always a portrait/identity page, even when the
    // visitor's broader case is legal, emergency, or military.
    if (TOOL_TYPES[normalizedTool] === "identity") return "identity";

    const explicitType = normalizeType(
      caseObject.documentType || caseObject.dossierType || caseObject.documentFamily || caseObject.type,
    );
    if (explicitType) return explicitType;

    const evidence = evidenceText(caseObject);

    if (
      /\b(emergency|urgent|medical|hospital|treatment|repair order|emergency channel)\b/.test(evidence)
    ) {
      return "emergency";
    }

    if (
      /\b(correspondence|restricted letter|sealed letter|special correspondence|restricted file)\b/.test(evidence) ||
      /\bcor[- ]\d{2,}/.test(evidence)
    ) {
      return "correspondence";
    }

    if (
      /\b(legal|notarial|power of attorney|witness form|certified copy|declaration)\b/.test(evidence) ||
      /\bleg[- ]\d{2,}/.test(evidence)
    ) {
      return "legal";
    }

    if (
      /\b(clearance|military|soldier|state affairs|service order|diplomatic|escort|guard detail|priority arrival)\b/.test(evidence) ||
      token(caseObject.mode) === "clearance"
    ) {
      return "clearance";
    }

    if (TOOL_TYPES[normalizedTool] === "appointment") return "appointment";
    if (token(caseObject.mode) === "appointment") return "appointment";

    // Identity is the neutral physical-document fallback; callers can pass
    // an explicit documentType when a custom case needs another family.
    return "identity";
  }

  function safeAssetPath(value) {
    const candidate = displayText(value, "");
    if (!candidate || candidate.includes("..")) return "";
    return /^(?:\.\/)?assets\/[a-z0-9_./-]+\.(?:png|jpe?g|webp|gif|svg)$/i.test(candidate)
      ? candidate
      : "";
  }

  function portraitPath(caseData) {
    const caseObject = isRecord(caseData) ? caseData : {};
    const explicitCandidates = [
      caseObject.portraitAsset,
      caseObject.portraitSrc,
      caseObject.portrait,
      caseObject.characterArt,
      caseObject.visitorAsset,
      caseObject.image,
      caseObject.avatar,
    ];

    for (const candidate of explicitCandidates) {
      const path = safeAssetPath(isRecord(candidate) ? candidate.src || candidate.url : candidate);
      if (path) return path;
    }

    return PORTRAIT_ASSETS[token(caseObject.look)] || "";
  }

  function initials(name) {
    const parts = displayText(name, "Veskar").split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "V";
  }

  function resultStatus(result, fallback = "NOT RECORDED") {
    return firstText(result.status, result.consistency, fallback);
  }

  function resultNote(result, fallback) {
    return firstText(result.detail, result.answer, fallback);
  }

  function findRow(rows, names, fallback = "—") {
    const wanted = names.map((name) => token(name));
    const row = rows.find((entry) => wanted.includes(token(entry.label)));
    return row ? row.value : fallback;
  }

  function contextFor(caseData, type) {
    const caseObject = isRecord(caseData) ? caseData : {};
    const record = isRecord(caseObject.record) ? caseObject.record : {};
    const rows = recordRows(caseObject);
    const idCheck = resultObject(caseObject, "idCheck");
    const documents = resultObject(caseObject, "documents");
    const detector = resultObject(caseObject, "detector");
    const xray = resultObject(caseObject, "xray");
    const question = resultObject(caseObject, "question");
    const secondary = resultObject(caseObject, "secondary");
    const liaison = resultObject(caseObject, "liaison");
    const name = firstText(caseObject.name, caseObject.fullName, caseObject.applicant, "UNIDENTIFIED VISITOR");
    const modeLabel = firstText(caseObject.modeLabel, caseObject.mode, "UNSPECIFIED ROUTE");

    return {
      id: firstText(caseObject.id, caseObject.caseNumber, "dossier"),
      name,
      role: firstText(caseObject.role, caseObject.title, "VISITOR"),
      mode: modeLabel,
      service: firstText(caseObject.service, caseObject.department, "UNASSIGNED SERVICE"),
      window: firstText(caseObject.window, caseObject.destination, "—"),
      time: firstText(caseObject.time, caseObject.appointmentTime, "—"),
      caseNumber: firstText(caseObject.caseNumber, caseObject.fileNumber, caseObject.id, "UNASSIGNED"),
      queue: firstText(caseObject.queue, caseObject.queueNumber, "—"),
      purpose: firstText(caseObject.purpose, caseObject.request, caseObject.reason, "No purpose recorded.",),
      recordStatus: resultStatus(record, "NO RECORD STATUS"),
      recordDetail: firstText(record.detail, "No internal record note has been entered."),
      rows,
      idCheck,
      documents,
      detector,
      xray,
      question,
      secondary,
      liaison,
      portrait: portraitPath(caseObject),
      portraitAlt: firstText(caseObject.portraitAlt, `${name} / Veskarian identity portrait`),
      initials: initials(name),
      type,
      raw: caseObject,
    };
  }

  function field(label, value) {
    return { label: displayText(label, "FIELD"), value: displayText(value) };
  }

  function note(label, text, tone = "") {
    return { label: displayText(label, "NOTE"), text: displayText(text), tone };
  }

  function seal(mark, label, value, tone = "") {
    return { mark: displayText(mark, "V"), label: displayText(label, "SEAL"), value: displayText(value), tone };
  }

  function primaryFields(ctx, type) {
    const rows = ctx.rows;
    switch (type) {
      case "identity":
        return [
          field("Full name", ctx.name),
          field("Identity class", ctx.role),
          field("Case file", ctx.caseNumber),
          field("Arrival", ctx.mode),
          field("Service", ctx.service),
          field("Queue / time", `${ctx.queue} / ${ctx.time}`),
        ];
      case "clearance":
        return [
          field("Bearer", ctx.name),
          field("Authority", ctx.service),
          field("Order / file", ctx.caseNumber),
          field("Clearance", ctx.recordStatus),
          field("Route", `WINDOW ${ctx.window}`),
          field("Equipment", findRow(rows, ["Weapon", "Equipment", "Mission", "Restriction"])),
        ];
      case "emergency":
        return [
          field("Applicant", ctx.name),
          field("Emergency code", ctx.caseNumber),
          field("Receiving window", ctx.window),
          field("Service", ctx.service),
          field("Arrival", ctx.mode),
          field("Reported time", ctx.time),
        ];
      case "legal":
        return [
          field("Applicant", ctx.name),
          field("Matter", ctx.purpose),
          field("Case file", ctx.caseNumber),
          field("Service", ctx.service),
          field("Appointment", ctx.time),
          field("Required", findRow(rows, ["Required", "Submitted", "Document"])),
        ];
      case "correspondence":
        return [
          field("Bearer", ctx.name),
          field("Letter file", ctx.caseNumber),
          field("Destination", `${ctx.service} / ${ctx.window}`),
          field("Clearance", ctx.recordStatus),
          field("Arrival", ctx.mode),
          field("Queue", ctx.queue),
        ];
      case "appointment":
      default:
        return [
          field("Applicant", ctx.name),
          field("Appointment", ctx.time),
          field("Service window", ctx.window),
          field("Case file", ctx.caseNumber),
          field("Service", ctx.service),
          field("Queue", ctx.queue),
        ];
    }
  }

  function verificationFields(ctx) {
    return [
      field("Record", ctx.recordStatus),
      field("Identity", resultStatus(ctx.idCheck)),
      field("Documents", resultStatus(ctx.documents)),
      field("Detector", resultStatus(ctx.detector)),
      field("Bag / X-ray", resultStatus(ctx.xray)),
      field("Statement", resultStatus(ctx.question, "NOT ASKED")),
    ];
  }

  function annexFields(ctx) {
    const rows = ctx.rows.slice(0, 6);
    const resultRows = [
      field("Secondary review", resultStatus(ctx.secondary)),
      field("Liaison", resultStatus(ctx.liaison)),
    ];
    return [...rows.map((row) => field(row.label, row.value)), ...resultRows].slice(0, 8);
  }

  function getPages(caseData, type) {
    const resolvedType = normalizeType(type) || documentTypeForCase(caseData);
    const meta = TYPE_META[resolvedType];
    const ctx = contextFor(caseData, resolvedType);
    const pageOneNotes = [
      note("Declared purpose", ctx.purpose),
      note("Internal record", ctx.recordDetail),
    ];
    const pageTwoNotes = [
      note("Identity examiner", resultNote(ctx.idCheck, "Identity review is pending."), resultStatus(ctx.idCheck)),
      note("Document examiner", resultNote(ctx.documents, "Physical papers have not been recorded."), resultStatus(ctx.documents)),
      note(
        "Visitor statement",
        ctx.question.prompt && ctx.question.answer
          ? `${displayText(ctx.question.prompt)} / “${displayText(ctx.question.answer)}”`
          : "No statement has been entered.",
        resultStatus(ctx.question, "NOT ASKED"),
      ),
    ];
    const pageThreeNotes = [
      note("Secondary finding", resultNote(ctx.secondary, "No secondary finding has been recorded."), resultStatus(ctx.secondary)),
      note("Liaison / receiving office", resultNote(ctx.liaison, "No liaison response has been entered."), resultStatus(ctx.liaison)),
      note("Examiner's margin", `Route: ${ctx.mode}. Purpose: ${ctx.purpose}`, "OPEN FILE"),
    ];

    const pages = [
      {
        index: 0,
        key: "cover",
        layout: "cover",
        kicker: `UNION OF VESKAR / ${meta.label}`,
        title: meta.title,
        subtitle: meta.subtitle,
        fields: primaryFields(ctx, resolvedType),
        notes: pageOneNotes,
        seals: [
          seal("V", "File seal", ctx.recordStatus, "record"),
          seal("RS", "Red stamp", "PENDING REVIEW", "pending"),
        ],
        portrait: {
          src: ctx.portrait,
          alt: ctx.portraitAlt,
          initials: ctx.initials,
          caption: "IDENTITY PORTRAIT / CHECKPOINT COPY",
        },
      },
      {
        index: 1,
        key: "verification",
        layout: "verification",
        kicker: `SECURITY CONTROL / ${meta.label}`,
        title: "VERIFICATION & EXAMINER NOTES",
        subtitle: "COMPARE THE MARKS / RECORD THE DISCREPANCIES",
        fields: verificationFields(ctx),
        notes: pageTwoNotes,
        seals: [
          seal("ID", "Identity", resultStatus(ctx.idCheck), "record"),
          seal("DOC", "Papers", resultStatus(ctx.documents), "review"),
        ],
        portrait: null,
      },
      {
        index: 2,
        key: "annex",
        layout: "annex",
        kicker: `CONTROLLED ANNEX / ${meta.label}`,
        title: "ROUTE, AUTHORITY & MARGIN NOTES",
        subtitle: "RETAIN WITH THE CASE UNTIL THE GATE IS CLOSED",
        fields: annexFields(ctx),
        notes: pageThreeNotes,
        seals: [
          seal("V", "Veskar seal", ctx.service, "record"),
          seal("RS", "Disposition", "UNRESOLVED", "pending"),
        ],
        portrait: null,
      },
    ];

    return pages.slice(0, meta.pages).map((page, index, allPages) => ({
      ...page,
      index,
      pageCount: allPages.length,
      type: resolvedType,
      asset: ASSETS[resolvedType],
    }));
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character]));
  }

  function renderFields(fields) {
    return `<dl class="rs-dossier-fields">${fields.map((entry) => `
      <div class="rs-dossier-field">
        <dt>${escapeHtml(entry.label)}</dt>
        <dd>${escapeHtml(entry.value)}</dd>
      </div>`).join("")}
    </dl>`;
  }

  function renderNotes(notes) {
    return `<section class="rs-dossier-notes" aria-label="Dossier notes">
      <h3 class="rs-dossier-section-label">MARGIN NOTES</h3>
      <div class="rs-dossier-note-list">${notes.map((entry) => `
        <article class="rs-dossier-note${entry.tone ? ` rs-dossier-note--${escapeHtml(entry.tone.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}` : ""}">
          <h4>${escapeHtml(entry.label)}</h4>
          <p>${escapeHtml(entry.text)}</p>
        </article>`).join("")}
      </div>
    </section>`;
  }

  function renderSeals(seals) {
    return `<div class="rs-dossier-seals" aria-label="Dossier seals">${seals.map((entry) => `
      <div class="rs-dossier-seal${entry.tone ? ` rs-dossier-seal--${escapeHtml(entry.tone.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}` : ""}">
        <span class="rs-dossier-seal-mark">${escapeHtml(entry.mark)}</span>
        <span class="rs-dossier-seal-copy"><b>${escapeHtml(entry.label)}</b><small>${escapeHtml(entry.value)}</small></span>
      </div>`).join("")}
    </div>`;
  }

  function renderPortrait(portrait) {
    if (!portrait) return "";
    const hasImage = Boolean(portrait.src);
    return `<figure class="rs-dossier-portrait${hasImage ? " rs-dossier-portrait--image" : ""}">
      <div class="rs-dossier-portrait-frame">
        ${hasImage ? `<img src="${escapeHtml(portrait.src)}" alt="${escapeHtml(portrait.alt)}" />` : ""}
        <span class="rs-dossier-portrait-monogram" aria-hidden="true">${escapeHtml(portrait.initials)}</span>
        <span class="rs-dossier-portrait-crosshair" aria-hidden="true"></span>
      </div>
      <figcaption>${escapeHtml(portrait.caption)}</figcaption>
    </figure>`;
  }

  function pageIndexFor(pageIndex, pageCount) {
    const numeric = Number(pageIndex);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(pageCount - 1, Math.floor(numeric)));
  }

  function renderPage(caseData, type, pageIndex) {
    const resolvedType = normalizeType(type) || documentTypeForCase(caseData);
    const pages = getPages(caseData, resolvedType);
    const index = pageIndexFor(pageIndex, pages.length);
    const page = pages[index];
    const meta = TYPE_META[resolvedType];
    const caseObject = isRecord(caseData) ? caseData : {};
    const caseId = firstText(caseObject.id, caseObject.caseNumber, "dossier");
    const previousDisabled = index === 0 ? " disabled" : "";
    const nextDisabled = index === pages.length - 1 ? " disabled" : "";

    return `<section class="rs-dossier-view" data-dossier-type="${escapeHtml(resolvedType)}" data-dossier-case="${escapeHtml(caseId)}" style="--rs-dossier-page-ratio: ${escapeHtml(meta.ratio)};">
      <article class="rs-dossier-page rs-dossier-page--${escapeHtml(resolvedType)} rs-dossier-page--${escapeHtml(page.layout)}" data-dossier-page="${index}" data-dossier-page-count="${pages.length}">
        <img class="rs-dossier-base-image" src="${escapeHtml(getAsset(resolvedType))}" alt="" aria-hidden="true" />
        <div class="rs-dossier-ink">
          <header class="rs-dossier-header">
            <div>
              <p class="rs-dossier-kicker">${escapeHtml(page.kicker)}</p>
              <h2>${escapeHtml(page.title)}</h2>
              <p class="rs-dossier-subtitle">${escapeHtml(page.subtitle)}</p>
            </div>
            <span class="rs-dossier-page-mark">${String(index + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}</span>
          </header>
          ${renderPortrait(page.portrait)}
          <section class="rs-dossier-fields-panel" aria-label="Dossier field rows">
            <h3 class="rs-dossier-section-label">REGISTERED PARTICULARS</h3>
            ${renderFields(page.fields)}
          </section>
          ${renderNotes(page.notes)}
          ${renderSeals(page.seals)}
          <footer class="rs-dossier-footer">
            <span>VESKAR / SECURITY CONTROL</span>
            <span>${escapeHtml(firstText(caseObject.caseNumber, caseObject.id, "UNASSIGNED"))}</span>
          </footer>
        </div>
      </article>
      <nav class="rs-dossier-nav" aria-label="Dossier pages">
        <button type="button" class="rs-dossier-button rs-dossier-prev" data-dossier-action="previous" data-dossier-page="${Math.max(0, index - 1)}"${previousDisabled}>PREVIOUS PAGE</button>
        <span class="rs-dossier-nav-caption">${escapeHtml(meta.label)} / PAGE ${index + 1} OF ${pages.length}</span>
        <button type="button" class="rs-dossier-button rs-dossier-next" data-dossier-action="next" data-dossier-page="${Math.min(pages.length - 1, index + 1)}"${nextDisabled}>NEXT PAGE</button>
      </nav>
    </section>`;
  }

  function getAsset(type) {
    const resolvedType = normalizeType(type) || "identity";
    return ASSETS[resolvedType];
  }

  const api = Object.freeze({
    documentTypeForCase,
    getPages,
    renderPage,
    getAsset,
    assetTargets: ASSETS,
  });

  global.RedStampDossier = api;
})(typeof window !== "undefined" ? window : globalThis);
