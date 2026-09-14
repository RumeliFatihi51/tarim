import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ALGORITHM_VERSION } from '../processing/spectralIndices';

export function analysisCacheKey(companyId: string, polygon: unknown, sceneId: string, mode: 'LIVE' | 'DEMO'): string {
  const canonical = JSON.stringify({ companyId, polygon, sceneId, mode, algorithmVersion: ALGORITHM_VERSION });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export class PersistentCache {
  constructor(private readonly directory = path.join(process.cwd(), 'data', 'cache')) {}
  get<T>(key: string): T | undefined {
    try {
      const record = JSON.parse(fs.readFileSync(path.join(this.directory, `${key}.json`), 'utf8')) as { expiresAt: number; value: T };
      if (record.expiresAt <= Date.now()) return undefined;
      return record.value;
    } catch { return undefined; }
  }
  set<T>(key: string, value: T, ttlMs = 24 * 60 * 60 * 1000): void {
    fs.mkdirSync(this.directory, { recursive: true });
    const target = path.join(this.directory, `${key}.json`);
    const temporary = `${target}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify({ expiresAt: Date.now() + ttlMs, algorithmVersion: ALGORITHM_VERSION, value }));
    fs.renameSync(temporary, target);
  }
}

export const analysisCache = new PersistentCache();

