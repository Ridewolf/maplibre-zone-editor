<!-- docs-i18n: generated translation — do not edit by hand.
     locale: nl
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.849Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <b>Nederlands</b> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Een koppeloze veelhoek-zone-editor voor MapLibre GL.<br>
  Teken-/bewerkingsmodi, een ongedaan-maak-stack, verwijdering van dubbeltaps op hoekpunten met een driehoek<br>
  bewaker, en schone geometriegebeurtenissen — breng je eigen knoppen mee.</p>
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

Een geofence-editor op MapLibre bouwen betekent `mapbox-gl-draw` lijmen op een bibliotheek waarvoor het niet geschreven is, de interne onderdelen opmaken, ongedaan maken uitvinden en mobiele gebruikers leren om hoekpunten te bewerken. Elk mobiliteitsdashboard doet dit van nul af aan. Dit pakket is die lijm, geëxtraheerd uit de Ridewolf-zone-editor — koppeloze, dus het geeft geen UI weer en werkt met de knoppen van elk framework.

## Snelstartgids

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

Of voer de meegeleverde demo uit — de werkbalk hierboven, op een kaart die geen tileserver of API-sleutel nodig heeft (de basiskaart wordt gegenereerd als GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Wat het voor je doet

- **De MapLibre-compatibiliteitspatch** — `mapbox-gl-draw` richt zich op Mapbox GL's DOM-klassenamen en gedraagt zich stilzwijgend verkeerd op MapLibre; `patchMapboxDrawForMapLibre()` herschrijft ze (automatisch toegepast door de editor).
- **Ongedaan maken** — elke create/update/delete maakt een snapshot van de teken-status (gebonden diepte, standaard 20); `undo()` loopt er doorheen terug naar een leeg canvas.
- **Dubbeltap / dubbeltik verwijdering van hoekpunten** — met een vingervriendelij hit box, de standaard dblclick-zoom opgeslokt, en een **driehoek bewaker**: een verwijdering die minder dan drie hoeken zou achterlaten, wordt geweigerd (gerapporteerd via `onInvalidAction`) in plaats van ongeldige geometrie te produceren.
- **Schone geometriegebeurtenissen** — `onChange` wordt geactiveerd met een duidelijke GeoJSON `Polygon` (of `null`), niet draw's interne feature-collectie.
- **Aanrakings-afgestemd teken-stijlen** — doorschijnende vulling, 6,5 px hoekpunt-handvatten, subtiele middenpunten, allemaal in je accentkleur (`buildDrawStyles(color)` wordt geëxporteerd voor aanpassing).
- **Geïnjecteerde afhankelijkheden** — de `MapboxDraw` constructor is een parameter, dus forks werken en de hele editor is testbaar zonder een browser (zie de fake-aangedreven [testsuite](src/editor.test.ts)).

## API

| Lid | Doel |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Construct; `attach()` / `detach()` beheren kaartbindingen. |
| `startDrawing()` | Voer de veelhoek-teken-modus in. |
| `startEditing()` | Voer de hoekpunt-bewerkingsmodus in op de getekende veelhoek. |
| `deletePolygon()` | Verwijder de veelhoek (ongedaan te maken). |
| `undo()` | Stap terug door de snapshot-stack. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON in, GeoJSON uit. `setGeometry` herstelt de ongedaan-maak-stack en geeft geen `onChange` door. |

Opties: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Documentatie

- [Ontwerpnotities](docs/design.md) — waarom koppeloze, de hoekpunt-verwijderings-mechanica, het enkel-veelhoek-model, en integratierecept (Vue/React).

## Waarom we dit gebouwd hebben

Bij [Ridewolf](https://ridewolf.com) tekenen operatoren geofence-zones — parkeren, niet-ingaan, snelheidslimiet — rechtstreeks op de dashboard-kaart. De editor hierachter liep door de gebruikelijke pijn: draw die zich verkeerd gedraagt op MapLibre, onopzettelijk hoekpuntverlies dat gedegenereerde veelhoeken produceerde die de backend afwees, en mobiele operatoren die helemaal geen hoekpunten konden verwijderen. Dit pakket is de overwinnaar, minus onze UI.

## Bijdragen

Bijdragen zijn welkom — zie de [bijdragegids](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md). Voer `bun test`, `bun run lint`, `bun run typecheck` uit voordat u een PR indient. Beveiligingsproblemen: [SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — nooit in een openbare issue.

## Licentie

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
