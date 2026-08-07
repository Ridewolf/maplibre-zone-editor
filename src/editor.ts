/**
 * The headless zone editor: one polygon, draw/edit modes, an undo stack,
 * double-click vertex deletion with a triangle guard, and clean geometry
 * events. No DOM, no framework — bind its methods to whatever UI you have.
 */
import { buildDrawStyles, patchMapboxDrawForMapLibre } from './styles';
import type {
  DrawCollection,
  DrawConstructor,
  DrawLike,
  MapDblClickEvent,
  MapLike,
  ZoneEditorOptions,
  ZonePolygon,
} from './types';

const DEFAULT_COLOR = '#3B82F6';
const DEFAULT_UNDO_DEPTH = 20;
const DEFAULT_TOLERANCE = 8;

/**
 * What the operator was in the middle of doing. Captured so a rebuild of the
 * draw control — a colour change, or a basemap swap that tears custom layers off
 * the map — hands them back the same polygon, the same mode and the same
 * selection instead of dropping them into an empty `simple_select`.
 */
interface EditingState {
  data: DrawCollection | null;
  mode: string;
  selectedIds: string[];
}

export class ZoneEditor {
  private readonly map: MapLike;
  private readonly MapboxDraw: DrawConstructor;
  private draw: DrawLike;
  private color: string;
  private readonly opts: Required<Pick<ZoneEditorOptions, 'maxUndoStates' | 'vertexHitTolerance'>> &
    ZoneEditorOptions;
  private undoStack: DrawCollection[] = [];
  private attached = false;
  /** Set by `detach()`, consumed by the next `attach()`. */
  private pending: EditingState | null = null;

  private readonly onDrawChange = (): void => {
    this.saveToUndoStack();
    this.emitGeometry();
  };

  private readonly onDblClick = (event: MapDblClickEvent): void => this.handleDblClick(event);

  constructor(map: MapLike, MapboxDraw: DrawConstructor, options: ZoneEditorOptions = {}) {
    this.map = map;
    this.opts = {
      maxUndoStates: options.maxUndoStates ?? DEFAULT_UNDO_DEPTH,
      vertexHitTolerance: options.vertexHitTolerance ?? DEFAULT_TOLERANCE,
      ...options,
    };
    patchMapboxDrawForMapLibre(MapboxDraw);
    this.MapboxDraw = MapboxDraw;
    this.color = options.color ?? DEFAULT_COLOR;
    this.draw = this.buildDraw();
  }

  private buildDraw(): DrawLike {
    return new this.MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      defaultMode: 'simple_select',
      styles: buildDrawStyles(this.color),
    });
  }

  private captureState(): EditingState {
    const data = this.draw.getAll();
    return {
      data: data.features.length > 0 ? data : null,
      mode: this.draw.getMode(),
      selectedIds: this.draw.getSelectedIds(),
    };
  }

  /**
   * Put the operator back where they were. Selection is restored per mode
   * because MapboxDraw takes it differently in each: `direct_select` edits one
   * feature, `simple_select` selects a set.
   */
  private restoreState(state: EditingState): void {
    if (state.data) this.draw.set(state.data);
    const [first] = state.selectedIds;
    if (state.mode === 'draw_polygon') {
      this.draw.changeMode('draw_polygon');
    } else if (state.mode === 'direct_select' && first !== undefined) {
      this.draw.changeMode('direct_select', { featureId: first });
    } else if (state.mode === 'simple_select' && state.selectedIds.length > 0) {
      this.draw.changeMode('simple_select', { featureIds: state.selectedIds });
    }
  }

  /**
   * Add the draw control and event handlers to the map. If a `detach()`
   * preceded this, the polygon, mode and selection from that moment come back —
   * so the detach/attach pair a basemap swap needs is round-trip safe.
   */
  attach(): void {
    if (this.attached) return;
    this.attached = true;
    this.map.addControl(this.draw, 'top-left');
    this.map.on('draw.create', this.onDrawChange as never);
    this.map.on('draw.update', this.onDrawChange as never);
    this.map.on('draw.delete', this.onDrawChange as never);
    // Bound to the map (not draw) so it survives draw re-creation; reads the
    // live draw instance through `this`.
    this.map.on('dblclick', this.onDblClick as never);

    if (this.pending) {
      const state = this.pending;
      this.pending = null;
      // A style swap can leave the control's own data behind; re-setting it is
      // cheap and makes the outcome the same either way.
      this.draw.deleteAll();
      this.restoreState(state);
    }
  }

  /**
   * Remove the control and handlers, remembering what the operator was doing so
   * the next `attach()` can restore it. Safe to call repeatedly.
   */
  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    this.pending = this.captureState();
    this.map.off('draw.create', this.onDrawChange as never);
    this.map.off('draw.update', this.onDrawChange as never);
    this.map.off('draw.delete', this.onDrawChange as never);
    this.map.off('dblclick', this.onDblClick as never);
    this.map.removeControl(this.draw);
  }

  /**
   * Restyle the polygon. MapboxDraw bakes its styles in at construction, so this
   * rebuilds the control — the polygon, mode and selection are carried across,
   * as is the undo stack, because recolouring is not an edit.
   */
  setColor(color: string): void {
    if (color === this.color) return;
    this.color = color;
    // detach() banks the editing state and attach() spends it, so the rebuild
    // needs no state handling of its own. Detached callers keep the state their
    // earlier detach() banked, and get it back whenever they attach.
    const wasAttached = this.attached;
    if (wasAttached) this.detach();
    this.draw = this.buildDraw();
    if (wasAttached) this.attach();
  }

  // ── Geometry I/O ─────────────────────────────────────────────────────────

  /** The current polygon, or null when nothing is drawn. */
  getGeometry(): ZonePolygon | null {
    const feature = this.draw.getAll().features[0];
    if (feature?.geometry.type !== 'Polygon') return null;
    return {
      type: 'Polygon',
      coordinates: feature.geometry.coordinates as ZonePolygon['coordinates'],
    };
  }

  /** Replace the drawn polygon (null clears). Does not fire onChange. */
  setGeometry(geometry: ZonePolygon | null): void {
    this.draw.deleteAll();
    if (geometry) {
      this.draw.add({ type: 'Feature', properties: {}, geometry });
    }
    this.undoStack = [];
  }

  // ── Modes and actions ────────────────────────────────────────────────────

  /** Enter polygon-drawing mode. */
  startDrawing(): void {
    this.draw.changeMode('draw_polygon');
  }

  /** Enter vertex-editing mode on the drawn polygon. */
  startEditing(): void {
    const feature = this.draw.getAll().features[0];
    if (!feature) {
      this.opts.onInvalidAction?.('no-polygon');
      return;
    }
    this.draw.changeMode('direct_select', { featureId: feature.id });
  }

  /** Delete the drawn polygon entirely. */
  deletePolygon(): void {
    const feature = this.draw.getAll().features[0];
    if (!feature) return;
    this.saveToUndoStack();
    this.draw.delete(String(feature.id));
    this.emitGeometry();
  }

  /** Revert the last change; an exhausted stack clears the canvas. */
  undo(): void {
    if (this.undoStack.length === 0) return;
    this.undoStack.pop(); // the state we're leaving
    const previous = this.undoStack[this.undoStack.length - 1];
    if (previous) {
      this.draw.set(previous);
    } else {
      this.draw.deleteAll();
    }
    this.emitGeometry();
  }

  // ── Internals ────────────────────────────────────────────────────────────

  private saveToUndoStack(): void {
    this.undoStack.push(structuredClone(this.draw.getAll()));
    if (this.undoStack.length > this.opts.maxUndoStates) this.undoStack.shift();
  }

  private emitGeometry(): void {
    this.opts.onChange?.(this.getGeometry());
  }

  /**
   * Double-click / double-tap a polygon vertex to remove it (matches dedicated
   * polygon-editing tools). Only active in vertex-editing mode. Refuses a
   * deletion that would leave fewer than three corners.
   */
  private handleDblClick(event: MapDblClickEvent): void {
    if (this.draw.getMode() !== 'direct_select') return;

    // Small hit box around the pointer so finger taps land on the vertex dots.
    const t = this.opts.vertexHitTolerance;
    const vertex = this.map
      .queryRenderedFeatures([
        [event.point.x - t, event.point.y - t],
        [event.point.x + t, event.point.y + t],
      ])
      .find((f) => f.properties?.meta === 'vertex' && typeof f.properties?.coord_path === 'string');
    if (!vertex?.properties) return;

    const featureId = String(vertex.properties.parent);
    const coordPath = String(vertex.properties.coord_path);

    // Keep at least a triangle — refuse a deletion that would invalidate the polygon.
    const feature = this.draw.get(featureId);
    if (feature && feature.geometry.type === 'Polygon') {
      const coordinates = feature.geometry.coordinates as number[][][];
      const ringIndex = Number(coordPath.split('.')[0]);
      const ring = coordinates[ringIndex] ?? [];
      const first = ring[0];
      const last = ring[ring.length - 1];
      const closed =
        ring.length > 1 && !!first && !!last && first[0] === last[0] && first[1] === last[1];
      const cornerCount = closed ? ring.length - 1 : ring.length;
      if (cornerCount <= 3) {
        event.preventDefault(); // swallow the dblclick zoom, but keep the vertex
        this.opts.onInvalidAction?.('min-vertices');
        return;
      }
    }

    // Stop the default double-click zoom, then remove just this vertex via
    // draw (it handles ring closure and re-validation; onChange fires from
    // the resulting draw.update event).
    event.preventDefault();
    this.saveToUndoStack();
    this.draw.changeMode('direct_select', { featureId, coordPath });
    this.draw.trash();
  }
}

/** Factory sugar mirroring the other Ridewolf packages. */
export function createZoneEditor(
  map: MapLike,
  MapboxDraw: DrawConstructor,
  options: ZoneEditorOptions = {},
): ZoneEditor {
  return new ZoneEditor(map, MapboxDraw, options);
}
