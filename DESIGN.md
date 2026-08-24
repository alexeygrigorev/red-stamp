# Red Stamp — Living Game Design Report

Status: first playable prototype / randomized content and browser-polish pass
Last updated: 2026-08-24

This is a working document. Decisions below are current direction, not a
commitment that cannot be changed.

## One-sentence pitch

In 2026, a security officer at the embassy of a closed, Soviet-inspired state
checks modern documents, bags, and X-rays while deciding which ordinary people,
spies, and supernatural intruders may pass through the embassy gate.

## Current identity

- **Title:** *Red Stamp*
- **Country:** the Union of Veskar
- **Year:** 2026
- **Location:** the public security entrance of a Veskarian embassy abroad
- **Genre:** browser-based inspection and decision game
- **Tone:** authoritarian Cold War spectacle, modern bureaucracy, and uncanny
  supernatural mystery
- **Primary reference:** the broad pulp, alternate-history, red-and-black
  industrial energy of *Command & Conquer: Red Alert*; all characters, art,
  names, symbols, writing, and story will be original

## Core fantasy

The player is the person standing between the queue and the embassy. They have
limited information, official rules, imperfect tools, and pressure from people
above them. Every visitor is a small human story, but some visitors are also
part of a larger operation.

The player is not simply deciding who is good or evil. They are deciding who is
authorized to enter, what evidence is trustworthy, and whether to obey the
state when its orders are morally or factually wrong.

## The world

The Union of Veskar is a powerful, closed, bureaucratic state. It has modern
technology—biometric passports, QR appointments, digital databases, security
cameras, smartphones, and contemporary X-ray equipment—but its political
culture is rigid and old-fashioned.

Its public image is built from monumental architecture, red banners, official
portraits, industrial uniforms, loud slogans, and carefully controlled news.
The state describes outsiders, dissidents, spies, smugglers, and unexplained
beings with the same bureaucratic phrase: **undesired elements**.

Veskar is not intended to be a direct copy of the Soviet Union. Its history,
institutions, slogans, glyphs, leaders, and supernatural rules should be
distinctive.

## The red stamp

Every person who passes the public checkpoint needs an official red stamp on
their entry authorization. The stamp is an ordinary bureaucratic mark on the
surface, but it may also be an old supernatural seal.

Possible rule:

> Digital systems verify identity. The red stamp authorizes passage.

This gives the title three meanings:

1. A mundane government approval or denial.
2. A symbol of Veskar’s authority and bureaucracy.
3. A magical seal that determines what, exactly, is allowed through the gate.

The player should eventually discover that a valid digital record is not always
enough. A forged stamp may fool a database but fail under the embassy’s older
rules. Alternatively, a perfectly valid stamp may allow something dangerous to
cross because the state itself issued it.

## A normal shift

The intended basic loop is:

1. A visitor approaches and explains their purpose.
2. The player checks their identity document and appointment or service paper.
3. The visitor passes through a metal detector.
4. The player examines the bag through an X-ray machine.
5. The player asks questions, requests a bag search, or compares information
   across documents.
6. The player chooses an action:
   - admit and apply the red stamp;
   - deny entry;
   - send the visitor to secondary inspection;
   - call an embassy official or security supervisor.
7. The choice changes the visitor’s story, the embassy’s condition, and the
   player’s standing.

The first prototype should be a single-screen, mouse-driven experience with
short shifts. It should be possible to understand the basic loop within a few
minutes.

### Single-screen interaction direction

The checkpoint is now treated as one persistent scene rather than a page of
separate panels. The player clicks the visitor, desk record, document tray,
metal detector, X-ray station, or the visitor to ask a question. Each action
opens an evidence overlay while keeping the monumental flag, visitor, and
security desk visible behind it. The final authority controls remain anchored
to the bottom of the scene so the player can inspect, return to the room, and
decide without losing spatial context.

The visual asset pack lives in `assets/generated/` and includes the
inspector, embassy background, eleven named visitor pairs, six dossier page
families, per-character X-rays, document still life, detector panel, and the
physical red stamp. The art is
original to Red Stamp and uses the supplied embassy reference only for broad
atmosphere: monumental architecture, red fabric, dark stone, and brass.

The sprites are not limited to the large scene. The active visitor portrait is
reused in the case card and identity/question hotspots; document, detector, and
X-ray sprites appear on their matching controls; and the final authority
buttons carry the stamp, threat scan, official, and anomaly art. This keeps
the player reading the room and its objects instead of navigating a text-only
control panel.

On phones, the room remains the primary visual, while the six inspection
sprites move into a thumb-friendly dock and the four authority actions become a
separate two-by-two tray. Inspection overlays are sized to the viewport and
remain scroll-safe at narrow widths down to 320px.

### Randomized campaign layer

The campaign is authored from a small cast but does not use one fixed queue.
Each run has a seed shown in the header. The seed controls the order of the
cases and whether a named visitor receives their standard scenario or an
alternate procedural situation. `?seed=424242` is therefore a useful bug
report or replay link.

The current campaign has three shifts:

- **Morning Intake:** public applicants, emergencies, and first clearance
  checks
- **Red Weather:** higher command pressure, compromised credentials, and
  restricted arrivals
- **Night Register:** after-hours returns where familiar faces carry new
  records, old seals, or unresolved authority

There are seventeen cases across the shifts, built from Mara Velen, Irena
Sava, Viktor Dalen, Radan Kest, Olya Merin, Anton Ryl, Sorin Dask, Director Vel
Ordan, Nadiya Ost, Milan Vek, and Elias Rhy. A scenario variant changes the
record, purpose, dialogue, rule, and consequence while retaining that
visitor’s dedicated art and X-ray language.

The randomizer is deliberately deterministic rather than fully chaotic. This
keeps a suspicious result reproducible, makes browser tests reliable, and lets
players share a run seed. A fresh campaign generates a new seed; a URL seed
overrides that behavior.

## Embassy arrival and service flow

The public entrance is a security checkpoint before a group of service windows.
Visitors normally have appointments, so the player is checking both physical
security and whether the person is expected by the embassy.

The visit can follow this sequence:

1. The visitor states which service they need.
2. The player searches the appointment system by name, case number, or QR code.
3. The player checks the appointment time, assigned window, photo, and list of
   documents already submitted.
4. The visitor presents an ID or passport.
5. The player compares the identity document with the appointment record.
6. The player asks for any required physical documents that are missing from
   the file.
7. The visitor passes through the metal detector.
8. The bag goes through the X-ray machine, with a manual search available when
   something is unclear.
9. The player sends the visitor to the correct window, requests secondary
   inspection, calls an embassy employee, or denies entry.

This gives the player several independent sources of evidence. A person may
have a valid appointment but the wrong identity document, the right identity
but the wrong service, complete paperwork but a prohibited object, or apparently
perfect records that have been manipulated.

### Service windows

The first version can use a small number of clearly different services:

- **Citizen Documents:** passports, identity cards, birth records, and
  replacement documents
- **Travel and Visas:** visas, travel permissions, invitations, and transit
  papers
- **Legal and Notarial Services:** powers of attorney, certified copies, and
  official declarations
- **Military and State Affairs:** service records, transfers, sealed orders, and
  diplomatic-security requests
- **Special Correspondence:** restricted files, unusual appointments, and cases
  that ordinary staff are not allowed to explain

Each window can have its own document requirements, staff member, queue, and
political consequences. A visitor at the wrong window is not necessarily a spy;
they may simply be confused, frightened, or unable to read the instructions.

### Appointment record

The appointment panel should show information that the player can compare with
what the visitor says and carries:

- Full name and portrait
- Date and time
- Service window
- Case or appointment number
- Documents already submitted
- Documents still required
- Host employee or department
- Internal notes, alerts, or restrictions

The system is useful but not infallible. A record may be out of date, duplicated,
edited by an insider, or technically correct while hiding an important detail.

### Two ways to arrive

The appointment system should not be the only legitimate route into the
embassy. This creates a key distinction:

#### Scheduled public visitors

Citizens, applicants, families, journalists, and ordinary contractors usually
need an appointment. Their appointment connects them to a service window and a
case file. Missing or incorrect appointment information is relevant evidence,
but it is not automatically proof of hostile intent.

#### Special-clearance visitors

Some people arrive for official work and do not make public appointments:

- Veskarian soldiers and military couriers
- Contracted auxiliaries or mercenary teams
- Embassy guards returning from an assignment
- Diplomats and senior government officials
- Emergency repair, medical, or security teams
- A person summoned directly by the ambassador or a restricted department

These visitors may have a military order, diplomatic credential, clearance
card, encrypted summons, escort authorization, or a vehicle and personnel
manifest instead of an appointment.

Special clearance changes the procedure, but it is not an automatic free pass.
Depending on the clearance level, it may allow someone to skip the queue or
enter without an appointment while still requiring identity verification,
weapons authorization, a bag check, or confirmation from the sponsoring
department.

This creates useful cases:

- A mercenary team has a valid mission order, but one member is not on the
  roster.
- A soldier has permission to carry a weapon, but the order was cancelled that
  morning.
- A senior official is genuine but has brought an unauthorized recording device.
- An emergency team has no appointment because the situation is real, but the
  player must verify the emergency code.
- A spy has stolen a legitimate clearance card from someone the player knows.

The interface should clearly identify the arrival mode—**appointment**,
**special clearance**, **emergency**, or **escort**—so the player knows which
rules apply. The challenge is deciding whether the visitor satisfies the rules
for that mode, not applying the appointment requirement to everyone.

Refusing a legitimate special-clearance visitor can cause command pressure,
mission failure, or loss of career standing. Admitting someone with forged or
compromised clearance can create a much more serious security breach.

### Useful evidence and ordinary exceptions

Document inconsistencies can be small and believable:

- A transliteration or glyph differs by one character
- The appointment is at the correct embassy but the wrong service window
- The visitor has a photocopy when the appointment requires an original
- The case number belongs to another person with a similar name
- The submitted document expired yesterday
- The person has an emergency that explains why the normal paperwork is absent
- A family appointment lists one adult, but two people arrive

The player should be able to resolve many issues by asking a question,
requesting one more document, checking with the service window, or sending the
visitor to secondary inspection. Denial should be one tool among several, not
the default response to every irregularity.

### Bags and the X-ray

The X-ray should contain ordinary airport-like objects as well as security
risks. Early cases can teach the player the difference between an unusual but
harmless object and a prohibited one:

- Keys, phone, wallet, medication, laptop, camera, and power bank
- Tools carried by an engineer or contractor
- Recording equipment or removable storage
- A knife or other restricted object with a legitimate work permit
- A sealed envelope that should have been declared at a service window
- A weapon or ammunition carried by personnel without the correct authorization
- A device that does not match the declared purpose of the visit
- A supernatural object that appears as an empty shape or a second silhouette

The X-ray should create questions rather than automatically identify the answer.
The player can ask the visitor to identify an object, open the bag, surrender a
restricted item, or explain why it is being carried.

### Candidate first-shift cases

The opening shift could establish the normal routine with five or six visitors:

1. A clean passport-renewal appointment that teaches the basic process.
2. A mother with a genuine emergency and one missing document.
3. A Veskarian soldier with a weapon and valid-looking military orders.
4. A contractor whose tools are allowed but whose appointment is at the wrong
   window.
5. A visitor with a legitimate appointment whose identity record has been
   duplicated.
6. A final case where the paperwork looks perfect but the X-ray reveals the
   first unmistakable supernatural anomaly.

The first shift should end with a report or phone call that makes the player
question whether the embassy’s records are protecting people or hiding them.

## Visitor groups

### Ordinary people

These visitors make the checkpoint feel like a place where real people have
needs rather than a parade of villains.

- A pensioner renewing an identity document
- A parent requesting medical travel permission
- A worker collecting a replacement passport
- A student applying for an education permit
- A local contractor arriving to repair embassy equipment
- A familiar visitor who returns across several shifts

Their cases can contain harmless mistakes, language barriers, missing papers,
or objects that look suspicious in an X-ray. Refusing them should have visible
human and diplomatic consequences.

### Important people

- A senior official who expects special treatment
- A diplomat with a diplomatic credential
- A scientist carrying classified research
- A delegation arriving during a security alert
- An embassy employee whose access should be automatic but whose behavior is
  unusual

Important people create pressure. The correct security decision may conflict
with an order from someone more powerful.

### Veskarian personnel and auxiliaries

The embassy also receives people who are officially serving Veskar. They should
feel like recognizable units from a theatrical alternate-history world, while
remaining original characters rather than copies of existing game characters.

- A uniformed embassy guard returning from leave
- A military courier with sealed orders
- A field medic or engineer carrying restricted equipment
- A special operations officer with diplomatic clearance
- A contracted auxiliary or mercenary team hired by Veskar
- A political security officer who expects immediate access
- A soldier whose identity is valid but whose orders have been altered

These visitors are not automatically good or bad. Refusing a legitimate team
can delay an important operation or look like insubordination. Admitting a
compromised soldier, courier, or mercenary can give a spy access to the embassy
under the protection of Veskar’s own uniform.

The player may need to verify several things at once: the person’s identity,
the unit they belong to, the current mission, weapons authorization, and whether
every member of a group is actually listed on the order.

### Undesired elements

- A spy with convincing documents
- A courier carrying a hidden device or file
- A saboteur using a legitimate appointment
- A smuggler transporting restricted material
- A blackmailed employee
- A dissident falsely classified as dangerous
- A supernatural visitor whose identity does not fit the database

The state’s label should not always be correct. Some “undesired elements” are
dangerous; some are simply unwanted by the regime.

## Supernatural direction

The supernatural should be uncanny, bureaucratic, and occasionally strange
rather than relying only on monsters or jump scares.

Possible clues include:

- An X-ray showing a second silhouette inside a person
- A passport belonging to someone who officially died years ago
- A QR code that changes when viewed through the inspection screen
- A document seal that moves or refuses to dry
- A visitor whose shadow does not match their body
- A bag containing an object that has no physical weight
- An appointment issued by an embassy department erased from the records
- A person whose face-recognition result says “identity unresolved”

These clues must follow learnable rules. The player should be able to form a
theory from previous cases instead of being punished by arbitrary randomness.

One possible larger mystery is that the embassy contains a classified ledger
of names and agreements that keeps something outside ordinary reality from
entering Veskar—or keeps Veskar from returning to the world in its original form.

## Consequences and career pressure

The player should not be fired immediately after one mistake. Decisions should
create pressure that builds across several cases and shifts.

The game can use two simple layers:

### Daily tolerance: 100% each morning

This is the player’s short-term allowance for stress, delays, complaints, and
minor procedural mistakes. It returns to 100% at the beginning of the next
working day, so a difficult shift does not permanently make the game harder.

It can be reduced by:

- Making several unnecessary searches
- Creating a long queue
- Denying a routine case without enough evidence
- Arguing with an important visitor
- Ignoring a supervisor’s instruction

If daily tolerance becomes very low, the shift can end with a reprimand or a
forced break. This is a setback, not automatic game over.

### Career standing: persistent across the campaign

Career standing represents the player’s long-term position inside the embassy.
It starts at 100% and changes more slowly than daily tolerance.

- A minor incorrect decision causes a small loss.
- Refusing a very important authorized person causes a larger loss.
- Denying a vulnerable innocent person may create a public scandal and a later
  review.
- Letting a spy, saboteur, or compromised soldier enter causes a serious loss.
- Correctly handling a high-risk case, resolving a complaint, or receiving a
  supervisor’s endorsement can restore some standing.

At low standing, the player receives warnings, tighter instructions, and less
authority. At zero, the player is fired, arrested, transferred, or forced to
choose a different ending. The exact outcome can depend on the campaign’s
political and supernatural story.

### Delayed consequences

The result of a decision should often arrive later rather than immediately.

- A denied VIP produces a phone call from the director and a new order the next
  morning.
- A mother denied for a paperwork problem posts about the embassy; the story
  spreads and public pressure increases.
- An admitted spy causes a missing-file investigation or a security lockdown.
- A denied soldier’s mission is delayed, causing command pressure on the next
  shift.
- A suspicious visitor sent to secondary inspection may later thank the player,
  accuse them publicly, or reveal that the inspection saved the embassy.

The player should have ways to mitigate consequences: explain a decision in the
end-of-day report, request a supervisor’s authorization, offer a new appointment,
identify a genuine emergency, or uncover evidence that changes the official
record.

### Recovery

Rest, ordinary successful shifts, official praise, and resolved complaints can
restore daily tolerance and some career standing. A vacation or leave period
can be an occasional story choice rather than a free reset: it may restore the
player, but it also advances the political situation and lets other events
happen without them.

This keeps the game forgiving enough to continue while making mistakes matter.

## Character and presentation direction

Characters should be recognizable at a glance, with strong silhouettes,
distinctive uniforms or clothing, exaggerated expressions, and memorable
dialogue. The presentation can be theatrical and pulpy, like an alternate-
history strategy game, while the decisions remain personal and consequential.

### Visual north star

The current visual reference is a dark, monumental Veskarian embassy entrance:
brutalist concrete, one enormous red flag, black metal, warm bronze lettering,
red accent lights, and a strong central emblem. It should feel like a modern
public institution that has inherited the visual language of a much older
authoritarian state.

The composition should be sparse. The player should usually see one active
visitor, the security desk, the gate or detector, and the monumental flag or
architecture behind them. A distant queue or service area can be suggested,
but the screen should not be filled with many people, windows, and tiny signs.
The environment establishes power and scale; the interaction focuses attention
on the current visitor and their evidence.

Important elements to preserve:

- A strong central security desk where the player works
- One enormous Veskarian flag or banner behind the desk
- Monumental columns, a high ceiling, and deliberate architectural symmetry
- Red fabric, sparse signage, and light against gray concrete and dark metal
- One clearly readable visitor silhouette at a time
- A large Veskarian emblem and one or two slogans that make the state feel
  present
- Focused human details: the visitor’s hands, folders, bags, documents, and the
  inspection equipment

For the browser game, this should become a readable 2D or 2.5D composition
rather than a photorealistic room. The background can be richly textured, but
the interactive documents, X-ray panel, appointment record, and decision
buttons must remain visually clear at a glance.

The attached reference is a mood and composition guide, not a source to copy
literally. Veskar’s flag, emblem, glyphs, slogans, uniforms, portraits, and
signage will be designed as original assets.

### Simple animation language

Animation should be restrained and functional:

- A queue number advances or flickers on the appointment board
- Visitors shift weight, approach the desk, and hand over documents
- The metal detector light blinks during a scan
- The X-ray beam sweeps across a bag
- A suspicious object pulses subtly in the X-ray panel
- The red stamp lands with a strong physical motion and spreads ink
- A service window light changes when the visitor is cleared
- Warning lights pulse during a security alert
- The gate or interior door opens only after authorization

The red stamp should be the strongest animated action in the interface. It is
the moment when the player’s decision becomes official.

Visual language:

- Red, black, cream, faded green, and warning yellow
- Concrete, metal, glass, paper, stamps, cables, and CRT-like panels
- Large state slogans and official portraits
- Modern screens mixed with old forms and physical seals
- Original Veskarian glyphs used consistently across documents and signage

The glyphs should not be random decoration. They can encode ministry, date,
clearance level, document type, and authenticity.

## Current design principles

1. The player should make judgments from evidence, not guess a hidden answer.
2. Ordinary visitors must matter as much as spies.
3. The state’s rules should sometimes be useful and sometimes be morally
   suspect.
4. Supernatural cases should connect to the same inspection tools as mundane
   cases.
5. The first version should be small enough to finish as a browser game.
6. The game should feel inspired by broad genre language, not copy any existing
   game’s characters, art, music, dialogue, or story.

## Questions still open

These are the decisions we should resolve before implementation becomes large:

1. Is Veskar itself supernatural, or is the embassy containing a supernatural
   threat hidden from the public?
2. Is the player a Veskarian citizen, a local hire, or someone with an unknown
   past?
3. What exactly does the red stamp do when it is applied?
4. What is the first major mystery the player encounters?
5. How much humor should sit beside the darker material?
6. What does a complete shift contain: a fixed story sequence, procedural
   visitors, or a mixture?
7. How many actions should the player have before the first prototype becomes
   overwhelming?
8. What is the main campaign endpoint: expose the state, protect it, open the
   gate, or discover that the player is part of the problem?

## Immediate next design task

Define the first playable shift:

- The checkpoint layout
- The first five visitors
- The inspection rules taught to the player
- One harmless anomaly
- One genuine security threat
- One decision where every available choice has a cost

## Character image generation pipeline

Character art is generated as a controlled asset pipeline rather than as
one-off prompts. The goal is to keep the cast visually coherent while giving
every named visitor a distinct face, silhouette, wardrobe, and reason for
being at the checkpoint.

### Shared style reference

Use \`assets/generated/mara-visitor.png\` as the common style anchor for new
visitor generations. It establishes the current target for painterly detail,
edge quality, Veskarian lighting, and scene-compatible contrast. Include the
same reference in every character-generation request. Add the embassy
background when the character needs to be judged against the room, and add a
previous character only when a specific prop, pose, or material needs to be
understood.

The reference is a style guide, not a character template. Prompts must
explicitly forbid copying Mara's face, coat, scarf, folder, pose, or color
palette when creating another visitor.

### Generation steps

1. Define the visitor's narrative job, age impression, body shape, silhouette,
   wardrobe, carried object, and emotional posture in the case data.
2. Send the shared Mara style reference, the embassy background, and the
   current scene screenshot as visual references. State that the output is a
   fictional Veskarian game character and must be distinct from all named
   references.
3. Request a single full-body character on a perfectly flat \`#00ff00\`
   chroma-key background. Do not ask the model to draw UI, labels, readable
   text, or a background scene.
4. Remove the chroma key locally with
   \`skills/.system/imagegen/scripts/remove_chroma_key.py\`, using a soft matte,
   one-pixel edge contract, slight feathering, and despill cleanup. Validate
   transparent corners and inspect the silhouette on the dark embassy wall.
5. Keep the original full-body PNG for detector composition and fallback
   inspection views. Create a trimmed
   scene PNG with a small transparent margin so \`object-fit: contain\` does not
   make the visitor too small.
6. Register both paths in \`CHARACTER_ART\` in \`app.js\`. A named case must
   never silently fall back to the generic \`civilian\`, \`soldier\`,
   \`official\`, \`worker\`, or \`anomaly\` asset once its own art exists.
7. Generate a dedicated face-and-shoulders PNG for identity and dossier
   documents. Do not use a CSS crop of the full-body source: the face needs to
   be readable at document scale and must be generated as the same person,
   with the same style reference, lighting, and dark-background treatment.
8. Check the image at phone size and desktop size. If the face becomes too
   small, regenerate the dedicated face asset rather than enlarging or
   geometrically cropping the full-body scene asset. Use the full checklist in
   [docs/character-asset-checklist.md](docs/character-asset-checklist.md).

### Style and quality checks

- No pale light-background halo or green chroma fringe on dark walls.
- No shared face between named visitors.
- No identical silhouette for two characters in the same shift.
- No blue rim light unless the room provides a visible blue source.
- Warm red/amber edge light, muted saturation, and shared grain treatment.
- Different props and posture must communicate the visitor's case before the
  player opens a document.
- Use references on every new generation and record the reference assets in
  the commit message or asset note.

### Aspect-ratio gate

Before a generated image is included, run

`node scripts/check-image-aspect-ratios.mjs`

The check reads PNG dimensions directly, verifies dossier and X-ray ratios,
rejects undersized character sources, checks Mara's blink frame against the
base frame, and fails if CSS introduces `object-fit: fill`. GitHub Pages runs
the same check before uploading the site artifact. A generated
face-and-shoulders portrait is required for documents; geometric stretching
and CSS body crops are not accepted.
