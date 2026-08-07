import type { Polygon } from 'geojson';

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
  id?: string | number;
  type: 'Feature';
  properties: Record<string, unknown> | null;
  geometry: { type: string; coordinates: unknown };
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

/** A MapboxDraw-style constructor — inject the real one (or your fork). */
export type DrawConstructor = new (options: {
  displayControlsDefault: boolean;
  controls: Record<string, never>;
  defaultMode: string;
  styles: unknown[];
}) => DrawLike;

export interface RenderedVertex {
  properties?: Record<string, unknown> | null;
}

/** The subset of maplibre-gl's Map the editor drives. */
export interface MapLike {
  addControl(control: unknown, position?: string): unknown;
  removeControl(control: unknown): unknown;
  on(event: string, handler: (event: never) => void): unknown;
  off(event: string, handler: (event: never) => void): unknown;
  queryRenderedFeatures(box: [[number, number], [number, number]]): RenderedVertex[];
  fitBounds(bounds: unknown, options?: Record<string, unknown>): unknown;
}

export interface MapDblClickEvent {
  point: { x: number; y: number };
  preventDefault(): void;
}
