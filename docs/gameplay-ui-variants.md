# Gameplay UI variants

These options change the actual checkpoint gameplay surface only. They do not redesign the welcome screen or create a second game engine.

- Current (`#c` or no hash): the source-of-truth checkpoint layout, using `reference/assets/checkpoint-background-v3.png`.
- Option A (`#a`): a guided-review treatment. Steps 02 and 04 gain a large finding band and a three-part check sequence while retaining the existing scene/card/action composition.
- Option B (`#b`): an evidence-desk treatment. Steps 02 and 04 gain a persistent summary column that keeps the source return, explanation, and decision prompt together.

All options share the parent game state through the existing reference bridge. The in-game switcher changes the hash and remounts only the responsive iframe surface. Desktop uses the desktop files; viewports at 700px and below use the mobile files.

To compare locally, open the game with `#a`, `#b`, or `#c`. Begin a shift, then inspect **02 · FACE / ID** and **04 · PERSON / GATE**. The switcher is intentionally hidden on the welcome screen.
