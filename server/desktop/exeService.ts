import fs from 'fs';
import path from 'path';

export const WINDOWS_APP_INFO = {
  name: 'TerraSat AI Workstation', version: '3.0.0', publisher: 'TerraSat AI Engineering',
  platform: 'Windows x64', packaging: 'Electron + electron-builder (NSIS)',
  requirements: { os: 'Windows 10/11 x64', ram: 'Minimum 4 GB', disk: '350 MB free space' },
};

function readBuiltArtifact(pattern: RegExp): Buffer {
  const releaseDir = path.join(process.cwd(), 'release');
  let match: string | undefined;
  try { match = fs.readdirSync(releaseDir).find((name) => pattern.test(name)); } catch { /* unavailable */ }
  if (!match) throw new Error('Desktop build artifact unavailable. Run npm run build:win on Windows first.');
  return fs.readFileSync(path.join(releaseDir, match));
}

export function generateWindowsExeBuffer(): Buffer {
  return readBuiltArtifact(/Setup.*\.exe$|\.exe$/i);
}

export function generatePortableWindowsZipBuffer(): Buffer {
  return readBuiltArtifact(/portable.*\.zip$|\.zip$/i);
}
