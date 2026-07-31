<!-- docs-i18n: generated translation — do not edit by hand.
     locale: ru
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:57.400Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<p align="center"><sub>[English](../../../README.md) · **Русский** · [Română](../../../docs/i18n/ro/README.md) · [Deutsch](../../../docs/i18n/de/README.md) · [Español](../../../docs/i18n/es/README.md) · [Français](../../../docs/i18n/fr/README.md) · [Italiano](../../../docs/i18n/it/README.md) · [Português](../../../docs/i18n/pt/README.md) · [Українська](../../../docs/i18n/uk/README.md) · [Polski](../../../docs/i18n/pl/README.md) · [Türkçe](../../../docs/i18n/tr/README.md) · [Svenska](../../../docs/i18n/sv/README.md) · [Nederlands](../../../docs/i18n/nl/README.md) · [Ελληνικά](../../../docs/i18n/el/README.md) · [العربية](../../../docs/i18n/ar/README.md) · [עברית](../../../docs/i18n/he/README.md)</sub></p>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Редактор полигональных зон без интерфейса для MapLibre GL.<br>
  Режимы рисования/редактирования, стек отмены, удаление вершин двойным касанием с защитой<br>
  треугольника и чистые события геометрии — приносите свои кнопки.</p>
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

Создание редактора геозоны на MapLibre означает привязку `mapbox-gl-draw` к библиотеке, для которой она не была разработана, стилизацию её внутреннего кода, реализацию отмены и обучение мобильных пользователей редактированию вершин. Каждая система управления мобильностью делает это с нуля. Этот пакет — это решение, выделенное из редактора зон Ridewolf — без пользовательского интерфейса, поэтому он ничего не отображает и работает с кнопками любого фреймворка.

## Быстрый старт

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

Или запустите встроенную демонстрацию — панель инструментов выше, на карте, которой не нужен сервер плиток или ключ API (базовая карта генерируется в GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Что он для вас делает

- **Патч совместимости MapLibre** — `mapbox-gl-draw` ориентирован на имена классов DOM Mapbox GL и тихо ведёт себя неправильно на MapLibre; `patchMapboxDrawForMapLibre()` переписывает их (применяется автоматически редактором).
- **Отмена** — каждый create/update/delete снимает состояние рисования (ограниченная глубина, по умолчанию 20); `undo()` проходит по нему вниз до пустого холста.
- **Удаление вершины двойным щелчком / двойным касанием** — с удобной для пальца зоной срабатывания, проглоченное по умолчанию dblclick-zoom, и **защита треугольника**: удаление, которое оставит менее трёх углов, отказывается (сообщается через `onInvalidAction`) вместо создания невалидной геометрии.
- **Чистые события геометрии** — `onChange` срабатывает с простым GeoJSON `Polygon` (или `null`), а не внутренней коллекцией объектов draw.
- **Стили рисования, настроенные для сенсорного ввода** — полупрозрачное заполнение, вершины размером 6,5 пиксела, тонкие промежуточные точки, всё в цвете вашего акцента (`buildDrawStyles(color)` экспортируется для настройки).
- **Внедрённые зависимости** — конструктор `MapboxDraw` — это параметр, поэтому форки работают и весь редактор тестируется без браузера (см. управляемый на основе заглушек [набор тестов](src/editor.test.ts)).

## API

| Элемент | Назначение |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Создание; `attach()` / `detach()` управляют привязками карты. |
| `startDrawing()` | Вход в режим рисования полигона. |
| `startEditing()` | Вход в режим редактирования вершин нарисованного полигона. |
| `deletePolygon()` | Удалить полигон (отменяемо). |
| `undo()` | Пройти назад через стек снимков. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON вход, GeoJSON выход. `setGeometry` сбрасывает стек отмены и не запускает `onChange`. |

Параметры: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Документация

- [Заметки о дизайне](docs/design.md) — почему без интерфейса, механика удаления вершин, модель одного полигона и рецепты интеграции (Vue/React).

## Почему мы это создали

В [Ridewolf](https://ridewolf.com) операторы рисуют геозоны — парковки, запретные зоны, зоны с ограничением скорости — прямо на карте панели управления. Редактор позади этого столкнулся с обычными проблемами: рисование, ведущее себя неправильно на MapLibre, случайная потеря вершин, создающая вырожденные полигоны, которые отклонялись бэкендом, и мобильные операторы, неспособные удалять вершины вообще.
Этот пакет — это результат выживания, без нашего пользовательского интерфейса.

## Внесение вклада

Вклады приветствуются — см. [руководство по внесению вклада](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Запустите `bun test`, `bun run lint`, `bun run typecheck` перед PR. Проблемы безопасности:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — никогда в открытой задаче.

## Лицензия

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
