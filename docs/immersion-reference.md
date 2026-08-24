# Immersion reference: the checkpoint as an instrument

The supplied screenshot of *That's not my Neighbor* is useful for its
presentation logic, not its setting or art. Its screen behaves like one
contained machine: a framed character window, a few physical control zones,
small readable slips of paper, and a decision control that remains visible.
The player scans the whole board instead of navigating a page.

## What we are borrowing

- **One persistent station.** The embassy, visitor, desk, and authority rail
  remain present as one composition.
- **Material hierarchy.** Metal fascia, paper dossiers, smoked scanner glass,
  and red rubber authority controls should not share the same generic card
  treatment.
- **Small but meaningful controls.** A tool is phrased as an action—`OPEN
  FILE`, `COMPARE FACE`, `RUN GATE`, `SCAN BAG`, `QUESTION`—and its state is
  shown by a lamp, raised key, or printed mark.
- **Evidence occupies the world.** Inspection is a pulled-forward instrument
  or document surface. The room is dimmed but does not disappear behind a
  browser-like page.
- **A strong final action.** The red stamp remains physically present and
  visually separate from evidence navigation.

## What we are not copying

Red Stamp keeps the Veskarian embassy, its monumental red banner, its original
characters, its supernatural case logic, and its own documents. We do not use
the other game's characters, setting, dialogue, sprites, or exact layout.

## Research notes

The official Steam description presents *That's not my Neighbor* as a job
simulator with science-fiction and eerie elements: the player is a doorman who
uses residents' documents and information to decide whether applicants may
enter. It also describes Campaign, Arcade, Nightmare, and Custom modes. The
developer's itch.io page frames the game as a short 2D creepy simulation built
around attention to detail and deciding whether an applicant gets access.

Those descriptions support the important lesson for Red Stamp: the fantasy is
not just “read a form.” It is “perform a tense job inside a recognizable
workstation,” with every check contributing to a consequential decision.

- [Official Steam store page](https://store.steampowered.com/app/3431040/)
- [Nacho Sama's official itch.io page](https://nachogames.itch.io/thats-not-my-neighbor)
- [Supplied visual reference](https://play-lh.googleusercontent.com/H65ZRS2FU89FyFcCcdVLqqCBGiJ_Plewq-lR6i0pP4CN0vkXuDzGUuKyeKZKY3ufCPSQbBIvtf7PWe23pqU=w526-h296-rw)

## Red Stamp implementation

The current console pass is in `immersive-console.css`. It adds a framed
metal fascia, inset screws, a persistent threshold stage, material-specific
inspection surfaces, a recessed evidence rail, and a separate authority plate.
It keeps the scene visible on desktop and preserves the six-key evidence dock
and two-row authority rail on phones. The deeper document interaction remains
the next step: pages should slide onto the desk, with the room still visible,
rather than feeling like a new web page.
