<!-- docs-i18n: generated translation — do not edit by hand.
     locale: ar
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.849Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <b>العربية</b> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>محرر منطقة مضلع بدون واجهة مستخدم لـ MapLibre GL.<br>
  أوضاع الرسم/التحرير، مكدس التراجع، حذف القمم بنقرة مزدوجة مع حماية المثلث<br>
  وأحداث الهندسة النظيفة — أحضر أزرارك الخاصة.</p>
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

بناء محرر جيوفينس على MapLibre يعني لصق `mapbox-gl-draw` على مكتبة لم تُكتب من أجله، وتنسيق داخلياتها، واختراع خاصية الاسترجاع، وتعليم مستخدمي الجوال تحرير الرؤوس. كل لوحة تحكم للتنقل تفعل هذا من الصفر. هذه الحزمة هي هذا الغراء، المستخرج من محرر منطقة Ridewolf — بدون رأس، لذا فإنها لا تقدم أي واجهة مستخدم وتعمل مع أزرار أي إطار عمل.

## البدء السريع

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

أو قم بتشغيل العرض التوضيحي المرفق — شريط الأدوات أعلاه، على خريطة لا تحتاج إلى خادم بلاط أو مفتاح API (يتم إنشاء الخريطة الأساسية كـ GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## ما يتعامل معه من أجلك

- **رقعة توافق MapLibre** — `mapbox-gl-draw` يستهدف أسماء فئات DOM في Mapbox GL وتتصرف بصمت بشكل خاطئ على MapLibre؛ `patchMapboxDrawForMapLibre()` تعيد كتابتها (يتم تطبيقها تلقائياً بواسطة المحرر).
- **الاسترجاع** — كل حالة إنشاء/تحديث/حذف تقوم بعمل لقطة من حالة الرسم (عمق محدود، الافتراضي 20)؛ `undo()` تسير للخلف عبره وصولاً إلى لوحة فارغة.
- **حذف القمم بنقرة مزدوجة/نقرة ثنائية** — مع صندوق ضربة صديق للإصبع، البحث الافتراضي dblclick-zoom المبتلع، و **حماية المثلث**: يتم رفض الحذف الذي يترك أقل من ثلاث زوايا (يتم الإبلاغ عنه عبر `onInvalidAction`) بدلاً من إنتاج هندسة غير صحيحة.
- **أحداث الهندسة النظيفة** — `onChange` يتم إطلاقه مع GeoJSON عادي `Polygon` (أو `null`)، وليس مجموعة الميزات الداخلية للرسم.
- **أنماط رسم معايرة اللمس** — ملء شفاف، مقابض رأس بحجم 6.5 بكسل، نقاط وسط دقيقة، كل ذلك بلون التركيز الخاص بك (`buildDrawStyles(color)` يتم تصديره من أجل التخصيص).
- **التبعيات المحقونة** — مُنشئ `MapboxDraw` هو معامل، لذا تعمل الفروع وكل محرر قابل للاختبار بدون متصفح (انظر مجموعة الاختبار المدفوعة بالتزييف [](src/editor.test.ts)).

## API

| العضو | الغرض |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | البناء؛ `attach()` / `detach()` إدارة ربط الخريطة. |
| `startDrawing()` | أدخل وضع رسم المضلع. |
| `startEditing()` | أدخل وضع تحرير الرأس على المضلع المرسوم. |
| `deletePolygon()` | إزالة المضلع (قابل للاسترجاع). |
| `undo()` | خطوة للخلف عبر مكدس اللقطة. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON في، GeoJSON خارج. `setGeometry` يعيد تعيين مكدس الاسترجاع ولا يطلق `onChange`. |

الخيارات: `color`، `onChange`، `onInvalidAction`، `maxUndoStates`، `vertexHitTolerance`.

## التوثيق

- [ملاحظات التصميم](docs/design.md) — السبب في الخلو من الواجهة، ميكانيكا حذف الرأس، نموذج المضلع الفردي، ووصفات التكامل (Vue/React).

## السبب في بناء هذا

في [Ridewolf](https://ridewolf.com) يرسم المشغلون مناطق جيوفينس — المواقف، المناطق المحظورة، المناطق المحدودة السرعة — مباشرة على خريطة لوحة التحكم. كان المحرر خلف هذا يمر بالألم المعتاد: الرسم يتصرف بشكل خاطئ على MapLibre، فقدان الرأس العرضي ينتج مضلعات منحلة رفضتها الخلفية، والمشغلون على الجوال غير قادرين على حذف الرؤوس على الإطلاق. هذه الحزمة هي الناجية، بدون واجهة المستخدم الخاصة بنا.

## المساهمة

المساهمات مرحب بها — انظر دليل [المساهمة](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
قم بتشغيل `bun test`، `bun run lint`، `bun run typecheck` قبل طلب سحب. المشاكل الأمنية:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — أبداً في مشكلة عامة.

## الترخيص

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
