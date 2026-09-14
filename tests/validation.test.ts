import { describe, expect, it } from 'vitest';
import { validateAnalysisRequest } from '../server/validation';

describe('analysis API validation', () => {
  it('accepts a bounded closed GeoJSON polygon', () => {
    const value = validateAnalysisRequest({ mode: 'LIVE', polygon: { type: 'Polygon', coordinates: [[[27,38],[27.001,38],[27.001,38.001],[27,38]]] } });
    expect(value.mode).toBe('LIVE');
  });
  it('rejects open rings and invalid coordinates', () => {
    expect(() => validateAnalysisRequest({ polygon: { type: 'Polygon', coordinates: [[[27,38],[27.1,38],[27.1,38.1],[27,38.1]]] } })).toThrow(/Invalid analysis request/);
  });
  it('rejects self-intersecting polygons', () => {
    expect(() => validateAnalysisRequest({ polygon: { type: 'Polygon', coordinates: [[[27,38],[27.01,38.01],[27.01,38],[27,38.01],[27,38]]] } })).toThrow(/Invalid analysis request/);
  });
});
