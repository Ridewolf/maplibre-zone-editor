---
"@ridewolf/maplibre-zone-editor": patch
---

Let the real `MapboxDraw` class satisfy `DrawConstructor`, and keep it that way.

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
