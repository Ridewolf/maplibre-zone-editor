<!-- docs-i18n: generated translation — do not edit by hand.
     locale: ro
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.842Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <b>Română</b> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Editor headless de zone poligonale pentru MapLibre GL.<br>
  Moduri de desen/editare, o stivă de anulare, ștergere vârf cu dublu-tap cu protecție<br>
  triunghiulară și eventuri de geometrie curată — aduceți-vă propriii butoane.</p>
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

Construirea unui editor de geoizolare pe MapLibre înseamnă lipirea `mapbox-gl-draw` pe o bibliotecă pentru care nu a fost scrisă, stilizarea internalelor sale, inventarea anulării și învățarea utilizatorilor mobili să editeze vârfuri. Fiecare tablou de bord de mobilitate face asta de la zero. Acest pachet este acea lipire, extrasă din editorul de zone Ridewolf — headless, deci nu redă niciun UI și funcționează cu butoanele oricărui cadru de lucru.

## Început rapid

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

Sau rulați demo-ul inclus — bara de instrumente de mai sus, pe o hartă care nu are nevoie de nici server de dale sau cheie API (harta de bază este generată ca GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Ce gestionează pentru tine

- **Patch-ul de compatibilitate MapLibre** — `mapbox-gl-draw` vizează nume de clase DOM din Mapbox GL și se comportă tăcut greșit pe MapLibre; `patchMapboxDrawForMapLibre()` le rescrie (aplicat automat de editor).
- **Anulare** — fiecare create/update/delete face o fotografie a stării de desen (adâncime limitată, implicit 20); `undo()` merge înapoi prin ea până pe pânza goală.
- **Ștergere cu dublu-click / dublu-tap a vârfului** — cu o casetă de lovire prietenoasă pentru deget, dblclick-zoom-ul înghițit și **protecție triunghiulară**: o ștergere care ar lăsa mai puțin de trei colțuri este refuzată (raportată via `onInvalidAction`) în loc să producă geometrie nevalidă.
- **Evenimente de geometrie curată** — `onChange` se activează cu o simplă `Polygon` GeoJSON (sau `null`), nu colecția de caracteristici interne a desenului.
- **Stiluri de desen ajustate pentru touch** — umplere translucidă, mânere vârf de 6,5 px, puncte medii subtile, toate în culoarea accentului (`buildDrawStyles(color)` este exportată pentru personalizare).
- **Dependențe injectate** — constructorul `MapboxDraw` este un parametru, deci bifurile funcționează și întregul editor este testabil fără browser (vezi suita de teste condusă fake ](src/editor.test.ts)).

## API

| Membru | Scop |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Construiți; `attach()` / `detach()` gestionează legăturile hărții. |
| `startDrawing()` | Intrați în modul de desen poligonal. |
| `startEditing()` | Intrați în modul de editare a vârfurilor pe poligonul desenat. |
| `deletePolygon()` | Eliminați poligonul (reversibil). |
| `undo()` | Treceți înapoi prin stiva de instantanee. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON în, GeoJSON afară. `setGeometry` resetează stiva de anulare și nu activează `onChange`. |

Opțiuni: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Documentație

- [Note de proiectare](docs/design.md) — de ce headless, mecanica ștergerii vârfului, modelul poligon unic și rețete de integrare (Vue/React).

## De ce am construit asta

La [Ridewolf](https://ridewolf.com) operatorii desenează zone de geoizolare — parcare, fără-intrare, viteză limitată — direct pe harta tabloului de bord. Editorul din spatele acesteia a trecut prin durerea obișnuită: desenarea se comportă greșit pe MapLibre, pierderea accidentală a vârfurilor producând poligoane degenerate pe care backend-ul le-a respins și operatorii mobili incapabili să șteargă vârfurile deloc. Acest pachet este supraviețuitorul, minus UI-ul nostru.

## Contribuire

Contribuțiile sunt binevenite — vezi [ghidul de contribuire](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Rulați `bun test`, `bun run lint`, `bun run typecheck` înainte de o PR. Probleme de securitate:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — niciodată într-o problemă publică.

## Licență

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
