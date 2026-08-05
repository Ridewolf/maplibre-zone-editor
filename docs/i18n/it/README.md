<!-- docs-i18n: generated translation — do not edit by hand.
     locale: it
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.847Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <b>Italiano</b> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Un editor poligonale senza interfaccia per MapLibre GL.<br>
  Modalità disegno/modifica, stack di annullamento, eliminazione vertici con doppio tocco con protezione triangolare, e eventi geometrici puliti — porta i tuoi pulsanti.</p>
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

Costruire un editor geofence su MapLibre significa incollare `mapbox-gl-draw` a una libreria per cui non è stato scritto, stilizzare gli interni, inventare l'annullamento e insegnare agli utenti mobili a modificare i vertici. Ogni dashboard di mobilità lo fa da zero. Questo pacchetto è quel collante, estratto dall'editor zona Ridewolf — senza interfaccia, quindi non renderizza alcuna interfaccia e funziona con i pulsanti di qualsiasi framework.

## Avvio rapido

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

Oppure esegui la demo in bundle — la barra degli strumenti sopra, su una mappa che non ha bisogno di alcun server di tessere o chiave API (la mappa di base è generata come GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Cosa gestisce per te

- **La patch di compatibilità MapLibre** — `mapbox-gl-draw` rivolge i nomi delle classi DOM di Mapbox GL e si comporta male silenziosamente su MapLibre; `patchMapboxDrawForMapLibre()` li riscrive (applicata automaticamente dall'editor).
- **Annulla** — ogni creazione/aggiornamento/eliminazione acquisisce uno snapshot dello stato del disegno (profondità limitata, 20 per impostazione predefinita); `undo()` torna indietro fino a un'area di disegno vuota.
- **Eliminazione vertici con doppio clic / doppio tocco** — con una hit box pratica al dito, il dblclick-zoom predefinito inghiottito, e una **protezione triangolare**: un'eliminazione che lascerebbe meno di tre angoli viene rifiutata (segnalata tramite `onInvalidAction`) anziché produrre geometria non valida.
- **Eventi geometrici puliti** — `onChange` si attiva con un semplice GeoJSON `Polygon` (o `null`), non la raccolta di funzionalità interna del disegno.
- **Stili di disegno ottimizzati al tocco** — riempimento traslucido, maniglie vertici di 6,5 px, punti medi sottili, tutto nel tuo colore di accento (`buildDrawStyles(color)` è esportato per la personalizzazione).
- **Dipendenze iniettate** — il costruttore `MapboxDraw` è un parametro, quindi i fork funzionano e l'intero editor è testabile senza un browser (vedi la [suite di test guidata da fake](src/editor.test.ts)).

## API

| Membro | Scopo |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Costruisci; `attach()` / `detach()` gestisci i binding della mappa. |
| `startDrawing()` | Accedi alla modalità disegno poligonale. |
| `startEditing()` | Accedi alla modalità modifica vertici sul poligono disegnato. |
| `deletePolygon()` | Rimuovi il poligono (annullabile). |
| `undo()` | Torna indietro nello stack di snapshot. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON in, GeoJSON out. `setGeometry` reimposta lo stack di annullamento e non attiva `onChange`. |

Opzioni: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Documentazione

- [Note di progettazione](docs/design.md) — perché senza interfaccia, la meccanica di eliminazione dei vertici, il modello a singolo poligono e le ricette di integrazione (Vue/React).

## Perché lo abbiamo costruito

Su [Ridewolf](https://ridewolf.com) gli operatori disegnano zone geofence — parcheggio, no-go, limitazioni di velocità — direttamente sulla mappa del dashboard. L'editor dietro tutto questo ha attraversato il solito calvario: draw che misbehaves su MapLibre, perdita accidentale di vertici producendo poligoni degeneri rifiutati dal backend, e operatori mobili incapaci di eliminare i vertici affatto. Questo pacchetto è il sopravvissuto, senza la nostra interfaccia.

## Contribuire

Contributi benvenuti — consulta la [guida ai contributi](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md). Esegui `bun test`, `bun run lint`, `bun run typecheck` prima di una PR. Problemi di sicurezza: [SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — mai in un problema pubblico.

## Licenza

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
