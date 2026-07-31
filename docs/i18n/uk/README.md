<!-- docs-i18n: generated translation — do not edit by hand.
     locale: uk
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.847Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<p align="center"><sub>[English](../../../README.md) · [Русский](../../../docs/i18n/ru/README.md) · [Română](../../../docs/i18n/ro/README.md) · [Deutsch](../../../docs/i18n/de/README.md) · [Español](../../../docs/i18n/es/README.md) · [Français](../../../docs/i18n/fr/README.md) · [Italiano](../../../docs/i18n/it/README.md) · [Português](../../../docs/i18n/pt/README.md) · **Українська** · [Polski](../../../docs/i18n/pl/README.md) · [Türkçe](../../../docs/i18n/tr/README.md) · [Svenska](../../../docs/i18n/sv/README.md) · [Nederlands](../../../docs/i18n/nl/README.md) · [Ελληνικά](../../../docs/i18n/el/README.md) · [العربية](../../../docs/i18n/ar/README.md) · [עברית](../../../docs/i18n/he/README.md)</sub></p>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Безголовий редактор багатокутних зон для MapLibre GL.<br>
  Режими малювання/редагування, стек скасування, видалення вершин подвійним дотиком із захистом трикутника та чисті геометричні события — приносіть свої кнопки.</p>
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

Створення редактора геозон на MapLibre означає приклеювання `mapbox-gl-draw` до бібліотеки, для якої він не був написаний, стилізацію її внутрішніх частин, винахід скасування й навчання мобільних користувачів редагуванню вершин. Кожна панель управління мобільністю робить це з нуля. Цей пакет — це той клей, витягнутий з редактора зон Ridewolf — безголовий, тому він не відображає жодного UI та працює з кнопками будь-якого фреймворку.

## Швидкий старт

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

Або запустіть вбудовану демонстрацію — панель інструментів вище, на карті, яка не потребує сервера плиток або ключа API (базова карта генерується як GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Що він робить за вас

- **Патч сумісності MapLibre** — `mapbox-gl-draw` спрямована на назви класів DOM Mapbox GL і мовчки помилкується на MapLibre; `patchMapboxDrawForMapLibre()` перезаписує їх (застосовується автоматично редактором).
- **Скасування** — кожне створення/оновлення/видалення створює знімок стану малюнку (обмежена глибина, за замовчуванням 20); `undo()` переходить назад через нього до порожнього полотна.
- **Видалення вершин подвійним клацанням / подвійним дотиком** — з ручним полем влучання, поглиненим за замовчуванням dblclick-zoom та **захистом трикутника**: видалення, яке залишило б менше трьох кутів, відхиляється (зазначається через `onInvalidAction`) замість створення недійсної геометрії.
- **Чисті геометричні события** — `onChange` запалює з простим GeoJSON `Polygon` (або `null`), а не внутрішньої колекції функцій малювання.
- **Стилі малювання, настроєні для дотику** — напівпрозорий заповнювач, ручки вершин розміром 6,5 пікселя, тонкі середні точки, все у вашому кольорі акценту (`buildDrawStyles(color)` експортується для налаштування).
- **Введені залежності** — конструктор `MapboxDraw` є параметром, тому форки працюють, а весь редактор можна тестувати без браузера (див. набір тестів, керований підробкою [test suite](src/editor.test.ts)).

## API

| Medlem | Мета |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Побудова; `attach()` / `detach()` керують прив'язками карти. |
| `startDrawing()` | Перейти в режим малювання багатокутника. |
| `startEditing()` | Перейти в режим редагування вершин на намальованому багатокутнику. |
| `deletePolygon()` | Видалити багатокутник (можна скасувати). |
| `undo()` | Крок назад через стек знімків. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON на вході, GeoJSON на виході. `setGeometry` скидає стек скасування та не запалює `onChange`. |

Параметри: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Документація

- [Примітки дизайну](docs/design.md) — чому безголовий, механіка видалення вершин, модель одного багатокутника та рецепти інтеграції (Vue/React).

## Чому ми це побудували

У [Ridewolf](https://ridewolf.com) оператори малюють зони геозабору — парковки, забороні зони, обмеження швидкості — прямо на карті панелі управління. Редактор за цим пройшов звичайне мучення: draw помилкується на MapLibre, випадкова втрата вершин, яка створює виродженні багатокутники, які бекенд відхилив, і мобільні оператори, які взагалі не можуть видаляти вершини. Цей пакет — це переживаючий, без нашого UI.

## Внесок

Внески вітаються — див. [посібник внесків](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Запустіть `bun test`, `bun run lint`, `bun run typecheck` перед PR. Проблеми безпеки:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — ніколи не публічне питання.

## Ліцензія

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
