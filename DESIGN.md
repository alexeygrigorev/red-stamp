# Red Stamp — Living Game Design Report

Status: early concept / active ideation  
Last updated: 2026-08-23

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
