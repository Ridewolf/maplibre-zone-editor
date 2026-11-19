import type { Geometry, Polygon } from 'geojson';

export type ZonePolygon = Polygon;

/** Why an action was refused — surface it as a toast/hint in your UI. */
export type InvalidActionReason = 'no-polygon' | 'min-vertices';

export interface ZoneEditorOptions {
  /** Fill/stroke/vertex accent colour. Default `#3B82F6`. */
  color?: string;
  /** Fired with the current polygon after every meaningful change; `null` when cleared. */
  onChange?: (geometry: ZonePolygon | null) => void;
  /** Fired when an action is refused (edit with nothing drawn, deleting a triangle's vertex). */
  onInvalidAction?: (reason: InvalidActionReason) => void;
  /** Undo history depth. Default 20. */
  maxUndoStates?: number;
  /** Hit box half-size in px around a double-click/tap for vertex deletion. Default 8. */
  vertexHitTolerance?: number;
}

// ── The narrow surfaces this package needs. MapLibre's Map and MapboxDraw
//    satisfy them structurally; tests satisfy them with fakes. ──────────────

export interface DrawFeature {
  // `| undefined` because exactOptionalPropertyTypes is on and MapboxDraw's
  // GeoJSON features type `id` that way; without it the real class does not fit.
  id?: string | number | undefined;
  type: 'Feature';
  properties: Record<string, unknown> | null;
  geometry: Geometry;
}

export interface DrawCollection {
  type: 'FeatureCollection';
  features: DrawFeature[];
}

/** The subset of MapboxDraw the editor drives. */
export interface DrawLike {
  getAll(): DrawCollection;
  set(collection: DrawCollection): unknown;
  add(feature: DrawFeature): unknown;
  get(featureId: string): DrawFeature | undefined;
  delete(featureId: string): unknown;
  deleteAll(): unknown;
  getMode(): string;
  getSelectedIds(): string[];
  changeMode(mode: string, options?: Record<string, unknown>): unknown;
  trash(): unknown;
}

/**
 * A MapboxDraw-style constructor — inject the real one (or your fork).
 *
 * `styles` is `object[]`, not `unknown[]`: MapboxDrawOptions declares it that
 * way, and `unknown[]` is not assignable to `object[]`, so the looser type made
 * `typeof MapboxDraw` fail to satisfy this. Loose is not always safe.
 */
export type DrawConstructor = new (options: {
  displayControlsDefault: boolean;
  controls: Record<string, never>;
  defaultMode: string;
  styles: object[];
}) => DrawLike;

export interface RenderedVertex {
  properties?: Record<string, unknown> | null;
}

/** The subset of maplibre-gl's Map the editor drives. */
export interface MapLike {
  addControl(control: unknown, position?: string): unknown;
  removeControl(control: unknown): unknown;
  /**
   * MapLibre types `on`/`off` as a generic overload set keyed by its event map,
   * and an overloaded method is only assignable to a target signature one of its
   * overloads matches. A handler typed anything narrower than `any` — `never`,
   * `unknown`, or a variadic `never[]` — matches none of them, so a real
   * `maplibregl.Map` fails to satisfy this interface and every consumer is pushed
   * into `map as unknown as MapLike`. Which defeats the point of describing the
   * surface structurally at all.
   *
   * The looseness is contained: these two are only ever called with the editor's
   * own bound handlers, a few lines below in editor.ts.
   */
  // biome-ignore lint/suspicious/noExplicitAny: the only shape a real MapLibre Map satisfies — see above.
  on(event: string, handler: (event: any) => void): unknown;
  // biome-ignore lint/suspicious/noExplicitAny: symmetrical with `on`.
  off(event: string, handler: (event: any) => void): unknown;
  queryRenderedFeatures(box: [[number, number], [number, number]]): RenderedVertex[];
  fitBounds(bounds: unknown, options?: Record<string, unknown>): unknown;
}

export interface MapDblClickEvent {
  point: { x: number; y: number };
  preventDefault(): void;
}
