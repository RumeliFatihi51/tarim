import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  STORAGE_DIR: z.string().default('./data/artifacts'),
  SATELLITE_PROVIDER: z.enum(['planetary_computer', 'earth_search', 'composite']).default('composite'),
  PLANETARY_COMPUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  EXTERNAL_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
  MAX_POLYGON_AREA_HA: z.coerce.number().positive().default(10000),
  MAX_POLYGON_VERTICES: z.coerce.number().int().min(4).max(100000).default(5000),
  DESKTOP_MODE: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

if (parsed.data.NODE_ENV === 'production' && !parsed.data.DESKTOP_MODE) {
  if (!parsed.data.DATABASE_URL) throw new Error('DATABASE_URL is required in production');
  if (!parsed.data.JWT_SECRET) throw new Error('JWT_SECRET (at least 32 characters) is required in production');
}

export const config = Object.freeze(parsed.data);
