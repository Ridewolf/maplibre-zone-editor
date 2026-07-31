# Design notes

Why the editor is headless, how the tricky parts work, and how to wrap it in a
framework. Source: [`src/editor.ts`](../src/editor.ts); every behaviour is pinned in
[`src/editor.test.ts`](../src/editor.test.ts).

## Why headless

The original component this was extracted from mixed three concerns: draw mechanics,
a specific UI kit (buttons, toasts, i18n), and app styling. Only the first is worth
sharing — the rest is what makes such components un-reusable. So the package exports
a controller with methods and callbacks, renders nothing, and holds no opinion about
your toolbar. `onInvalidAction` exists precisely so the *decision* ("refuse this")
stays in the package while the *presentation* (toast, shake, tooltip) stays in yours.

## Injected constructors

`ZoneEditor` takes the `MapboxDraw` constructor as a parameter instead of importing
it. Three wins:

1. **No runtime dependencies** — both `maplibre-gl` and `@mapbox/mapbox-gl-draw` stay
   peers; the package ships ~6 KB.
2. **Forks welcome** — anything constructor-compatible (e.g. maplibre-native draw
   forks) drops in.
3. **Testability** — the suite drives the whole editor with a 40-line fake; no
   browser, no WebGL.

The MapLibre class-name patch (`patchMapboxDrawForMapLibre`) is applied to whatever
constructor you pass, once, idempotently.

## The single-polygon model

A zone is one polygon — that's the domain this came from (geofences, parking areas).
`getGeometry()` reads the first feature; drawing a second polygon is not prevented by
draw itself, but the editor's contract is "the first polygon is the zone". If you
need multi-polygon zones, the honest path is one editor per zone or a PR that makes
the feature index explicit — not a silent `features.map()`.

## Vertex deletion mechanics

Double-click (or double-tap) a vertex in editing mode to delete it:

1. The handler is bound to the **map**, not the draw instance, so it survives draw
   re-creation; it activates only in `direct_select` mode.
2. `queryRenderedFeatures` runs over a ±8 px box around the pointer (tunable) so
   finger taps land on the small vertex dots.
3. The **triangle guard** counts the ring's real corners (accounting for the closing
   coordinate GeoJSON rings carry) and refuses a deletion that would leave fewer
   than three — the polygon stays valid, `onInvalidAction('min-vertices')` fires, and
   the dblclick zoom is still swallowed so the map doesn't lurch.
4. Deletion itself goes through draw's own `changeMode('direct_select', {coordPath})`
   + `trash()`, so ring closure and re-validation stay draw's job; `onChange` fires
   from the resulting `draw.update` event, not from the handler.

## Undo semantics

Snapshots are taken *before* each mutation lands (create/update/delete/manual
deletion), deep-cloned, and capped at `maxUndoStates`. `undo()` pops the state being
left and applies the previous one; an exhausted stack clears the canvas — matching
what users expect from "undo everything". `setGeometry()` resets the stack: loading a
different zone must not allow "undo" into the previous zone's history.

## Integration recipes

**Vue 3**

```ts
onMounted(() => {
  editor = createZoneEditor(map, MapboxDraw, {
    color: props.color,
    onChange: (g) => emit('geometryChange', g),
    onInvalidAction: () => toast.warning(t('zones.drawFirst')),
  });
  editor.attach();
  editor.setGeometry(props.initialGeometry ?? null);
});
onBeforeUnmount(() => editor?.detach());
```

**React**

```tsx
useEffect(() => {
  const editor = createZoneEditor(map, MapboxDraw, { onChange: setPolygon });
  editor.attach();
  return () => editor.detach();
}, [map]);
```

Remember the draw CSS: `import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'`.
