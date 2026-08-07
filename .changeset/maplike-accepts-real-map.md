---
"@ridewolf/maplibre-zone-editor": patch
---

Let a real `maplibregl.Map` satisfy `MapLike`.

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
