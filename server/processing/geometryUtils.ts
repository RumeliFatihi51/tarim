import proj4 from 'proj4';
import { GeoPolygon } from '../types';

/**
 * Normalizes various polygon formats to standard GeoJSON Polygon format [[lng, lat], ...]
 */
export function normalizePolygon(input: any): GeoPolygon {
  if (!input) {
    throw new Error('Geçersiz poligon geometrisi: polygon zorunludur.');
  }

  // If already GeoJSON Polygon
  if (input.type === 'Polygon' && Array.isArray(input.coordinates)) {
    const ring = input.coordinates[0];
    if (ring && ring.length >= 3) {
      // Ensure closed ring
      const normalizedRing = ring.map((point: unknown) => {
        if (!Array.isArray(point) || point.length < 2 || !Number.isFinite(Number(point[0])) || !Number.isFinite(Number(point[1]))) {
          throw new Error('Geçersiz poligon koordinatı.');
        }
        const lng = Number(point[0]);
        const lat = Number(point[1]);
        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) throw new Error('Poligon koordinatı WGS84 sınırları dışında.');
        return [lng, lat] as [number, number];
      });
      const first = normalizedRing[0];
      const last = normalizedRing[normalizedRing.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        normalizedRing.push([...first]);
      }
      return { type: 'Polygon', coordinates: [normalizedRing] };
    }
  }

  // If array of points [[lat, lng], ...] or [[lng, lat], ...]
  if (Array.isArray(input)) {
    const coords: [number, number][] = input.map((pt: any) => {
      if (Array.isArray(pt)) {
        // Check if [lat, lng] (typical Leaflet) vs [lng, lat]
        // In Turkey, lat is ~36-42, lng is ~26-45
        // If pt[0] is > 30 and pt[1] < 30, it is likely [lat, lng]
        if (pt[0] > pt[1] && pt[0] >= 30 && pt[0] <= 85) {
          return [Number(pt[1]), Number(pt[0])]; // convert [lat, lng] to [lng, lat]
        }
        return [Number(pt[0]), Number(pt[1])];
      }
      if (pt && typeof pt.lat === 'number' && typeof pt.lng === 'number') {
        return [pt.lng, pt.lat];
      }
      return [0, 0];
    });

    if (coords.length >= 3) {
      // Ensure closed ring
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([first[0], first[1]]);
      }
      return {
        type: 'Polygon',
        coordinates: [coords],
      };
    }
  }

  throw new Error('Geçersiz poligon geometrisi: En az 3 koordinat noktası gereklidir.');
}

/**
 * Calculates WGS84 Bounding Box [minLng, minLat, maxLng, maxLat]
 */
export function getPolygonBBox(polygon: GeoPolygon): [number, number, number, number] {
  const ring = polygon.coordinates[0];
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  return [
    parseFloat(minLng.toFixed(6)),
    parseFloat(minLat.toFixed(6)),
    parseFloat(maxLng.toFixed(6)),
    parseFloat(maxLat.toFixed(6)),
  ];
}

/**
 * Determines UTM EPSG code based on longitude and latitude
 */
export function getUtmEpsg(lng: number, lat: number): number {
  const zone = Math.floor((lng + 180) / 6) + 1;
  return lat >= 0 ? 32600 + zone : 32700 + zone;
}

/**
 * Calculates polygon area in hectares using UTM projection
 */
export function calculatePolygonAreaHa(polygon: GeoPolygon): number {
  const ring = polygon.coordinates[0];
  if (ring.length < 3) return 0;

  const [lng, lat] = ring[0];
  const epsg = getUtmEpsg(lng, lat);
  const utmDef = `+proj=utm +zone=${epsg % 100} ${lat >= 0 ? '+north' : '+south'} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;

  // Project points to UTM meters
  const utmRing = ring.map(([l, a]) => proj4('EPSG:4326', utmDef, [l, a]));

  // Shoelace formula in meters squared
  let areaM2 = 0;
  for (let i = 0; i < utmRing.length - 1; i++) {
    areaM2 += utmRing[i][0] * utmRing[i + 1][1] - utmRing[i + 1][0] * utmRing[i][1];
  }
  areaM2 = Math.abs(areaM2) / 2;

  // 1 hectare = 10,000 m2
  return parseFloat((areaM2 / 10000).toFixed(2));
}

/**
 * Ray-casting algorithm to test if a 2D point is inside a polygon
 */
export function pointInPolygon(point: [number, number], vs: [number, number][]): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
