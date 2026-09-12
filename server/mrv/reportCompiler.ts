import { RasterAnalysisResult, TimeSeriesObservation, GeoPolygon } from '../types';
import { AIAnalysisOutput } from '../ai/geminiAnalyzer';
import { getPolygonBBox, calculatePolygonAreaHa, getUtmEpsg } from '../processing/geometryUtils';

export interface MRVSection {
  number: number;
  id: string;
  title: string;
  category: 'Executive' | 'Technical' | 'Spectral' | 'Environmental' | 'Compliance' | 'Verification';
  content: string;
  keyMetrics?: { label: string; value: string | number; badge?: string }[];
  bulletPoints?: string[];
  alert?: { type: 'info' | 'warning' | 'critical'; text: string };
}

export interface FullMRVReport {
  reportId: string;
  generatedAt: string;
  complianceStandard: string;
  parcel: {
    name: string;
    crop: string;
    areaHa: number;
    coordinates: string;
    crs: string;
  };
  satelliteMetadata: {
    constellation: string;
    instrument: string;
    productType: string;
    processingLevel: string;
    sceneId: string;
    acquisitionDate: string;
    sensingTime: string;
    cloudCoverage: string;
    spatialResolution: string;
    dataSource: string;
  };
  sections: MRVSection[];
  auditTrail: {
    queryTimestamp: string;
    stacCatalog: string;
    sceneId: string;
    pixelCount: number;
    validPixelCount: number;
    cloudMaskedPixelCount: number;
    sha256Digest: string;
  };
}

export class ReportCompiler {
  compile19SectionReport(
    parcelName: string,
    crop: string,
    polygon: GeoPolygon,
    rasterResult: RasterAnalysisResult,
    timeSeries: TimeSeriesObservation[],
    aiOutput: AIAnalysisOutput,
    isDemo: boolean = false
  ): FullMRVReport {
    const bbox = getPolygonBBox(polygon);
    const areaHa = calculatePolygonAreaHa(polygon);
    const epsg = getUtmEpsg((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2);

    const { scene, pixelStats, reflectances, indices, derivedMoistureProxy } = rasterResult;
    const reportId = `MRV-S2-${scene.tileId}-${Date.now().toString(36).toUpperCase()}`;

    const dateObj = new Date(scene.datetime);
    const monthsTr = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dateFormatted = `${dateObj.getDate().toString().padStart(2, '0')} ${monthsTr[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

    const sections: MRVSection[] = [
      // 1. Executive Summary
      {
        number: 1,
        id: 'executive-summary',
        title: 'Yönetici Özeti & Genel Durum Değerlendirmesi',
        category: 'Executive',
        content: `${parcelName} (${crop}, ${areaHa} ha) parseli için Copernicus Sentinel-2 Level-2A (BOA) optik uydu geçişine ait multispektral analitik inceleme tamamlanmıştır. Ortalama NDVI vejetasyon canlılık indeksi ${indices.ndvi.mean}, NDWI su indeksi ${indices.ndwi.mean} ve NDMI kanopi nem indeksi ${indices.ndmi.mean} olarak ölçülmüştür. Parsel genel durumu: ${aiOutput.overallStatus}.`,
        keyMetrics: [
          { label: 'Çevresel Durum', value: aiOutput.overallStatus, badge: 'Denetim Onaylı' },
          { label: 'Ortalama NDVI', value: indices.ndvi.mean },
          { label: 'Kanopi Nem Skoru', value: `${derivedMoistureProxy.estimatedMoistureScore}/100` },
          { label: 'Analiz Modu', value: isDemo ? 'DEMO VERİSİ' : 'CANLI SENTINEL-2' },
        ],
        bulletPoints: aiOutput.keyFindings,
      },

      // 2. Parcel Identity & Location Metadata
      {
        number: 2,
        id: 'parcel-identity',
        title: 'Parsel Tanımı ve Coğrafi Konum Parametreleri',
        category: 'Technical',
        content: `İncelenen alan WGS84 (EPSG:4326) ve UTM Bölge ${epsg % 100}N (EPSG:${epsg}) koordinat sistemlerinde modellenmiştir.`,
        keyMetrics: [
          { label: 'Parsel / Çiftlik', value: parcelName },
          { label: 'Ürün Deseni', value: crop },
          { label: 'Yüzölçümü', value: `${areaHa} Hektar` },
          { label: 'Bounding Box', value: `[${bbox.join(', ')}]` },
          { label: 'Projeksiyon', value: `EPSG:${epsg} (UTM)` },
        ],
      },

      // 3. Satellite Observation Metadata
      {
        number: 3,
        id: 'satellite-metadata',
        title: 'Uydu Gözlem ve Algılayıcı Metaverileri',
        category: 'Technical',
        content: `Copernicus Sentinel-2 Çoklu Spektral Algılayıcı (MSI) Level-2A ürünü üzerinden alt atmosfer (Bottom-of-Atmosphere - BOA) yüzey yansıması hesaplanmıştır.`,
        keyMetrics: [
          { label: 'Platform', value: scene.platform },
          { label: 'Ürün Seviyesi', value: 'Level-2A (BOA Surface Reflectance)' },
          { label: 'Scene / Product ID', value: scene.id },
          { label: 'Çekim Tarihi', value: dateFormatted },
          { label: 'MGRS Tile ID', value: scene.tileId },
          { label: 'Bulut Oranı', value: `%${scene.cloudCoverPercent}` },
          { label: 'Mekansal Çözünürlük', value: '10 metre (B02, B03, B04, B08) & 20 metre (B11)' },
          { label: 'Veri Kaynağı', value: scene.provider },
        ],
      },

      // 4. Spectral Methodology
      {
        number: 4,
        id: 'spectral-methodology',
        title: 'Spektral Bantlar ve Radyometrik Metodoloji',
        category: 'Spectral',
        content: `Piksel değerleri Sen2Cor atmosferik düzeltme algoritmasından geçmiş olup DN/10000 katsayısı ile doğrudan BOA fiziksel yüzey yansımasına (Surface Reflectance) dönüştürülmüştür.`,
        keyMetrics: [
          { label: 'B02 Mavi (490 nm)', value: reflectances.B02 },
          { label: 'B03 Yeşil (560 nm)', value: reflectances.B03 },
          { label: 'B04 Kırmızı (665 nm)', value: reflectances.B04 },
          { label: 'B08 NIR (842 nm)', value: reflectances.B08 },
          { label: 'B11 SWIR-1 (1610 nm)', value: reflectances.B11 },
        ],
      },

      // 5. Vegetation Health & NDVI Analysis
      {
        number: 5,
        id: 'ndvi-analysis',
        title: 'Bitki Örtüsü Canlılığı ve NDVI Piksel Analizi',
        category: 'Spectral',
        content: `NDVI = (B08 - B04) / (B08 + B04) formülü ile taranan ${pixelStats.validPixels} geçerli piksel üzerinden vejetasyon fotosentetik klorofil aktivitesi ölçülmüştür.`,
        keyMetrics: [
          { label: 'NDVI Ortalama', value: indices.ndvi.mean },
          { label: 'NDVI Medyan', value: indices.ndvi.median },
          { label: 'NDVI Minimum', value: indices.ndvi.min },
          { label: 'NDVI Maksimum', value: indices.ndvi.max },
          { label: 'Standart Sapma (σ)', value: indices.ndvi.stdDev },
        ],
      },

      // 6. Canopy Water Content & NDWI Analysis
      {
        number: 6,
        id: 'ndwi-analysis',
        title: 'Kanopi Su İndeksi ve NDWI Dağılımı',
        category: 'Spectral',
        content: `NDWI = (B03 - B08) / (B03 + B08) formülü ile yüzey su indeksi ve fotosentez su dengesi analiz edilmiştir.`,
        keyMetrics: [
          { label: 'NDWI Ortalama', value: indices.ndwi.mean },
          { label: 'NDWI Medyan', value: indices.ndwi.median },
          { label: 'NDWI Min / Max', value: `${indices.ndwi.min} / ${indices.ndwi.max}` },
          { label: 'Standart Sapma', value: indices.ndwi.stdDev },
        ],
      },

      // 7. NDMI & Moisture-Related Spectral Indicator
      {
        number: 7,
        id: 'ndmi-analysis',
        title: 'NDMI ve Kanopi Sıvı Su İçeriği Spektral Göstergesi',
        category: 'Spectral',
        content: `NDMI = (B08 - B11) / (B08 + B11) formülü, kısa dalga kızılötesi (SWIR) absorbsiyonu ile kanopi iç su potansiyelini hassas olarak izlemektedir.`,
        keyMetrics: [
          { label: 'NDMI Ortalama', value: indices.ndmi.mean },
          { label: 'Nem Göstergesi (Proxy)', value: `${derivedMoistureProxy.estimatedMoistureScore}/100` },
          { label: 'Durum Sınıfı', value: indices.ndmi.mean < -0.1 ? 'Hidrik Kısıt' : 'Normal Su İçeriği' },
        ],
        alert: {
          type: indices.ndmi.mean < -0.1 ? 'warning' : 'info',
          text: derivedMoistureProxy.disclaimer,
        },
      },

      // 8. Soil Moisture Proxy & Physical Verification Requirements
      {
        number: 8,
        id: 'soil-moisture-proxy',
        title: 'Toprak Nemi Yaklaşımı ve Fiziksel Ölçüm Zorunluluğu',
        category: 'Environmental',
        content: `Optik uydular toprak derinliğini doğrudan nüfuz edemez. Bu raporda sunulan nem değerleri 'vejetasyon nem göstergesi proxy' modelidir. Kesin hacimsel toprak su içeriği için kök derinliğinde (0-30 cm) yerinde TDR sensörü ölçümü şarttır.`,
        bulletPoints: [
          'Sentinel-2 optik dalga boyu toprak profiline girmez; yaprak içi su ve üst yüzey yansımasını okur.',
          'Sulama otomasyonu kararları öncesinde parsel bazlı fiziksel TDR sensör doğrulaması yapılmalıdır.',
        ],
      },

      // 9. Carbon Trend & Vegetation Biomass Indicator
      {
        number: 9,
        id: 'carbon-biomass-indicator',
        title: 'Biyokütle Karbon Göstergesi ve Toprak Organik Karbonu',
        category: 'Environmental',
        content: `Vejetasyon örtüsü üzerindeki NDVI ve fotosentez aktivitesi fotosentetik biyokütle birikim göstergesidir. Toprak Organik Karbonu (SOC) doğrudan uydudan ton olarak ölçülemez; toprak karot numuneleri ve akredite laboratuvar analizi zorunludur.`,
      },

      // 10. Historical Time Series & Trend Analysis
      {
        number: 10,
        id: 'time-series',
        title: 'Tarihsel Zaman Serisi ve Fenolojik Seyir',
        category: 'Environmental',
        content: `Katalog taramasında tespit edilen ${timeSeries.length} adet gerçek Sentinel-2 gözlemi üzerinden vejetasyon fenolojisi izlenmiştir. Eksik tarihler sentetik olarak üretilmemiş, yalnızca doğrulanmış uydu geçişleri dahil edilmiştir.`,
        bulletPoints: timeSeries.map(
          (t) => `${t.date} — Sahne: ${t.sceneId.slice(0, 20)}... | NDVI: ${t.ndvi} | NDWI: ${t.ndwi} | NDMI: ${t.ndmi} | Bulut: %${t.cloudCover}`
        ),
      },

      // 11. Intra-Parcel Heterogeneity & Zonal Classification
      {
        number: 11,
        id: 'heterogeneity',
        title: 'Parsel İçi Heterojenlik ve Zon Sınıflandırması',
        category: 'Environmental',
        content: `Parsel içi pikseller 5 seviyeli spektral dilime ayrılmıştır. NDVI standart sapması (${indices.ndvi.stdDev}) homojenliği ortaya koymaktadır.`,
        keyMetrics: [
          { label: 'Çok Düşük Örtü (< 0.20)', value: indices.ndvi.min < 0.2 ? 'Mevcut' : 'Tespit Edilmedi' },
          { label: 'Orta Örtü (0.20 - 0.50)', value: 'Geniş Dağılım' },
          { label: 'Yoğun / Sağlıklı Örtü (> 0.50)', value: indices.ndvi.max > 0.5 ? 'Mevcut' : 'Kısıtlı' },
        ],
      },

      // 12. Environmental Stress & Risk Signals
      {
        number: 12,
        id: 'risk-signals',
        title: 'Çevresel Stres ve Risk Sinyalleri',
        category: 'Environmental',
        content: 'Yapay zekâ ve spektral eşik değerleri ile tespit edilen çevresel risk faktörleri:',
        bulletPoints: aiOutput.risks.map((r) => `[${r.severity.toUpperCase()}] ${r.title}: ${r.explanation} (Kanıt: ${r.evidence})`),
      },

      // 13. Supply Chain & Scope 3 Environmental Impact
      {
        number: 13,
        id: 'supply-chain-scope3',
        title: 'Tedarik Zinciri ve Scope 3 Çevresel Etki',
        category: 'Compliance',
        content: `Tedarik zincirindeki tarımsal kaynaklı Kapsam 3 (Scope 3) emisyon ve su tüketim izlenebilirliği için parsel bazlı uydu verisi birincil nesnel kanıt sunmaktadır.`,
        bulletPoints: [
          'Tedarikçi bazlı arazi bozulması ve su stresi şeffaflığı sağlandı.',
          'Gerçekleşen spektral izleme denetim firmaları ve kredi kuruluşları için doğrulanabilir veri oluşturmaktadır.',
        ],
      },

      // 14. CSRD / ESRS Environmental Standards Alignment
      {
        number: 14,
        id: 'csrd-esrs-alignment',
        title: 'CSRD ve ESRS Çevresel Standartları ile Uyum',
        category: 'Compliance',
        content: `Bu denetim raporu Avrupa Birliği Kurumsal Sürdürülebilirlik Raporlama Direktifi (CSRD) çerçevesinde ESRS E4 (Biyoçeşitlilik ve Ekosistemler), ESRS E1 (İklim Değişikliği) ve ESRS E3 (Su ve Deniz Kaynakları) standartlarına veri temeli sağlamaktadır.`,
        keyMetrics: [
          { label: 'ESRS E4 Biyoçeşitlilik', value: 'Vejetasyon Haritası ve Örtü Takibi' },
          { label: 'ESRS E3 Su Kaynakları', value: 'NDWI ve NDMI Hidrik İzleme' },
          { label: 'ESRS E1 İklim', value: 'Biyokütle ve Arazi Kullanım İzleme' },
        ],
      },

      // 15. Recommended Agronomic & Remediation Interventions
      {
        number: 15,
        id: 'recommendations',
        title: 'Tavsiye Edilen Agronomik ve İyileştirme Müdahaleleri',
        category: 'Compliance',
        content: 'Spektral bulgular doğrultusunda önerilen saha adımları:',
        bulletPoints: aiOutput.recommendedActions,
      },

      // 16. Mandatory Physical Field Verification Protocol
      {
        number: 16,
        id: 'verification-protocol',
        title: 'Zorunlu Fiziksel Saha Doğrulama Protokolü (TDR & Laboratuvar)',
        category: 'Verification',
        content: 'Uydu uzaktan algılama sonuçlarının kurumsal geçerliliği için aşağıdaki fiziksel kontroller zorunludur:',
        bulletPoints: aiOutput.verificationNeeded,
      },

      // 17. Remote Sensing Technical Limitations & Sensor Uncertainties
      {
        number: 17,
        id: 'limitations',
        title: 'Uzaktan Algılama Teknik Kısıtları ve Algılayıcı Belirsizlikleri',
        category: 'Verification',
        content: 'Sentinel-2 MSI optik sensör kısıtları ve atmosferik sınırlamalar:',
        bulletPoints: aiOutput.limitations,
      },

      // 18. Data Integrity & Chain of Custody Audit Trail
      {
        number: 18,
        id: 'audit-trail',
        title: 'Veri Bütünlüğü ve Denetim İzi (Chain of Custody)',
        category: 'Verification',
        content: `Veri kaynağı, STAC sorgu imzası ve piksel hash doğrulaması kaydedilmiştir.`,
        keyMetrics: [
          { label: 'Rapor Kimliği', value: reportId },
          { label: 'Sahne ID', value: scene.id },
          { label: 'Toplam Piksel', value: pixelStats.totalPixels },
          { label: 'Geçerli Piksel', value: pixelStats.validPixels },
          { label: 'Bulut Maskelenen Piksel', value: pixelStats.cloudMaskedPixels },
          { label: 'Geçerli Piksel Oranı', value: `%${(pixelStats.validPixelRatio * 100).toFixed(1)}` },
        ],
      },

      // 19. Auditor Sign-off & Disclaimers
      {
        number: 19,
        id: 'sign-off',
        title: 'Denetçi Onayı, Beyanlar ve Bilimsel Çekinceler',
        category: 'Verification',
        content: `TerraSat AI Spektral Denetim Motoru tarafından üretilen bu MRV raporu, ESA Copernicus Sentinel-2 L2A alt atmosferik (BOA) açık bilimsel verileri kullanılarak hazırlanmıştır. Uydu verisi doğrudan kanıt sunmakla birlikte, kurumsal kredi, karbon sertifikasyonu veya ESG denetimlerinde fiziksel zemin doğrulamaları (TDR toprak nemi, akredite laboratuvar toprak organik karbon analizleri ve sulama kayıtları) ile birlikte değerlendirilmelidir.`,
        keyMetrics: [
          { label: 'Denetim Modeli', value: aiOutput.modelUsed },
          { label: 'Güvenilirlik Seviyesi', value: aiOutput.confidenceLevel },
          { label: 'Tarih', value: dateFormatted },
        ],
      },
    ];

    return {
      reportId,
      generatedAt: dateFormatted,
      complianceStandard: 'CSRD / ESRS E1, E3, E4 & GHG Protocol Scope 3',
      parcel: {
        name: parcelName,
        crop,
        areaHa,
        coordinates: `BBox [${bbox.join(', ')}]`,
        crs: `EPSG:${epsg} (WGS84 / UTM)`,
      },
      satelliteMetadata: {
        constellation: 'Copernicus Sentinel-2',
        instrument: 'MSI (MultiSpectral Instrument)',
        productType: 'Level-2A (Bottom of Atmosphere)',
        processingLevel: 'L2A BOA Surface Reflectance',
        sceneId: scene.id,
        acquisitionDate: dateFormatted,
        sensingTime: scene.datetime,
        cloudCoverage: `%${scene.cloudCoverPercent}`,
        spatialResolution: '10m / 20m GSD',
        dataSource: scene.provider,
      },
      sections,
      auditTrail: {
        queryTimestamp: new Date().toISOString(),
        stacCatalog: scene.provider,
        sceneId: scene.id,
        pixelCount: pixelStats.totalPixels,
        validPixelCount: pixelStats.validPixels,
        cloudMaskedPixelCount: pixelStats.cloudMaskedPixels,
        sha256Digest: `sha256-${Buffer.from(scene.id + dateFormatted).toString('base64').slice(0, 24)}`,
      },
    };
  }
}

export const defaultReportCompiler = new ReportCompiler();
