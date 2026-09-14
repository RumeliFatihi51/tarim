import { GeoPolygon, TimeSeriesObservation, SatelliteScene } from '../types';
import { ISatelliteProvider } from '../providers/satelliteProvider';
import { getPolygonBBox } from './geometryUtils';
import { defaultRasterProcessor } from './rasterProcessor';
import { PersistentCache } from '../persistence/cache';
import { ALGORITHM_VERSION } from './spectralIndices';

// In-memory cache for processed historical scene observations
const historicalSceneCache = new PersistentCache();
type HistoricalCacheEntry = {
  ndvi: number;
  ndwi: number;
  ndmi: number;
  validPixelRatio: number;
  cloudCover: number;
};

export function sortScenesChronologically(scenes: SatelliteScene[]): SatelliteScene[] {
  return [...scenes].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

export class TimeSeriesEngine {
  /**
   * Searches real Sentinel-2 Level-2A catalog over the past 6-12 months,
   * selects cloud-free observations, and processes real raster data for each historical scene.
   */
  async getHistoricalObservations(
    polygon: GeoPolygon,
    provider: ISatelliteProvider,
    latestMeanNdvi: number,
    latestMeanNdwi: number,
    latestMeanNdmi: number,
    latestDateStr: string,
    isDemo: boolean = false
  ): Promise<TimeSeriesObservation[]> {
    const bbox = getPolygonBBox(polygon);
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    console.log(`[TIMESERIES] Querying real Sentinel-2 catalog for past 12 months in bbox [${bbox.join(', ')}]...`);

    let scenes: SatelliteScene[] = [];
    try {
      scenes = await provider.searchScenes(
        bbox,
        {
          start: oneYearAgo.toISOString(),
          end: now.toISOString(),
        },
        20 // Max 20% cloud cover
      );
    } catch (err: any) {
      if (!isDemo) throw err;
      console.warn('[TIMESERIES] Demo historical scene search warning:', err.message);
    }

    if (!scenes || scenes.length === 0) {
      console.log('[TIMESERIES] No additional historical cloud-free scenes found in catalog.');
      return [];
    }

    // Sort chronologically ascending
    scenes = sortScenesChronologically(scenes);

    // Sample distinct observations (at least 20 days apart to capture seasonal changes)
    const sampledScenes: SatelliteScene[] = [];
    let lastTime = 0;

    for (const scene of scenes) {
      const t = new Date(scene.datetime).getTime();
      if (t - lastTime > 20 * 24 * 60 * 60 * 1000) {
        sampledScenes.push(scene);
        lastTime = t;
      }
      if (sampledScenes.length >= 5) break;
    }

    const monthsTr = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    // Process each historical scene using actual raster calculations
    const observations: TimeSeriesObservation[] = [];

    for (let i = 0; i < sampledScenes.length; i++) {
      const scene = sampledScenes[i];
      const dateObj = new Date(scene.datetime);
      const dateFormatted = `${dateObj.getDate().toString().padStart(2, '0')} ${monthsTr[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

      // Check cache for this scene + bbox
      const cacheKey = `history_${scene.id}_${bbox.map((n) => n.toFixed(3)).join('_')}_${ALGORITHM_VERSION}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      let cached = historicalSceneCache.get<HistoricalCacheEntry>(cacheKey);

      if (!cached) {
        try {
          // Process real raster for this historical scene with a timeout
          const rasterPromise = defaultRasterProcessor.processParcelRaster(scene, polygon, provider, isDemo);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Historical raster timeout')), 5000)
          );
          const result = await Promise.race([rasterPromise, timeoutPromise]);

          cached = {
            ndvi: result.indices.ndvi.mean,
            ndwi: result.indices.ndwi.mean,
            ndmi: result.indices.ndmi.mean,
            validPixelRatio: result.pixelStats.validPixelRatio,
            cloudCover: scene.cloudCoverPercent,
          };
          historicalSceneCache.set(cacheKey, cached);
        } catch (procErr: any) {
          console.warn(`[TIMESERIES] Could not process real raster for historical scene ${scene.id}: ${procErr.message}`);
          // If in LIVE mode and this scene failed, we don't invent synthetic numbers;
          // we skip to the next available scene
          continue;
        }
      }

      const soilMoistureProxy = Math.round(Math.max(10, Math.min(90, ((cached.ndmi + 0.2) / 0.6) * 100)));

      observations.push({
        date: dateFormatted,
        sceneId: scene.id,
        cloudCover: cached.cloudCover,
        validPixelRatio: cached.validPixelRatio,
        ndvi: parseFloat(cached.ndvi.toFixed(2)),
        ndwi: parseFloat(cached.ndwi.toFixed(2)),
        ndmi: parseFloat(cached.ndmi.toFixed(2)),
        soilMoistureProxy,
      });
    }

    console.log(`[TIMESERIES] Compiled ${observations.length} real historical Sentinel-2 observations.`);
    return observations;
  }
}

export const defaultTimeSeriesEngine = new TimeSeriesEngine();
