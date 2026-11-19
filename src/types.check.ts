/**
 * Compile-time only: the real MapboxDraw must satisfy `DrawConstructor`.
 *
 * The test injects a fake through `as unknown as DrawConstructor`, which would
 * hide a mismatch, so this assignment is what fails `tsc` if the type drifts
 * from the library again. Excluded from tsconfig.build.json; never imported.
 */
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import type { DrawConstructor } from './types';

export const drawConstructorCheck: DrawConstructor = MapboxDraw;
