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

// A visitor is a person; a case is the situation that brings them to the
// gate. These patches let the same cast return with a different pressure,
// document trail, or consequence without multiplying character assets.
const CASE_VARIANTS = {
  "mara-velen": [
    {
      variantId: "same-day-override",
      variantLabel: "SAME-DAY OVERRIDE",
      rule: "A same-day replacement can bypass the queue only after the document desk confirms the override.",
      mode: "emergency",
      modeLabel: "SAME-DAY OVERRIDE",
      time: "NOW",
      caseNumber: "CIV-1840-R",
      queue: "EM-04",
      purpose: "Replace a lost identity card before a border appointment closes.",
      record: {
        status: "MANUAL OVERRIDE",
        rows: [
          ["Applicant", "Mara Velen"],
          ["Appointment", "NONE / same-day override"],
          ["Case file", "CIV-1840-R"],
          ["Submitted", "Loss declaration"],
          ["Required", "Identity card / photo"],
          ["Host", "Citizen Documents"],
        ],
        detail: "The document desk opened a same-day slot, but the override must be confirmed before entry.",
      },
      idCheck: {
        status: "MATCH",
        title: "BIOMETRIC MATCH",
        detail: "Mara’s face and temporary identity record agree with the manual override.",
      },
      documents: {
        status: "COMPLETE",
        title: "LOSS DECLARATION PRESENT",
        detail: "The loss declaration, temporary number, and new photograph are present.",
      },
      question: {
        prompt: "Which desk opened the same-day override?",
        answer: "Citizen Documents. They told me the border appointment could not be moved.",
        consistency: "PLAUSIBLE / CONFIRM",
      },
      liaison: {
        status: "PROCEED",
        title: "DOCUMENT DESK CONFIRMS",
        detail: "The override is genuine. Send Mara to Window 01 once the record is logged.",
      },
      kind: "emergency",
      expected: "admit",
      requiresLiaison: true,
    },
  ],
  "irena-sava": [
    {
      variantId: "guardian-dispute",
      variantLabel: "GUARDIAN DISPUTE",
      rule: "An emergency may bypass the queue, but a guardian conflict needs a live confirmation from Travel and Visas.",
      caseNumber: "MED-2207-B",
      queue: "EM-05",
      purpose: "Request emergency travel permission while the second guardian is unreachable.",
      record: {
        status: "EMERGENCY / GUARDIAN REVIEW",
        rows: [
          ["Applicant", "Irena Sava"],
          ["Appointment", "NONE / emergency code"],
          ["Case file", "MED-2207-B"],
          ["Submitted", "Hospital referral / guardian form"],
          ["Required", "Child identity / live confirmation"],
          ["Host", "Travel and Visas"],
        ],
        detail: "The hospital referral is genuine, but the second guardian has not signed the travel record.",
      },
      documents: {
        status: "REVIEW",
        title: "CO-SIGNATURE NOT FOUND",
        detail: "The hospital referral and guardian ID are present. The second guardian’s approval is not in the system.",
      },
      question: {
        prompt: "Why is the second guardian not on the travel record?",
        answer: "He is at the hospital. The travel desk told me they could confirm him by telephone.",
        consistency: "PLAUSIBLE / CONFIRM",
      },
      secondary: {
        status: "CLEAR",
        title: "FAMILY SEARCH COMPLETE",
        detail: "The bag contains medication and personal effects. The open question belongs to Travel and Visas.",
      },
      liaison: {
        status: "PROCEED",
        title: "TRAVEL DESK CONFIRMS THE EXCEPTION",
        detail: "The second guardian is verified by telephone. Send Irena to Window 02 without delay.",
      },
      kind: "emergency",
      expected: "admit",
      requiresLiaison: true,
    },
  ],
  "viktor-dalen": [
    {
      variantId: "expired-order",
      variantLabel: "EXPIRED ORDER",
      rule: "A service weapon can be declared and still be attached to an order that is no longer active.",
      modeLabel: "CLEARANCE / REVIEW",
      caseNumber: "MIL-7710-X",
      queue: "C-18",
      purpose: "Deliver sealed orders using a clearance code that was cancelled at first light.",
      record: {
        status: "ORDER EXPIRED",
        rows: [
          ["Officer", "Viktor Dalen"],
          ["Appointment", "NONE / military channel"],
          ["Order", "MIL-7710-X / cancelled"],
          ["Unit", "17th Civic Defense"],
          ["Weapon", "Sidearm listed / authority expired"],
          ["Sponsor", "State Affairs Directorate"],
        ],
        detail: "The courier is genuine, but the order was withdrawn after a route change this morning.",
      },
      documents: {
        status: "REVOKED",
        title: "SEAL NO LONGER ACTIVE",
        detail: "The packet is intact. Its command glyph was cancelled at 06:00 and cannot authorize entry now.",
      },
      question: {
        prompt: "Who reactivated the cancelled route?",
        answer: "My unit told me the old order would still open the gate. I have no newer code.",
        consistency: "NOT VERIFIED",
      },
      secondary: {
        status: "SECURITY HOLD",
        title: "ORDER CONFIRMED CANCELLED",
        detail: "State Affairs confirms the route change. Secure the packet and keep the courier outside.",
      },
      liaison: {
        status: "DENY",
        title: "STATE AFFAIRS ORDERS HOLD",
        detail: "The receiving officer will issue a new route after the cancelled order is surrendered.",
      },
      kind: "risk",
      expected: "deny",
      requiresSecondary: true,
    },
  ],
  "radan-kest": [
    {
      variantId: "escort-swap",
      variantLabel: "ESCORT SWAP",
      rule: "A real mission order does not cover a person or device that was added after the roster was sealed.",
      caseNumber: "AUX-4418-S",
      queue: "C-21",
      purpose: "Bring a contracted security team inside after an unlisted escort joins the convoy.",
      record: {
        status: "ROSTER ALTERED",
        rows: [
          ["Team lead", "Radan Kest"],
          ["Appointment", "NONE / auxiliary channel"],
          ["Mission", "AUX-4418-S / overnight"],
          ["Roster", "4 names / 3 present"],
          ["Equipment", "Weapons / secure comms / capsule"],
          ["Sponsor", "External Security Office"],
        ],
        detail: "The sponsor confirms the mission but not the person who joined the convoy outside the embassy.",
      },
      documents: {
        status: "ROSTER MISMATCH",
        title: "ESCORT ADDED AFTER SEAL",
        detail: "The roster is stamped for three auxiliaries. Radan says the fourth name is a temporary driver.",
      },
      question: {
        prompt: "Why was the escort added after the roster was sealed?",
        answer: "The driver knows the route. The sponsor will correct the paper when we are inside.",
        consistency: "EVASIVE / NOT VERIFIED",
      },
      secondary: {
        status: "BLACKLISTED SERIAL",
        title: "CAPSULE FLAGGED BY SECURITY",
        detail: "The capsule serial is still listed as missing from a Veskarian archive. Hold the team.",
      },
      liaison: {
        status: "HOLD",
        title: "SPONSOR DENIES THE ADDITION",
        detail: "External Security confirms the mission but will not authorize the unlisted escort or capsule.",
      },
      kind: "risk",
      expected: "deny",
      requiresSecondary: true,
    },
  ],
  "olya-merin": [
    {
      variantId: "living-record",
      variantLabel: "LIVING DUPLICATE",
      rule: "A genuine document is not enough when the same case file is active under another living portrait.",
      caseNumber: "LEG-5109-L",
      queue: "B146",
      purpose: "Submit a power-of-attorney document while another applicant uses the same legal file.",
      record: {
        status: "DUPLICATE / ACTIVE NOW",
        rows: [
          ["Applicant", "Olya Merin"],
          ["Appointment", "09:20 / Window 03"],
          ["Case file", "LEG-5109-L"],
          ["Submitted", "Power of attorney / copy"],
          ["Required", "Original ID / witness form"],
          ["Alert", "Second applicant active at Window 03"],
        ],
        detail: "The same case number is currently being opened by a different person in the legal office.",
      },
      idCheck: {
        status: "MATCH / DUPLICATE",
        title: "DOCUMENT IS REAL / RECORD IS NOT UNIQUE",
        detail: "The card is genuine and belongs to Olya, but the active legal file is already being used by another portrait.",
      },
      documents: {
        status: "INCOMPLETE",
        title: "ORIGINAL WITNESS FORM MISSING",
        detail: "The copy is present. The original form is attached to the other active file.",
      },
      question: {
        prompt: "Who is already using the same legal case number?",
        answer: "I only know that the clerk told me to take a seat. I was not shown another applicant.",
        consistency: "INCONSISTENT WITH LIVE FILE",
      },
      secondary: {
        status: "IDENTITY FRAUD SUSPECTED",
        title: "SECOND RECORD IS A LIVE ALERT",
        detail: "Legal security confirms that the duplicate file was opened minutes ago under a different portrait.",
      },
      liaison: {
        status: "INVESTIGATE",
        title: "LEGAL DESK REQUESTS SECURITY HOLD",
        detail: "No one may enter until the duplicate power-of-attorney file is reconciled.",
      },
      kind: "spy",
      expected: "deny",
      requiresSecondary: true,
    },
  ],
  "anton-ryl": [
    {
      variantId: "returning-seal",
      variantLabel: "RETURNING SEAL",
      rule: "The restricted office must identify the recipient before an old seal can authorize a new crossing.",
      caseNumber: "COR-0000-R",
      queue: "S-04",
      purpose: "Return a sealed letter that appears in the correspondence register before it is delivered.",
      record: {
        status: "VALID / RECIPIENT MISSING",
        rows: [
          ["Visitor", "Anton Ryl"],
          ["Appointment", "NONE / restricted channel"],
          ["Case file", "COR-0000-R"],
          ["Clearance", "Old seal / recipient absent"],
          ["Package", "One sealed letter"],
          ["Sponsor", "Not listed"],
        ],
        detail: "The letter is now listed, but the recipient field changes every time the page is refreshed.",
      },
      documents: {
        status: "OLD SEAL",
        title: "RECIPIENT FIELD IS BLANK",
        detail: "The envelope carries the pre-Union mark. Its recipient line has no stable text under magnification.",
      },
      question: {
        prompt: "Who should receive this letter?",
        answer: "The person who is missing from the register. They are already waiting behind the red door.",
        consistency: "NO MATCHING RECORD",
      },
      secondary: {
        status: "THRESHOLD HOLD",
        title: "THE RED STAMP WILL NOT DRY",
        detail: "Keep Anton outside the inner gate and contact the restricted office before recognizing the seal.",
      },
      liaison: {
        status: "HOLD",
        title: "RESTRICTED OFFICE REFUSES TO ANSWER",
        detail: "The line rings once. The display returns: DO NOT RECOGNIZE THE RECIPIENT.",
      },
      kind: "anomaly",
      expected: "deny",
      requiresSecondary: true,
    },
  ],
  "sorin-dask": [
    {
      variantId: "unlisted-transmitter",
      variantLabel: "UNLISTED TRANSMITTER",
      rule: "Emergency repair status explains the tools, not a module that can transmit from inside the embassy.",
      caseNumber: "ENG-1182-T",
      queue: "E-09",
      purpose: "Repair the scanner with an extra module that is absent from the work order.",
      record: {
        status: "EMERGENCY / MODULE UNLISTED",
        rows: [
          ["Engineer", "Sorin Dask"],
          ["Appointment", "NONE / emergency channel"],
          ["Order", "ENG-1182-T"],
          ["Equipment", "Diagnostic tools / module?"],
          ["Sponsor", "Facilities Directorate"],
          ["Restriction", "No transmitters beyond gate"],
        ],
        detail: "Facilities sent a repair team, but the black module has no serial in the work order.",
      },
      xray: {
        status: "UNDECLARED MODULE",
        title: "BLACK MODULE REQUIRES SEARCH",
        detail: "The spare-board shape is denser than the listed scanner parts and has a second connector row.",
      },
      question: {
        prompt: "Who assigned the black module to this repair?",
        answer: "Facilities gave it to me at the loading bay. I assumed the serial was already attached.",
        consistency: "PLAUSIBLE / VERIFY SERIAL",
      },
      secondary: {
        status: "TRANSMITTER FLAGGED",
        title: "MODULE IS NOT A SPARE BOARD",
        detail: "Secondary inspection identifies a short-range transmitter. The repair crew must wait outside.",
      },
      liaison: {
        status: "HOLD",
        title: "FACILITIES CANNOT VERIFY THE MODULE",
        detail: "The work order is real, but Facilities has no record of this transmitter. Do not release it.",
      },
      kind: "risk",
      expected: "deny",
      requiresSecondary: true,
    },
  ],
  "director-vel": [
    {
      variantId: "sealed-recorder",
      variantLabel: "SEALED RECORDER",
      rule: "Priority clearance skips the queue; it does not erase a no-recording-device restriction.",
      caseNumber: "DIR-9011-S",
      queue: "P-03",
      purpose: "Attend a closed meeting after a recorder is found sealed inside the executive portfolio.",
      record: {
        status: "PRIORITY / DEVICE REVIEW",
        rows: [
          ["Official", "Vel Ordan"],
          ["Appointment", "NONE / executive channel"],
          ["Clearance", "Priority red / level 4"],
          ["Sponsor", "Ambassador’s Office"],
          ["Restriction", "No recording devices"],
          ["Exception", "One sealed recorder found"],
        ],
        detail: "The device is sealed and inactive, but the meeting file still requires it to be secured outside.",
      },
      xray: {
        status: "PROHIBITED DEVICE",
        title: "RECORDER SEALED IN PORTFOLIO",
        detail: "The recorder is powered down and wrapped, but the portfolio cannot cross with it inside.",
      },
      question: {
        prompt: "Will you leave the recorder in the outer locker?",
        answer: "If the ambassador insists, I will. I was told the meeting could not wait for a locker key.",
        consistency: "PRESSURE / CONDITIONALLY COMPLIANT",
      },
      secondary: {
        status: "DEVICE SECURED",
        title: "RECORDER LOCKED OUTSIDE",
        detail: "The device contains no active transmission. The portfolio is clear after the locker seal is logged.",
      },
      liaison: {
        status: "HOLD DEVICE",
        title: "AMBASSADOR’S OFFICE CONFIRMS",
        detail: "The director may enter after the recorder is sealed in the outer locker.",
      },
      kind: "risk",
      expected: "admit",
      requiresSecondary: true,
      requiresLiaison: true,
    },
  ],
  "nadiya-ost": [
    {
      variantId: "registry-window",
      variantLabel: "REGISTRY WINDOW",
      rule: "A family-record discrepancy belongs to Citizen Documents, but the desk must confirm the applicant before entry.",
      mode: "emergency",
      modeLabel: "SAME-DAY REVIEW",
      caseNumber: "FAM-2403-R",
      queue: "A-091",
      purpose: "Resolve a family registry discrepancy before the record is archived at the end of the day.",
      record: {
        status: "SAME-DAY REVIEW",
        rows: [
          ["Applicant", "Nadiya Ost"],
          ["Appointment", "NONE / registry desk"],
          ["Case file", "FAM-2403-R"],
          ["Submitted", "Family registry request"],
          ["Required", "Identity card / receipt"],
          ["Host", "Citizen Documents"],
        ],
        detail: "The registry desk opened a same-day review because one family member is being removed from the file.",
      },
      question: {
        prompt: "Who told you to come before the normal appointment queue?",
        answer: "The registry clerk said the record would close tonight. They told me the desk could confirm it.",
        consistency: "PLAUSIBLE / CONFIRM",
      },
      liaison: {
        status: "PROCEED",
        title: "CITIZEN DOCUMENTS CONFIRMS",
        detail: "The registry discrepancy is genuine and not a gate issue. Send Nadiya to Window 01.",
      },
      kind: "emergency",
      expected: "admit",
      requiresLiaison: true,
    },
  ],
  "milan-vek": [
    {
      variantId: "duplicate-pass",
      variantLabel: "DUPLICATE PASS",
      rule: "A real former guard may still be carrying an access credential that must not cross the gate.",
      caseNumber: "GUA-6671-D",
      queue: "C-25",
      purpose: "Collect a replacement credential while the original pass appears in a second security record.",
      record: {
        status: "CREDENTIAL DUPLICATED",
        rows: [
          ["Visitor", "Milan Vek"],
          ["Appointment", "NONE / guard channel"],
          ["Credential", "GUA-6671-D / duplicate"],
          ["Unit", "Embassy Guard Detail"],
          ["Request", "Replacement pass"],
          ["Alert", "Original pass seen at Archive"],
        ],
        detail: "The guard office confirms Milan’s identity but reports the missing pass near the archive overnight.",
      },
      documents: {
        status: "REVOKED",
        title: "DUPLICATE PASS NOT ACCEPTED",
        detail: "The presented pass is authentic but revoked. The replacement token is not ready at the gate.",
      },
      question: {
        prompt: "Who used the original pass near the archive?",
        answer: "I do not know. I reported it lost. The guard office said I should collect the replacement here.",
        consistency: "NO ORDER FOUND",
      },
      secondary: {
        status: "SECURITY HOLD",
        title: "ORIGINAL PASS LOCATED",
        detail: "The old credential was used near the archive. Milan must wait outside for the investigator.",
      },
      liaison: {
        status: "DENY",
        title: "GUARD COMMAND ORDERS HOLD",
        detail: "Milan must surrender the duplicate pass and weapon before the case can proceed.",
      },
      kind: "spy",
      expected: "deny",
      requiresSecondary: true,
    },
  ],
  "elias-rhy": [
    {
      variantId: "second-page",
      variantLabel: "SECOND PAGE",
      rule: "A page carrying the red seal is still only paper until its issuing office can name its origin.",
      caseNumber: "COR-0001-P",
      queue: "S-05",
      purpose: "Return a second red-stamped page that the correspondence register says was never issued.",
      record: {
        status: "RECORD CHANGED AGAIN",
        rows: [
          ["Visitor", "Elias Rhy"],
          ["Appointment", "NONE / restricted channel"],
          ["Case file", "COR-0001-P"],
          ["Last visit", "NOT FOUND / AGAIN"],
          ["Document", "One red-stamped page / duplicate"],
          ["Sponsor", "The gate"],
        ],
        detail: "The file now contains two identical pages. Neither has a ministry, serial, date, or issuing origin.",
      },
      documents: {
        status: "UNISSUED",
        title: "SECOND PAGE HAS NO ORIGIN",
        detail: "The seal is identical to the first page, but the paper grain and blank reverse do not match any ministry stock.",
      },
      question: {
        prompt: "Who gave you the second page?",
        answer: "You did. You stamped the first one when the room was empty. This is the page you meant to keep.",
        consistency: "IMPOSSIBLE / FAMILIAR",
      },
      secondary: {
        status: "DO NOT STAMP",
        title: "THE PAGE IS A COPY OF THE GATE",
        detail: "Deny recognition and keep Elias outside the inner line. The page is not an entry authority.",
      },
      liaison: {
        status: "NO RESPONSE",
        title: "ALL INTERNAL LINES ARE BUSY",
        detail: "The service windows display one message: WE ARE ALREADY INSIDE.",
      },
      kind: "anomaly",
      expected: "deny",
      requiresSecondary: true,
    },
  ],
};

const BONUS_CASES = [
  {
    baseId: "mara-velen",
    patch: {
      variantId: "night-audit",
      variantLabel: "NIGHT AUDIT",
      rule: "A familiar face and a clear bag do not resolve a duplicate identity record after hours.",
      mode: "clearance",
      modeLabel: "AFTER-HOURS SUMMONS",
      time: "22:10",
      caseNumber: "AUD-1840",
      queue: "N-01",
      purpose: "Answer an after-hours summons from Citizen Documents after a second Mara Velen record appears.",
      record: {
        status: "DUPLICATE / AFTER HOURS",
        rows: [
          ["Visitor", "Mara Velen"],
          ["Appointment", "NONE / internal summons"],
          ["Case file", "AUD-1840"],
          ["Alert", "Second Mara record opened"],
          ["Host", "Citizen Documents"],
          ["Route", "Outer gate only"],
        ],
        detail: "A second identity record opened after the public desk closed. The face is familiar; the route is not.",
      },
      idCheck: {
        status: "MATCH / DUPLICATE",
        title: "FACE MATCHES TWO ACTIVE RECORDS",
        detail: "The portrait matches Mara, but the same biometric token is active on a second after-hours file.",
      },
      documents: {
        status: "INCOMPLETE",
        title: "SUMMONS LACKS HOST SIGNATURE",
        detail: "The printed summons names Citizen Documents but has no staff signature or secure dispatch number.",
      },
      question: {
        prompt: "Who sent the after-hours summons?",
        answer: "The document desk. They said you would recognize my face and let me through.",
        consistency: "PRESSURE / NOT VERIFIED",
      },
      secondary: {
        status: "DUPLICATE ALERT",
        title: "SECOND RECORD IS ACTIVE",
        detail: "Security finds a second live identity token. Keep Mara outside until the host is confirmed.",
      },
      liaison: {
        status: "HOLD",
        title: "NO AFTER-HOURS HOST FOUND",
        detail: "Citizen Documents is closed and cannot confirm the summons. Do not recognize the duplicate.",
      },
      kind: "spy",
      expected: "deny",
      requiresSecondary: true,
    },
  },
  {
    baseId: "irena-sava",
    patch: {
      variantId: "night-medical",
      variantLabel: "NIGHT MEDICAL",
      rule: "The emergency route is compassionate, but the liaison must confirm who is responsible for the child tonight.",
      caseNumber: "MED-2207-N",
      queue: "N-02",
      purpose: "Reach the embassy medical liaison after a hospital transfer is redirected through the closed entrance.",
      record: {
        status: "NIGHT EMERGENCY",
        rows: [
          ["Applicant", "Irena Sava"],
          ["Appointment", "NONE / medical liaison"],
          ["Case file", "MED-2207-N"],
          ["Submitted", "Hospital transfer note"],
          ["Required", "Guardian ID / liaison call"],
          ["Host", "Travel and Visas"],
        ],
        detail: "The hospital transfer is real, but the overnight liaison must authorize the route through the embassy.",
      },
      question: {
        prompt: "Who is waiting for you inside after hours?",
        answer: "The medical liaison. The hospital gave me a number and told me to use the red entrance.",
        consistency: "PLAUSIBLE / CALL LIAISON",
      },
      liaison: {
        status: "PROCEED",
        title: "NIGHT LIAISON AUTHORIZES ENTRY",
        detail: "The medical liaison confirms the transfer. Send Irena directly to the protected waiting room.",
      },
      kind: "emergency",
      expected: "admit",
      requiresLiaison: true,
    },
  },
  {
    baseId: "radan-kest",
    patch: {
      variantId: "night-lockdown",
      variantLabel: "NIGHT LOCKDOWN",
      rule: "A mission order cannot override a lockdown when its equipment manifest has a missing serial.",
      caseNumber: "AUX-4418-N",
      queue: "N-03",
      purpose: "Bring a contracted team to the embassy during an overnight archive lockdown.",
      record: {
        status: "LOCKDOWN / REVIEW",
        rows: [
          ["Team lead", "Radan Kest"],
          ["Appointment", "NONE / auxiliary channel"],
          ["Mission", "AUX-4418-N / archive"],
          ["Roster", "3 names / 3 present"],
          ["Equipment", "Weapons / secure comms"],
          ["Alert", "One serial missing"],
        ],
        detail: "The roster is correct, but an equipment serial is missing during an archive lockdown.",
      },
      documents: {
        status: "SERIAL MISSING",
        title: "MANIFEST CANNOT BE CLOSED",
        detail: "Every person is listed. The secure-comms case still contains one item with no serial entry.",
      },
      question: {
        prompt: "Which item has the missing serial?",
        answer: "The comms case. It was sealed before the archive alarm and nobody opened it afterward.",
        consistency: "NOT VERIFIED",
      },
      secondary: {
        status: "BLACKLISTED SERIAL",
        title: "LOCKDOWN ITEM CONFIRMED",
        detail: "The hidden capsule matches the archive alert. Hold the team outside the inner gate.",
      },
      liaison: {
        status: "HOLD",
        title: "ARCHIVE SECURITY DENIES ENTRY",
        detail: "The mission is real, but no unlisted item may cross during the lockdown.",
      },
      kind: "risk",
      expected: "deny",
      requiresSecondary: true,
    },
  },
  {
    baseId: "director-vel",
    patch: {
      variantId: "ambassador-errand",
      variantLabel: "AMBASSADOR’S ERRAND",
      rule: "A senior official may be expected and still must leave the recorder in the outer locker.",
      caseNumber: "DIR-9011-N",
      queue: "N-04",
      purpose: "Carry a sealed portfolio to the ambassador after a late meeting changes rooms.",
      record: {
        status: "PRIORITY / ROOM CHANGE",
        rows: [
          ["Official", "Vel Ordan"],
          ["Appointment", "NONE / executive channel"],
          ["Clearance", "Priority red / level 4"],
          ["Sponsor", "Ambassador’s Office"],
          ["Meeting", "Room changed after 21:00"],
          ["Restriction", "No recording devices"],
        ],
        detail: "The room change is confirmed, but the portfolio still contains the recorder listed in the restriction.",
      },
      question: {
        prompt: "Did the room change authorize the recorder?",
        answer: "No. The ambassador only changed rooms. The recorder can stay with security if you make this quick.",
        consistency: "CONSISTENT / RESTRICTION REMAINS",
      },
      secondary: {
        status: "DEVICE SECURED",
        title: "RECORDER LOCKED OUTSIDE",
        detail: "The recorder is sealed and the portfolio is clear for the new meeting room.",
      },
      liaison: {
        status: "PROCEED",
        title: "AMBASSADOR CONFIRMS THE ROOM CHANGE",
        detail: "The director may enter after the recorder is deposited in the outer locker.",
      },
      kind: "risk",
      expected: "admit",
      requiresSecondary: true,
      requiresLiaison: true,
    },
  },
  {
    baseId: "olya-merin",
    patch: {
      variantId: "witness-switch",
      variantLabel: "WITNESS SWITCH",
      rule: "Legal paperwork must name the same witness on the system record and the physical original.",
      caseNumber: "LEG-5109-N",
      queue: "N-05",
      purpose: "Deliver a power-of-attorney after the witness named in the appointment is replaced.",
      record: {
        status: "WITNESS CHANGED",
        rows: [
          ["Applicant", "Olya Merin"],
          ["Appointment", "NONE / legal recall"],
          ["Case file", "LEG-5109-N"],
          ["Submitted", "Power of attorney / original"],
          ["Required", "ID / named witness"],
          ["Alert", "Witness changed after filing"],
        ],
        detail: "The original paper is present, but the named witness differs from the witness in the live legal file.",
      },
      documents: {
        status: "WITNESS MISMATCH",
        title: "ORIGINAL NAMES A DIFFERENT WITNESS",
        detail: "The paper is stamped and complete, but its witness line does not match the active legal record.",
      },
      question: {
        prompt: "Why was the witness changed after filing?",
        answer: "The first witness could not travel. The clerk said the name could be fixed after I entered.",
        consistency: "PROCEDURE BYPASSED",
      },
      secondary: {
        status: "LEGAL HOLD",
        title: "WITNESS LINE REQUIRES INVESTIGATION",
        detail: "Legal security confirms that the original and live file cannot both be valid.",
      },
      liaison: {
        status: "DENY",
        title: "LEGAL DESK REFUSES THE PAPER",
        detail: "Keep Olya outside until a new witnessed original is issued.",
      },
      kind: "spy",
      expected: "deny",
      requiresSecondary: true,
    },
  },
  {
    baseId: "elias-rhy",
    patch: {
      variantId: "night-shadow",
      variantLabel: "NIGHT SHADOW",
      rule: "When the X-ray shows the page but not the person’s shadow, ordinary clearance cannot authorize recognition.",
      caseNumber: "COR-0001-N",
      queue: "N-06",
      purpose: "Return a red-stamped page at the hour when the correspondence office is dark.",
      record: {
        status: "NIGHT ENTRY / UNKNOWN",
        rows: [
          ["Visitor", "Elias Rhy"],
          ["Appointment", "NONE / restricted channel"],
          ["Case file", "COR-0001-N"],
          ["Last visit", "NOT FOUND"],
          ["Document", "One red-stamped page"],
          ["Sponsor", "The gate"],
        ],
        detail: "The system recognizes the page but returns no human origin. The correspondence office is closed.",
      },
      question: {
        prompt: "Who will receive the page tonight?",
        answer: "The person who has always received it. You can hear them on the other side of the gate.",
        consistency: "IMPOSSIBLE / FAMILIAR",
      },
      secondary: {
        status: "DO NOT STAMP",
        title: "SHADOW ABSENCE CONFIRMED",
        detail: "The page remains visible in the scan while the visitor’s shadow does not. Keep Elias outside.",
      },
      liaison: {
        status: "NO RESPONSE",
        title: "CORRESPONDENCE OFFICE IS DARK",
        detail: "The internal line answers with the sound of a stamp and no voice.",
      },
      kind: "anomaly",
      expected: "deny",
      requiresSecondary: true,
    },
  },
];

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeCaseData(base, patch = {}) {
  const output = cloneData(base);
  const merge = (target, source) => {
    Object.entries(source).forEach(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value) && target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) {
        merge(target[key], value);
      } else {
        target[key] = cloneData(value);
      }
    });
    return target;
  };
  return merge(output, patch);
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function applyCasePatch(base, patch = null) {
  const next = mergeCaseData(base, patch || {});
  next.variantId = patch?.variantId || "standard";
  next.variantLabel = patch?.variantLabel || "STANDARD CHECKS";
  next.scenarioId = `${base.id}::${next.variantId}`;
  next.rule = patch?.rule || "Compare the record, the person, the papers, and the scan before applying the stamp.";
  return next;
}

function campaignSeedFromUrl() {
  const raw = new URLSearchParams(window.location.search).get("seed");
  if (raw === null || raw.trim() === "") return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? (parsed >>> 0) : null;
}

function newCampaignSeed() {
  if (window.crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    window.crypto.getRandomValues(buffer);
    return buffer[0];
  }
  return Math.floor(Math.random() * 4294967296) >>> 0;
}

function buildCampaign(seed) {
  const random = mulberry32(seed);
  const campaign = shifts.map((shift) => ({
    ...shift,
    cases: shuffle(shift.cases.map((base) => {
      const variants = CASE_VARIANTS[base.id] || [];
      const patch = variants.length && random() < 0.62
        ? variants[Math.floor(random() * variants.length)]
        : null;
      return applyCasePatch(base, patch);
    }), random),
  }));
  const baseById = Object.fromEntries(shifts.flatMap((shift) => shift.cases.map((base) => [base.id, base])));
  const nightCases = BONUS_CASES.map(({ baseId, patch }) => applyCasePatch(baseById[baseId], patch));
  campaign.push({
    day: 3,
    title: "NIGHT REGISTER",
    directive: "AFTER-HOURS VISITORS / EVERY EXCEPTION LEAVES A TRACE",
    cases: shuffle(nightCases, random),
  });
  return campaign;
}

const initialCampaignSeed = campaignSeedFromUrl() ?? newCampaignSeed();
let campaignShifts = buildCampaign(initialCampaignSeed);

function initialState(seed = initialCampaignSeed) {
  return {
    started: false,
    seed,
    day: 1,
    caseIndex: 0,
    dailyTolerance: 100,
    career: 100,
    publicPressure: 0,
    commandPressure: 0,
    securityBreaches: 0,
    revealed: {},
    selectedTool: null,
    dossierPage: 0,
    dossierType: null,
    dossierTool: null,
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
let visitorBlinkTimer = null;
let visitorBlinkResetTimer = null;

function currentShift() {
  return campaignShifts[state.day - 1];
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

// Every named visitor gets an explicit art entry. New character renders use
// Mara's corrected cutout as the shared style anchor, while each character
// keeps separate scene, full-body, and document-face assets.
const CHARACTER_ART = {
  "mara-velen": {
    scene: "assets/generated/mara-visitor-scene.png",
    portrait: "assets/generated/mara-visitor.png",
    face: "assets/generated/mara-face.png",
  },
  "irena-sava": {
    scene: "assets/generated/irena-visitor-scene.png",
    portrait: "assets/generated/irena-visitor.png",
    face: "assets/generated/irena-face.png",
  },
  "viktor-dalen": {
    scene: "assets/generated/viktor-visitor-scene.png",
    portrait: "assets/generated/viktor-visitor.png",
    face: "assets/generated/viktor-face.png",
  },
  "radan-kest": {
    scene: "assets/generated/radan-visitor-scene.png",
    portrait: "assets/generated/radan-visitor.png",
    face: "assets/generated/radan-face.png",
  },
  "olya-merin": {
    scene: "assets/generated/olya-visitor-scene.png",
    portrait: "assets/generated/olya-visitor.png",
    face: "assets/generated/olya-face.png",
  },
  "anton-ryl": {
    scene: "assets/generated/anton-visitor-scene.png",
    portrait: "assets/generated/anton-visitor.png",
    face: "assets/generated/anton-face.png",
  },
  "sorin-dask": {
    scene: "assets/generated/sorin-dask-visitor-scene.png",
    portrait: "assets/generated/sorin-dask-visitor.png",
    face: "assets/generated/sorin-dask-face.png",
  },
  "director-vel": {
    scene: "assets/generated/director-vel-ordan-visitor-scene.png",
    portrait: "assets/generated/director-vel-ordan-visitor.png",
    face: "assets/generated/director-vel-ordan-face.png",
  },
  "nadiya-ost": {
    scene: "assets/generated/nadiya-ost-visitor-scene.png",
    portrait: "assets/generated/nadiya-ost-visitor.png",
    face: "assets/generated/nadiya-ost-face.png",
  },
  "milan-vek": {
    scene: "assets/generated/milan-vek-visitor-scene.png",
    portrait: "assets/generated/milan-vek-visitor.png",
    face: "assets/generated/milan-vek-face.png",
  },
  "elias-rhy": {
    scene: "assets/generated/elias-rhy-visitor-scene.png",
    portrait: "assets/generated/elias-rhy-visitor.png",
    face: "assets/generated/elias-rhy-face.png",
  },
};

const TOOL_ART = {
  appointment: "assets/generated/passport-documents.png",
  documents: "assets/generated/passport-documents.png",
  detector: "assets/generated/detector-clear.png",
};

const PRIMARY_TOOLS = ["appointment", "id", "documents", "detector", "xray", "question"];

function xrayAsset(c) {
  const caseAsset = window.RedStampXrayArt?.[c?.id]?.filename;
  if (caseAsset) return caseAsset;
  if (c.kind === "anomaly") return "assets/generated/xray-anomaly.png";
  if (c.kind === "spy" || (c.xray && !/(clear|ordinary|personal|medical|military|authorized)/i.test(c.xray.status))) {
    return "assets/generated/xray-threat.png";
  }
  return "assets/generated/xray-clear.png";
}

function visitorAsset(c) {
  if (CHARACTER_ART[c?.id]?.portrait) return CHARACTER_ART[c.id].portrait;
  return VISITOR_ART[c.look] || VISITOR_ART.civilian;
}

function faceAsset(c) {
  if (CHARACTER_ART[c?.id]?.face) return CHARACTER_ART[c.id].face;
  return visitorAsset(c);
}

function visitorSceneAsset(c) {
  if (CHARACTER_ART[c?.id]?.scene) return CHARACTER_ART[c.id].scene;
  return visitorAsset(c);
}

function clearVisitorBlink() {
  if (visitorBlinkTimer) window.clearTimeout(visitorBlinkTimer);
  if (visitorBlinkResetTimer) window.clearTimeout(visitorBlinkResetTimer);
  visitorBlinkTimer = null;
  visitorBlinkResetTimer = null;
  const image = $("#visitorImage");
  if (image) {
    image.dataset.blinking = "false";
    image.classList.remove("visitor-blink");
  }
}

function triggerMaraBlink() {
  const c = currentCase();
  const image = $("#visitorImage");
  if (!state.started || c?.id !== "mara-velen" || !image || image.dataset.blinking === "true") return;
  if (visitorBlinkTimer) window.clearTimeout(visitorBlinkTimer);
  visitorBlinkTimer = null;
  image.dataset.blinking = "true";
  image.classList.add("visitor-blink");
  image.src = "assets/generated/mara-visitor-blink.png";
  visitorBlinkResetTimer = window.setTimeout(() => {
    if (currentCase()?.id === "mara-velen") image.src = visitorSceneAsset(currentCase());
    image.dataset.blinking = "false";
    image.classList.remove("visitor-blink");
    scheduleVisitorBlink();
  }, 150);
}

function scheduleVisitorBlink() {
  if (visitorBlinkTimer) window.clearTimeout(visitorBlinkTimer);
  if (!state.started || currentCase()?.id !== "mara-velen") return;
  visitorBlinkTimer = window.setTimeout(() => {
    triggerMaraBlink();
  }, 3600 + Math.round(Math.random() * 3200));
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
    clearVisitorBlink();
    document.body.removeAttribute("data-case-id");
    $("#caseTitle").textContent = "No active visitor";
    $("#caseMeta").textContent = "Start the shift to receive the first visitor.";
    $("#casePurpose").textContent = "";
    $("#caseRule").hidden = true;
    $("#caseRule").textContent = "";
    $("#evidenceList").innerHTML = "";
    $("#questionCard").hidden = true;
    $("#visitorNamePlate").textContent = "AWAITING VISITOR";
    $("#visitorRolePlate").textContent = "CHECKPOINT STANDBY";
    $("#visitorPortrait").dataset.look = "civilian";
    $("#visitorImage").src = "assets/generated/inspector-cutout.png";
    $("#visitorImage").alt = "Veskarian security inspector at the checkpoint";
    $("#toolIdSprite").src = "assets/generated/inspector-cutout.png";
    $("#toolQuestionSprite").src = "assets/generated/inspector-cutout.png";
    $("#idShortcutSprite").src = "assets/generated/inspector-cutout.png";
    $("#questionShortcutSprite").src = "assets/generated/inspector-cutout.png";
    $("#arrivalBadge").textContent = "STANDBY";
    $("#arrivalBadge").className = "arrival-badge";
    $("#caseProgress").textContent = "VISITOR —";
    $("#evidenceProgress").textContent = "CHECKS 0 / 6";
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
    $("#sceneCaseVariant").textContent = "STANDARD";
    $("#scenePurpose").textContent = "The checkpoint is quiet. Click the inspector’s desk, the visitor, or the gate equipment to investigate.";
    $("#sceneCasePortrait").src = "assets/generated/inspector-cutout.png";
    $("#sceneVisitorSprite").src = "assets/generated/inspector-cutout.png";
    $("#sceneQuestionSprite").src = "assets/generated/inspector-cutout.png";
    return;
  }

  document.body.dataset.caseId = c.id;

  const recordMeta = [
    ["Arrival", c.modeLabel],
    ["Service", c.service],
    ["Window", `${c.window} / ${c.time}`],
    ["Case", c.caseNumber],
    ["Scenario", c.variantLabel],
  ];
  $("#caseTitle").textContent = c.name;
  $("#caseMeta").innerHTML = recordMeta.map(([label, value]) => metaRow(label, value)).join("");
  $("#casePurpose").textContent = c.purpose;
  $("#caseRule").hidden = false;
  $("#caseRule").textContent = `PROTOCOL NOTE / ${c.rule}`;
  $("#evidenceList").innerHTML = renderEvidenceRows(c);
  $("#questionCard").hidden = !state.revealed.question;
  $("#questionPrompt").textContent = c.question.prompt;
  $("#questionAnswer").textContent = `“${c.question.answer}” / ${c.question.consistency}`;

  $("#visitorNamePlate").textContent = c.name.toUpperCase();
  $("#visitorRolePlate").textContent = c.role.toUpperCase();
  $("#visitorPortrait").dataset.look = c.look;
  if ($("#visitorImage").dataset.blinking !== "true") {
    $("#visitorImage").src = visitorSceneAsset(c);
  }
  $("#toolIdSprite").src = faceAsset(c);
  $("#toolQuestionSprite").src = visitorSceneAsset(c);
  $("#idShortcutSprite").src = faceAsset(c);
  $("#questionShortcutSprite").src = visitorSceneAsset(c);
  $("#visitorImage").alt = `${c.name}, ${c.role}`;
  $("#arrivalBadge").textContent = c.modeLabel;
  $("#arrivalBadge").className = `arrival-badge ${modeClass(c.mode)} ${c.kind === "spy" || c.kind === "anomaly" ? "alert" : ""}`;
  $("#caseProgress").textContent = `VISITOR ${String(state.caseIndex + 1).padStart(2, "0")} / ${String(currentShift().cases.length).padStart(2, "0")}`;
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
  $("#sceneCaseVariant").textContent = c.variantLabel;
  $("#scenePurpose").textContent = c.purpose;
  $("#sceneCasePortrait").src = visitorSceneAsset(c);
  $("#sceneCasePortrait").alt = `${c.name}, ${c.role}`;
  $("#sceneVisitorSprite").src = visitorSceneAsset(c);
  $("#sceneQuestionSprite").src = visitorSceneAsset(c);
  scheduleVisitorBlink();
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
  if (tool === "question" || tool === "id") return faceAsset(c);
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

function detectorVisualMarkup(c) {
  const personAsset = visitorAsset(c);
  const personLabel = `${c.name}, ${c.role} body profile in the Veskarian metal detector`;
  return [
    '<div class="rs-detector-scan" role="img" aria-label="', escapeHtml(personLabel), '">',
    '<img class="inspection-art rs-detector-frame" src="', escapeHtml(TOOL_ART.detector), '" alt="" aria-hidden="true" />',
    '<div class="rs-detector-person-window" aria-hidden="true">',
    '<img class="rs-detector-person" src="', escapeHtml(personAsset), '" alt="" />',
    '</div>',
    '<span class="rs-detector-readout-label" aria-hidden="true">BODY PROFILE // ', escapeHtml(c.name), '</span>',
    '</div>',
  ].join("");
}

function dossierTypeFor(c, tool) {
  return window.RedStampDossier?.documentTypeForCase(c, tool) || "identity";
}

function renderDossierPage(c, type) {
  const mount = $("#inspectionOverlayVisual");
  if (!mount || !window.RedStampDossier) return;
  const dossierCase = {
    ...c,
    portraitAsset: faceAsset(c),
    portraitAlt: `${c.name} / ${c.role}`,
  };
  mount.classList.add("dossier-visual");
  mount.innerHTML = window.RedStampDossier.renderPage(dossierCase, type, state.dossierPage);
}

function changeDossierPage(delta) {
  const c = currentCase();
  if (!c || !window.RedStampDossier || !state.dossierType) return;
  const pages = window.RedStampDossier.getPages(c, state.dossierType);
  state.dossierPage = clamp(state.dossierPage + delta, 0, pages.length - 1);
  renderDossierPage(c, state.dossierType);
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
  const dossierTool = ["appointment", "documents", "id"].includes(tool);
  const visual = $("#inspectionOverlayVisual");
  visual.classList.toggle("dossier-visual", dossierTool);
  visual.classList.toggle("rs-detector-visual", tool === "detector");
  if (dossierTool) {
    const type = dossierTypeFor(c, tool);
    if (state.dossierType !== type || state.dossierTool !== tool) {
      state.dossierType = type;
      state.dossierTool = tool;
      state.dossierPage = 0;
    }
    renderDossierPage(c, type);
  } else if (tool === "detector") {
    visual.innerHTML = detectorVisualMarkup(c);
  } else {
    const imageClass = tool === "xray" ? "xray-art" : ["id", "question"].includes(tool) ? "portrait-art" : "";
    visual.innerHTML = '<img class="inspection-art ' + imageClass + '" src="' + escapeHtml(image) + '" alt="' + escapeHtml(inspectionVisualAlt(c, tool)) + '" />';
  }

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

function inspectedCount() {
  return PRIMARY_TOOLS.filter((tool) => state.revealed[tool]).length;
}

function renderDecision() {
  const active = state.started && Boolean(currentCase()) && !state.resolved;
  const checks = inspectedCount();
  const checkLabel = `${checks} / ${PRIMARY_TOOLS.length}`;
  $("#evidenceProgress").textContent = `CHECKS ${checkLabel}`;
  $("#decisionProgress").textContent = `${checkLabel} CHECKS LOGGED`;
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
    ? `Additional authority has been recorded. ${checkLabel} primary checks logged; you still hold the final authorization.`
    : `${checkLabel} primary checks logged. Review the evidence you consider necessary before applying the stamp.`;
  $("#decisionNote").textContent = state.secondaryUsed
    ? "Secondary findings are now part of the official case record."
    : state.liaisonCalled
      ? "The liaison response is logged. The red stamp remains your decision."
      : "The red stamp is the final authority at this gate.";
}

function renderLobbyStats() {
  const totalCases = campaignShifts.reduce((total, shift) => total + shift.cases.length, 0);
  $("#overlayStats").innerHTML = `<span><b>${String(campaignShifts.length).padStart(2, "0")}</b> SHIFTS</span><span><b>${String(totalCases).padStart(2, "0")}</b> CASES</span><span><b>100%</b> TOLERANCE</span>`;
}

function render() {
  renderMetrics();
  renderCase();
  renderInspection();
  renderTools();
  renderDecision();
  if (!state.started) renderLobbyStats();
  $("#protocolText").textContent = state.started ? "PROTOCOL ACTIVE" : "PROTOCOL STANDBY";
  $("#runSeed").textContent = state.started ? `RUN ${String(state.seed).padStart(6, "0")}` : "RUN —";
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

function resetCampaign(started = false) {
  const seed = campaignSeedFromUrl() ?? newCampaignSeed();
  campaignShifts = buildCampaign(seed);
  Object.assign(state, initialState(seed), { started });
}

function startGame() {
  resetCampaign(true);
  closeOverlay();
  render();
  showToast(`Shift 01 opened. Run ${String(state.seed).padStart(6, "0")}. Check the arrival mode before applying the stamp.`);
}

function inspectTool(tool) {
  if (!state.started || state.resolved) return;
  const c = currentCase();
  state.revealed[tool] = true;
  state.selectedTool = tool;
  render();
  renderInspectionOverlay(tool);
  if (c?.id === "mara-velen") triggerMaraBlink();
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
  state.dossierPage = 0;
  state.dossierType = null;
  state.dossierTool = null;
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
  if (state.day < campaignShifts.length) {
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
    resetCampaign(false);
    closeOverlay();
    render();
    showToast(`Campaign reset. New run ${String(state.seed).padStart(6, "0")} opens at 08:30.`);
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

document.addEventListener("keydown", (event) => {
  if (event.defaultPrevented || event.target.closest("input, textarea, select")) return;
  if (event.key === "Escape") {
    if (!$("#inspectionOverlay").hidden && $("#inspectionOverlay").classList.contains("is-open")) {
      closeInspectionOverlay();
    } else if ($("#overlay").classList.contains("is-open") && state.started) {
      closeOverlay();
    }
    return;
  }
  if (!state.started || state.resolved) return;
  const tool = {
    "1": "appointment",
    "2": "id",
    "3": "documents",
    "4": "detector",
    "5": "xray",
    "6": "question",
  }[event.key];
  if (tool) {
    event.preventDefault();
    inspectTool(tool);
    return;
  }
  const shortcut = event.key.toLowerCase();
  if (shortcut === "a") {
    event.preventDefault();
    resolveCase("admit");
  } else if (shortcut === "d") {
    event.preventDefault();
    resolveCase("deny");
  } else if (shortcut === "s") {
    event.preventDefault();
    useSecondary();
  } else if (shortcut === "l") {
    event.preventDefault();
    callLiaison();
  }
});

document.addEventListener("click", (event) => {
  const dossierElement = event.target.closest("[data-dossier-action]");
  if (dossierElement) {
    return changeDossierPage(dossierElement.dataset.dossierAction === "next" ? 1 : -1);
  }
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  handleAction(actionElement);
});

if (new URLSearchParams(window.location.search).has("debug")) {
  window.RedStampDebug = {
    getState: () => cloneData(state),
    getCampaign: () => cloneData(campaignShifts),
  };
}

render();
