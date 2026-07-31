<!-- docs-i18n: generated translation — do not edit by hand.
     locale: tr
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.848Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<p align="center"><sub>[English](../../../README.md) · [Русский](../../../docs/i18n/ru/README.md) · [Română](../../../docs/i18n/ro/README.md) · [Deutsch](../../../docs/i18n/de/README.md) · [Español](../../../docs/i18n/es/README.md) · [Français](../../../docs/i18n/fr/README.md) · [Italiano](../../../docs/i18n/it/README.md) · [Português](../../../docs/i18n/pt/README.md) · [Українська](../../../docs/i18n/uk/README.md) · [Polski](../../../docs/i18n/pl/README.md) · **Türkçe** · [Svenska](../../../docs/i18n/sv/README.md) · [Nederlands](../../../docs/i18n/nl/README.md) · [Ελληνικά](../../../docs/i18n/el/README.md) · [العربية](../../../docs/i18n/ar/README.md) · [עברית](../../../docs/i18n/he/README.md)</sub></p>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>MapLibre GL için kurasız bir çokgen bölge editörü.<br>
  Çizim/düzenleme modları, geri alma yığını, üçgen koruma ile çift dokunuşla tepe noktası silinmesi<br>
  ve temiz geometri olayları — kendi düğmelerinizi getirin.</p>
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

MapLibre'de bir coğrafi çit editörü oluşturmak, `mapbox-gl-draw` için yazılmayan bir kütüphaneye yapıştırmak, iç işleyişini stil vermek, geri almayı icat etmek ve mobil kullanıcılara tepe noktalarını düzenlemesini öğretmek anlamına gelir. Her mobilite panosunda bu sıfırdan yapılır. Bu paket, Ridewolf bölge editöründen çıkarılmış o yapıştırıcıdır — kurasız, bu yüzden sıfır UI render eder ve herhangi bir çerçevenin düğmeleriyle çalışır.

## Hızlı Başlangıç

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

Veya paketlenmiş demoyu çalıştırın — yukarıdaki araç çubuğu, hiçbir döşeme sunucusu veya API anahtarı gerektirmeyen bir harita üzerinde (tabanlık GeoJSON olarak oluşturulur):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## Sizin için neler yapıyor

- **MapLibre uyumluluk yaması** — `mapbox-gl-draw` Mapbox GL'nin DOM sınıf adlarını hedef alır ve MapLibre'de sessizce yanlış davranır; `patchMapboxDrawForMapLibre()` onları yeniden yazar (editör tarafından otomatik olarak uygulanır).
- **Geri alma** — her oluştur/güncelle/sil, çizim durumunu resmeder (sınırlı derinlik, varsayılan 20); `undo()` boş bir kanvas aşağı doğru adım adım geri gider.
- **Çift tıkla / çift dokunuşla tepe noktası silinmesi** — parmak dostu bir hit kutusunda, varsayılan dblclick-zoom kaldırıldı ve **üçgen koruması**: ikiden az köşe bırakacak bir silme reddedilir (`onInvalidAction` aracılığıyla raporlanır) geçersiz geometri üretme yerine.
- **Temiz geometri olayları** — `onChange` düz bir GeoJSON `Polygon` (veya `null`) ile ateşlenir, çizimin iç özellik koleksiyonu değil.
- **Dokunmaya göre ayarlanmış çizim stilleri** — yarı saydam dolgu, 6,5 px tepe noktası tutamaçları, ince ara noktalar, tümü aksan renginde (`buildDrawStyles(color)` özelleştirme için dışa aktarılır).
- **Enjekte edilen bağımlılıklar** — `MapboxDraw` yapıcısı bir parametredir, bu nedenle çatallar çalışır ve tüm editör bir tarayıcı olmadan test edilebilir ([sahte tarafından yönetilen test paketi](src/editor.test.ts)'ye bakın).

## API

| Üye | Amaç |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Oluştur; `attach()` / `detach()` harita bağlamalarını yönet. |
| `startDrawing()` | Çokgen çizim moduna gir. |
| `startEditing()` | Çizilen çokgen üzerinde tepe noktası düzenleme moduna gir. |
| `deletePolygon()` | Çokgeni kaldır (geri alınabilir). |
| `undo()` | Anlık görüntü yığını aracılığıyla geri adım at. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON içinde, GeoJSON dışında. `setGeometry` geri alma yığınını sıfırlar ve `onChange` ateşlemez. |

Seçenekler: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Belgeler

- [Tasarım notları](docs/design.md) — neden kurasız, tepe noktası silinme mekanikleri, tek çokgen modeli ve entegrasyon tarifleri (Vue/React).

## Neden bunu yaptık

[Ridewolf](https://ridewolf.com)'de operatörler coğrafi çit bölgeleri — otopark, yasaklı alan, hız sınırlaması — doğrudan pano haritasına çizerler. Bu editörün arkasında gelen her zamanki acıyla karşılaşıldı: MapLibre'de çizimin yanlış davranışı, yanlışlıkla tepe noktası kaybı arka uçta reddettikleri dejenere çokgenler üretiyor ve mobil operatörler tepe noktalarını hiç silemiyorlardı. Bu paket, UI'mız eksi, sağ kalanıdır.

## Katkıda Bulunma

Katkılar hoş geldiniz — [katkı rehberine](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md) bakın.
PR öncesinde `bun test`, `bun run lint`, `bun run typecheck` çalıştırın. Güvenlik sorunları: [SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — asla halka açık bir sorununda değil.

## Lisans

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
