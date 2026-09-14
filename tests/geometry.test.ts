import { describe, expect, it } from 'vitest';
import { calculatePolygonAreaHa, getPolygonBBox, getUtmEpsg, normalizePolygon, pointInPolygon } from '../server/processing/geometryUtils';

describe('geometry', () => {
  const polygon = normalizePolygon({ type: 'Polygon', coordinates: [[[27, 38], [27.01, 38], [27.01, 38.01], [27, 38.01], [27, 38]]] });
  it('calculates bbox and a positive UTM area', () => {
    expect(getPolygonBBox(polygon)).toEqual([27, 38, 27.01, 38.01]);
    expect(calculatePolygonAreaHa(polygon)).toBeGreaterThan(90);
    expect(getUtmEpsg(27, 38)).toBe(32635);
  });
  it('clips points to the real polygon', () => {
    expect(pointInPolygon([27.005, 38.005], polygon.coordinates[0])).toBe(true);
    expect(pointInPolygon([27.02, 38.005], polygon.coordinates[0])).toBe(false);
  });
  it('rejects missing geometry', () => expect(() => normalizePolygon(null)).toThrow(/zorunludur/));
});

