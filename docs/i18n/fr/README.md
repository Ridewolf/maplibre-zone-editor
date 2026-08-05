<!-- docs-i18n: generated translation — do not edit by hand.
     locale: fr
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.846Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <b>Français</b> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Un éditeur de zones polygonales sans interface pour MapLibre GL.<br>
  Modes dessin/édition, une pile d'annulation, suppression de sommet au double-clic avec<br>
  protection triangulaire, et événements de géométrie propres — apportez vos propres boutons.</p>
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

Construire un éditeur de clôture sur MapLibre signifie coller `mapbox-gl-draw` à une bibliothèque
pour laquelle elle n'a pas été écrite, styliser ses internes, inventer l'annulation, et
enseigner aux utilisateurs mobiles à éditer des sommets. Chaque tableau de bord de mobilité le fait
à partir de zéro. Ce paquet est cette colle, extrait de l'éditeur de zones Ridewolf — sans
interface, donc il ne rend aucune IU et fonctionne avec les boutons de n'importe quel framework.

## Démarrage rapide

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

Ou lancez la démo groupée — la barre d'outils ci-dessus, sur une carte qui n'a besoin d'aucun
serveur de tuiles ou clé API (la carte de base est générée en tant que GeoJSON) :

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Ce qu'il gère pour vous

- **Le correctif de compatibilité MapLibre** — `mapbox-gl-draw` cible les noms de classe DOM de Mapbox GL et
  se comporte silencieusement mal sur MapLibre ; `patchMapboxDrawForMapLibre()` les réécrit
  (appliqué automatiquement par l'éditeur).
- **Annulation** — chaque création/mise à jour/suppression crée un instantané de l'état du dessin
  (profondeur bornée, par défaut 20) ; `undo()` revient en arrière à travers celui-ci
  jusqu'à un canevas vide.
- **Suppression au double-clic / double-appui sur sommet** — avec une zone de clic adaptée au doigt,
  le dblclick-zoom par défaut avalé, et une **protection triangulaire** : une suppression qui
  laisserait moins de trois coins est refusée (signalée via `onInvalidAction`) au lieu
  de produire une géométrie invalide.
- **Événements de géométrie propres** — `onChange` se déclenche avec un `Polygon` GeoJSON ordinaire
  (ou `null`), pas la collection de caractéristiques interne du dessin.
- **Styles de dessin adaptés au toucher** — remplissage translucide, poignées de sommet de 6,5 px,
  points milieux subtils, tous dans votre couleur d'accent (`buildDrawStyles(color)` est exporté pour
  la personnalisation).
- **Dépendances injectées** — le constructeur de `MapboxDraw` est un paramètre, donc les forks
  fonctionnent et l'éditeur entier est testable sans navigateur (voir la suite de tests
  pilotée par faux [](src/editor.test.ts)).

## API

| Membre | Objectif |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Construire ; `attach()` / `detach()` gèrent les liaisons de carte. |
| `startDrawing()` | Entrer en mode de dessin de polygone. |
| `startEditing()` | Entrer en mode d'édition de sommet sur le polygone dessiné. |
| `deletePolygon()` | Supprimer le polygone (annulable). |
| `undo()` | Revenir en arrière à travers la pile d'instantanés. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON en, GeoJSON dehors. `setGeometry` réinitialise la pile d'annulation et ne se déclenche pas `onChange`. |

Options : `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Documentation

- [Notes de conception](docs/design.md) — pourquoi sans interface, les mécaniques de suppression de
  sommet, le modèle de polygone unique, et les recettes d'intégration (Vue/React).

## Pourquoi nous avons construit cela

Chez [Ridewolf](https://ridewolf.com) les opérateurs tracent des zones de clôture — parking, pas de passage,
limites de vitesse — directement sur la carte du tableau de bord. L'éditeur derrière cela a connu
la douleur habituelle : le dessin se comportant mal sur MapLibre, la perte accidentelle de sommet
produisant des polygones dégénérés que le backend rejetait, et les opérateurs mobiles incapables
de supprimer des sommets du tout. Ce paquet est le survivant, moins notre IU.

## Contribution

Les contributions sont les bienvenues — voir le [guide de contribution](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Exécutez `bun test`, `bun run lint`, `bun run typecheck` avant une PR. Problèmes de sécurité :
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — jamais dans un problème public.

## Licence

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
