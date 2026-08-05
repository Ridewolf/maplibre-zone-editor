<!-- docs-i18n: generated translation — do not edit by hand.
     locale: es
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.845Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <b>Español</b> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Un editor de zonas de polígonos sin interfaz para MapLibre GL.<br>
  Modos de dibujo/edición, una pila de deshacer, eliminación de vértices con doble toque con protección<br>
  de triángulo, y eventos de geometría limpia — aporta tus propios botones.</p>
</div>

<p align="center">
  <a href="https://github.com/Ridewolf/maplibre-zone-editor/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Ridewolf/maplibre-zone-editor/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@ridewolf/maplibre-zone-editor"><img alt="npm" src="https://img.shields.io/npm/v/@ridewolf/maplibre-zone-editor"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6">
  <img alt="Peers" src="https://img.shields.io/badge/peers-maplibre--gl%20%7C%20mapbox--gl--draw-396cb2">
  <img alt="Dependencies" src="https://img.shields.io/badge/dependencies-0-3fb950">
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache--2.0-blue"></a>
</p>

---

<p align="center">
  <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/demo.gif" width="660"
       alt="Drawing a zone, dragging a vertex, deleting corners by double-click, and the triangle guard refusing the last one">
</p>

Construir un editor de geofencing en MapLibre significa pegar `mapbox-gl-draw` a una librería para la que no fue diseñada, estilizar sus internals, inventar deshacer, y enseñar a los usuarios móviles a editar vértices. Cada dashboard de movilidad hace esto desde cero. Este paquete es ese pegamento, extraído del editor de zonas de Ridewolf — sin interfaz, así que no renderiza ninguna UI y funciona con los botones de cualquier framework.

## Inicio rápido

```bash
bun add @ridewolf/maplibre-zone-editor maplibre-gl @mapbox/mapbox-gl-draw
```

```ts
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Map as MapLibreMap } from 'maplibre-gl';
import { createZoneEditor } from '@ridewolf/maplibre-zone-editor';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const map = new MapLibreMap({ container: 'map', style: STYLE_URL });

const editor = createZoneEditor(map, MapboxDraw, {
  color: '#3B82F6',
  onChange: (polygon) => save(polygon), // GeoJSON Polygon | null
  onInvalidAction: (reason) => toast(reason), // 'no-polygon' | 'min-vertices'
});
editor.attach();

// Wire your own toolbar:
drawButton.onclick = () => editor.startDrawing();
editButton.onclick = () => editor.startEditing();
undoButton.onclick = () => editor.undo();
deleteButton.onclick = () => editor.deletePolygon();
```

O ejecuta el demo incluido — la barra de herramientas arriba, en un mapa que no necesita servidor de tiles ni API key (el mapa base se genera como GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Qué maneja por ti

- **El parche de compatibilidad de MapLibre** — `mapbox-gl-draw` apunta a los nombres de clases DOM de Mapbox GL y falla silenciosamente en MapLibre; `patchMapboxDrawForMapLibre()` los reescribe (aplicado automáticamente por el editor).
- **Deshacer** — cada creación/actualización/eliminación captura el estado del dibujo (profundidad acotada, 20 por defecto); `undo()` recorre hacia atrás a través de él hasta un lienzo vacío.
- **Eliminación de vértices con doble clic / doble toque** — con una caja de impacto amigable para dedos, el dblclick-zoom por defecto desactivado, y una **guardia de triángulo**: una eliminación que dejaría menos de tres esquinas se rechaza (reportada vía `onInvalidAction`) en lugar de producir una geometría inválida.
- **Eventos de geometría limpia** — `onChange` se dispara con un simple GeoJSON `Polygon` (o `null`), no la colección de características interna de draw.
- **Estilos de dibujo optimizados para toque** — relleno translúcido, asas de vértices de 6.5 px, puntos medios sutiles, todo en tu color de acento (`buildDrawStyles(color)` se exporta para personalización).
- **Dependencias inyectadas** — el constructor `MapboxDraw` es un parámetro, así que los forks funcionan y el editor completo es testeable sin navegador (ver la [suite de pruebas dirigida por fake](src/editor.test.ts)).

## API

| Member | Purpose |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Construir; `attach()` / `detach()` administran los enlaces del mapa. |
| `startDrawing()` | Entrar en modo de dibujo de polígonos. |
| `startEditing()` | Entrar en modo de edición de vértices en el polígono dibujado. |
| `deletePolygon()` | Eliminar el polígono (reversible). |
| `undo()` | Retroceder a través de la pila de snapshots. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON dentro, GeoJSON fuera. `setGeometry` reinicia la pila de deshacer y no dispara `onChange`. |

Opciones: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Documentación

- [Notas de diseño](docs/design.md) — por qué sin interfaz, la mecánica de eliminación de vértices, el modelo de polígono único, y recetas de integración (Vue/React).

## Por qué construimos esto

En [Ridewolf](https://ridewolf.com) los operadores dibujan zonas de geofencing — estacionamiento, sin-go, velocidad-limitada — directamente en el mapa del dashboard. El editor detrás de eso pasó por el dolor habitual: draw se comporta mal en MapLibre, la pérdida accidental de vértices produce polígonos degenerados que el backend rechaza, y los operadores móviles no pueden eliminar vértices en absoluto. Este paquete es el sobreviviente, menos nuestra UI.

## Contribuyendo

Las contribuciones son bienvenidas — ver la [guía de contribución](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Ejecuta `bun test`, `bun run lint`, `bun run typecheck` antes de un PR. Problemas de seguridad:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — nunca en un issue público.

## Licencia

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
