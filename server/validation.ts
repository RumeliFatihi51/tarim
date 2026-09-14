import { z } from 'zod';
import { calculatePolygonAreaHa } from './processing/geometryUtils';
import { config } from './config';
import { AppError } from './errors';
import type { GeoPolygon } from './types';

const coordinate = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);

function hasSelfIntersection(ring: [number, number][]): boolean {
  const cross = (a: [number, number], b: [number, number], c: [number, number]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  for (let i = 0; i < ring.length - 1; i++) {
    for (let j = i + 1; j < ring.length - 1; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === ring.length - 2)) continue;
      const [a, b, c, d] = [ring[i], ring[i + 1], ring[j], ring[j + 1]];
      if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return true;
    }
  }
  return false;
}

export const polygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(coordinate).min(4)).min(1).max(1),
}).superRefine((polygon, ctx) => {
  const ring = polygon.coordinates[0];
  if (ring.length > config.MAX_POLYGON_VERTICES) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Polygon exceeds ${config.MAX_POLYGON_VERTICES} vertices` });
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Polygon ring must be closed' });
  }
  if (hasSelfIntersection(ring as [number, number][])) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Polygon must not self-intersect' });
});

export const analysisRequestSchema = z.object({
  parcelId: z.string().trim().min(1).max(100).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  crop: z.string().trim().min(1).max(100).optional(),
  location: z.string().trim().min(1).max(300).optional(),
  mode: z.enum(['LIVE', 'DEMO']).default('LIVE'),
  polygon: polygonSchema,
  forceFresh: z.boolean().default(false),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export function validateAnalysisRequest(input: unknown): AnalysisRequest {
  const parsed = analysisRequestSchema.safeParse(input);
  if (!parsed.success) throw new AppError('VALIDATION_ERROR', 'Invalid analysis request', 400, parsed.error.flatten());
  const areaHa = calculatePolygonAreaHa(parsed.data.polygon as GeoPolygon);
  if (areaHa <= 0 || areaHa > config.MAX_POLYGON_AREA_HA) {
    throw new AppError('VALIDATION_ERROR', `Polygon area must be between 0 and ${config.MAX_POLYGON_AREA_HA} ha`, 400);
  }
  return parsed.data as AnalysisRequest;
}
