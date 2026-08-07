# @ridewolf/maplibre-zone-editor

## 0.2.0

### Minor Changes

- [#4](https://github.com/Ridewolf/maplibre-zone-editor/pull/4) [`450d7ab`](https://github.com/Ridewolf/maplibre-zone-editor/commit/450d7ab3fd70e9c2d30a9394ca12cdd653e1f432) Thanks [@oxygrimmkiv](https://github.com/oxygrimmkiv)! - Make `detach()` / `attach()` preserve the operator's place, and add `setColor`.

  MapboxDraw bakes its styles in at construction, and a basemap swap tears custom
  layers off the map — so recolouring a zone or switching the basemap both mean
  rebuilding or re-adding the control. Until now that dropped whoever was editing
  out of `direct_select` on their chosen vertex and into an empty `simple_select`,
  with the polygon gone from the control.

  `detach()` now banks the polygon, the current mode and the selection, and the
  next `attach()` restores them — so the detach/swap/attach cycle a style change
  needs is round-trip safe. `setColor(color)` rebuilds the control through that
  same pair, keeping the operator's place and the undo stack, since recolouring is
  not an edit.

  Selection is restored the way each mode takes it: `direct_select` by
  `featureId`, `simple_select` by `featureIds`.

  `DrawLike` gains `getSelectedIds()`, which real MapboxDraw already provides —
  custom implementations of that interface need to add it.

## 0.1.1

### Patch Changes

- [#2](https://github.com/Ridewolf/maplibre-zone-editor/pull/2) [`e0aa451`](https://github.com/Ridewolf/maplibre-zone-editor/commit/e0aa451dbf4652e00fd3495fdddfc1c93c6f346d) Thanks [@oxygrimmkiv](https://github.com/oxygrimmkiv)! - Verify this package's own trusted publisher. `0.1.0` was published by hand — npm cannot
  configure a trusted publisher for a package that does not exist on the registry yet — so
  the release workflow has never authenticated as itself here. `track-playback@0.1.1` has
  since proved the workflow is correct, but each package carries its own trusted-publisher
  entry, typed in separately, and a mistake in this one would first surface during a release
  that mattered.

  No functional change: the tarball is identical to `0.1.0` apart from the version and this
  changelog entry. `0.1.1` is the first version published from CI, so it is also the first
  to carry a provenance attestation.

## 0.1.0 — 2026-07-31

### Minor Changes

- First public release: headless polygon zone editing on MapLibre — the mapbox-gl-draw
  compatibility patch, an undo stack, double-tap vertex deletion with a triangle guard, and clean
  GeoJSON change events.
