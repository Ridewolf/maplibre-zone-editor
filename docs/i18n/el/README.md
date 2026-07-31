<!-- docs-i18n: generated translation — do not edit by hand.
     locale: el
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.849Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<p align="center"><sub>[English](../../../README.md) · [Русский](../../../docs/i18n/ru/README.md) · [Română](../../../docs/i18n/ro/README.md) · [Deutsch](../../../docs/i18n/de/README.md) · [Español](../../../docs/i18n/es/README.md) · [Français](../../../docs/i18n/fr/README.md) · [Italiano](../../../docs/i18n/it/README.md) · [Português](../../../docs/i18n/pt/README.md) · [Українська](../../../docs/i18n/uk/README.md) · [Polski](../../../docs/i18n/pl/README.md) · [Türkçe](../../../docs/i18n/tr/README.md) · [Svenska](../../../docs/i18n/sv/README.md) · [Nederlands](../../../docs/i18n/nl/README.md) · **Ελληνικά** · [العربية](../../../docs/i18n/ar/README.md) · [עברית](../../../docs/i18n/he/README.md)</sub></p>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Ένας χωρίς κεφαλή συντάκτης πολυγώνου ζώνης για MapLibre GL.<br>
  Λειτουργίες σχεδίασης/επεξεργασίας, στοίβα αναίρεσης, διαγραφή κορυφής με διπλή αφή<br>
  με φύλακα τριγώνου, και καθαρά γεγονότα γεωμετρίας — φέρτε τα δικά σας κουμπιά.</p>
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

Η κατασκευή ενός συντάκτη γεω-φράγματος στο MapLibre σημαίνει ότι πρέπει να κολλήσουμε `mapbox-gl-draw` σε μια βιβλιοθήκη για την οποία δεν γράφτηκε, να τροποποιήσουμε τα εσωτερικά της, να δημιουργήσουμε αναίρεση, και να διδάξουμε στους χρήστες κινητών συσκευών να επεξεργάζονται κορυφές. Κάθε πίνακας ελέγχου κινητικότητας το κάνει αυτό από την αρχή. Αυτό το πακέτο είναι το κόλλημα, εξαγόμενο από τον zone editor του Ridewolf — χωρίς κεφαλή, οπότε δεν αποδίδει κανένα UI και λειτουργεί με οποιαδήποτε κουμπιά του framework.

## Γρήγορη Έναρξη

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

Ή εκτελέστε τη συμπεριλαμβανόμενη επίδειξη — η γραμμή εργαλείων παραπάνω, σε έναν χάρτη που δεν χρειάζεται διακομιστή tiles ή κλειδί API (ο χάρτης βάσης δημιουργείται ως GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Τι χειρίζεται για εσάς

- **Το patch συμβατότητας MapLibre** — `mapbox-gl-draw` στοχεύει στις ονοματοδοσίες κλάσεων DOM του Mapbox GL και λειτουργεί σιωπηρά λανθασμένα στο MapLibre. `patchMapboxDrawForMapLibre()` τις ξαναγράφει (εφαρμόζεται αυτόματα από τον συντάκτη).
- **Αναίρεση** — κάθε δημιουργία/ενημέρωση/διαγραφή αποθηκεύει ένα στιγμιότυπο της κατάστασης σχεδίασης (περιορισμένο βάθος, προεπιλογή 20). `undo()` περνάει πίσω διαμέσου αυτού έως σε ένα άδειο καμβά.
- **Διαγραφή κορυφής με διπλή κλικ / διπλή αφή** — με ένα κουτί hit φιλικό προς το δάχτυλο, το προεπιλεγμένο dblclick-zoom καταποντίζεται, και ένας **φύλακας τριγώνου**: μια διαγραφή που θα άφηνε λιγότερες από τρεις γωνίες απορρίπτεται (αναφέρεται μέσω `onInvalidAction`) αντί να παράγει μη έγκυρη γεωμετρία.
- **Καθαρά γεγονότα γεωμετρίας** — `onChange` πυροδοτεί με απλό GeoJSON `Polygon` (ή `null`), όχι τη συλλογή εσωτερικών χαρακτηριστικών του σχεδίου.
- **Στυλ σχεδίασης που βελτιστοποιούνται για αφή** — ημι-διαφανές γέμισμα, 6,5 px χειρολαβές κορυφής, λεπτές μεσοβέλειες, όλα στο χρώμα τονισμού σας (το `buildDrawStyles(color)` εξάγεται για προσαρμογή).
- **Εγχεόμενες εξαρτήσεις** — ο κατασκευαστής `MapboxDraw` είναι παράμετρος, οπότε τα forks λειτουργούν και ολόκληρος ο συντάκτης είναι δοκιμάσιμος χωρίς πρόγραμμα περιήγησης (δείτε τη σουίτα δοκιμών που υποστηρίζεται από ψεύτικα [](src/editor.test.ts)).

## API

| Μέλος | Σκοπός |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Δημιουργία. `attach()` / `detach()` διαχειρίζονται τις δεσμεύσεις χάρτη. |
| `startDrawing()` | Εισαγωγή λειτουργίας σχεδίασης πολυγώνου. |
| `startEditing()` | Εισαγωγή λειτουργίας επεξεργασίας κορυφής στο σχεδιασμένο πολύγωνο. |
| `deletePolygon()` | Αφαίρεση του πολυγώνου (αναιρέσιμο). |
| `undo()` | Βήμα πίσω διαμέσου της στοίβας στιγμιοτύπων. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON in, GeoJSON out. Το `setGeometry` επαναφέρει τη στοίβα αναίρεσης και δεν πυροδοτεί το `onChange`. |

Επιλογές: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Τεκμηρίωση

- [Σημειώσεις σχεδίασης](docs/design.md) — γιατί χωρίς κεφαλή, η μηχανική διαγραφής κορυφής, το μοντέλο με ένα μόνο πολύγωνο, και συνταγές ενσωμάτωσης (Vue/React).

## Γιατί το φτιάξαμε

Στο [Ridewolf](https://ridewolf.com) οι χειριστές σχεδιάζουν ζώνες γεω-φράγματος — σταθμεύσεις, χωρίς πέρασμα, περιορισμένη ταχύτητα — απευθείας στον πίνακα ελέγχου του χάρτη. Ο συντάκτης πίσω από αυτό πέρασε τον συνήθη πόνο: το σχέδιο δεν λειτουργούσε σωστά στο MapLibre, η τυχαία απώλεια κορυφής παρήγαγε εκφυλισμένα πολύγωνα που ο backend απέρριψε, και οι χειριστές κινητών συσκευών δεν μπορούσαν να διαγράψουν κορυφές καθόλου. Αυτό το πακέτο είναι ο επιζών, χωρίς το UI μας.

## Συνεισφορά

Οι συνεισφορές είναι ευπρόσδεκτες — δείτε τον [οδηγό συνεισφοράς](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Εκτελέστε τα `bun test`, `bun run lint`, `bun run typecheck` πριν από ένα PR. Ζητήματα ασφάλειας:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — ποτέ σε ένα δημόσιο ζήτημα.

## Άδεια

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
