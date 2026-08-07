---
"@ridewolf/maplibre-zone-editor": patch
---

Accept MapLibre 5 as well as 6 in `peerDependencies`.

The range was `^6.1.0`, which is what the repo's own devDependencies happen to
pin — not what the package requires. It never imports `maplibre-gl`; it talks to
a structural `MapLike` of six methods (`addControl`, `removeControl`, `on`,
`off`, `queryRenderedFeatures`, `fitBounds`), all present and unchanged in
MapLibre 5.

As written, the range excluded **both** apps this package exists for: rw-dashboard
runs 5.24.0 and rw-service 5.23.0, so `npm i` failed with ERESOLVE on a
constraint the code does not actually have. Now `^5.18.0 || ^6.1.0`.
