import { AppError } from '../errors';

export const ALGORITHM_VERSION = '1.1.0';
export const INVALID_SCL_CLASSES = new Set([0, 1, 3, 8, 9, 10, 11]);

export function isValidSclClass(value: number): boolean {
  return Number.isInteger(value) && !INVALID_SCL_CLASSES.has(value);
}

export function toReflectance(raw: number): number | null {
  if (!Number.isFinite(raw) || raw <= 0) return null;
  const reflectance = raw / 10000;
  return reflectance > 0 && reflectance <= 1.6 ? reflectance : null;
}

export function normalizedDifference(a: number, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const denominator = a + b;
  if (Math.abs(denominator) < 1e-8) return null;
  const value = (a - b) / denominator;
  return Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : null;
}

export const calculateNdvi = (b08: number, b04: number) => normalizedDifference(b08, b04);
export const calculateNdwi = (b03: number, b08: number) => normalizedDifference(b03, b08);
export const calculateNdmi = (b08: number, b11: number) => normalizedDifference(b08, b11);
export const calculateNbr = (b08: number, b12: number) => normalizedDifference(b08, b12);
export const calculateNdre = (b08: number, b05: number) => normalizedDifference(b08, b05);

export function requireIndex(value: number | null, name: string): number {
  if (value === null) throw new AppError('RASTER_PROCESSING_ERROR', `${name} could not be calculated from valid reflectance values`, 422);
  return value;
}

export const INDEX_METADATA = {
  ndvi: { formula: '(B08 - B04) / (B08 + B04)', inputBands: ['B08', 'B04'], resolutionMeters: 10 },
  ndwi: { formula: '(B03 - B08) / (B03 + B08)', inputBands: ['B03', 'B08'], resolutionMeters: 10 },
  ndmi: { formula: '(B08 - B11) / (B08 + B11)', inputBands: ['B08', 'B11'], resolutionMeters: 10 },
  nbr: { formula: '(B08 - B12) / (B08 + B12)', inputBands: ['B08', 'B12'], resolutionMeters: 10 },
} as const;

