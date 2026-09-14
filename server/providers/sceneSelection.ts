import type { SatelliteScene } from '../types';
import { AppError } from '../errors';

const REQUIRED_ASSETS = ['B02', 'B03', 'B04', 'B08', 'B11', 'B12', 'SCL'] as const;

export function missingRequiredAssets(scene: SatelliteScene): string[] {
  return REQUIRED_ASSETS.filter((band) => !scene.assets[band]?.href);
}

export function validateSceneAssets(scene: SatelliteScene): void {
  const missing = missingRequiredAssets(scene);
  if (missing.length) throw new AppError('MISSING_SATELLITE_ASSET', `Scene ${scene.id} is missing required assets: ${missing.join(', ')}`, 422, { sceneId: scene.id, missing });
}

export function rankScenes(scenes: SatelliteScene[]): SatelliteScene[] {
  return [...scenes]
    .filter((scene) => missingRequiredAssets(scene).length === 0)
    .sort((a, b) => {
      const qa = a.quality;
      const qb = b.quality;
      const scoreA = qa ? qa.validPixelRatio * 100 - qa.cloudRatio * 50 - qa.shadowRatio * 30 - qa.noDataRatio * 40 : 100 - a.cloudCoverPercent;
      const scoreB = qb ? qb.validPixelRatio * 100 - qb.cloudRatio * 50 - qb.shadowRatio * 30 - qb.noDataRatio * 40 : 100 - b.cloudCoverPercent;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });
}

export function selectBestScene(scenes: SatelliteScene[]): SatelliteScene {
  const ranked = rankScenes(scenes);
  if (!ranked.length) throw new AppError('NO_SUITABLE_SCENE', 'No scene contains all required Sentinel-2 assets', 422);
  return ranked[0];
}

