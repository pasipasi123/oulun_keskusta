// WGS84 coordinates [latitude, longitude]. Illustrative, NOT an official boundary.
export const OULU_BOUNDARY = [
  [65.0180, 25.4615], [65.0190, 25.4695], [65.0180, 25.4775],
  [65.0145, 25.4860], [65.0080, 25.4880], [65.0050, 25.4780],
  [65.0060, 25.4650], [65.0100, 25.4565], [65.0145, 25.4555],
];
export const EARTH_RADIUS = 6371008.8;
const rad = degrees => degrees * Math.PI / 180;
const deg = radians => radians * 180 / Math.PI;

export function distanceAndBearing(from, to) {
  const lat1 = rad(from[0]), lat2 = rad(to[0]);
  const dLat = lat2 - lat1, dLng = rad(to[1] - from[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return {
    distance: 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))),
    bearing: Math.atan2(Math.sin(dLng) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)),
  };
}

export function destination(center, { distance, bearing }) {
  const lat = rad(center[0]), lng = rad(center[1]), delta = distance / EARTH_RADIUS;
  const newLat = Math.asin(Math.max(-1, Math.min(1, Math.sin(lat) * Math.cos(delta) + Math.cos(lat) * Math.sin(delta) * Math.cos(bearing))));
  const newLng = lng + Math.atan2(Math.sin(bearing) * Math.sin(delta) * Math.cos(lat), Math.cos(delta) - Math.sin(lat) * Math.sin(newLat));
  // Keep the longitude in the same world copy as the map center.
  return [deg(newLat), deg(newLng)];
}

// Find the area centroid in a local tangent plane, rather than averaging vertices.
function centroid(points) {
  const reference = points[0];
  const scale = Math.cos(rad(reference[0]));
  const xy = points.map(([lat, lng]) => [(lng - reference[1]) * scale, lat - reference[0]]);
  let area2 = 0, x = 0, y = 0;
  xy.forEach((p, i) => {
    const q = xy[(i + 1) % xy.length], cross = p[0] * q[1] - q[0] * p[1];
    area2 += cross; x += (p[0] + q[0]) * cross; y += (p[1] + q[1]) * cross;
  });
  return [reference[0] + y / (3 * area2), reference[1] + x / (3 * area2 * scale)];
}

export const ORIGIN = centroid(OULU_BOUNDARY);
export const OFFSETS = OULU_BOUNDARY.map(point => distanceAndBearing(ORIGIN, point));
export function polygonAt(center) { return OFFSETS.map(offset => destination(center, offset)); }
export function sphericalArea(points) {
  let sum = 0;
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    const delta = ((q[1] - p[1] + 540) % 360) - 180;
    sum += rad(delta) * (2 + Math.sin(rad(p[0])) + Math.sin(rad(q[0])));
  });
  return Math.abs(sum * EARTH_RADIUS ** 2 / 2);
}
