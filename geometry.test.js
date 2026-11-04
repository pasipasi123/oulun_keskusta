import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ORIGIN, OULU_BOUNDARY, OFFSETS, polygonAt, distanceAndBearing, sphericalArea } from './geometry.js';

test('outline matches the user GeoJSON with coordinates in Leaflet order', () => {
  const geojson = JSON.parse(readFileSync(new URL('./oulun_keskusta2.geojson', import.meta.url), 'utf8'));
  const ring = geojson.features[0].geometry.coordinates[0];
  assert.deepEqual(ring[0], ring.at(-1));
  assert.deepEqual(OULU_BOUNDARY, ring.slice(0, -1).map(([lng, lat]) => [lat, lng]));
});

test('original outline is reconstructed to sub-millimeter precision', () => {
  polygonAt(ORIGIN).forEach((point, i) => assert.ok(distanceAndBearing(point, OULU_BOUNDARY[i]).distance < 0.001));
});
test('vertex distances and bearings survive relocation, including across the date line', () => {
  for (const center of [[60.1699, 24.9384], [0, 0], [-33.87, 151.21], [79, 179.999], [65, 385]]) {
    polygonAt(center).forEach((point, i) => {
      const result = distanceAndBearing(center, point);
      assert.ok(Math.abs(result.distance - OFFSETS[i].distance) < 0.001);
      assert.ok(Math.abs(result.bearing - OFFSETS[i].bearing) < 1e-9);
    });
  }
});
test('area stays within 0.1 percent at different latitudes', () => {
  const original = sphericalArea(OULU_BOUNDARY);
  assert.ok(original > 500000 && original < 5000000);
  for (const center of [[60.17, 24.94], [0, 0], [-33.87, 151.21], [79, 179.999]]) {
    assert.ok(Math.abs(sphericalArea(polygonAt(center)) / original - 1) < 0.001);
  }
});
test('Mercator footprint shrinks by half when zooming out one level', () => {
  const points = polygonAt([60.17, 24.94]);
  const width = zoom => {
    const xs = points.map(p => (p[1] + 180) / 360 * 256 * 2 ** zoom);
    return Math.max(...xs) - Math.min(...xs);
  };
  assert.ok(Math.abs(width(13) / width(14) - 0.5) < 1e-10);
});
