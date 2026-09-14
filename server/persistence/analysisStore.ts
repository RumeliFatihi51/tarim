import fs from 'fs';
import path from 'path';
import type { FullAnalysisPayload } from '../types';

export class AnalysisStore {
  constructor(private readonly directory = path.join(process.cwd(), 'data', 'analyses')) {}
  save(companyId: string, payload: FullAnalysisPayload): void {
    const dir = path.join(this.directory, companyId);
    fs.mkdirSync(dir, { recursive: true });
    const target = path.join(dir, `${payload.parcel.id}.json`);
    const temporary = `${target}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(payload));
    fs.renameSync(temporary, target);
  }
  get(companyId: string, parcelId: string): FullAnalysisPayload | undefined {
    try { return JSON.parse(fs.readFileSync(path.join(this.directory, companyId, `${parcelId}.json`), 'utf8')) as FullAnalysisPayload; }
    catch { return undefined; }
  }
  list(companyId: string): FullAnalysisPayload[] {
    try { return fs.readdirSync(path.join(this.directory, companyId)).filter((name) => name.endsWith('.json')).map((name) => JSON.parse(fs.readFileSync(path.join(this.directory, companyId, name), 'utf8')) as FullAnalysisPayload); }
    catch { return []; }
  }
}
export const analysisStore = new AnalysisStore();

