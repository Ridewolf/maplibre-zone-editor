<!-- docs-i18n: generated translation — do not edit by hand.
     locale: pl
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.848Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<p align="center"><sub>[English](../../../README.md) · [Русский](../../../docs/i18n/ru/README.md) · [Română](../../../docs/i18n/ro/README.md) · [Deutsch](../../../docs/i18n/de/README.md) · [Español](../../../docs/i18n/es/README.md) · [Français](../../../docs/i18n/fr/README.md) · [Italiano](../../../docs/i18n/it/README.md) · [Português](../../../docs/i18n/pt/README.md) · [Українська](../../../docs/i18n/uk/README.md) · **Polski** · [Türkçe](../../../docs/i18n/tr/README.md) · [Svenska](../../../docs/i18n/sv/README.md) · [Nederlands](../../../docs/i18n/nl/README.md) · [Ελληνικά](../../../docs/i18n/el/README.md) · [العربية](../../../docs/i18n/ar/README.md) · [עברית](../../../docs/i18n/he/README.md)</sub></p>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Bezserwerowy edytor strefy wielokątnej dla MapLibre GL.<br>
  Tryby rysowania/edycji, stos cofania, usuwanie wierzchołków przy podwójnym dotknięciu z zabezpieczeniem trójkątnym<br>
  i czystymi zdarzeniami geometrii — dostarcz własne przyciski.</p>
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

Zbudowanie edytora geofence na MapLibre oznacza przyklejenie `mapbox-gl-draw` do biblioteki, dla której nie był napisany, stylizowanie jej wnętrza, wymyślanie cofania i nauczanie użytkowników mobilnych edycji wierzchołków. Każdy pulpit nawigacyjny mobilności robi to od zera. Ten pakiet to właśnie ten klej, wyekstrahowany z edytora strefy Ridewolf — bezserwerowy, więc nie renderuje żadnego interfejsu użytkownika i działa z przyciskami dowolnego frameworka.

## Szybki start

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

Lub uruchom dołączony demo — pasek narzędzi powyżej, na mapie, która nie potrzebuje serwera kafelków ani klucza API (mapa bazowa jest generowana jako GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Co obsługuje dla ciebie

- **Łata kompatybilności MapLibre** — `mapbox-gl-draw` kieruje się na nazwy klas DOM Mapbox GL i dyskretnie źle się zachowuje na MapLibre; `patchMapboxDrawForMapLibre()` je przepisuje
  (automatycznie stosowane przez edytor).
- **Cofanie** — każde utworzenie/aktualizacja/usunięcie robi zrzut stanu rysowania (ograniczona głębokość,
  domyślnie 20); `undo()` przechodzi wstecz aż do pustej kanwy.
- **Usunięcie wierzchołka przy podwójnym kliknięciu / podwójnym dotknięciu** — z przyjaznym dla palca polem trafienia, połkniętym
  domyślnym powiększeniem dblclick i **zabezpieczeniem trójkątnym**: usunięcie, które pozostawiłoby mniej niż trzy narożniki jest odrzucane (raportowane przez `onInvalidAction`) zamiast
  tworzenia nieprawidłowej geometrii.
- **Czyszczenie zdarzeń geometrii** — `onChange` uruchamia zwykły GeoJSON `Polygon` (lub
  `null`), a nie wewnętrzną kolekcję cech rysowania.
- **Style rysowania dostrojone do dotyku** — przezroczyste wypełnienie, uchwyty wierzchołków 6,5 px, subtelne
  punkty środkowe, wszystko w twoim kolorze akcentu (`buildDrawStyles(color)` jest
  eksportowany do dostosowania).
- **Wstrzykiwane zależności** — konstruktor `MapboxDraw` jest parametrem, więc forki
  działają i cały edytor jest testowalny bez przeglądarki (patrz oparta na podróbkach
  [pakiet testów](src/editor.test.ts)).

## API

| Element | Cel |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Konstruuj; `attach()` / `detach()` zarządzają wiązaniami mapy. |
| `startDrawing()` | Wejdź w tryb rysowania wielokąta. |
| `startEditing()` | Wejdź w tryb edycji wierzchołków na narysowanym wielokącie. |
| `deletePolygon()` | Usuń wielokąt (odwracalny). |
| `undo()` | Cofnij się przez stos migawek. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON na wejściu, GeoJSON na wyjściu. `setGeometry` resetuje stos cofania i nie uruchamia `onChange`. |

Opcje: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Dokumentacja

- [Notatki projektowe](docs/design.md) — dlaczego bezserwerowy, mechanika usuwania wierzchołków, model single-polygon i przepisy integracji (Vue/React).

## Dlaczego to zbudowaliśmy

W [Ridewolf](https://ridewolf.com) operatorzy rysują strefy geofence — parkowanie, brak wejścia, ograniczona prędkość — bezpośrednio na mapie pulpitu. Edytor za tym przeszedł zwykły ból: rysowanie źle się zachowuje na MapLibre, przypadkowa strata wierzchołków produkująca zdegenerowane wielokąty odrzucane przez backend i operatorzy mobilni nie mogą w ogóle usuwać wierzchołków. Ten pakiet to ocalały, bez naszego interfejsu użytkownika.

## Wkład

Wkład jest mile widziany — zobacz [przewodnik wkładu](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md). Uruchom `bun test`, `bun run lint`, `bun run typecheck` przed PR. Kwestie bezpieczeństwa:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — nigdy w publicznym wydaniu.

## Licencja

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
