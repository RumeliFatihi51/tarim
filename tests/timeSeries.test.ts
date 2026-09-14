import { describe, expect, it } from 'vitest';
import { sortScenesChronologically } from '../server/processing/timeSeries';
import type { SatelliteScene } from '../server/types';

describe('historical ordering', () => {
  it('is deterministic oldest to newest', () => {
    const base = { provider: 'x', platform: 'Sentinel-2A', collection: 'x', cloudCoverPercent: 0, tileId: 'x', bbox: [0,0,1,1], assets: {} };
    const scenes = [{ ...base, id: 'b', datetime: '2026-02-01' }, { ...base, id: 'a', datetime: '2026-01-01' }] as SatelliteScene[];
    expect(sortScenesChronologically(scenes).map((s) => s.id)).toEqual(['a', 'b']);
  });
});

