# Declared versus concealed evidence

Status: active content rule  
Last updated: 2026-08-24

## The player’s job

The player compares three different things:

1. **Declared** — what the appointment record, passport, service order, or
   equipment manifest says the visitor is carrying.
2. **Observed** — what the player can actually see in the document, detector,
   X-ray, bag, or answer.
3. **Resolved** — what a secondary search, serial lookup, or liaison confirms.

The game must never print the resolved conclusion in the first scan. A case is
interesting because the player notices that the declared list and observed
evidence do not quite agree, then chooses which tool can resolve the gap.

The internal content model is `evidenceLedger` on every generated case:

```js
{
  declared: ["sealed team roster", "sidearm", "secure communications"],
  observed: ["sidearm", "secure communications case", "dense rectangular mass"],
  concealed: "data capsule / serial not matched to the manifest"
}
```

`concealed` is authoring data. It is not rendered by the ordinary appointment
or X-ray result. The existing case data remains readable in the same way: the
record exposes the declared list, the X-ray describes shapes and objects, and
secondary inspection or liaison results can disclose the resolution.

## Writing rules

- Do not use `hidden`, `undeclared`, `spy`, `threat`, `blacklisted`, or
  `correct decision` in the first X-ray title or description.
- Describe shape, density, quantity, position, material, or legibility:
  “a compact rectangular mass sits beneath the lining” is useful evidence.
- Put the declared list in the record or manifest, not inside the X-ray
  conclusion.
- A clear scan can still be evidence: “phone, keys, and folded umbrella are
  visible” is stronger than “nothing suspicious.”
- The detector can report a physical alarm; it cannot decide whether the
  object is authorized.
- The player must be able to resolve the difference with a search, serial
  reader, liaison, or question. Do not make the final truth arbitrary.
- Good and bad cases should use similar visual luggage. The player must learn
  to inspect, not memorize a character’s face.

## Character coverage

Every named visitor has a clean and compromised direction available to the
seeded campaign. The same art can therefore support different truths.

| Visitor | Declared evidence | Observable discrepancy or comparison | Resolution path |
| --- | --- | --- | --- |
| Mara Velen | Damaged card, application, photo | Personal effects; identity and appointment may diverge in an alternate run | ID check, record, liaison |
| Irena Sava | Hospital referral, guardian IDs | A real medical story can carry a code that the travel desk did not issue | Documents, question, liaison |
| Viktor Dalen | Sealed orders, sidearm, field kit | A genuine courier can arrive with a cancelled route | Order record, question, liaison |
| Radan Kest | Roster, sidearm, tools, secure communications | Count, serial, escort, or dense object may disagree with the manifest | X-ray, secondary, liaison |
| Olya Merin | ID, power of attorney, witness form | Portrait, case number, witness, or folder material may disagree | ID, papers, secondary |
| Anton Ryl | Sealed letter, courier mark, key | Recipient or shadow geometry may be unresolved | Papers, question, restricted liaison |
| Sorin Dask | Work order, diagnostic tools, scanner parts | A module may look like a spare board while its connector pattern differs | X-ray, serial check, Facilities |
| Director Vel Ordan | Priority clearance, portfolio, phone | A compact device may or may not violate the meeting restriction | X-ray, secondary, Ambassador’s Office |
| Nadiya Ost | ID, registry request, payment receipt | Family story may be genuine while the live biometric token belongs elsewhere | ID, record, Citizen Documents |
| Milan Vek | Replacement request, retired pass, weapon only if authorized | Old credential, weapon, or access device may remain active | Detector, papers, Guard Command |
| Elias Rhy | Red-stamped page, restricted mark, key | The page can have a registered origin—or show a second silhouette and no origin | X-ray, papers, restricted liaison |

## Radan’s seeded variations

Radan is the first explicit test of the rule that a familiar visitor is not a
fixed alignment:

- `STANDARD CHECKS`: an extra dense object is present in the bag; investigate
  before refusing entry.
- `ESCORT SWAP`: the roster changed after sealing; the sponsor does not verify
  the addition.
- `VERIFIED CONVOY`: three people, the equipment count, serials, and sponsor
  all agree; after the required checks, admit the team.
- `NIGHT LOCKDOWN`: the mission is real, but the lockdown makes the unresolved
  serial unacceptable.

The campaign randomizer selects authored variants from a deterministic seed.
The case label tells the player which scenario they are in, not whether the
visitor is good or bad.

## Visual implementation

The evidence surfaces should have distinct affordances:

- **Record / manifest:** paper folder or terminal showing declared contents.
- **X-ray:** blue/amber silhouette with a scan sweep and no automatic red
  verdict.
- **Tray/search:** objects laid out one by one, with serial plates and quantity
  marks.
- **Serial reader:** a separate glyph/control that resolves one selected
  object.
- **Liaison:** a physical intercom or service-window light that can confirm or
  deny the record.

The first implementation adds the declared-content caption to the record and
an `OBSERVED IN SCAN` list to the X-ray result. The next art pass should add
the physical manifest, serial reader, and tray as generated props rather than
turning these comparisons into HTML cards.

## Acceptance checks

- The first X-ray does not state the final classification.
- The record and X-ray expose different evidence fields.
- Secondary inspection or liaison can reveal the internal `concealed` value.
- At least one seeded scenario for every named visitor expects admission and
  at least one expects refusal/hold.
- The same character art is reused across those scenario variants.
- A player can explain the decision from visible evidence after the case closes.
