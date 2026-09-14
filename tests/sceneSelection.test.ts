import { describe, expect, it } from 'vitest';
import { selectBestScene, validateSceneAssets } from '../server/providers/sceneSelection';
import type { SatelliteScene } from '../server/types';

const scene = (id: string, cloud: number, datetime: string, complete = true): SatelliteScene => ({
  id, provider: 'test', platform: 'Sentinel-2A', collection: 'sentinel-2-l2a', datetime, cloudCoverPercent: cloud,
  tileId: 'T35', bbox: [0, 0, 1, 1], assets: complete ? Object.fromEntries(['B02','B03','B04','B08','B11','B12','SCL'].map((b) => [b, { href: `https://example.test/${b}` }])) : {},
});

describe('scene selection', () => {
  it('selects lowest-cloud complete scene and uses date as tie-breaker', () => {
    expect(selectBestScene([scene('new-cloudy', 20, '2026-01-02'), scene('clear', 2, '2026-01-01')]).id).toBe('clear');
  });
  it('rejects missing required assets', () => expect(() => validateSceneAssets(scene('bad', 1, '2026-01-01', false))).toThrow(/missing required assets/));
});

