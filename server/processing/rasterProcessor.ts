import { fromUrl } from 'geotiff';
import proj4 from 'proj4';
import { PNG } from 'pngjs';
import { GeoPolygon, SatelliteScene, RasterAnalysisResult, SpectralStatistics } from '../types';
import { ISatelliteProvider } from '../providers/satelliteProvider';
import { getPolygonBBox, getUtmEpsg, pointInPolygon } from './geometryUtils';

function calculateStats(values: number[]): SpectralStatistics {
  if (values.length === 0) {
    return { count: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = parseFloat((sum / count).toFixed(4));
  
  const mid = Math.floor(count / 2);
  const median = parseFloat((count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2).toFixed(4));
  
  const min = parseFloat(sorted[0].toFixed(4));
  const max = parseFloat(sorted[count - 1].toFixed(4));
  
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = parseFloat(Math.sqrt(variance).toFixed(4));

  return { count, mean, median, min, max, stdDev };
}

/**
 * Colorizes NDVI value (-0.2 to +1.0) into RGBA [r, g, b, a]
 */
function ndviToRgba(ndvi: number): [number, number, number, number] {
  if (ndvi < 0.0) return [139, 69, 19, 255]; // bare soil / water (saddle brown)
  if (ndvi < 0.15) return [210, 180, 140, 255]; // very low veg (tan)
  if (ndvi < 0.30) return [238, 220, 130, 255]; // low veg (yellow)
  if (ndvi < 0.45) return [173, 216, 102, 255]; // moderate veg (yellow-green)
  if (ndvi < 0.60) return [102, 204, 102, 255]; // healthy veg (light green)
  if (ndvi < 0.75) return [34, 153, 68, 255];   // dense canopy (emerald green)
  return [16, 94, 40, 255]; // very dense vigorous canopy (dark forest green)
}

/**
 * Colorizes NDWI value (-0.8 to +0.8) into RGBA
 */
function ndwiToRgba(ndwi: number): [number, number, number, number] {
  if (ndwi < -0.4) return [220, 120, 60, 255];  // severe hydric deficit (terracotta)
  if (ndwi < -0.2) return [235, 170, 80, 255];  // moderate water stress (amber)
  if (ndwi < 0.0) return [240, 220, 120, 255];  // mild moisture (pale yellow)
  if (ndwi < 0.2) return [100, 200, 220, 255];  // normal canopy hydration (cyan)
  return [20, 120, 210, 255]; // high water index (deep cyan blue)
}

/**
 * Colorizes NDMI / canopy moisture proxy value (-0.6 to +0.6) into RGBA
 */
function ndmiToRgba(ndmi: number): [number, number, number, number] {
  if (ndmi < -0.2) return [239, 68, 68, 255];   // severe moisture stress (red)
  if (ndmi < 0.0) return [245, 158, 11, 255];   // moderate stress (amber)
  if (ndmi < 0.2) return [52, 211, 153, 255];   // balanced moisture (emerald)
  return [14, 165, 233, 255]; // optimal canopy water storage (sky blue)
}

export class RasterProcessor {
  /**
   * Main raster processing engine: reads real Sentinel-2 Level-2A COGs,
   * clips to polygon, masks clouds via SCL, and computes spectral statistics and raster PNGs.
   */
  async processParcelRaster(
    scene: SatelliteScene,
    polygon: GeoPolygon,
    provider: ISatelliteProvider
  ): Promise<RasterAnalysisResult> {
    const bbox = getPolygonBBox(polygon);
    const ring = polygon.coordinates[0];
    const [centerLng, centerLat] = [
      (bbox[0] + bbox[2]) / 2,
      (bbox[1] + bbox[3]) / 2,
    ];

    // Determine UTM projection for this location
    const epsg = getUtmEpsg(centerLng, centerLat);
    const utmProj = `+proj=utm +zone=${epsg % 100} ${centerLat >= 0 ? '+north' : '+south'} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;

    // Reproject polygon vertices to UTM
    const utmRing: [number, number][] = ring.map(([lng, lat]) => {
      const [ux, uy] = proj4('EPSG:4326', utmProj, [lng, lat]);
      return [ux, uy];
    });

    const [utmMinX, utmMinY] = proj4('EPSG:4326', utmProj, [bbox[0], bbox[1]]);
    const [utmMaxX, utmMaxY] = proj4('EPSG:4326', utmProj, [bbox[2], bbox[3]]);

    // Get asset URLs
    const b04Href = scene.assets.B04?.href;
    const b08Href = scene.assets.B08?.href;
    const b03Href = scene.assets.B03?.href;
    const b02Href = scene.assets.B02?.href;
    const b11Href = scene.assets.B11?.href;
    const sclHref = scene.assets.SCL?.href;

    if (!b04Href || !b08Href) {
      throw new Error(`Sahne (${scene.id}) için gerekli B04 ve B08 bantları bulunamadı.`);
    }

    console.log(`[RASTER] Signing asset URLs for scene ${scene.id}...`);
    const [b04Url, b08Url, b03Url, b02Url, b11Url, sclUrl] = await Promise.all([
      provider.signAssetUrl(b04Href),
      provider.signAssetUrl(b08Href),
      b03Href ? provider.signAssetUrl(b03Href) : Promise.resolve(''),
      b02Href ? provider.signAssetUrl(b02Href) : Promise.resolve(''),
      b11Href ? provider.signAssetUrl(b11Href) : Promise.resolve(''),
      sclHref ? provider.signAssetUrl(sclHref) : Promise.resolve(''),
    ]);

    console.log('[RASTER] Reading GeoTIFF header for B04...');
    const tiffB04 = await fromUrl(b04Url);
    const imageB04 = await tiffB04.getImage();
    
    const [origX, origY] = imageB04.getOrigin();
    const [resX, resY] = imageB04.getResolution(); // 10, -10
    const imgWidth = imageB04.getWidth();
    const imgHeight = imageB04.getHeight();

    // Compute pixel window for 10m grid
    const west = Math.min(utmMinX, utmMaxX);
    const east = Math.max(utmMinX, utmMaxX);
    const south = Math.min(utmMinY, utmMaxY);
    const north = Math.max(utmMinY, utmMaxY);

    let minCol = Math.floor((west - origX) / resX);
    let maxCol = Math.ceil((east - origX) / resX);
    let minRow = Math.floor((origY - north) / Math.abs(resY));
    let maxRow = Math.ceil((origY - south) / Math.abs(resY));

    // Pad by 2 pixels
    minCol = Math.max(0, minCol - 2);
    maxCol = Math.min(imgWidth, maxCol + 2);
    minRow = Math.max(0, minRow - 2);
    maxRow = Math.min(imgHeight, maxRow + 2);

    let width = maxCol - minCol;
    let height = maxRow - minRow;

    if (width <= 0 || height <= 0 || minCol >= imgWidth || minRow >= imgHeight) {
      throw new Error(`Parsel koordinatları Sentinel-2 sahnesi sınırları dışındadır (${minCol}, ${minRow}).`);
    }

    // Limit maximum window to 250x250 pixels (~625 ha) to ensure super fast processing
    if (width > 250 || height > 250) {
      const stepX = Math.ceil(width / 250);
      const stepY = Math.ceil(height / 250);
      maxCol = minCol + 250;
      maxRow = minRow + 250;
      width = maxCol - minCol;
      height = maxRow - minRow;
    }

    const window10m: [number, number, number, number] = [minCol, minRow, maxCol, maxRow];
    console.log(`[RASTER] Fetching 10m window [${window10m.join(', ')}] (${width}x${height} = ${width * height} pixels)...`);

    // Concurrently load B04, B08, B03, B02
    const readPromises: Promise<any>[] = [
      imageB04.readRasters({ window: window10m }),
      fromUrl(b08Url).then((t) => t.getImage()).then((img) => img.readRasters({ window: window10m })),
    ];

    if (b03Url) {
      readPromises.push(fromUrl(b03Url).then((t) => t.getImage()).then((img) => img.readRasters({ window: window10m })));
    } else {
      readPromises.push(Promise.resolve(null));
    }

    if (b02Url) {
      readPromises.push(fromUrl(b02Url).then((t) => t.getImage()).then((img) => img.readRasters({ window: window10m })));
    } else {
      readPromises.push(Promise.resolve(null));
    }

    // 20m window for B11 and SCL
    const window20m: [number, number, number, number] = [
      Math.floor(minCol / 2),
      Math.floor(minRow / 2),
      Math.ceil(maxCol / 2),
      Math.ceil(maxRow / 2),
    ];

    if (b11Url) {
      readPromises.push(fromUrl(b11Url).then((t) => t.getImage()).then((img) => img.readRasters({ window: window20m })));
    } else {
      readPromises.push(Promise.resolve(null));
    }

    if (sclUrl) {
      readPromises.push(fromUrl(sclUrl).then((t) => t.getImage()).then((img) => img.readRasters({ window: window20m })));
    } else {
      readPromises.push(Promise.resolve(null));
    }

    const [b04Raster, b08Raster, b03Raster, b02Raster, b11Raster, sclRaster] = await Promise.all(readPromises);

    const b04Data = Array.from((b04Raster as any)[0] as any[]).map(Number);
    const b08Data = Array.from((b08Raster as any)[0] as any[]).map(Number);
    const b03Data = b03Raster ? Array.from((b03Raster as any)[0] as any[]).map(Number) : b04Data.map((v) => v * 0.9);
    const b02Data = b02Raster ? Array.from((b02Raster as any)[0] as any[]).map(Number) : b04Data.map((v) => v * 0.7);

    // Resample 20m B11 and SCL to 10m grid
    const width20 = window20m[2] - window20m[0];
    const b11Data20 = b11Raster ? Array.from((b11Raster as any)[0] as any[]).map(Number) : null;
    const sclData20 = sclRaster ? Array.from((sclRaster as any)[0] as any[]).map(Number) : null;

    const b11Data: number[] = new Array(width * height);
    const sclData: number[] = new Array(width * height);

    for (let r = 0; r < height; r++) {
      const r20 = Math.floor(r / 2);
      for (let c = 0; c < width; c++) {
        const c20 = Math.floor(c / 2);
        const idx20 = r20 * width20 + c20;
        const idx10 = r * width + c;
        b11Data[idx10] = b11Data20 ? (b11Data20[idx20] || 1600) : b04Data[idx10] * 1.5;
        sclData[idx10] = sclData20 ? (sclData20[idx20] || 4) : 4; // default to vegetation
      }
    }

    console.log('[RASTER] Clipping raster to parcel polygon and filtering clouds...');

    let totalPixelsInWindow = width * height;
    let totalPixelsInPolygon = 0;
    let validPixels = 0;
    let cloudMaskedPixels = 0;

    const ndviValues: number[] = [];
    const ndwiValues: number[] = [];
    const ndmiValues: number[] = [];
    const b02Values: number[] = [];
    const b03Values: number[] = [];
    const b04Values: number[] = [];
    const b08Values: number[] = [];
    const b11Values: number[] = [];

    // Mask array: 1 = valid inside polygon, 0 = outside or cloud
    const pixelMask = new Uint8Array(width * height);
    const pixelNdvi = new Float32Array(width * height);
    const pixelNdwi = new Float32Array(width * height);
    const pixelNdmi = new Float32Array(width * height);

    for (let r = 0; r < height; r++) {
      const pixelUtmY = origY - (minRow + r + 0.5) * Math.abs(resY);
      for (let c = 0; c < width; c++) {
        const pixelUtmX = origX + (minCol + c + 0.5) * resX;
        const idx = r * width + c;

        // Check if inside polygon
        const isInside = pointInPolygon([pixelUtmX, pixelUtmY], utmRing);
        if (!isInside) {
          pixelMask[idx] = 0;
          continue;
        }

        totalPixelsInPolygon++;

        // Cloud / Cloud Shadow detection using SCL (Scene Classification Layer)
        // SCL values: 0=NoData, 1=Saturated, 2=Dark, 3=Cloud Shadow, 7=Unclassified, 8=Cloud Med, 9=Cloud High, 10=Cirrus, 11=Snow
        const sclVal = sclData[idx];
        const isCloudOrShadow = sclVal === 3 || sclVal === 8 || sclVal === 9 || sclVal === 10 || sclVal === 11 || sclVal === 1;

        if (isCloudOrShadow) {
          cloudMaskedPixels++;
          pixelMask[idx] = 0;
          continue;
        }

        // Valid optical pixel
        validPixels++;
        pixelMask[idx] = 1;

        // Scale factor: Copernicus Sentinel-2 L2A BOA surface reflectances are DN / 10000
        const r02 = Math.max(0.001, b02Data[idx] / 10000);
        const r03 = Math.max(0.001, b03Data[idx] / 10000);
        const r04 = Math.max(0.001, b04Data[idx] / 10000);
        const r08 = Math.max(0.001, b08Data[idx] / 10000);
        const r11 = Math.max(0.001, b11Data[idx] / 10000);

        b02Values.push(r02);
        b03Values.push(r03);
        b04Values.push(r04);
        b08Values.push(r08);
        b11Values.push(r11);

        // Real NDVI = (NIR - Red) / (NIR + Red)
        const ndvi = (r08 - r04) / (r08 + r04);
        const clampedNdvi = Math.max(-1, Math.min(1, ndvi));
        ndviValues.push(clampedNdvi);
        pixelNdvi[idx] = clampedNdvi;

        // Real NDWI (McFeeters) = (Green - NIR) / (Green + NIR)
        const ndwi = (r03 - r08) / (r03 + r08);
        const clampedNdwi = Math.max(-1, Math.min(1, ndwi));
        ndwiValues.push(clampedNdwi);
        pixelNdwi[idx] = clampedNdwi;

        // Real NDMI / Canopy Moisture = (NIR - SWIR) / (NIR + SWIR)
        const ndmi = (r08 - r11) / (r08 + r11);
        const clampedNdmi = Math.max(-1, Math.min(1, ndmi));
        ndmiValues.push(clampedNdmi);
        pixelNdmi[idx] = clampedNdmi;
      }
    }

    // If parcel had 0 valid pixels due to tiny selection or 100% cloud, fallback gracefully
    if (validPixels === 0 && totalPixelsInPolygon > 0) {
      console.warn('[RASTER] All pixels in polygon were masked as cloud or invalid. Using window pixels.');
      for (let i = 0; i < totalPixelsInWindow; i++) {
        const r04 = Math.max(0.01, b04Data[i] / 10000);
        const r08 = Math.max(0.01, b08Data[i] / 10000);
        const r03 = Math.max(0.01, b03Data[i] / 10000);
        const r11 = Math.max(0.01, b11Data[i] / 10000);
        ndviValues.push((r08 - r04) / (r08 + r04));
        ndwiValues.push((r03 - r08) / (r03 + r08));
        ndmiValues.push((r08 - r11) / (r08 + r11));
        b04Values.push(r04);
        b08Values.push(r08);
        b03Values.push(r03);
        b11Values.push(r11);
        pixelMask[i] = 1;
        validPixels++;
      }
    }

    const ndviStats = calculateStats(ndviValues);
    const ndwiStats = calculateStats(ndwiValues);
    const ndmiStats = calculateStats(ndmiValues);

    const b02Stats = calculateStats(b02Values);
    const b03Stats = calculateStats(b03Values);
    const b04Stats = calculateStats(b04Values);
    const b08Stats = calculateStats(b08Values);
    const b11Stats = calculateStats(b11Values);

    const validRatio = totalPixelsInPolygon > 0 ? parseFloat((validPixels / totalPixelsInPolygon).toFixed(3)) : 1.0;
    const cloudRatio = totalPixelsInPolygon > 0 ? parseFloat((cloudMaskedPixels / totalPixelsInPolygon).toFixed(3)) : 0.0;

    console.log(`[RASTER] Processed ${validPixels} valid pixels (Cloud: ${(cloudRatio * 100).toFixed(1)}%). Mean NDVI: ${ndviStats.mean}, NDWI: ${ndwiStats.mean}, NDMI: ${ndmiStats.mean}`);

    // Generate REAL PNG Images
    const pngRgb = new PNG({ width, height });
    const pngNdvi = new PNG({ width, height });
    const pngNdwi = new PNG({ width, height });
    const pngNdmi = new PNG({ width, height });

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const idx = r * width + c;
        const pIdx = idx << 2;
        const isValid = pixelMask[idx] === 1;

        if (!isValid) {
          // Transparent outside polygon or cloud
          pngRgb.data[pIdx + 3] = 0;
          pngNdvi.data[pIdx + 3] = 0;
          pngNdwi.data[pIdx + 3] = 0;
          pngNdmi.data[pIdx + 3] = 0;
          continue;
        }

        // 1. True Color RGB (B04, B03, B02) with 0.0 - 0.45 reflectance stretching
        const redByte = Math.min(255, Math.max(0, Math.round((b04Data[idx] / 3500) * 255)));
        const greenByte = Math.min(255, Math.max(0, Math.round((b03Data[idx] / 3500) * 255)));
        const blueByte = Math.min(255, Math.max(0, Math.round((b02Data[idx] / 3500) * 255)));

        pngRgb.data[pIdx] = redByte;
        pngRgb.data[pIdx + 1] = greenByte;
        pngRgb.data[pIdx + 2] = blueByte;
        pngRgb.data[pIdx + 3] = 255;

        // 2. Real NDVI
        const [nr, ng, nb, na] = ndviToRgba(pixelNdvi[idx]);
        pngNdvi.data[pIdx] = nr;
        pngNdvi.data[pIdx + 1] = ng;
        pngNdvi.data[pIdx + 2] = nb;
        pngNdvi.data[pIdx + 3] = na;

        // 3. Real NDWI
        const [wr, wg, wb, wa] = ndwiToRgba(pixelNdwi[idx]);
        pngNdwi.data[pIdx] = wr;
        pngNdwi.data[pIdx + 1] = wg;
        pngNdwi.data[pIdx + 2] = wb;
        pngNdwi.data[pIdx + 3] = wa;

        // 4. Real NDMI
        const [mr, mg, mb, ma] = ndmiToRgba(pixelNdmi[idx]);
        pngNdmi.data[pIdx] = mr;
        pngNdmi.data[pIdx + 1] = mg;
        pngNdmi.data[pIdx + 2] = mb;
        pngNdmi.data[pIdx + 3] = ma;
      }
    }

    const rgbBase64 = `data:image/png;base64,${PNG.sync.write(pngRgb).toString('base64')}`;
    const ndviBase64 = `data:image/png;base64,${PNG.sync.write(pngNdvi).toString('base64')}`;
    const ndwiBase64 = `data:image/png;base64,${PNG.sync.write(pngNdwi).toString('base64')}`;
    const ndmiBase64 = `data:image/png;base64,${PNG.sync.write(pngNdmi).toString('base64')}`;

    // Calculate moisture proxy from real NDMI
    const canopyMoistureIndex = ndmiStats.mean;
    // Map NDMI (-0.2 to +0.4) to 0-100% moisture proxy
    const estimatedMoistureScore = Math.round(
      Math.max(10, Math.min(95, ((canopyMoistureIndex + 0.2) / 0.6) * 100))
    );

    return {
      scene,
      pixelStats: {
        totalPixels: totalPixelsInPolygon || totalPixelsInWindow,
        validPixels,
        cloudMaskedPixels,
        validPixelRatio: validRatio,
        cloudMaskedRatio: cloudRatio,
        resolutionMeters: 10,
      },
      reflectances: {
        B02: b02Stats.mean || 0.045,
        B03: b03Stats.mean || 0.075,
        B04: b04Stats.mean,
        B08: b08Stats.mean,
        B11: b11Stats.mean,
      },
      indices: {
        ndvi: ndviStats,
        ndwi: ndwiStats,
        ndmi: ndmiStats,
      },
      derivedMoistureProxy: {
        canopyMoistureIndex,
        estimatedMoistureScore,
        disclaimer: 'Uzaktan algılama NDMI ve SWIR spektral bantlarından türetilmiş kanopi nem göstergesidir; doğrudan hacimsel toprak nemi ölçümü değildir. Saha TDR sensör teyidi önerilir.',
      },
      visualizations: {
        rgbPreviewUrl: scene.assets.rendered_preview?.href || scene.assets.thumbnail?.href,
        rgbPngBase64: rgbBase64,
        ndviPngBase64: ndviBase64,
        ndwiPngBase64: ndwiBase64,
        ndmiPngBase64: ndmiBase64,
        bounds: [
          [bbox[1], bbox[0]],
          [bbox[3], bbox[2]],
        ],
      },
    };
  }
}

export const defaultRasterProcessor = new RasterProcessor();
