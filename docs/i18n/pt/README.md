<!-- docs-i18n: generated translation — do not edit by hand.
     locale: pt
     source: README.md (a274a336347ce1a8)
     model: claude-haiku-4.5
     generated: 2026-07-31T14:01:35.847Z
     Edit README.md and re-run `docs-i18n translate` instead. -->

> 🌐 This is a generated translation. The canonical document is [README.md](../../../README.md).

<!-- docs-i18n:switcher -->
<p align="center"><sub><a href="../../../README.md">English</a> · <a href="../ru/README.md">Русский</a> · <a href="../ro/README.md">Română</a> · <a href="../de/README.md">Deutsch</a> · <a href="../es/README.md">Español</a> · <a href="../fr/README.md">Français</a> · <a href="../it/README.md">Italiano</a> · <b>Português</b> · <a href="../uk/README.md">Українська</a> · <a href="../pl/README.md">Polski</a> · <a href="../tr/README.md">Türkçe</a> · <a href="../sv/README.md">Svenska</a> · <a href="../nl/README.md">Nederlands</a> · <a href="../el/README.md">Ελληνικά</a> · <a href="../ar/README.md">العربية</a> · <a href="../he/README.md">עברית</a></sub></p>
<!-- /docs-i18n:switcher -->

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-white.png">
    <img src="https://raw.githubusercontent.com/Ridewolf/maplibre-zone-editor/main/docs/logo-dark.png" alt="Ridewolf" width="260">
  </picture>
  <h1>@ridewolf/maplibre-zone-editor</h1>
  <p>Um editor de zonas poligonais sem interface para MapLibre GL.<br>
  Modos de desenho/edição, pilha de desfazer, exclusão de vértices com duplo toque com proteção<br>
  de triângulo, e eventos de geometria limpa — traga seus próprios botões.</p>
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

Construir um editor de cerca geográfica no MapLibre significa colar `mapbox-gl-draw` em uma biblioteca
para a qual não foi escrito, estilizando seus internos, inventando desfazer, e ensinando usuários
móveis a editar vértices. Todo painel de mobilidade faz isso do zero. Este pacote é essa
cola, extraída do editor de zona Ridewolf — sem interface, portanto renderiza zero UI e
funciona com botões de qualquer framework.

## Início rápido

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

Ou execute a demo agrupada — a barra de ferramentas acima, em um mapa que não precisa de servidor
de telhas ou chave de API (o mapa base é gerado como GeoJSON):

```bash
bun install && bun run build && bunx serve .   # → examples/demo.html
```

## O que ele trata para você

- **O patch de compatibilidade MapLibre** — `mapbox-gl-draw` tem como alvo nomes de classes DOM do Mapbox GL
  e se comporta silenciosamente de forma incorreta no MapLibre; `patchMapboxDrawForMapLibre()` reescreve
  eles (aplicado automaticamente pelo editor).
- **Desfazer** — cada criação/atualização/exclusão faz uma captura do estado de desenho (profundidade limitada,
  padrão 20); `undo()` volta através dela até uma tela vazia.
- **Exclusão de vértices por clique duplo / duplo toque** — com uma caixa de acerto amigável para dedos, o
  zoom de dblclick padrão consumido, e uma **proteção de triângulo**: uma exclusão que deixaria
  menos de três cantos é recusada (relatada via `onInvalidAction`) ao invés
  de produzir geometria inválida.
- **Eventos de geometria limpa** — `onChange` dispara com um GeoJSON simples `Polygon` (ou
  `null`), não a coleção de recursos interna do draw.
- **Estilos de desenho ajustados para toque** — preenchimento translúcido, alças de vértices de 6,5 px, pontos médios sutis,
  tudo na sua cor de destaque (`buildDrawStyles(color)` é exportado para
  customização).
- **Dependências injetadas** — o construtor `MapboxDraw` é um parâmetro, então forks
  funcionam e todo o editor é testável sem um navegador (veja o [test suite](src/editor.test.ts) orientado a fake).

## API

| Membro | Propósito |
| --- | --- |
| `createZoneEditor(map, MapboxDraw, options)` | Construir; `attach()` / `detach()` gerenciam ligações de mapa. |
| `startDrawing()` | Entrar no modo de desenho de polígono. |
| `startEditing()` | Entrar no modo de edição de vértices no polígono desenhado. |
| `deletePolygon()` | Remover o polígono (desfeito). |
| `undo()` | Voltar um passo na pilha de capturas. |
| `getGeometry()` / `setGeometry(polygon \| null)` | GeoJSON em, GeoJSON para fora. `setGeometry` redefine a pilha de desfazer e não dispara `onChange`. |

Opções: `color`, `onChange`, `onInvalidAction`, `maxUndoStates`, `vertexHitTolerance`.

## Documentação

- [Notas de design](docs/design.md) — por que sem interface, a mecânica de exclusão de vértices, o
  modelo de polígono único, e receitas de integração (Vue/React).

## Por que construímos isso

Em [Ridewolf](https://ridewolf.com) operadores desenham zonas de cerca geográfica — estacionamento, sem ir,
com limite de velocidade — diretamente no mapa do painel. O editor por trás disso passou pelo
usual dor: draw se comportando mal no MapLibre, perda acidental de vértices produzindo polígonos
degenerados que o backend rejeitou, e operadores móveis incapazes de deletar vértices. Este
pacote é o sobrevivente, menos nossa UI.

## Contribuindo

Contribuições bem-vindas — veja o [guia de contribuição](https://github.com/Ridewolf/.github/blob/main/CONTRIBUTING.md).
Execute `bun test`, `bun run lint`, `bun run typecheck` antes de um PR. Problemas de segurança:
[SECURITY.md](https://github.com/Ridewolf/.github/blob/main/SECURITY.md) — nunca em uma questão pública.

## Licença

[Apache-2.0](LICENSE) © [Ridewolf](https://ridewolf.com)
