import { describe, expect, it } from 'vitest';
import { calculateNbr, calculateNdmi, calculateNdre, calculateNdvi, calculateNdwi, isValidSclClass, toReflectance } from '../server/processing/spectralIndices';

describe('spectral indices and SCL masking', () => {
  it('uses documented Sentinel-2 band formulas', () => {
    expect(calculateNdvi(0.6, 0.2)).toBeCloseTo(0.5);
    expect(calculateNdwi(0.2, 0.6)).toBeCloseTo(-0.5);
    expect(calculateNdmi(0.6, 0.3)).toBeCloseTo(1 / 3);
    expect(calculateNbr(0.6, 0.2)).toBeCloseTo(0.5);
    expect(calculateNdre(0.6, 0.3)).toBeCloseTo(1 / 3);
  });
  it('does not invent invalid reflectance or zero-denominator values', () => {
    expect(toReflectance(0)).toBeNull();
    expect(toReflectance(Number.NaN)).toBeNull();
    expect(calculateNdvi(0, 0)).toBeNull();
  });
  it('masks no-data, cloud, shadow, cirrus and snow SCL classes', () => {
    for (const scl of [0, 1, 3, 8, 9, 10, 11]) expect(isValidSclClass(scl)).toBe(false);
    for (const scl of [2, 4, 5, 6, 7]) expect(isValidSclClass(scl)).toBe(true);
  });
});

