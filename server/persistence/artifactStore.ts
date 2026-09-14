import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';

export interface StoredArtifact { storageKey: string; sha256: string; sizeBytes: number }

export class LocalArtifactStore {
  async put(storageKey: string, content: Buffer): Promise<StoredArtifact> {
    if (!/^[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]+$/.test(storageKey) || storageKey.includes('..')) throw new Error('Invalid artifact storage key');
    const root = path.resolve(config.STORAGE_DIR);
    const target = path.resolve(root, storageKey);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Artifact path escapes storage root');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, { flag: 'wx' });
    return { storageKey, sha256: crypto.createHash('sha256').update(content).digest('hex'), sizeBytes: content.byteLength };
  }
  async get(storageKey: string): Promise<Buffer> {
    const root = path.resolve(config.STORAGE_DIR);
    const target = path.resolve(root, storageKey);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Artifact path escapes storage root');
    return fs.readFile(target);
  }
}

export const artifactStore = new LocalArtifactStore();
