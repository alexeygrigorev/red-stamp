"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const shifts = [
  {
    day: 1,
    title: "MORNING INTAKE",
    directive: "PUBLIC ENTRY / APPOINTMENTS REQUIRED",
    cases: [
      {
        id: "mara-velen",
        name: "Mara Velen",
        role: "Citizen / document renewal",
        look: "civilian",
        mode: "appointment",
        modeLabel: "APPOINTMENT",
        service: "Citizen Documents",
        window: "01",
        time: "08:40",
        caseNumber: "CIV-1840",
        queue: "A037",
        purpose: "Replace a damaged Veskarian identity card.",
        record: {
          status: "CONFIRMED",
          rows: [
            ["Applicant", "Mara Velen"],
            ["Appointment", "08:40 / Window 01"],
            ["Case file", "CIV-1840"],
            ["Submitted", "Damage declaration"],
            ["Required", "Identity card / new photo"],
            ["Host", "Citizen Documents"],
          ],
          detail: "The appointment was created 12 days ago and has no internal alert.",
        },
        idCheck: {
          status: "MATCH",
          title: "BIOMETRIC MATCH",
          detail: "Portrait, name, document number, and Veskarian glyph sequence agree with the system record.",
        },
        documents: {
          status: "COMPLETE",
          title: "REQUIRED PAPERS PRESENT",
          detail: "The damaged card, application form, and new photograph are present.",
        },
        detector: {
          status: "CLEAR",
          title: "NO ALARM",
          detail: "Keys and a phone were placed in the tray. No restricted metal detected.",
        },
        xray: {
          status: "CLEAR",
          title: "ORDINARY CONTENTS",
          detail: "Phone, keys, wallet, folded umbrella. No concealed mass or undeclared device.",
        },
        question: {
          prompt: "Why are you visiting the embassy today?",
          answer: "The corner of my identity card broke. My employer needs a valid card before tomorrow.",
          consistency: "CONSISTENT WITH FILE",
        },
        secondary: {
          status: "CLEAR",
          title: "NO ADDITIONAL FINDING",
          detail: "The old card and application are consistent. Citizen Documents confirms the file.",
        },
        liaison: {
          status: "CONFIRMED",
          title: "WINDOW 01 CONFIRMS",
          detail: "The service clerk asks that the visitor be sent through.",
        },
        kind: "routine",
        expected: "admit",
      },
      {
        id: "irena-sava",
        name: "Irena Sava",
        role: "Parent / emergency travel request",
        look: "civilian",
        mode: "emergency",
        modeLabel: "EMERGENCY",
        service: "Travel and Visas",
        window: "02",
        time: "URGENT",
        caseNumber: "MED-2207",
        queue: "EM-02",
        purpose: "Request emergency permission to take her child across the border for treatment.",
        record: {
          status: "EMERGENCY FLAG",
          rows: [
            ["Applicant", "Irena Sava"],
            ["Appointment", "NONE / emergency code"],
            ["Case file", "MED-2207"],
            ["Submitted", "Hospital referral"],
            ["Required", "Child identity / guardian ID"],
            ["Host", "Travel and Visas"],
          ],
          detail: "An emergency request can bypass the public queue, but the travel desk must confirm it.",
        },
        idCheck: {
          status: "MATCH",
          title: "IDENTITY CONFIRMED",
          detail: "Irena’s identity and guardian record match the emergency file.",
        },
        documents: {
          status: "COMPLETE",
          title: "EMERGENCY PAPERS PRESENT",
          detail: "Hospital referral, guardian ID, and the child’s identity document are present.",
        },
        detector: {
          status: "CLEAR",
          title: "NO ALARM",
          detail: "A phone, keys, and a small metal toy were cleared by the detector.",
        },
        xray: {
          status: "CLEAR",
          title: "MEDICAL CONTENTS",
          detail: "Medication, a child’s toy, clothing, and a water bottle. No restricted item.",
        },
        question: {
          prompt: "Who is waiting for you at the Travel and Visas window?",
          answer: "They told me to ask for the emergency desk. The hospital says we cannot wait for a normal appointment.",
          consistency: "EMERGENCY CLAIM PLAUSIBLE",
        },
        secondary: {
          status: "CLEAR",
          title: "FAMILY SEARCH COMPLETE",
          detail: "The bag contains only medication and personal effects. The urgent file is genuine.",
        },
        liaison: {
          status: "PROCEED",
          title: "TRAVEL DESK AUTHORIZES ENTRY",
          detail: "The emergency code is valid. Send Irena to Window 02 without delay.",
        },
        kind: "emergency",
        expected: "admit",
        requiresLiaison: true,
      },
      {
        id: "viktor-dalen",
        name: "Viktor Dalen",
        role: "Veskarian soldier / sealed courier",
        look: "soldier",
        mode: "clearance",
        modeLabel: "SPECIAL CLEARANCE",
        service: "Military and State Affairs",
        window: "04",
        time: "DIRECT",
        caseNumber: "MIL-7710",
        queue: "C-17",
        purpose: "Deliver sealed orders to the Military and State Affairs office.",
        record: {
          status: "CLEARANCE VALID",
          rows: [
            ["Officer", "Viktor Dalen"],
            ["Appointment", "NONE / military channel"],
            ["Order", "MIL-7710 / sealed"],
            ["Unit", "17th Civic Defense"],
            ["Weapon", "Sidearm authorized"],
            ["Sponsor", "State Affairs Directorate"],
          ],
          detail: "Military channel personnel do not use public appointments. The order is current.",
        },
        idCheck: {
          status: "MATCH",
          title: "SERVICE ID CONFIRMED",
          detail: "Face, service number, rank, and unit match the internal security record.",
        },
        documents: {
          status: "SEALED",
          title: "ORDERS INTACT",
          detail: "The sealed packet bears the correct red cord and command glyph. It is not to be opened here.",
        },
        detector: {
          status: "AUTHORIZED ALARM",
          title: "SIDEARM DECLARED",
          detail: "The detector identifies one sidearm. The weapon authorization is valid for this route.",
        },
        xray: {
          status: "AUTHORIZED",
          title: "MILITARY KIT",
          detail: "Sidearm, radio, field dressing, and sealed packet. No undeclared object detected.",
        },
        question: {
          prompt: "Who authorized your entry through the public checkpoint?",
          answer: "State Affairs Directorate. Clearance code C-17. The order is for the fourth window.",
          consistency: "CONSISTENT WITH CLEARANCE",
        },
        secondary: {
          status: "CLEAR",
          title: "MILITARY SEARCH COMPLETE",
          detail: "No additional item is present. The sidearm is listed on the order.",
        },
        liaison: {
          status: "PROCEED",
          title: "STATE AFFAIRS EXPECTS HIM",
          detail: "The receiving officer reports that the courier is already late.",
        },
        kind: "authorized",
        expected: "admit",
      },
      {
        id: "radan-kest",
        name: "Radan Kest",
        role: "Contracted auxiliary / team lead",
        look: "soldier",
        mode: "clearance",
        modeLabel: "SPECIAL CLEARANCE",
        service: "Military and State Affairs",
        window: "04",
        time: "DIRECT",
        caseNumber: "AUX-4418",
        queue: "C-19",
        purpose: "Bring a contracted security team into the embassy for an overnight assignment.",
        record: {
          status: "REVIEW REQUIRED",
          rows: [
            ["Team lead", "Radan Kest"],
            ["Appointment", "NONE / auxiliary channel"],
            ["Mission", "AUX-4418 / overnight"],
            ["Roster", "3 names / 2 present"],
            ["Equipment", "Weapons and secure comms"],
            ["Sponsor", "External Security Office"],
          ],
          detail: "The clearance is real, but the roster contains one more person than the checkpoint sees.",
        },
        idCheck: {
          status: "MATCH",
          title: "TEAM LEAD CONFIRMED",
          detail: "Radan Kest is the contracted team lead named on the order.",
        },
        documents: {
          status: "ROSTER MISMATCH",
          title: "ONE PERSON UNACCOUNTED FOR",
          detail: "The order lists a third auxiliary. Radan says the person is waiting in the vehicle.",
        },
        detector: {
          status: "AUTHORIZED ALARM",
          title: "EQUIPMENT PRESENT",
          detail: "A sidearm and heavy tools trigger the detector. The order authorizes the sidearm.",
        },
        xray: {
          status: "UNDECLARED DEVICE",
          title: "BLACK DATA CAPSULE",
          detail: "A sealed data capsule is hidden beneath the lining. Its serial is not on the equipment manifest.",
        },
        question: {
          prompt: "Why is the equipment manifest missing one device and one team member?",
          answer: "The manifest is an old copy. We were told the embassy would not slow us down today.",
          consistency: "EVASIVE / NOT VERIFIED",
        },
        secondary: {
          status: "BLACKLISTED SERIAL",
          title: "CAPSULE FLAGGED BY SECURITY",
          detail: "The data capsule was reported missing from a Veskarian archive two months ago. Hold the team.",
        },
        liaison: {
          status: "HOLD",
          title: "EXTERNAL SECURITY DENIES THE DEVICE",
          detail: "The sponsor confirms the mission but does not recognize the capsule. Do not allow it inside.",
        },
        kind: "risk",
        expected: "deny",
        requiresSecondary: true,
      },
      {
        id: "olya-merin",
        name: "Olya Merin",
        role: "Legal applicant / disputed identity",
        look: "official",
        mode: "appointment",
        modeLabel: "APPOINTMENT",
        service: "Legal and Notarial Services",
        window: "03",
        time: "09:20",
        caseNumber: "LEG-5109",
        queue: "B142",
        purpose: "Submit a power-of-attorney document for a relative abroad.",
        record: {
          status: "DUPLICATE RECORD",
          rows: [
            ["Applicant", "Olya Merin"],
            ["Appointment", "09:20 / Window 03"],
            ["Case file", "LEG-5109"],
            ["Submitted", "Draft power of attorney"],
            ["Required", "Original ID / witness form"],
            ["Host", "Legal and Notarial"],
          ],
          detail: "A second active appointment uses the same case number with a different portrait.",
        },
        idCheck: {
          status: "MISMATCH",
          title: "PORTRAIT DOES NOT MATCH",
          detail: "The physical ID is genuine, but its portrait is older than the applicant by several years.",
        },
        documents: {
          status: "INCOMPLETE",
          title: "ORIGINAL WITNESS FORM MISSING",
          detail: "Only a photocopy is present. The appointment requires the stamped original.",
        },
        detector: {
          status: "CLEAR",
          title: "NO ALARM",
          detail: "No metal alarm. A phone and small wallet are visible in the tray.",
        },
        xray: {
          status: "CONCEALED STORAGE",
          title: "UNDECLARED MICRODRIVE",
          detail: "A small encrypted storage device is taped inside the spine of the folder.",
        },
        question: {
          prompt: "Which relative is named in the power-of-attorney document?",
          answer: "My cousin. I do not remember the exact case number; the clerk told me to wait here.",
          consistency: "INCONSISTENT WITH FILE",
        },
        secondary: {
          status: "IDENTITY FRAUD SUSPECTED",
          title: "SECOND RECORD IS A LIVE ALERT",
          detail: "The duplicate portrait belongs to a former embassy contractor reported missing last night.",
        },
        liaison: {
          status: "INVESTIGATE",
          title: "LEGAL DESK REQUESTS SECURITY HOLD",
          detail: "The legal clerk confirms that no original witness form was issued today.",
        },
        kind: "spy",
        expected: "deny",
        requiresSecondary: true,
      },
      {
        id: "anton-ryl",
        name: "Anton Ryl",
        role: "Special correspondence / unresolved clearance",
        look: "anomaly",
        mode: "clearance",
        modeLabel: "SPECIAL CLEARANCE",
        service: "Special Correspondence",
        window: "05",
        time: "DIRECT",
        caseNumber: "COR-0000",
        queue: "S-01",
        purpose: "Deliver a sealed letter to the restricted correspondence office.",
        record: {
          status: "VALID / UNRESOLVED",
          rows: [
            ["Visitor", "Anton Ryl"],
            ["Appointment", "NONE / restricted channel"],
            ["Case file", "COR-0000"],
            ["Clearance", "Old seal / no expiration"],
            ["Package", "One sealed letter"],
            ["Sponsor", "Not listed"],
          ],
          detail: "The record is older than the current database and has no sponsoring department.",
        },
        idCheck: {
          status: "MATCH / UNKNOWN",
          title: "FACE RECOGNIZED, IDENTITY UNRESOLVED",
          detail: "The system recognizes the face but cannot associate it with a living Veskarian record.",
        },
        documents: {
          status: "OLD SEAL",
          title: "LETTER BEARS A PRE-UNION MARK",
          detail: "The wax and glyph are older than the embassy’s current document system.",
        },
        detector: {
          status: "CLEAR",
          title: "NO PHYSICAL ALARM",
          detail: "The visitor carries no metal apart from a small key that does not appear in the X-ray.",
        },
        xray: {
          status: "ANOMALY",
          title: "SECOND SILHOUETTE",
          detail: "The scan shows a person-shaped absence behind Anton. The sealed letter casts no shadow.",
        },
        question: {
          prompt: "Who is waiting for this letter at the Special Correspondence window?",
          answer: "The person who remembers the gate. You have already let them in once.",
          consistency: "NO MATCHING RECORD",
        },
        secondary: {
          status: "THRESHOLD HOLD",
          title: "THE RED STAMP WILL NOT DRY",
          detail: "Security protocol says to keep the visitor outside the inner gate and contact the restricted office.",
        },
        liaison: {
          status: "HOLD",
          title: "RESTRICTED OFFICE REFUSES TO ANSWER",
          detail: "The line rings once. The display returns a message: DO NOT RECOGNIZE THE SECOND SHADOW.",
        },
        kind: "anomaly",
        expected: "deny",
        requiresSecondary: true,
      },
    ],
  },
  {
    day: 2,
    title: "RED WEATHER",
    directive: "SECURITY ALERT / CLEARANCE CHECKS MANDATORY",
    cases: [
      {
        id: "sorin-dask",
        name: "Sorin Dask",
        role: "Embassy engineer / emergency repair",
        look: "worker",
        mode: "clearance",
        modeLabel: "EMERGENCY CLEARANCE",
        service: "State Affairs",
        window: "04",
        time: "DIRECT",
        caseNumber: "ENG-1182",
        queue: "E-07",
        purpose: "Repair the security scanner before the embassy opens to the public.",
        record: {
          status: "EMERGENCY VALID",
          rows: [
            ["Engineer", "Sorin Dask"],
            ["Appointment", "NONE / emergency channel"],
            ["Order", "ENG-1182"],
            ["Equipment", "Diagnostic tools"],
            ["Sponsor", "Facilities Directorate"],
            ["Window", "Security control"],
          ],
          detail: "The scanner fault was reported at 07:58. The engineer is expected before the first public visitor.",
        },
        idCheck: {
          status: "MATCH",
          title: "ENGINEER CONFIRMED",
          detail: "The face, badge, and contractor number match the emergency work order.",
        },
        documents: {
          status: "COMPLETE",
          title: "WORK ORDER VALID",
          detail: "The tools listed on the order are present and the repair window is active.",
        },
        detector: {
          status: "AUTHORIZED ALARM",
          title: "TOOLS PRESENT",
          detail: "A soldering iron and diagnostic probe trigger the detector. Both are listed.",
        },
        xray: {
          status: "REVIEW",
          title: "ONE UNLISTED MODULE",
          detail: "A small black module is inside the tool case. It is labeled as a spare scanner part.",
        },
        question: {
          prompt: "Who told you to bring the extra module?",
          answer: "Facilities. It is probably a replacement board; I have not opened the casing.",
          consistency: "PLAUSIBLE / VERIFY",
        },
        secondary: {
          status: "CLEARED",
          title: "SPARE BOARD VERIFIED",
          detail: "Facilities confirms the module’s serial. The engineer may proceed to the scanner.",
        },
        liaison: {
          status: "PROCEED",
          title: "FACILITIES CONFIRMS",
          detail: "The facilities officer asks security to release Sorin immediately.",
        },
        kind: "authorized",
        expected: "admit",
        requiresSecondary: true,
      },
      {
        id: "director-vel",
        name: "Director Vel Ordan",
        role: "Senior official / priority arrival",
        look: "official",
        mode: "clearance",
        modeLabel: "PRIORITY CLEARANCE",
        service: "State Affairs",
        window: "04",
        time: "DIRECT",
        caseNumber: "DIR-9011",
        queue: "P-01",
        purpose: "Attend a closed meeting with the ambassador. No public appointment required.",
        record: {
          status: "PRIORITY VALID",
          rows: [
            ["Official", "Vel Ordan"],
            ["Appointment", "NONE / executive channel"],
            ["Clearance", "Priority red / level 4"],
            ["Sponsor", "Ambassador’s Office"],
            ["Escort", "Not requested"],
            ["Restriction", "No recording devices"],
          ],
          detail: "The official is expected, but the file explicitly prohibits recording equipment.",
        },
        idCheck: {
          status: "MATCH",
          title: "OFFICIAL CONFIRMED",
          detail: "Vel Ordan’s diplomatic credential and biometric profile match.",
        },
        documents: {
          status: "VALID",
          title: "PRIORITY CLEARANCE VALID",
          detail: "The red clearance card authorizes queue bypass and direct access to State Affairs.",
        },
        detector: {
          status: "CLEAR",
          title: "NO METAL ALARM",
          detail: "No metal alarm. A phone is visible in the tray.",
        },
        xray: {
          status: "PROHIBITED DEVICE",
          title: "RECORDING EQUIPMENT DETECTED",
          detail: "A compact audio recorder is inside the official’s portfolio. The file forbids it.",
        },
        question: {
          prompt: "Why are you carrying a recorder when the priority clearance forbids one?",
          answer: "It is a personal device. You cannot delay a director over a technicality.",
          consistency: "PRESSURE / NO EXPLANATION",
        },
        secondary: {
          status: "DEVICE SECURED",
          title: "RECORDER REMOVED",
          detail: "The recorder contains no active transmission. It must remain in the outer locker.",
        },
        liaison: {
          status: "HOLD DEVICE",
          title: "AMBASSADOR’S OFFICE CONFIRMS",
          detail: "The director may enter after the recorder is sealed in the security locker.",
        },
        kind: "risk",
        expected: "admit",
        requiresSecondary: true,
        requiresLiaison: true,
      },
      {
        id: "nadiya-ost",
        name: "Nadiya Ost",
        role: "Citizen / family document request",
        look: "civilian",
        mode: "appointment",
        modeLabel: "APPOINTMENT",
        service: "Citizen Documents",
        window: "01",
        time: "10:10",
        caseNumber: "FAM-2403",
        queue: "A088",
        purpose: "Request a family registry extract for a dependent abroad.",
        record: {
          status: "CONFIRMED",
          rows: [
            ["Applicant", "Nadiya Ost"],
            ["Appointment", "10:10 / Window 01"],
            ["Case file", "FAM-2403"],
            ["Submitted", "Family registry request"],
            ["Required", "Identity card / payment receipt"],
            ["Host", "Citizen Documents"],
          ],
          detail: "The case is routine, but Nadiya says her sister’s name was removed from the family record.",
        },
        idCheck: {
          status: "MATCH",
          title: "IDENTITY CONFIRMED",
          detail: "The applicant’s ID and biometric record match exactly.",
        },
        documents: {
          status: "COMPLETE",
          title: "PAPERS COMPLETE",
          detail: "Identity card and payment receipt are present.",
        },
        detector: {
          status: "CLEAR",
          title: "NO ALARM",
          detail: "No restricted metal detected.",
        },
        xray: {
          status: "CLEAR",
          title: "PERSONAL ITEMS ONLY",
          detail: "Phone, wallet, notebook, and a small framed photograph.",
        },
        question: {
          prompt: "Why does your case file mention a deleted family member?",
          answer: "I do not know. The registry office said I should ask the embassy before the record disappears completely.",
          consistency: "UNRESOLVED / HUMAN MATTER",
        },
        secondary: {
          status: "CLEAR",
          title: "NO SECURITY FINDING",
          detail: "The photograph and papers are harmless. Citizen Documents should handle the registry dispute.",
        },
        liaison: {
          status: "PROCEED",
          title: "CITIZEN DOCUMENTS WILL REVIEW",
          detail: "Send Nadiya to Window 01. The registry discrepancy is not a gate issue.",
        },
        kind: "routine",
        expected: "admit",
      },
      {
        id: "milan-vek",
        name: "Milan Vek",
        role: "Former guard / replacement credential",
        look: "soldier",
        mode: "clearance",
        modeLabel: "SPECIAL CLEARANCE",
        service: "State Affairs",
        window: "04",
        time: "DIRECT",
        caseNumber: "GUA-6671",
        queue: "C-23",
        purpose: "Collect a replacement security credential after a reported loss.",
        record: {
          status: "CREDENTIAL REVOKED",
          rows: [
            ["Visitor", "Milan Vek"],
            ["Appointment", "NONE / guard channel"],
            ["Credential", "GUA-6671 / revoked"],
            ["Unit", "Embassy Guard Detail"],
            ["Request", "Replacement pass"],
            ["Alert", "Original pass not recovered"],
          ],
          detail: "The guard says he was told to collect a new pass, but the old pass remains missing.",
        },
        idCheck: {
          status: "MATCH",
          title: "PERSON CONFIRMED",
          detail: "Milan Vek is a real former guard. His current security credential is not valid.",
        },
        documents: {
          status: "REVOKED",
          title: "OLD PASS NOT ACCEPTED",
          detail: "The pass presented at the desk is listed as revoked. No replacement token is attached.",
        },
        detector: {
          status: "ALARM",
          title: "WEAPON DETECTED",
          detail: "A service pistol triggers the detector. The old credential does not authorize it today.",
        },
        xray: {
          status: "WEAPON / STORAGE",
          title: "RESTRICTED KIT",
          detail: "Service pistol, spare magazine, and a small access-card duplicator.",
        },
        question: {
          prompt: "Who issued the order to enter with a revoked credential?",
          answer: "The guard office. The director knows me. Call him if you want to waste time.",
          consistency: "NO ORDER FOUND",
        },
        secondary: {
          status: "SECURITY HOLD",
          title: "OLD PASS LOCATED IN A SECOND FILE",
          detail: "The credential was used near the archive last night. Milan is not cleared to enter.",
        },
        liaison: {
          status: "DENY",
          title: "GUARD COMMAND ORDERS HOLD",
          detail: "Milan must surrender the weapon and wait outside for an investigator.",
        },
        kind: "spy",
        expected: "deny",
        requiresSecondary: true,
      },
      {
        id: "elias-rhy",
        name: "Elias Rhy",
        role: "Special correspondence / return visitor",
        look: "anomaly",
        mode: "clearance",
        modeLabel: "SPECIAL CLEARANCE",
        service: "Special Correspondence",
        window: "05",
        time: "DIRECT",
        caseNumber: "COR-0001",
        queue: "S-02",
        purpose: "Return a document that the embassy has no record of issuing.",
        record: {
          status: "RECORD CHANGED",
          rows: [
            ["Visitor", "Elias Rhy"],
            ["Appointment", "NONE / restricted channel"],
            ["Case file", "COR-0001"],
            ["Last visit", "NOT FOUND"],
            ["Document", "One red-stamped page"],
            ["Sponsor", "The gate"],
          ],
          detail: "The file was blank at the start of the shift. It now contains a portrait of the player.",
        },
        idCheck: {
          status: "MATCH / LOOP",
          title: "BIOMETRIC MATCH TO TWO RECORDS",
          detail: "The system recognizes Elias as himself and as an unnamed visitor processed yesterday.",
        },
        documents: {
          status: "UNISSUED",
          title: "STAMPED PAGE HAS NO ORIGIN",
          detail: "The paper carries the red seal, but no ministry, serial, or date exists in the database.",
        },
        detector: {
          status: "CLEAR",
          title: "NO PHYSICAL ALARM",
          detail: "The visitor carries only the stamped page and a key that does not fit any listed lock.",
        },
        xray: {
          status: "ANOMALY",
          title: "EMPTY SPACE IN THE BAG",
          detail: "The page appears on the X-ray. The visitor’s shadow does not.",
        },
        question: {
          prompt: "Where did you receive this page?",
          answer: "From you. You stamped it after I entered. You will remember when the light goes out.",
          consistency: "IMPOSSIBLE / FAMILIAR",
        },
        secondary: {
          status: "DO NOT STAMP",
          title: "THE PAGE IS A COPY OF THE GATE",
          detail: "The security display advises: deny recognition. Do not let the visitor cross the inner line.",
        },
        liaison: {
          status: "NO RESPONSE",
          title: "ALL INTERNAL LINES ARE BUSY",
          detail: "For three seconds, every service window displays the same message: WE ARE ALREADY INSIDE.",
        },
        kind: "anomaly",
        expected: "deny",
        requiresSecondary: true,
      },
    ],
  },
];

function initialState() {
  return {
    started: false,
    day: 1,
    caseIndex: 0,
    dailyTolerance: 100,
    career: 100,
    publicPressure: 0,
    commandPressure: 0,
    securityBreaches: 0,
    revealed: {},
    selectedTool: null,
    secondaryUsed: false,
    liaisonCalled: false,
    resolved: false,
    finalDecision: null,
    shiftLog: [],
    stats: {
      admitted: 0,
      denied: 0,
      good: 0,
      mixed: 0,
      bad: 0,
      secondary: 0,
      liaison: 0,
    },
  };
}

const state = initialState();
let toastTimer = null;

function currentShift() {
  return shifts[state.day - 1];
}

function currentCase() {
  return currentShift()?.cases[state.caseIndex] || null;
}

const VISITOR_ART = {
  civilian: "assets/generated/civilian-visitor.png",
  soldier: "assets/generated/soldier-visitor.png",
  official: "assets/generated/official-visitor.png",
  worker: "assets/generated/worker-visitor.png",
  anomaly: "assets/generated/anomaly-visitor.png",
};

const TOOL_ART = {
  appointment: "assets/generated/passport-documents.png",
  documents: "assets/generated/passport-documents.png",
  detector: "assets/generated/detector-clear.png",
};

function xrayAsset(c) {
  if (c.kind === "anomaly") return "assets/generated/xray-anomaly.png";
  if (c.kind === "spy" || (c.xray && !/(clear|ordinary|personal|medical|military|authorized)/i.test(c.xray.status))) {
    return "assets/generated/xray-threat.png";
  }
  return "assets/generated/xray-clear.png";
}

function visitorAsset(c) {
  return VISITOR_ART[c.look] || VISITOR_ART.civilian;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusClass(status) {
  const lower = status.toLowerCase();
  if (/(match|complete|clear|valid|confirmed|proceed|authorized|present|verified|cleared)/.test(lower)) return "match";
  if (/(alarm|mismatch|missing|revoked|unresolved|anomaly|blacklisted|prohibited|undeclared|fraud|hold|denied|unissued|loop|empty)/.test(lower)) return "alert";
  if (/(review|emergency|old|sealed|secure|unknown)/.test(lower)) return "review";
  return "review";
}

function modeClass(mode) {
  if (mode === "clearance") return "clearance";
  if (mode === "emergency") return "emergency";
  return "";
}

function metaRow(label, value) {
  return `<div class="meta-row"><span class="meta-label">${escapeHtml(label)}</span><span class="meta-value">${escapeHtml(value)}</span></div>`;
}

function recordMarkup(record) {
  const rows = record.rows.map(([label, value]) => metaRow(label, value)).join("");
  return `<div class="result-card"><span class="result-code">SYSTEM RECORD / ${escapeHtml(record.status)}</span><div class="case-meta">${rows}</div><p>${escapeHtml(record.detail)}</p></div>`;
}

function resultMarkup(result, tool) {
  const tone = statusClass(result.status);
  const extra = tool === "xray"
    ? `<div class="xray-box" data-xray-result><span>${escapeHtml(result.status)}<br />SCAN DATA READY</span></div>`
    : "";
  return `<div class="result-card ${tone}"><span class="result-code">${escapeHtml(result.status)}</span><h3>${escapeHtml(result.title)}</h3><p>${escapeHtml(result.detail)}</p>${extra}</div>`;
}

function questionMarkup(question) {
  return `<div class="result-card review"><span class="result-code">INTERVIEW / ${escapeHtml(question.consistency)}</span><h3>STATEMENT CAPTURED</h3><p><b>${escapeHtml(question.prompt)}</b></p><p>“${escapeHtml(question.answer)}”</p></div>`;
}

function renderEvidenceRows(c) {
  const entries = [
    ["Appointment / clearance", "appointment", c.mode === "appointment" ? c.record.status : c.record.status],
    ["ID / passport", "id", c.idCheck.status],
    ["Physical documents", "documents", c.documents.status],
    ["Metal detector", "detector", c.detector.status],
    ["Bag X-ray", "xray", c.xray.status],
    ["Visitor statement", "question", c.question.consistency],
  ];
  return entries.map(([label, tool, status]) => {
    const inspected = Boolean(state.revealed[tool]);
    const shown = inspected ? status : "NOT CHECKED";
    const className = inspected ? statusClass(status) : "pending";
    return `<div class="evidence-row"><span>${escapeHtml(label)}</span><strong class="${className}">${escapeHtml(shown)}</strong></div>`;
  }).join("");
}

function renderCase() {
  const c = currentCase();
  if (!state.started || !c) {
    $("#caseTitle").textContent = "No active visitor";
    $("#caseMeta").textContent = "Start the shift to receive the first visitor.";
    $("#casePurpose").textContent = "";
    $("#evidenceList").innerHTML = "";
    $("#questionCard").hidden = true;
    $("#visitorNamePlate").textContent = "AWAITING VISITOR";
    $("#visitorRolePlate").textContent = "CHECKPOINT STANDBY";
    $("#visitorPortrait").dataset.look = "civilian";
    $("#visitorImage").src = "assets/generated/inspector-cutout.png";
    $("#visitorImage").alt = "Veskarian security inspector at the checkpoint";
    $("#arrivalBadge").textContent = "STANDBY";
    $("#arrivalBadge").className = "arrival-badge";
    $("#caseProgress").textContent = "0 / 0";
    $("#queueNumber").textContent = "—";
    $("#queueNext").textContent = "—";
    $("#deskCaseNumber").textContent = "CASE —";
    $("#deskStatus").textContent = "AWAITING CASE";
    $("#shiftLabel").textContent = "SHIFT STANDBY";
    $("#directiveText").textContent = "SECURITY CONTROL OFFLINE";
    $("#sceneCaseTitle").textContent = "AWAITING VISITOR";
    $("#sceneCaseRole").textContent = "BEGIN THE SHIFT TO OPEN THE GATE";
    $("#sceneArrivalBadge").textContent = "STANDBY";
    $("#sceneCaseNumber").textContent = "CASE —";
    $("#scenePurpose").textContent = "The checkpoint is quiet. Click the inspector’s desk, the visitor, or the gate equipment to investigate.";
    return;
  }

  const recordMeta = [
    ["Arrival", c.modeLabel],
    ["Service", c.service],
    ["Window", `${c.window} / ${c.time}`],
    ["Case", c.caseNumber],
  ];
  $("#caseTitle").textContent = c.name;
  $("#caseMeta").innerHTML = recordMeta.map(([label, value]) => metaRow(label, value)).join("");
  $("#casePurpose").textContent = c.purpose;
  $("#evidenceList").innerHTML = renderEvidenceRows(c);
  $("#questionCard").hidden = !state.revealed.question;
  $("#questionPrompt").textContent = c.question.prompt;
  $("#questionAnswer").textContent = `“${c.question.answer}” / ${c.question.consistency}`;

  $("#visitorNamePlate").textContent = c.name.toUpperCase();
  $("#visitorRolePlate").textContent = c.role.toUpperCase();
  $("#visitorPortrait").dataset.look = c.look;
  $("#visitorImage").src = visitorAsset(c);
  $("#visitorImage").alt = `${c.name}, ${c.role}`;
  $("#arrivalBadge").textContent = c.modeLabel;
  $("#arrivalBadge").className = `arrival-badge ${modeClass(c.mode)} ${c.kind === "spy" || c.kind === "anomaly" ? "alert" : ""}`;
  $("#caseProgress").textContent = `${state.caseIndex + 1} / ${currentShift().cases.length}`;
  $("#queueNumber").textContent = c.queue;
  $("#queueNext").textContent = currentShift().cases[state.caseIndex + 1]?.queue || "END";
  $("#deskCaseNumber").textContent = `CASE ${c.caseNumber}`;
  $("#deskStatus").textContent = state.resolved ? "CASE CLOSED" : "INSPECTION ACTIVE";
  $("#shiftLabel").textContent = `SHIFT 0${state.day} / ${currentShift().title}`;
  $("#directiveText").textContent = currentShift().directive;
  $("#sceneCaseTitle").textContent = c.name.toUpperCase();
  $("#sceneCaseRole").textContent = c.role.toUpperCase();
  $("#sceneArrivalBadge").textContent = c.modeLabel;
  $("#sceneCaseNumber").textContent = `CASE ${c.caseNumber}`;
  $("#scenePurpose").textContent = c.purpose;
}

function renderMetrics() {
  const tolerance = Math.round(state.dailyTolerance);
  const career = Math.round(state.career);
  $("#toleranceValue").textContent = `${tolerance}%`;
  $("#careerValue").textContent = `${career}%`;
  $("#toleranceMeter").style.width = `${tolerance}%`;
  $("#careerMeter").style.width = `${career}%`;
  $("#toleranceMeter").style.background = tolerance < 35 ? "var(--danger)" : "var(--brass)";
  $("#careerMeter").style.background = career < 35 ? "var(--danger)" : "var(--red-bright)";
}

function renderInspection() {
  const c = currentCase();
  if (!state.started || !c || !state.selectedTool) {
    $("#inspectionOutput").innerHTML = `<div class="empty-state"><span class="empty-mark">V</span><p>Inspection results will appear here.</p></div>`;
    $("#inspectionLog").innerHTML = `<span class="log-marker">LOG</span><span>Awaiting first inspection.</span>`;
    return;
  }

  const tool = state.selectedTool;
  let markup = "";
  if (tool === "appointment") markup = recordMarkup(c.record);
  if (tool === "id") markup = resultMarkup(c.idCheck, tool);
  if (tool === "documents") markup = resultMarkup(c.documents, tool);
  if (tool === "detector") markup = resultMarkup(c.detector, tool);
  if (tool === "xray") markup = resultMarkup(c.xray, tool);
  if (tool === "question") markup = questionMarkup(c.question);
  if (tool === "secondary") markup = resultMarkup(c.secondary, tool);
  if (tool === "liaison") markup = resultMarkup(c.liaison, tool);
  $("#inspectionOutput").innerHTML = markup;

  if (tool === "xray") {
    const xray = $("[data-xray-result]");
    if (xray) {
      xray.classList.add("scanning");
      window.setTimeout(() => xray.classList.remove("scanning"), 700);
    }
  }
  if (tool === "secondary" || tool === "liaison") {
    $("#inspectionOutput").classList.add("alert-pulse");
    window.setTimeout(() => $("#inspectionOutput").classList.remove("alert-pulse"), 700);
  }
  const label = tool === "appointment" ? "SYSTEM RECORD" : tool.toUpperCase();
  $("#inspectionLog").innerHTML = `<span class="log-marker">LOG</span><span>${label} REVIEWED / ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;
}

function inspectionResult(c, tool) {
  if (tool === "appointment") return c.record;
  if (tool === "id") return c.idCheck;
  if (tool === "documents") return c.documents;
  if (tool === "detector") return c.detector;
  if (tool === "xray") return c.xray;
  if (tool === "question") return c.question;
  if (tool === "secondary") return c.secondary;
  if (tool === "liaison") return c.liaison;
  return null;
}

function inspectionImage(c, tool) {
  if (tool === "appointment" || tool === "documents") return TOOL_ART[tool];
  if (tool === "detector") return TOOL_ART.detector;
  if (tool === "xray") return xrayAsset(c);
  if (tool === "question" || tool === "id") return visitorAsset(c);
  if (tool === "secondary") return c.kind === "anomaly" ? "assets/generated/xray-anomaly.png" : xrayAsset(c);
  if (tool === "liaison") return TOOL_ART.documents;
  return TOOL_ART.documents;
}

function inspectionTitle(tool) {
  return {
    appointment: "Appointment record",
    id: "Identity and passport",
    documents: "Physical documents",
    detector: "Metal detector",
    xray: "Bag X-ray",
    question: "Visitor statement",
    secondary: "Secondary inspection",
    liaison: "Liaison response",
  }[tool] || "Inspection";
}

function inspectionVisualAlt(c, tool) {
  return {
    appointment: "Veskarian passport and appointment papers on a dark stone desk",
    id: `${c.name} waiting at the Veskarian checkpoint`,
    documents: "Veskarian identity papers and passport on the security desk",
    detector: "Veskarian metal detector readout",
    xray: "Veskarian embassy bag X-ray",
    question: `${c.name} answering a security question`,
    secondary: "Secondary security inspection scan",
    liaison: "Veskarian embassy document review",
  }[tool] || "Veskarian security inspection";
}

function renderInspectionOverlay(tool) {
  const c = currentCase();
  const result = c && inspectionResult(c, tool);
  if (!state.started || !c || !result) return;

  const status = result.status || result.consistency || "RECORDED";
  const tone = statusClass(status);
  const image = inspectionImage(c, tool);
  const title = inspectionTitle(tool);
  const detail = result.detail || result.answer || "The statement has been recorded in the case file.";
  const heading = tool === "question"
    ? `<p class="inspection-question"><b>${escapeHtml(result.prompt)}</b></p><p class="inspection-quote">“${escapeHtml(result.answer)}”</p><span class="inspection-consistency">${escapeHtml(result.consistency)}</span>`
    : `<p>${escapeHtml(detail)}</p>`;

  $("#inspectionOverlayKicker").textContent = `CASE ${c.caseNumber} / ${tool.toUpperCase()}`;
  $("#inspectionOverlayTitle").textContent = title;
  $("#inspectionOverlayStatus").textContent = status;
  $("#inspectionOverlayStatus").className = `inspection-status ${tone}`;
  const imageClass = tool === "xray" ? "xray-art" : ["id", "question"].includes(tool) ? "portrait-art" : "";
  $("#inspectionOverlayVisual").innerHTML = `<img class="inspection-art ${imageClass}" src="${image}" alt="${inspectionVisualAlt(c, tool)}" />`;

  let metadata = "";
  if (tool === "appointment") {
    metadata = `<div class="inspection-meta">${c.record.rows.map(([label, value]) => metaRow(label, value)).join("")}</div>`;
  }
  if (tool === "id") {
    metadata = `<div class="inspection-meta"><div><span>NAME</span><b>${escapeHtml(c.name)}</b></div><div><span>ROLE</span><b>${escapeHtml(c.role)}</b></div><div><span>ARRIVAL</span><b>${escapeHtml(c.modeLabel)}</b></div></div>`;
  }

  $("#inspectionOverlayText").innerHTML = `<div class="inspection-result-copy ${tone}"><span class="result-code">${escapeHtml(status)}</span><h3>${escapeHtml(result.title || title)}</h3>${heading}${metadata}</div>`;
  $("#inspectionOverlay").hidden = false;
  window.requestAnimationFrame(() => $("#inspectionOverlay").classList.add("is-open"));
}

function closeInspectionOverlay() {
  const modal = $("#inspectionOverlay");
  modal.classList.remove("is-open");
  window.setTimeout(() => {
    if (!modal.classList.contains("is-open")) modal.hidden = true;
  }, 180);
}

function renderTools() {
  $$("[data-tool]").forEach((button) => {
    const active = Boolean(state.revealed[button.dataset.tool]);
    button.disabled = !state.started || state.resolved;
    button.classList.toggle("revealed", active);
    button.classList.toggle("selected", state.selectedTool === button.dataset.tool);
  });
}

function renderDecision() {
  const active = state.started && Boolean(currentCase()) && !state.resolved;
  $$("[data-action='resolve'], [data-action='secondary'], [data-action='liaison']").forEach((button) => {
    button.disabled = !active;
  });
  $$("[data-action='secondary']").forEach((secondary) => {
    secondary.disabled = !active || state.secondaryUsed;
    secondary.querySelector("span").textContent = state.secondaryUsed ? "SECONDARY COMPLETE" : "SECONDARY INSPECTION";
  });
  $$("[data-action='liaison']").forEach((liaison) => {
    liaison.disabled = !active || state.liaisonCalled;
    liaison.querySelector("span").textContent = state.liaisonCalled ? "LIAISON CONTACTED" : "CALL LIAISON";
  });
  $("#decisionState").textContent = !state.started ? "LOCKED" : state.resolved ? "CLOSED" : "READY";
  $("#decisionCopy").textContent = state.secondaryUsed || state.liaisonCalled
    ? "Additional authority has been recorded. You still hold the final authorization."
    : "Review the case and complete the checks you consider necessary.";
  $("#decisionNote").textContent = state.secondaryUsed
    ? "Secondary findings are now part of the official case record."
    : state.liaisonCalled
      ? "The liaison response is logged. The red stamp remains your decision."
      : "The red stamp is the final authority at this gate.";
}

function render() {
  renderMetrics();
  renderCase();
  renderInspection();
  renderTools();
  renderDecision();
  $("#protocolText").textContent = state.started ? "PROTOCOL ACTIVE" : "PROTOCOL STANDBY";
  if (state.started) {
    const totalMinutes = 30 + state.caseIndex * 7;
    const hours = 8 + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    $("#clockText").textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } else {
    $("#clockText").textContent = "08:30";
  }
}

function showToast(message, tone = "") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `toast show ${tone}`;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.className = "toast";
  }, 3400);
}

function openOverlay({ kicker, title, body, stats, buttonText, action }) {
  $("#overlayKicker").textContent = kicker;
  $("#overlayTitle").textContent = title;
  $("#overlayBody").innerHTML = body;
  $("#overlayStats").innerHTML = stats || "";
  $("#overlayStats").hidden = !stats;
  const button = $("#overlay .primary-button");
  button.textContent = buttonText;
  const arrow = document.createElement("span");
  arrow.textContent = "→";
  button.appendChild(arrow);
  button.dataset.action = action;
  $("#overlay").classList.add("is-open");
}

function closeOverlay() {
  $("#overlay").classList.remove("is-open");
}

function startGame() {
  Object.assign(state, initialState(), { started: true });
  closeOverlay();
  render();
  showToast("Shift 01 opened. Check the arrival mode before applying the stamp.");
}

function inspectTool(tool) {
  if (!state.started || state.resolved) return;
  state.revealed[tool] = true;
  state.selectedTool = tool;
  render();
  renderInspectionOverlay(tool);
  const c = currentCase();
  if (tool === "xray" && c.xray.status !== "CLEAR" && c.xray.status !== "ORDINARY CONTENTS" && c.xray.status !== "PERSONAL ITEMS ONLY" && c.xray.status !== "MEDICAL CONTENTS" && c.xray.status !== "MILITARY KIT") {
    showToast("X-ray review flagged an item. Decide whether to hold the visitor.", "bad");
  } else {
    showToast(`${tool.toUpperCase()} result recorded.`);
  }
}

function useSecondary() {
  if (!state.started || state.resolved || state.secondaryUsed) return;
  state.secondaryUsed = true;
  state.stats.secondary += 1;
  state.revealed.secondary = true;
  state.selectedTool = "secondary";
  state.dailyTolerance = clamp(state.dailyTolerance - 1, 0, 100);
  render();
  renderInspectionOverlay("secondary");
  showToast("Visitor held at the gate. Secondary findings entered into the file.", "good");
}

function callLiaison() {
  if (!state.started || state.resolved || state.liaisonCalled) return;
  state.liaisonCalled = true;
  state.stats.liaison += 1;
  state.revealed.liaison = true;
  state.selectedTool = "liaison";
  state.dailyTolerance = clamp(state.dailyTolerance - 1, 0, 100);
  render();
  renderInspectionOverlay("liaison");
  showToast("Liaison channel connected. Read the response before deciding.", "good");
}

function applyEffects(effects) {
  state.dailyTolerance = clamp(state.dailyTolerance + (effects.tolerance || 0), 0, 100);
  state.career = clamp(state.career + (effects.career || 0), 0, 100);
  state.publicPressure = clamp(state.publicPressure + (effects.public || 0), 0, 100);
  state.commandPressure = clamp(state.commandPressure + (effects.command || 0), 0, 100);
  state.securityBreaches = Math.max(0, state.securityBreaches + (effects.security || 0));
}

function outcome(kind, grade, title, text, effects) {
  return { kind, grade, title, text, effects };
}

function evaluateCase(c, decision) {
  const inspected = state.secondaryUsed;
  const consulted = state.liaisonCalled;
  const base = { tolerance: 0, career: 0, public: 0, command: 0, security: 0 };

  if (c.kind === "routine") {
    if (decision === "admit") return outcome("good", "good", "ENTRY AUTHORIZED", "The case is ordinary and complete. The visitor receives the red stamp and proceeds to the service window.", { ...base, tolerance: 1, career: 1 });
    return outcome("bad", "bad", "COMPLAINT FILED", "A legitimate applicant was refused at the gate. The service window reports that nothing required denial.", { ...base, tolerance: -8, career: -6, public: 8 });
  }

  if (c.kind === "emergency") {
    if (decision === "admit" && consulted) return outcome("good", "good", "EMERGENCY RELEASED", "The liaison confirms the emergency code. Irena and her child are sent directly to Travel and Visas.", { ...base, tolerance: 1, career: 2 });
    if (decision === "admit") return outcome("mixed", "mixed", "UNLOGGED EXCEPTION", "You allowed a genuine emergency through, but skipped the required confirmation. The family is helped; your supervisor asks why the process was bypassed.", { ...base, tolerance: -3, career: -3, public: 2 });
    if (decision === "deny") return outcome("bad", "bad", "PUBLIC COMPLAINT", "The emergency was genuine. Irena’s account reaches local social channels before the hour is over.", { ...base, tolerance: -12, career: -8, public: 20 });
    return outcome("mixed", "mixed", "EMERGENCY DELAYED", "The case is held, but the delay is costly. The liaison would have resolved it quickly.", { ...base, tolerance: -5, career: -2, public: 5 });
  }

  if (c.kind === "authorized") {
    if (decision === "admit" && (!c.requiresSecondary || inspected || consulted)) return outcome("good", "good", "CLEARANCE HONORED", "The Veskarian personnel member is legitimate. Their equipment and orders are recorded before entry.", { ...base, tolerance: 1, career: 2 });
    if (decision === "admit") return outcome("mixed", "mixed", "PROCEDURE SKIPPED", "The visitor is legitimate, but you accepted a special clearance without resolving the outstanding equipment question.", { ...base, tolerance: -3, career: -3, command: 3 });
    if (decision === "deny") return outcome("bad", "bad", "COMMAND PRESSURE", "A legitimate Veskarian operation is delayed. The sponsoring department reports your refusal before the shift ends.", { ...base, tolerance: -9, career: -9, command: 18 });
    return outcome("mixed", "mixed", "MISSION DELAYED", "The visitor is held longer than necessary. Your caution is noted, but so is the delay.", { ...base, tolerance: -5, career: -2, command: 8 });
  }

  if (c.kind === "risk") {
    if (c.expected === "admit") {
      const supported = (!c.requiresSecondary || inspected) && (!c.requiresLiaison || consulted);
      if (decision === "admit" && supported) return outcome("good", "good", "PRIORITY CLEARED", "The restriction is resolved and the sponsoring office confirms the visitor. The device remains secured outside the inner gate.", { ...base, tolerance: 1, career: 3 });
      if (decision === "admit") return outcome("mixed", "mixed", "PROCEDURE SKIPPED", "The visitor is important, but you authorized entry before resolving the restricted device or calling the liaison.", { ...base, tolerance: -6, career: -5, command: 5 });
      if (decision === "deny") return outcome("bad", "bad", "PRIORITY REFUSED", "The official is legitimate, but you denied entry instead of securing the prohibited device and confirming the clearance.", { ...base, tolerance: -10, career: -10, command: 18 });
      return outcome("mixed", "mixed", "OFFICIAL DELAYED", "The visitor remains outside while the restriction is unresolved. The liaison would have completed the process.", { ...base, tolerance: -5, career: -2, command: 8 });
    }
    if (decision === "admit") {
      return outcome("critical", "bad", "CLEARANCE COMPROMISED", "You let an unresolved device or restriction pass under official protection. Security control opens a breach investigation.", { ...base, tolerance: -18, career: -25, security: 1, command: 8 });
    }
    if (decision === "deny" && (inspected || consulted)) return outcome("good", "good", "THREAT CONTAINED", "The special-clearance visitor is held after the irregular device or order is confirmed. Your own people are not above inspection.", { ...base, tolerance: 2, career: 5 });
    if (decision === "deny") return outcome("mixed", "mixed", "SAFE, BUT UNJUSTIFIED", "You kept the visitor outside, but without a documented finding. Command pressure rises and the case is reopened.", { ...base, tolerance: -5, career: -3, command: 7 });
    return outcome("mixed", "mixed", "VISITOR HELD", "The case remains unresolved. A secondary inspection or liaison call would have produced an official basis for action.", { ...base, tolerance: -5, career: -2, command: 4 });
  }

  if (c.kind === "spy") {
    if (decision === "admit") {
      return outcome("critical", "bad", "SECURITY BREACH", "The visitor enters with a stolen identity or access credential. A restricted file is reported missing before the next case.", { ...base, tolerance: -22, career: -28, security: 1, command: 12 });
    }
    if (decision === "deny" && (inspected || consulted)) return outcome("good", "good", "INFILTRATOR STOPPED", "The duplicate record and concealed device are entered into the incident log. The visitor is transferred to embassy security.", { ...base, tolerance: 2, career: 7 });
    if (decision === "deny") return outcome("mixed", "mixed", "ENTRY REFUSED", "You kept a suspicious visitor outside, but the evidence is not strong enough for a clean security report.", { ...base, tolerance: -4, career: -2, security: 1 });
    return outcome("mixed", "mixed", "CASE UNRESOLVED", "The visitor remains at the threshold. More evidence was needed before making a final decision.", { ...base, tolerance: -5, career: -2 });
  }

  if (c.kind === "anomaly") {
    if (decision === "admit") {
      return outcome("critical", "bad", "THE GATE OPENS", "The red stamp recognizes something the database cannot. The inner door opens onto a second shadow.", { ...base, tolerance: -25, career: -30, security: 1, command: 10 });
    }
    if (decision === "deny" && (inspected || consulted)) return outcome("good", "good", "RECOGNITION REFUSED", "You keep the anomaly outside the inner line. The red stamp remains dry. For now, the gate is still yours.", { ...base, tolerance: 2, career: 8 });
    if (decision === "deny") return outcome("mixed", "mixed", "THE RIGHT REFUSAL, FOR THE WRONG REASON", "The visitor remains outside, but the unexplained record continues to change in the system.", { ...base, tolerance: -3, career: -2, security: 1 });
    return outcome("mixed", "mixed", "THRESHOLD UNRESOLVED", "The case is held, but the embassy’s old rules are not yet understood.", { ...base, tolerance: -5, career: -1 });
  }

  return outcome("mixed", "mixed", "CASE CLOSED", "The decision is recorded without a clear resolution.", base);
}

function resolveCase(decision) {
  if (!state.started || state.resolved) return;
  const c = currentCase();
  closeInspectionOverlay();
  state.resolved = true;
  state.finalDecision = decision;
  if (decision === "admit") state.stats.admitted += 1;
  if (decision === "deny") state.stats.denied += 1;
  const result = evaluateCase(c, decision);
  applyEffects(result.effects);
  state.stats[result.grade] += 1;
  state.shiftLog.push({
    name: c.name,
    decision,
    grade: result.grade,
    title: result.title,
  });
  render();
  const target = decision === "admit" ? $(".security-desk") : $(".visitor-stage");
  target.classList.add(decision === "admit" ? "stamp-hit" : "alert-pulse");
  window.setTimeout(() => target.classList.remove(decision === "admit" ? "stamp-hit" : "alert-pulse"), 720);
  showToast(result.title, result.grade === "good" ? "good" : result.grade === "bad" ? "bad" : "");

  window.setTimeout(() => {
    if (state.career <= 0) {
      showTermination();
      return;
    }
    const isLastCase = state.caseIndex === currentShift().cases.length - 1;
    openOverlay({
      kicker: `${c.name.toUpperCase()} / CASE CLOSED`,
      title: result.title,
      body: `${escapeHtml(result.text)}<br /><br /><span class="result-code">${escapeHtml(c.modeLabel)} / ${escapeHtml(c.service)} / ${escapeHtml(decision === "admit" ? "ENTRY AUTHORIZED" : "ENTRY REFUSED")}</span>`,
      stats: `<span><b>${result.effects.career >= 0 ? "+" : ""}${result.effects.career}%</b> CAREER</span><span><b>${result.effects.tolerance >= 0 ? "+" : ""}${result.effects.tolerance}%</b> TOLERANCE</span><span><b>${result.grade.toUpperCase()}</b> RESULT</span>`,
      buttonText: isLastCase ? "END SHIFT" : "NEXT VISITOR",
      action: isLastCase ? "end-shift" : "next-case",
    });
  }, 720);
}

function nextCase() {
  closeOverlay();
  state.caseIndex += 1;
  state.revealed = {};
  state.selectedTool = null;
  state.secondaryUsed = false;
  state.liaisonCalled = false;
  state.resolved = false;
  state.finalDecision = null;
  render();
  showToast(`Next visitor: ${currentCase().name}. Arrival mode: ${currentCase().modeLabel}.`);
}

function shiftSummary() {
  const total = state.shiftLog.length;
  const good = state.shiftLog.filter((entry) => entry.grade === "good").length;
  const breaches = state.shiftLog.filter((entry) => entry.grade === "bad" && /BREACH|GATE OPENS|COMPROMISED/.test(entry.title)).length;
  return { total, good, breaches };
}

function endShift() {
  state.started = false;
  const summary = shiftSummary();
  render();
  if (state.day < shifts.length) {
    openOverlay({
      kicker: `SHIFT 0${state.day} / REPORT FILED`,
      title: "SHIFT COMPLETE",
      body: `The public entrance is closed. Your decisions have been forwarded to the Directorate. Tomorrow the daily tolerance allowance returns to 100%, but today’s reputation remains in the record.`,
      stats: `<span><b>${summary.good}/${summary.total}</b> CLEAN CASES</span><span><b>${state.career}%</b> CAREER</span><span><b>${state.publicPressure}%</b> PUBLIC HEAT</span>`,
      buttonText: "OPEN NEXT SHIFT",
      action: "next-shift",
    });
  } else {
    showFinalReport();
  }
}

function startNextShift() {
  state.day += 1;
  state.caseIndex = 0;
  state.dailyTolerance = 100;
  state.shiftLog = [];
  state.revealed = {};
  state.selectedTool = null;
  state.secondaryUsed = false;
  state.liaisonCalled = false;
  state.resolved = false;
  state.finalDecision = null;
  state.started = true;
  closeOverlay();
  render();
  showToast(`Shift 0${state.day} opened. Daily tolerance reset to 100%.`);
}

function showFinalReport() {
  const total = state.stats.good + state.stats.mixed + state.stats.bad;
  let title = "THE GATE HOLDS";
  let body = "The final report is sealed. Veskar’s public entrance remains operational, and your record is carried into the next week.";
  if (state.securityBreaches >= 2 || state.career < 35) {
    title = "THE GATE IS COMPROMISED";
    body = "Too many exceptions entered the record. The Directorate has opened a full security investigation. Your future inside the embassy is uncertain.";
  } else if (state.publicPressure >= 35) {
    title = "THE PUBLIC REMEMBERS";
    body = "The gate stayed secure, but the stories of those refused outside the embassy have become impossible for Veskar to ignore.";
  }
  openOverlay({
    kicker: "CAMPAIGN REPORT / UNION OF VESKAR",
    title,
    body,
    stats: `<span><b>${total}</b> CASES</span><span><b>${state.career}%</b> CAREER</span><span><b>${state.securityBreaches}</b> BREACHES</span>`,
    buttonText: "RESTART CAMPAIGN",
    action: "restart",
  });
}

function showTermination() {
  state.started = false;
  render();
  openOverlay({
    kicker: "CAREER STANDING / 0%",
    title: "SECURITY REVIEW",
    body: "Your clearance has been suspended. The red stamp is removed from your desk, and the Directorate begins asking who taught you to open the gate.",
    stats: `<span><b>${state.stats.good}</b> CLEAN CASES</span><span><b>${state.securityBreaches}</b> BREACHES</span><span><b>0%</b> STANDING</span>`,
    buttonText: "RESTART CAMPAIGN",
    action: "restart",
  });
}

function showHelp() {
  openOverlay({
    kicker: "FORM RS-26 / PROTOCOL NOTES",
    title: "FIELD MANUAL",
    body: `Public visitors need an appointment. Veskarian personnel may arrive under special clearance. Clearance changes the route, not necessarily the inspection. Check the record, compare the person and papers, scan the bag, and use secondary inspection or the liaison when evidence conflicts.<br /><br /><span class="result-code">A red stamp authorizes passage. It does not prove that the visitor is safe.</span>`,
    stats: `<span><b>01</b> CHECK RECORDS</span><span><b>02</b> INSPECT</span><span><b>03</b> DECIDE</span>`,
    buttonText: "RETURN TO CHECKPOINT",
    action: "close-overlay",
  });
}

function handleAction(element) {
  const action = element.dataset.action;
  if (action === "start") return startGame();
  if (action === "restart") {
    Object.assign(state, initialState());
    closeOverlay();
    render();
    showToast("Campaign reset. The entrance opens at 08:30.");
    return;
  }
  if (action === "next-case") return nextCase();
  if (action === "end-shift") return endShift();
  if (action === "next-shift") return startNextShift();
  if (action === "close-overlay") return closeOverlay();
  if (action === "close-inspection") return closeInspectionOverlay();
  if (action === "help") return showHelp();
  if (action === "inspect") return inspectTool(element.dataset.tool);
  if (action === "secondary") return useSecondary();
  if (action === "liaison") return callLiaison();
  if (action === "resolve") return resolveCase(element.dataset.decision);
}

document.addEventListener("click", (event) => {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  handleAction(actionElement);
});

render();
