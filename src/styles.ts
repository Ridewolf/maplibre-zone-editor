/** Draw styling + the MapLibre compatibility patch for mapbox-gl-draw. */

interface DrawClassesHolder {
  constants?: {
    classes?: Record<string, string>;
  };
}

/**
 * mapbox-gl-draw targets Mapbox GL's DOM class names; on MapLibre its canvas
 * lookups and control styling miss. This rewrites the class-name constants to
 * their `maplibregl-` counterparts. Call once, before constructing any draw
 * instance. Idempotent.
 */
export function patchMapboxDrawForMapLibre(MapboxDraw: unknown): void {
  const drawClasses = (MapboxDraw as DrawClassesHolder)?.constants?.classes;
  if (!drawClasses) return;

  drawClasses.CANVAS = 'maplibregl-canvas';
  drawClasses.CANVAS_CONTAINER = 'maplibregl-canvas-container';
  drawClasses.CONTROL_BASE = 'maplibregl-ctrl';
  drawClasses.CONTROL_PREFIX = 'maplibregl-ctrl-';
  drawClasses.CONTROL_GROUP = 'maplibregl-ctrl-group';
  drawClasses.ATTRIBUTION = 'maplibregl-ctrl-attrib';
}

/**
 * A minimal, accent-coloured draw style set: translucent fill, solid outline,
 * large vertex handles (finger-friendly), subtle midpoints.
 */
export function buildDrawStyles(color: string): object[] {
  return [
    {
      id: 'gl-draw-polygon-fill',
      type: 'fill',
      filter: ['all', ['==', '$type', 'Polygon']],
      paint: { 'fill-color': color, 'fill-opacity': 0.3 },
    },
    {
      id: 'gl-draw-polygon-stroke',
      type: 'line',
      filter: ['all', ['==', '$type', 'Polygon']],
      paint: { 'line-color': color, 'line-width': 2 },
    },
    {
      id: 'gl-draw-polygon-and-line-vertex-active',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      paint: {
        'circle-radius': 6.5,
        'circle-color': '#FFF',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': color,
      },
    },
    {
      id: 'gl-draw-polygon-midpoint',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
      paint: {
        'circle-radius': 2.7,
        'circle-color': '#FFF',
        'circle-stroke-width': 2,
        'circle-stroke-color': color,
      },
    },
  ];
}
