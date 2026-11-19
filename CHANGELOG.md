# @ridewolf/maplibre-zone-editor

## 0.2.3

### Patch Changes

- [`c069385`](https://github.com/Ridewolf/maplibre-zone-editor/commit/c069385aca1390acb19708c512919af8e7335ad0) Thanks [@oxygrimmkiv](https://github.com/oxygrimmkiv)! - Let the real `MapboxDraw` class satisfy `DrawConstructor`, and keep it that way.

  Three types did not fit the library they describe. `styles` was `unknown[]`,
  which is not assignable to the `object[]` that `MapboxDrawOptions` declares.
  `DrawFeature.id` was `string | number` under `exactOptionalPropertyTypes`, while
  GeoJSON features carry `id` as possibly `undefined`. And `DrawFeature.geometry`
  was a hand-written `{ type; coordinates }`, which a `GeometryCollection` (no
  `coordinates`) does not satisfy; it is now GeoJSON's `Geometry`, and the editor
  already narrowed on `type === 'Polygon'` before reading coordinates.

  Code that read `feature.geometry.coordinates` from a `DrawFeature` without
  narrowing on `geometry.type` first will now fail to typecheck; narrow first.

  `src/types.check.ts` assigns the real class to `DrawConstructor`, so `tsc` fails
  if the types drift again; the tests inject a fake through a cast and could not
  catch it. The draw types are now a declared dev dependency, and their
  `mapbox-gl` dependency is overridden with an empty package: only a few type
  names come from it, and the full proprietary bundle is not worth installing for
  one compile-time check.

## 0.2.2

### Patch Changes

- [#8](https://github.com/Ridewolf/maplibre-zone-editor/pull/8) [`e81d00e`](https://github.com/Ridewolf/maplibre-zone-editor/commit/e81d00e99ec9cc0fd0f3646d8df582626ccffdac) Thanks [@oxygrimmkiv](https://github.com/oxygrimmkiv)! - Let a real `maplibregl.Map` satisfy `MapLike`.

  `on`/`off` typed their handler as `(event: never) => void`. MapLibre declares
  those methods as a generic overload set keyed by its event map, and an overloaded
  method is only assignable to a target signature that one of its overloads
  matches — a `never` handler matches none. So passing a real map into
  `createZoneEditor` failed to typecheck, and every consumer had to write
  `map as unknown as MapLike`, which defeats describing the surface structurally
  in the first place. `unknown` and a variadic `never[]` fail the same way; `any`
  is the only shape that works, and it is contained — these two are called only
  with the editor's own bound handlers.

  The fakes in the test suite satisfied `MapLike` trivially, which is why they
  never caught this. There is now a compile-time guard that mimics MapLibre's
  overload shape, verified to fail against the old signature.

## 0.2.1

### Patch Changes

- [#6](https://github.com/Ridewolf/maplibre-zone-editor/pull/6) [`cb64aec`](https://github.com/Ridewolf/maplibre-zone-editor/commit/cb64aec0ccac9c5cabba767559a7d98234b8d17b) Thanks [@oxygrimmkiv](https://github.com/oxygrimmkiv)! - Accept MapLibre 5 as well as 6 in `peerDependencies`.

  The range was `^6.1.0`, which is what the repo's own devDependencies happen to
  pin — not what the package requires. It never imports `maplibre-gl`; it talks to
  a structural `MapLike` of six methods (`addControl`, `removeControl`, `on`,
  `off`, `queryRenderedFeatures`, `fitBounds`), all present and unchanged in
  MapLibre 5.

  As written, the range excluded **both** apps this package exists for: rw-dashboard
  runs 5.24.0 and rw-service 5.23.0, so `npm i` failed with ERESOLVE on a
  constraint the code does not actually have. Now `^5.18.0 || ^6.1.0`.

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
