#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { gunzipSync } from "node:zlib";

const projectRoot = resolve(new URL(".", import.meta.url).pathname, "..");
const defaultSource = "/tmp/red-stamp-issue-1.ydaHSa";
const sourceRoot = resolve(process.argv[2] || defaultSource);
const outputRoot = join(projectRoot, "reference");
const assetRoot = join(outputRoot, "assets");

const pages = [
  { source: "red-stamp-desktop.html", output: "desktop.html" },
  { source: "red-stamp-mobile.html", output: "mobile.html" },
];

const mimeExtensions = {
  "font/woff2": "woff2",
  "image/webp": "webp",
  "text/javascript": "js",
};

function taggedJson(source, type) {
  const open = `<script type="${type}">`;
  const start = source.indexOf(open);
  if (start === -1) throw new Error(`Missing ${type} block`);
  const contentStart = start + open.length;
  const contentEnd = source.indexOf("</script>", contentStart);
  if (contentEnd === -1) throw new Error(`Unclosed ${type} block`);
  return JSON.parse(source.slice(contentStart, contentEnd).trim());
}

function extensionFor(entry) {
  return mimeExtensions[entry.mime] || extname(entry.mime).replace(/^\./, "") || "bin";
}

function assetPath(uuid, entry) {
  return `assets/${uuid}.${extensionFor(entry)}`;
}

function decodeResource(entry) {
  const bytes = Buffer.from(entry.data, "base64");
  return entry.compressed ? gunzipSync(bytes) : bytes;
}

function wrapValueAfter(output, marker, slot) {
  const markerIndex = output.indexOf(marker);
  const valueIndex = output.indexOf(">100<", markerIndex);
  if (markerIndex === -1 || valueIndex === -1) {
    throw new Error(`Could not add ${slot} slot after ${marker}`);
  }
  return `${output.slice(0, valueIndex + 1)}<span data-ref-slot="${slot}">100</span>${output.slice(valueIndex + 4)}`;
}

function wrapValueAfterIfPresent(output, marker, slot) {
  return output.includes(marker) ? wrapValueAfter(output, marker, slot) : output;
}

function addReferenceHooks(template, paths) {
  let output = template;
  const interpolationSlots = [
    ["{{ sourceLabel }}", "source-label"],
    ["{{ markLabel }}", "mark-label"],
    ["{{ observed }}", "observed"],
    ["{{ task }}", "task"],
    ["{{ markedLabel }}", "marked-label"],
    ["{{ cardState }}", "card-state"],
    ["{{ askedLabel }}", "asked-label"],
  ];
  for (const [expression, name] of interpolationSlots) {
    output = output.replaceAll(expression, `<span data-ref-slot="${name}">${expression}</span>`);
  }

  const visitorImages = [
    ["f1d0ed4d-8409-4b5b-a090-4284a308328b", "visitor-scene"],
    ["8c60a95b-8b62-45a1-ad4a-c411cffdef84", "visitor-scene"],
    ["daa681a6-5484-42ea-a673-73bc698fb169", "visitor-face"],
    ["2b08665f-e2d7-4aea-9c0b-1252493cb4f4", "visitor-face"],
    ["4fa20b25-27aa-45f4-b30b-df6493003a21", "xray-scan"],
    ["8589a753-9aed-485d-9be0-9ac8c218ee16", "xray-scan"],
  ];
  for (const [uuid, name] of visitorImages) {
    const relative = paths.get(uuid) || `assets/${uuid}.webp`;
    output = output.replaceAll(`src="${relative}"`, `data-ref-slot="${name}" src="${relative}"`);
  }

  output = output.replace(
    ">CASE COR-0000-R<",
    '><span data-ref-slot="case-id">CASE COR-0000-R</span><',
  );
  output = output.replace(
    ">SPECIAL CORRESPONDENCE<",
    '><span data-ref-slot="case-title">SPECIAL CORRESPONDENCE</span><',
  );
  output = output.replace(
    ">SPECIAL CLEARANCE · QUEUE S-04<",
    '><span data-ref-slot="case-meta">SPECIAL CLEARANCE · QUEUE S-04</span><',
  );
  output = output.replace(
    ">INTERVIEW LOG · COR-0000-R<",
    '><span data-ref-slot="case-log-id">INTERVIEW LOG · COR-0000-R</span><',
  );
  output = output.replace(
    ">Declared: deliver a sealed letter to the restricted correspondence office. No appointment on file.<",
    '><span data-ref-slot="case-purpose">Declared: deliver a sealed letter to the restricted correspondence office. No appointment on file.</span><',
  );
  output = output.replace(
    ">ANTON RYL<",
    '><span data-ref-slot="visitor-name">ANTON RYL</span><',
  );
  output = output.replace(
    ">“The letter is sealed. I am not permitted to open it, and neither are you.”<",
    '><span data-ref-slot="visitor-quote">“The letter is sealed. I am not permitted to open it, and neither are you.”</span><',
  );
  output = wrapValueAfterIfPresent(output, "SHIFT TOLERANCE", "tolerance-value");
  output = wrapValueAfterIfPresent(output, "CAREER STANDING", "career-value");
  output = wrapValueAfterIfPresent(output, ">TOL<", "tolerance-value");
  output = wrapValueAfterIfPresent(output, ">CAREER<", "career-value");
  output = output.replace(
    ">Anton Ryl<",
    '><span data-ref-slot="file-bearer">Anton Ryl</span><',
  );
  output = output.replace(
    ">COR-0000-R<",
    '><span data-ref-slot="file-number">COR-0000-R</span><',
  );
  output = output.replace(
    ">Special Corr. / 05<",
    '><span data-ref-slot="file-destination">Special Corr. / 05</span><',
  );
  output = output.replace(
    ">NONE — restricted<",
    '><span data-ref-slot="file-appointment">NONE — restricted</span><',
  );
  output = output.replace(/GATE ALARM · METAL(?: PRESENT)?/g, (match) => (
    `<span data-ref-slot="gate-status">${match}</span>`
  ));
  output = output.replaceAll(
    "3 MASSES · 1 UNRESOLVED",
    '<span data-ref-slot="scan-summary">3 MASSES · 1 UNRESOLVED</span>',
  );
  output = output.replaceAll(
    '<span data-ref-slot="scan-summary">3 MASSES · 1 UNRESOLVED</span>',
    '<span data-ref-slot="scan-summary">3 MASSES · 1 UNRESOLVED</span> <span data-ref-action="xray-hint" title="Compare the scan silhouette with the declared contents." style="display:inline-grid;place-items:center;width:15px;height:15px;border:1px solid #6e7f7c;border-radius:50%;color:#a8ddd2;cursor:pointer;font-size:10px;letter-spacing:0">?</span>',
  );

  const hooks = [
    ["{{ markMatch }}", 'data-ref-action="mark-match"'],
    ["{{ markFlag }}", 'data-ref-action="mark-flag"'],
    ["{{ markReview }}", 'data-ref-action="mark-review"'],
    ["{{ backToWindow }}", 'data-ref-action="back-window"'],
    ["{{ begin }}", 'data-ref-action="begin"'],
    ["{{ openPaper0 }}", 'data-ref-action="paper-0"'],
    ["{{ openPaper1 }}", 'data-ref-action="paper-1"'],
    ["{{ openPaper2 }}", 'data-ref-action="paper-2"'],
    ["{{ closePaper }}", 'data-ref-action="close-paper"'],
    ["{{ closeItem }}", 'data-ref-action="close-item"'],
    ["{{ showScan }}", 'data-ref-action="show-scan"'],
    ["{{ openBag }}", 'data-ref-action="open-bag"'],
    ["{{ closeBagItem }}", 'data-ref-action="close-bag-item"'],
  ];

  for (const [expression, hook] of hooks) {
    output = output.replaceAll(`sc-camel-on-click="${expression}"`, `${hook} sc-camel-on-click="${expression}"`);
  }

  output = output.replace(
    '<div sc-camel-on-click="{{ row.open }}"',
    '<div data-ref-source="{{ row.n }}" sc-camel-on-click="{{ row.open }}"',
  );

  const actionMarkers = [
    ["<div style=\"position:relative;overflow:hidden;border:2px solid #8e1f1c", 'data-ref-action="admit" '],
    ["<div style=\"border:1px solid #4a3a2c;background:linear-gradient(#241c16,#100c0a);display:grid;place-items:center;text-align:center;box-shadow:inset 0 1px 0 #5c4938,0 5px 0 #0a0806;cursor:pointer\" style-hover=\"border-color:#8a7458\">\n          <div><div style=\"font-family:'Staatliches',sans-serif;font-size:24px;letter-spacing:.08em;color:#d2c3a0;line-height:1\">SECOND", 'data-ref-action="secondary" '],
    ["<div style=\"border:1px solid #4a3a2c;background:linear-gradient(#241c16,#100c0a);display:grid;place-items:center;text-align:center;box-shadow:inset 0 1px 0 #5c4938,0 5px 0 #0a0806;cursor:pointer\" style-hover=\"border-color:#8a7458\">\n          <div><div style=\"font-family:'Staatliches',sans-serif;font-size:24px;letter-spacing:.08em;color:#d2c3a0;line-height:1\">REFUSE", 'data-ref-action="deny" '],
  ];
  for (const [needle, hook] of actionMarkers) {
    output = output.replace(needle, needle.replace("<div ", `<div ${hook}`));
  }

  output = output.replace(
    /<div (style="[^"]*")>SECOND<br>INSPECT<\/div>/,
    '<div data-ref-action="secondary" $1>SECOND<br>INSPECT</div>',
  );
  output = output.replace(
    /<div (style="[^"]*")>REFUSE<br>ENTRY<\/div>/,
    '<div data-ref-action="deny" $1>REFUSE<br>ENTRY</div>',
  );
  output = output.replace(
    /<div (style="[^"]*")>STAMP<\/div>/,
    '<div data-ref-action="admit" $1>STAMP</div>',
  );

  return output.replace("marks: { file: 'flag' }", "marks: {}");
}

async function unpackPage(page) {
  const source = await readFile(join(sourceRoot, page.source), "utf8");
  const manifest = taggedJson(source, "__bundler/manifest");
  const extResources = taggedJson(source, "__bundler/ext_resources");
  let template = taggedJson(source, "__bundler/template");
  const paths = new Map();

  for (const [uuid, entry] of Object.entries(manifest)) {
    const relative = assetPath(uuid, entry);
    paths.set(uuid, relative);
    await writeFile(join(outputRoot, relative), decodeResource(entry));
  }

  for (const [uuid, relative] of paths) {
    template = template.replaceAll(uuid, relative);
  }
  template = template
    .replaceAll("assets/web/doc-identity-page.webp", "../assets/generated/doc-identity-page.png")
    .replaceAll("assets/web/doc-clearance-page.webp", "../assets/generated/doc-clearance-page.png")
    .replaceAll("assets/web/doc-correspondence-page.webp", "../assets/generated/doc-correspondence-page.png");
  template = addReferenceHooks(template, paths);

  const resourceMap = Object.fromEntries(
    extResources
      .filter((entry) => paths.has(entry.uuid))
      .map((entry) => [entry.id, paths.get(entry.uuid)]),
  );
  const resourceScript = `<script>window.__resources = ${JSON.stringify(resourceMap)};</script>`;
  const head = template.match(/<head[^>]*>/i);
  if (!head) throw new Error(`Missing head in ${page.source}`);
  const headEnd = head.index + head[0].length;
  template = `${template.slice(0, headEnd)}${resourceScript}${template.slice(headEnd)}`;
  template = template.replace("</body>", '<script src="reference-bridge.js"></script>\n</body>');

  await writeFile(join(outputRoot, page.output), template);
  return {
    source: page.source,
    output: page.output,
    templateBytes: Buffer.byteLength(template),
    resources: Object.keys(manifest).length,
    digest: createHash("sha256").update(template).digest("hex").slice(0, 12),
  };
}

await mkdir(assetRoot, { recursive: true });
const results = [];
for (const page of pages) results.push(await unpackPage(page));
console.log(JSON.stringify({ sourceRoot, outputRoot, pages: results }, null, 2));
