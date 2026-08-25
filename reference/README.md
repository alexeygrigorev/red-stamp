# Reference UI

`desktop.html` and `mobile.html` are the unpacked Red Stamp interface from GitHub issue #1. They retain the reference component runtime, inline layout styles, and bundled IBM Plex Mono / Staatliches font files.

To regenerate them from the supplied issue HTML files:

```sh
npm run unpack:reference -- /path/to/red-stamp-issue-1
```

The parent game keeps the existing rules engine in the hidden legacy DOM. `reference-bridge.js` maps the visible reference controls to that engine and mirrors its current case state into the reference surface.
