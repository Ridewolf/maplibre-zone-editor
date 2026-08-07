---
"@ridewolf/maplibre-zone-editor": minor
---

Make `detach()` / `attach()` preserve the operator's place, and add `setColor`.

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
