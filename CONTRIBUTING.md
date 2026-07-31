# Contributing to @ridewolf/maplibre-zone-editor

General Ridewolf contribution rules (code of conduct, PR conventions, commit style) live
in the [organization-wide guide](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md) —
this file covers what's specific to this repository.

## Development setup

Requires [Bun](https://bun.sh) ≥ 1.1.

```bash
git clone https://github.com/Ridewolf/maplibre-zone-editor.git
cd maplibre-zone-editor
bun install

bun test              # 13 tests, no browser needed
bun run lint          # biome check
bun run typecheck     # tsc --noEmit (strict)
bun run build         # dist/ — ESM + .d.ts (peers stay external)
```

## What contributions help most

- **Multi-polygon zones** — with an explicit feature index rather than a silent
  `features.map()`; see the design notes on why the current contract is single-polygon.
- **Snapping** — vertex-to-vertex or vertex-to-road snapping while dragging.
- **Keyboard editing** — arrow-key nudges and `Delete` on a selected vertex, for
  accessibility.

## Conventions

- **Headless means headless.** The package renders no UI and shows no toasts;
  refusals surface through `onInvalidAction` so presentation stays with the caller.
- Dependencies stay peers, and `MapboxDraw` stays an injected constructor — that's
  what keeps the tests browser-free and forks usable.
- The triangle guard (never produce a polygon with fewer than three corners) is a
  pinned invariant, not a heuristic.
