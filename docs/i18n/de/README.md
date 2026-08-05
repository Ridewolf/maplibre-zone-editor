<!-- docs-i18n: generated translation — do not edit by hand.
     locale: de
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.845Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <b>Deutsch</b> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Ein kopfloses Polygon-Zone-Editor für MapLibre GL.<br>
  Zeichnen-/Bearbeitungsmodi, ein Rückgängig-Stack, Doppeltipp-Vertex-Löschung mit Dreiecksschutz<br>
  und saubere Geometrie-Events – bringen Sie Ihre eigenen Schaltflächen mit.</p>
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

Der Aufbau eines Geofence-Editors auf MapLibre bedeutet, `mapbox-gl-draw` auf eine Bibliothek anzupassen, für die sie nicht geschrieben wurde, ihre interne Gestaltung anzupassen, Rückgängigmachen zu erfinden und mobilen Benutzern beizubringen, Vertices zu bearbeiten. Jedes Mobilitätsdashboard macht dies von Grund auf neu. Dieses Paket ist dieser Anpassungscode, extrahiert aus dem Ridewolf-Zone-Editor – kopflos, daher wird keine Benutzeroberfläche gerendert und es funktioniert mit den Schaltflächen eines beliebigen Frameworks.

## Schnelleinstieg

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

Oder führen Sie die gebündelte Demo aus – die Symbolleiste oben auf einer Karte, die keinen Tile-Server oder API-Schlüssel benötigt (die Basiskarte wird als GeoJSON generiert):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Was es für Sie übernimmt

- **Der MapLibre-Kompatibilitätspatch** – `mapbox-gl-draw` zielt auf die DOM-Klassennamen von Mapbox GL ab und funktioniert auf MapLibre falsch; `patchMapboxDrawForMapLibre()` schreibt sie um (automatisch vom Editor angewendet).
- **Rückgängigmachen** – jeder create/update/delete erstellt einen Snapshot des Draw-Status (begrenzte Tiefe, Standard 20); `undo()` navigiert durch die Stack hinunter bis zur leeren Leinwand.
- **Doppelklick-/Doppeltipp-Vertex-Löschung** – mit benutzerfreundlichem Hit-Box, swallowed default dblclick-zoom und einem **Dreiecksschutz**: eine Löschung, die weniger als drei Ecken hinterlässt, wird abgelehnt (über `onInvalidAction` gemeldet) statt ungültige Geometrie zu produzieren.
- **Saubere Geometrie-Events** – `onChange` wird mit einfach Feld GeoJSON `Polygon` (oder `null`) gestartet, nicht mit der internen Feature Collection des Draw.
- **Touch-angepasste Draw-Stile** – halbtransparente Füllung, 6,5 px Vertex-Griffe, subtile Mittelpunkte, alles in Ihrer Akzentfarbe (`buildDrawStyles(color)` wird zum Anpassen exportiert).
- **Injizierte Abhängigkeiten** – der `MapboxDraw` Konstruktor ist ein Parameter, daher funktionieren Forks und der ganze Editor ist ohne Browser testbar (siehe die Test-Suite mit gefälschtem Driver [](src/editor.test.ts)).

## API

| Member | Zweck |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Konstruieren; `attach()` / `detach()` verwalten Kartenbindungen. |
| `startDrawing()` | Polygon-Zeichnungsmodus eingeben. |
| `startEditing()` | Vertex-Bearbeitungsmodus auf dem gezeichneten Polygon eingeben. |
| `deletePolygon()` | Polygon entfernen (rückgängig machbar). |
| `undo()` | Durch den Snapshot-Stack zurückgehen. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON rein, GeoJSON raus. `setGeometry` setzt den Rückgängig-Stack zurück und feuert nicht `onChange`. |

Optionen: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Dokumentation

- [Entwurfsnotizen](docs/design.md) – warum kopflos, die Vertex-Löschmechanik, das Single-Polygon-Modell und Integrationsrezepte (Vue/React).

## Warum wir das gebaut haben

Bei [Ridewolf](https://ridewolf.com) zeichnen Operatoren Geofence-Zonen – Parkplatz, No-Go, Geschwindigkeit begrenzt – direkt auf der Dashboard-Karte. Der Editor dahinter durchlief die üblichen Schwierigkeiten: Draw-Fehler auf MapLibre, versehentlicher Vertex-Verlust, der zu ungültigen Polygonen führte, die das Backend ablehnte, und mobile Operatoren, die Vertices überhaupt nicht löschen konnten.
Dieses Paket ist der Überlebende, ohne unsere UI.

## Beitrag leisten

Beiträge willkommen – siehe den [Beitragsleitfaden](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Führen Sie `bun test`, `bun run lint`, `bun run typecheck` vor einem PR aus. Sicherheitsprobleme:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) – nie in einem öffentlichen Problem.

## Lizenz

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
