import { describe, expect, it } from 'bun:test';
import { createZoneEditor } from './editor';
import type {
  DrawCollection,
  DrawConstructor,
  DrawFeature,
  InvalidActionReason,
  MapLike,
  RenderedVertex,
  ZonePolygon,
} from './types';

// ── Fakes ────────────────────────────────────────────────────────────────────

class FakeDraw {
  collection: DrawCollection = { type: 'FeatureCollection', features: [] };
  mode = 'simple_select';
  modeCalls: Array<{ mode: string; options?: Record<string, unknown> | undefined }> = [];
  trashed = 0;

  constructor(public readonly ctorOptions: Record<string, unknown>) {}

  getAll(): DrawCollection {
    return this.collection;
  }
  set(collection: DrawCollection): void {
    this.collection = collection;
  }
  add(feature: DrawFeature): void {
    this.collection.features.push({ ...feature, id: feature.id ?? 'f1' });
  }
  get(featureId: string): DrawFeature | undefined {
    return this.collection.features.find((f) => String(f.id) === featureId);
  }
  delete(featureId: string): void {
    this.collection.features = this.collection.features.filter((f) => String(f.id) !== featureId);
  }
  deleteAll(): void {
    this.collection = { type: 'FeatureCollection', features: [] };
  }
  getMode(): string {
    return this.mode;
  }
  changeMode(mode: string, options?: Record<string, unknown>): void {
    this.mode = mode;
    this.modeCalls.push({ mode, options });
  }
  trash(): void {
    this.trashed++;
  }
}

class FakeMap implements MapLike {
  controls: unknown[] = [];
  handlers = new Map<string, Set<(e: never) => void>>();
  renderedVertices: RenderedVertex[] = [];

  addControl(control: unknown): void {
    this.controls.push(control);
  }
  removeControl(control: unknown): void {
    this.controls = this.controls.filter((c) => c !== control);
  }
  on(event: string, handler: (e: never) => void): void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler);
  }
  off(event: string, handler: (e: never) => void): void {
    this.handlers.get(event)?.delete(handler);
  }
  emit(event: string, arg?: unknown): void {
    for (const handler of this.handlers.get(event) ?? []) {
      (handler as (e: unknown) => void)(arg);
    }
  }
  queryRenderedFeatures(): RenderedVertex[] {
    return this.renderedVertices;
  }
  fitBounds(): void {}
}

function square(size = 10): ZonePolygon {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [size, 0],
        [size, size],
        [0, size],
        [0, 0],
      ],
    ],
  };
}

function triangle(): ZonePolygon {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [10, 0],
        [5, 8],
        [0, 0],
      ],
    ],
  };
}

function setup(options: { color?: string } = {}) {
  const map = new FakeMap();
  const changes: Array<ZonePolygon | null> = [];
  const invalid: InvalidActionReason[] = [];
  let drawInstance: FakeDraw | null = null;
  const Ctor = function (this: unknown, opts: Record<string, unknown>) {
    drawInstance = new FakeDraw(opts);
    return drawInstance;
  } as unknown as DrawConstructor;

  const editor = createZoneEditor(map, Ctor, {
    ...options,
    onChange: (g) => changes.push(g),
    onInvalidAction: (r) => invalid.push(r),
  });
  editor.attach();
  if (!drawInstance) throw new Error('draw not constructed');
  return { map, editor, draw: drawInstance as FakeDraw, changes, invalid };
}

const dbl = (prevent = { count: 0 }) => ({
  point: { x: 100, y: 100 },
  preventDefault: () => {
    prevent.count++;
  },
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('lifecycle', () => {
  it('attach adds the control and handlers; detach removes both', () => {
    const { map, editor } = setup();
    expect(map.controls).toHaveLength(1);
    expect(map.handlers.get('draw.create')?.size).toBe(1);
    editor.detach();
    expect(map.controls).toHaveLength(0);
    expect(map.handlers.get('draw.create')?.size).toBe(0);
    editor.detach(); // idempotent
  });
});

describe('geometry I/O', () => {
  it('setGeometry/getGeometry roundtrip; null clears', () => {
    const { editor } = setup();
    editor.setGeometry(square());
    expect(editor.getGeometry()).toEqual(square());
    editor.setGeometry(null);
    expect(editor.getGeometry()).toBeNull();
  });

  it('draw events emit the current polygon through onChange', () => {
    const { map, editor, changes } = setup();
    editor.setGeometry(square());
    map.emit('draw.update');
    expect(changes).toEqual([square()]);
  });

  it('deletePolygon clears and emits null', () => {
    const { editor, changes } = setup();
    editor.setGeometry(square());
    editor.deletePolygon();
    expect(editor.getGeometry()).toBeNull();
    expect(changes).toEqual([null]);
  });
});

describe('modes', () => {
  it('startDrawing enters draw_polygon', () => {
    const { editor, draw } = setup();
    editor.startDrawing();
    expect(draw.mode).toBe('draw_polygon');
  });

  it('startEditing targets the drawn polygon, or reports no-polygon', () => {
    const { editor, draw, invalid } = setup();
    editor.startEditing();
    expect(invalid).toEqual(['no-polygon']);

    editor.setGeometry(square());
    editor.startEditing();
    expect(draw.modeCalls.at(-1)).toEqual({
      mode: 'direct_select',
      options: { featureId: 'f1' },
    });
  });
});

describe('undo', () => {
  it('reverts through the stack down to an empty canvas', () => {
    const { map, editor, draw } = setup();
    editor.setGeometry(square(10));
    map.emit('draw.create'); // snapshot: square(10)

    draw.collection.features[0] = {
      ...(draw.collection.features[0] as DrawFeature),
      geometry: square(20),
    };
    map.emit('draw.update'); // snapshot: square(20)

    editor.undo(); // back to square(10)
    expect((editor.getGeometry()?.coordinates[0]?.[1] ?? [])[0]).toBe(10);

    editor.undo(); // stack exhausted → cleared
    expect(editor.getGeometry()).toBeNull();
    editor.undo(); // no-op on empty stack
  });

  it('caps the stack at maxUndoStates', () => {
    const { map, editor, draw } = setup();
    editor.setGeometry(square());
    for (let i = 0; i < 30; i++) {
      draw.collection.features[0] = {
        ...(draw.collection.features[0] as DrawFeature),
        geometry: square(i + 1),
      };
      map.emit('draw.update');
    }
    // 30 snapshots pushed, capped to 20 — undoing 25 times must not throw.
    for (let i = 0; i < 25; i++) editor.undo();
    expect(editor.getGeometry()).toBeNull();
  });
});

describe('double-click vertex deletion', () => {
  function vertexAt(parent: string, coordPath: string): RenderedVertex {
    return { properties: { meta: 'vertex', coord_path: coordPath, parent } };
  }

  it('ignores double-clicks outside direct_select mode', () => {
    const { map, draw } = setup();
    map.renderedVertices = [vertexAt('f1', '0.1')];
    map.emit('dblclick', dbl());
    expect(draw.trashed).toBe(0);
  });

  it('deletes the vertex under the pointer via trash()', () => {
    const { map, editor, draw } = setup();
    editor.setGeometry(square()); // 4 corners
    draw.mode = 'direct_select';
    map.renderedVertices = [vertexAt('f1', '0.1')];

    const prevent = { count: 0 };
    map.emit('dblclick', dbl(prevent));
    expect(prevent.count).toBe(1); // dblclick zoom swallowed
    expect(draw.trashed).toBe(1);
    expect(draw.modeCalls.at(-1)?.options).toEqual({ featureId: 'f1', coordPath: '0.1' });
  });

  it('refuses to delete a corner of a triangle', () => {
    const { map, editor, draw, invalid } = setup();
    editor.setGeometry(triangle());
    draw.mode = 'direct_select';
    map.renderedVertices = [vertexAt('f1', '0.0')];

    const prevent = { count: 0 };
    map.emit('dblclick', dbl(prevent));
    expect(prevent.count).toBe(1); // zoom still swallowed
    expect(draw.trashed).toBe(0); // but the vertex survives
    expect(invalid).toEqual(['min-vertices']);
  });

  it('ignores double-clicks that hit no vertex', () => {
    const { map, editor, draw } = setup();
    editor.setGeometry(square());
    draw.mode = 'direct_select';
    map.renderedVertices = [];
    map.emit('dblclick', dbl());
    expect(draw.trashed).toBe(0);
  });
});

describe('draw construction', () => {
  it('passes the accent colour into the draw styles', () => {
    const { draw } = setup({ color: '#ff0000' });
    expect(JSON.stringify(draw.ctorOptions)).toContain('#ff0000');
  });
});
