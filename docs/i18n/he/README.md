<!-- docs-i18n: generated translation — do not edit by hand.
     locale: he
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.849Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <a href="../pt/README.md">Português</a> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <b>עברית</b></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>עורך פוליגון ללא ממשק ל-MapLibre GL.<br>
  מצבי ציור/עריכה, מחסנית ביטול, מחיקת קודקודים בלחיצה כפולה עם שומר<br>
  משולש, ו-events גיאומטריה נקיים — הביאו את הכפתורים שלכם שלכם.</p>
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

בניית עורך גדרות על MapLibre משמעותה הדבקת `mapbox-gl-draw` לספרייה שלא נכתבה עבורה, עיצוב של הפנים שלה, המצאת ביטול, והוראת משתמשים לנייד לערוך קודקודים. כל לוח בקרה ניידות עושה זאת מאפס. חבילה זו היא ההדבק הזה, מופק מעורך האזור של Ridewolf — ללא ראש, כך שהוא מצייר אפס ממשק וממשיך עם כפתורים של כל מסגרת.

## התחלה מהירה

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

או הפעל את ההדגמה המהודקת — סרגל הכלים לעיל, על מפה שאינה זקוקה לשרת קרחונים או מפתח API (מפת הבסיס נוצרת כ-GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## מה הוא טוען עבורך

- **תיקון התאימות של MapLibre** — `mapbox-gl-draw` ממטרה את שמות מחלקות ה-DOM של Mapbox GL ומתנהג בשקט בצורה שגויה על MapLibre; `patchMapboxDrawForMapLibre()` כותב אותם מחדש (מופעל באופן אוטומטי על ידי העורך).
- **ביטול** — כל יצירה/עדכון/מחיקה צילומי מצב של מצב הציור (עומק מוגבל, ברירת מחדל 20); `undo()` הולך בחזרה דרכו עד לקנבס ריק.
- **מחיקת קודקוד בלחיצה כפולה / הקשה כפולה** — עם תיבת hit ידידותית לאצבע, ה-dblclick-zoom ברירת המחדל בולע, ו**שומר משולש**: מחיקה שתשאיר פחות משלוש פינות מסורבת (דווחה דרך `onInvalidAction`) במקום לייצר גיאומטריה לא חוקית.
- **Events גיאומטריה נקיים** — `onChange` הזעקה עם GeoJSON פשוט `Polygon` (או `null`), לא אוסף תכונות פנימי של ציור.
- **סגנונות ציור מכוונים למגע** — מילוי שקוף, 6.5 px קודקוד handles, נקודות ביניים עדינות, הכל בצבע הדגש שלך (`buildDrawStyles(color)` מיוצא לכיסטום).
- **תלויות מוזרקות** — הבנאי `MapboxDraw` הוא פרמטר, כך ש-forks עובדים והעורך כולו ניתן לבדיקה ללא דפדפן (ראו את סוויץ' מונע [בחבילת בדיקות](src/editor.test.ts)).

## API

| חבר | מטרה |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | בנה; `attach()` / `detach()` ניהול קשרי מפה. |
| `startDrawing()` | הזן מצב ציור פוליגון. |
| `startEditing()` | הזן מצב עריכת קודקוד על הפוליגון המצויר. |
| `deletePolygon()` | הסר את הפוליגון (ניתן לביטול). |
| `undo()` | צעד אחורה דרך מחסנית הצילומים. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON פנימה, GeoJSON החוצה. `setGeometry` מאפס את מחסנית הביטול ואינו הזעקה `onChange`. |

אפשרויות: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## תיעוד

- [הערות עיצוב](docs/design.md) — למה ללא ראש, מכניקת מחיקת הקודקוד, מודל הפוליגון היחיד, ומתכוני אינטגרציה (Vue/React).

## למה בנינו זאת

ב-[Ridewolf](https://ridewolf.com) מפעילים מציירים אזורי גדרות — חניה, no-go, מהירות מוגבלת — ישירות על מפת לוח הבקרה. העורך מאחורי זה עבר את הכאב הרגיל: ציור התנהג בצורה שגויה על MapLibre, אובדן קודקוד בשגגה המייצר פוליגונים מעוכים שהשרת האחורי דחה, ומפעילים לנייד אינם יכולים למחוק קודקודים בכלל.
חבילה זו היא הניצול, מינוס ממשק שלנו.

## תרומה

הערות בברכה — ראו את [מדריך התרומה](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
הפעל `bun test`, `bun run lint`, `bun run typecheck` לפני PR. בעיות אבטחה:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — לעולם לא בנושא ציבורי.

## רישיון

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
