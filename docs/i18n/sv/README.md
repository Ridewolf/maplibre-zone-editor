<!-- docs-i18n: generated translation — do not edit by hand.
     locale: sv
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.848Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <b>Svenska</b> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>En headless polygonzoneditor för MapLibre GL.<br>
  Ritnings-/redigeringslägen, en undo-stack, dubbel-tap-hörnborttagning med triangelgaranti<br>
  och rena geometrihändelser — ta med dina egna knappar.</p>
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

Att bygga en geofence-editor på MapLibre innebär att klistra `mapbox-gl-draw` på ett bibliotek det inte var gjort för, stilisera dess interna delar, uppfinna undo och lära mobila användare att redigera hörn. Varje mobilitetsdashboard gör detta från grunden. Det här paketet är det lim som extraherats från Ridewolfs zoneditor — headless, så det renderar noll UI och fungerar med vilken ramverksknapp som helst.

## Snabbstart

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

Eller kör den paketerade demon — verktygsraden ovan, på en karta som inte behöver någon tile-server eller API-nyckel (baskartan genereras som GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Vad den hanterar åt dig

- **MapLibre-kompatibilitetslappen** — `mapbox-gl-draw` är inriktad på Mapbox GL:s DOM-klassnamn och fungerar tyst fel på MapLibre; `patchMapboxDrawForMapLibre()` skriver om dem (tillämpas automatiskt av editorn).
- **Undo** — varje create/update/delete tar en ögonblicksbild av ritillståndet (begränsad djup, standard 20); `undo()` går tillbaka genom det tills en tom arbetsyta.
- **Double-click / double-tap hörnborttagning** — med en fingervenlig träffbox, standard dblclick-zoom sväljs, och en **triangelgaranti**: en borttagning som skulle lämna färre än tre hörn är vägran (rapporterad via `onInvalidAction`) istället för att producera ogiltig geometri.
- **Rena geometrihändelser** — `onChange` utlöses med en enkel GeoJSON `Polygon` (eller `null`), inte draws interna funktionssamling.
- **Beröringsjusterad ritstil** — genomskinlig fyllning, 6,5 px hörnhandtag, subtila mittpunkter, allt i din accentfärg (`buildDrawStyles(color)` är exporterad för anpassning).
- **Injicerade beroenden** — konstruktören `MapboxDraw` är en parameter, så förgreningar fungerar och hela editorn är testbar utan en webbläsare (se den falska [testsviten](src/editor.test.ts)).

## API

| Medlem | Syfte |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Konstruera; `attach()` / `detach()` hanterar kartbindningar. |
| `startDrawing()` | Ange polygonritningsläge. |
| `startEditing()` | Ange hörnredigeringsläge på den ritade polygonen. |
| `deletePolygon()` | Ta bort polygonen (ångra möjlig). |
| `undo()` | Stega tillbaka genom ögonblicksbildsstacken. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON in, GeoJSON ut. `setGeometry` återställer undostacken och utlöser inte `onChange`. |

Alternativ: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Dokumentation

- [Designanteckningar](docs/design.md) — varför headless, mekaniken för hörnborttagning, single-polygon-modellen och integrationsprecept (Vue/React).

## Varför vi byggde detta

I [Ridewolf](https://ridewolf.com) ritar operatörer geofence-zoner — parkering, no-go, hastighetsbegränsad — direkt på instrumentpanelkartan. Editorn bakom det gick igenom den vanliga smärtan: draw fungerar dåligt på MapLibre, oavsiktlig hörnförlust som producerar degenererade polygoner som backend avvisade, och mobila operatörer som inte kunde ta bort hörn alls. Det här paketet är överlevaren, minus vår UI.

## Bidrag

Bidrag välkomna — se [bidragsguiden](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Kör `bun test`, `bun run lint`, `bun run typecheck` före en PR. Säkerhetsproblem:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — aldrig i ett offentligt ärende.

## Licens

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
