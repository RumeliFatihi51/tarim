import { FullAnalysisPayload } from '../types';
import { INITIAL_PARCELS } from '../data/parcels';

/**
 * Sample / Demo fixture clearly separated from the live Sentinel-2 pipeline
 */
export function getDemoAnalysisPayload(parcelId?: string): FullAnalysisPayload {
  const parcel = INITIAL_PARCELS.find((p) => p.id === parcelId) || INITIAL_PARCELS[0];

  return {
    parcel,
    satelliteMetadata: {
      sensor: 'Copernicus Sentinel-2B MSI (Demo Mode)',
      sceneId: 'S2B_MSIL2A_DEMO_T35SNC_SAMPLE',
      tileId: 'T35SNC',
      acquisitionDate: parcel.lastObservation,
      cloudCoveragePercent: 4.2,
      cloudScreeningPassed: true,
      spatialResolutionMeters: 10,
      processingLevel: 'L2A (BOA Surface Reflectance - Demo)',
      bandsUsed: ['B02 (Blue)', 'B03 (Green)', 'B04 (Red)', 'B08 (NIR)', 'B11 (SWIR)'],
      dataSource: 'TerraSat Demo Arşivi (Sentinel-2 Referans)',
    },
    spectralBands: {
      B02: 0.042,
      B03: 0.078,
      B04: 0.055,
      B08: 0.380,
      B11: 0.165,
    },
    calculatedIndices: {
      ndvi: parcel.ndvi,
      ndviTrend: -0.01,
      ndwi: parcel.ndwi,
      ndwiTrend: -0.03,
      ndmi: 0.18,
      soilMoisture: parcel.soilMoisture,
      waterStress: parcel.waterStress,
      plantHealth: parcel.plantHealth,
      carbonIndicator: parcel.carbonIndicator,
    },
    pixelStats: {
      totalPixels: 480,
      validPixels: 462,
      cloudMaskedPixels: 18,
      validPixelRatio: 0.962,
      cloudMaskedRatio: 0.038,
      resolutionMeters: 10,
    },
    spectralStats: {
      ndvi: { mean: parcel.ndvi, median: parcel.ndvi + 0.01, min: 0.42, max: 0.81, stdDev: 0.07, count: 462 },
      ndwi: { mean: parcel.ndwi, median: parcel.ndwi, min: 0.08, max: 0.34, stdDev: 0.05, count: 462 },
      ndmi: { mean: 0.18, median: 0.19, min: 0.05, max: 0.32, stdDev: 0.06, count: 462 },
    },
    historicalObservations: parcel.historicalData,
    aiAssessment: {
      overallStatus: 'Demo Örnek Değerlendirmesi (Canlı Analiz İçin Pipeline Başlatın)',
      summary: `${parcel.name} için demo veri seti görüntülenmektedir. Bu ön izleme, arayüz bileşenlerini test etmek amacıyla hazırlanmış referans değerler içermektedir.`,
      keyFindings: [
        'Demo veri seti: Gerçek Sentinel-2 analizi için "Analizi Başlat" butonuna tıklayınız.',
        `Ortalama NDVI ${parcel.ndvi} ile tipik Ege bölgesi ${parcel.crop} örtüsünü yansıtır.`,
      ],
      risks: [
        {
          title: 'Demo Modu Uyarısı',
          severity: 'low',
          explanation: 'Görüntülenen veriler gerçek zamanlı uydu taramasından değil, referans arşivden gelmektedir.',
          evidence: 'Demo fixture',
        },
      ],
      positiveSignals: ['Referans spektral değerler normal fenolojik döngüdedir.'],
      possibleDrivers: ['Mevsimsel fenoloji ve sulama rejimi.'],
      recommendedActions: ['Canlı uydu analizini tetikleyerek en güncel sahneyi sorgulayın.'],
      verificationNeeded: ['Fiziksel TDR toprak nemi teyidi tavsiye edilir.'],
      mrvStatus: {
        measurement: ['Demo spektral bantlar: B02, B03, B04, B08, B11'],
        reporting: ['CSRD demo şablonu'],
        verification: ['Saha teyit protokolü'],
      },
      confidenceLevel: 'Medium',
      confidenceJustification: 'Demo referans verisi.',
      limitations: ['Demo modunda canlı STAC sorgusu yapılmaz.'],
      generatedAt: parcel.lastObservation,
      modelUsed: 'TerraSat Demo Simülatörü',
    },
    isDemoMode: true,
    dataSourceLabel: 'Demo Referans Verisi (Sentetik/Örnek)',
  };
}
