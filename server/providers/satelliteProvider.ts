import { SatelliteScene } from '../types';

export interface ISatelliteProvider {
  name: string;
  searchScenes(
    bbox: [number, number, number, number],
    dateRange?: { start?: string; end?: string },
    maxCloudCover?: number
  ): Promise<SatelliteScene[]>;
  signAssetUrl(url: string): Promise<string>;
}

/**
 * Microsoft Planetary Computer Sentinel-2 L2A STAC Provider
 * Primary provider with 10m/20m Level-2A BOA COGs and rendered preview
 */
export class PlanetaryComputerProvider implements ISatelliteProvider {
  name = 'Microsoft Planetary Computer (Copernicus Sentinel-2 L2A)';
  private stacUrl = 'https://planetarycomputer.microsoft.com/api/stac/v1/search';
  private sasSignUrl = 'https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=';

  async searchScenes(
    bbox: [number, number, number, number],
    dateRange?: { start?: string; end?: string },
    maxCloudCover: number = 25
  ): Promise<SatelliteScene[]> {
    const apiKey = process.env.PLANETARY_COMPUTER_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'TerraSat-AI-MRV/1.0',
    };
    if (apiKey) {
      headers['Ocp-Apim-Subscription-Key'] = apiKey;
    }

    // Default to last 90 days if not provided
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const start = dateRange?.start || ninetyDaysAgo.toISOString();
    const end = dateRange?.end || now.toISOString();

    const body: any = {
      collections: ['sentinel-2-l2a'],
      bbox: bbox,
      datetime: `${start}/${end}`,
      query: {
        'eo:cloud_cover': { lte: maxCloudCover },
      },
      sortby: [{ field: 'properties.datetime', direction: 'desc' }],
      limit: 10,
    };

    console.log(`[SENTINEL] Searching Planetary Computer STAC for bbox [${bbox.join(', ')}]...`);

    const response = await fetch(this.stacUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Planetary Computer STAC search failed (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data: any = await response.json();
    const features: any[] = data.features || [];

    const scenes: SatelliteScene[] = features.map((f) => {
      const p = f.properties || {};
      const cloud = typeof p['eo:cloud_cover'] === 'number' ? p['eo:cloud_cover'] : (p['s2:high_proba_clouds_percentage'] || 0);
      
      return {
        id: f.id,
        provider: 'Microsoft Planetary Computer',
        platform: p['platform'] || 'Sentinel-2B',
        collection: 'sentinel-2-l2a',
        datetime: p['datetime'] || new Date().toISOString(),
        cloudCoverPercent: parseFloat(Number(cloud).toFixed(2)),
        tileId: p['s2:mgrs_tile'] || 'T35SNC',
        bbox: f.bbox || bbox,
        assets: {
          B02: f.assets?.['B02'] ? { href: f.assets['B02'].href } : undefined,
          B03: f.assets?.['B03'] ? { href: f.assets['B03'].href } : undefined,
          B04: f.assets?.['B04'] ? { href: f.assets['B04'].href } : undefined,
          B08: f.assets?.['B08'] ? { href: f.assets['B08'].href } : undefined,
          B11: f.assets?.['B11'] ? { href: f.assets['B11'].href } : undefined,
          B12: f.assets?.['B12'] ? { href: f.assets['B12'].href } : undefined,
          SCL: f.assets?.['SCL'] ? { href: f.assets['SCL'].href } : undefined,
          visual: f.assets?.['visual'] ? { href: f.assets['visual'].href } : undefined,
          rendered_preview: f.assets?.['rendered_preview'] ? { href: f.assets['rendered_preview'].href } : undefined,
        },
      };
    });

    return scenes;
  }

  async signAssetUrl(url: string): Promise<string> {
    if (!url) return '';
    // If it is already signed or doesn't need signing
    if (url.includes('sig=') || url.includes('se=')) return url;

    try {
      const apiKey = process.env.PLANETARY_COMPUTER_API_KEY;
      const headers: Record<string, string> = { 'User-Agent': 'TerraSat-AI-MRV/1.0' };
      if (apiKey) {
        headers['Ocp-Apim-Subscription-Key'] = apiKey;
      }

      const res = await fetch(`${this.sasSignUrl}${encodeURIComponent(url)}`, { headers });
      if (!res.ok) {
        return url; // fallback to original
      }
      const data: any = await res.json();
      return data.href || url;
    } catch (e) {
      console.warn('[SENTINEL] SAS URL signing warning:', e);
      return url;
    }
  }
}

/**
 * Earth Search AWS Open Data STAC Provider (Element84)
 * Reliable secondary provider with public AWS S3 Sentinel-2 COGs
 */
export class EarthSearchProvider implements ISatelliteProvider {
  name = 'Earth Search (AWS Open Data Copernicus Sentinel-2)';
  private stacUrl = 'https://earth-search.aws.element84.com/v1/search';

  async searchScenes(
    bbox: [number, number, number, number],
    dateRange?: { start?: string; end?: string },
    maxCloudCover: number = 25
  ): Promise<SatelliteScene[]> {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const start = dateRange?.start || ninetyDaysAgo.toISOString();
    const end = dateRange?.end || now.toISOString();

    const body: any = {
      collections: ['sentinel-2-l2a'],
      bbox: bbox,
      datetime: `${start}/${end}`,
      query: {
        'eo:cloud_cover': { lte: maxCloudCover },
      },
      sortby: [{ field: 'properties.datetime', direction: 'desc' }],
      limit: 10,
    };

    console.log(`[SENTINEL] Searching Earth Search STAC for bbox [${bbox.join(', ')}]...`);

    const response = await fetch(this.stacUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Earth Search STAC search failed (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data: any = await response.json();
    const features: any[] = data.features || [];

    const scenes: SatelliteScene[] = features.map((f) => {
      const p = f.properties || {};
      const cloud = p['eo:cloud_cover'] || 0;
      const tile = p['grid:code'] || p['mgrs:tile'] || 'T35SNC';

      return {
        id: f.id,
        provider: 'Earth Search AWS',
        platform: p['platform'] || 'Sentinel-2B',
        collection: 'sentinel-2-l2a',
        datetime: p['datetime'] || new Date().toISOString(),
        cloudCoverPercent: parseFloat(Number(cloud).toFixed(2)),
        tileId: tile.startsWith('MGRS-') ? tile.replace('MGRS-', 'T') : tile,
        bbox: f.bbox || bbox,
        assets: {
          B02: f.assets?.['blue'] ? { href: f.assets['blue'].href } : undefined,
          B03: f.assets?.['green'] ? { href: f.assets['green'].href } : undefined,
          B04: f.assets?.['red'] ? { href: f.assets['red'].href } : undefined,
          B08: f.assets?.['nir'] ? { href: f.assets['nir'].href } : undefined,
          B11: f.assets?.['swir16'] ? { href: f.assets['swir16'].href } : undefined,
          SCL: f.assets?.['scl'] ? { href: f.assets['scl'].href } : undefined,
          visual: f.assets?.['visual'] ? { href: f.assets['visual'].href } : undefined,
          rendered_preview: f.assets?.['thumbnail'] ? { href: f.assets['thumbnail'].href } : undefined,
          thumbnail: f.assets?.['thumbnail'] ? { href: f.assets['thumbnail'].href } : undefined,
        },
      };
    });

    return scenes;
  }

  async signAssetUrl(url: string): Promise<string> {
    // AWS Open Data Sentinel-2 COGs are public HTTP
    return url;
  }
}

/**
 * Composite Provider: Tries Planetary Computer first, automatically falls back to Earth Search
 */
export class CompositeSatelliteProvider implements ISatelliteProvider {
  name = 'Copernicus Sentinel-2 Level-2A Multi-Provider';
  private primary: ISatelliteProvider;
  private secondary: ISatelliteProvider;

  constructor() {
    this.primary = new PlanetaryComputerProvider();
    this.secondary = new EarthSearchProvider();
  }

  async searchScenes(
    bbox: [number, number, number, number],
    dateRange?: { start?: string; end?: string },
    maxCloudCover: number = 25
  ): Promise<SatelliteScene[]> {
    try {
      const scenes = await this.primary.searchScenes(bbox, dateRange, maxCloudCover);
      if (scenes.length > 0) {
        return scenes;
      }
      console.log('[SENTINEL] Primary provider returned 0 scenes, trying fallback provider...');
    } catch (err: any) {
      console.warn('[SENTINEL] Primary provider search error, falling back:', err.message);
    }

    // Fallback to Earth Search
    return await this.secondary.searchScenes(bbox, dateRange, maxCloudCover);
  }

  async signAssetUrl(url: string): Promise<string> {
    if (url.includes('planetarycomputer') || url.includes('blob.core.windows.net')) {
      return await this.primary.signAssetUrl(url);
    }
    return await this.secondary.signAssetUrl(url);
  }
}

export const defaultSatelliteProvider = new CompositeSatelliteProvider();
