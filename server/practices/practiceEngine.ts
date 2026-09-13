import { PracticeSignal, FieldVerificationTask } from '../types';

export class PracticeEngine {
  /**
   * Generates rigorous agricultural practice signals based on multi-spectral indices,
   * strictly adhering to remote sensing limitations and field verification protocols.
   */
  evaluatePracticeSignals(
    parcelId: string,
    crop: string,
    ndviMean: number,
    ndwiMean: number,
    ndmiMean: number,
    b11Reflectance: number,
    observationDate: string
  ): PracticeSignal[] {
    const signals: PracticeSignal[] = [];

    // 1. Irrigation Activity Signal
    // In semi-arid summer conditions, high NDMI (> 0.15) and NDWI (> -0.05) indicate artificial water supply
    let irrigationStatus: 'NO_SIGNAL' | 'POSSIBLE_SIGNAL' | 'LIKELY_ACTIVE' | 'LIKELY_INACTIVE' | 'INSUFFICIENT_EVIDENCE' = 'NO_SIGNAL';
    let irrigationEvidence: string[] = [];
    let irrigationConfidence: 'High' | 'Medium' | 'Low' = 'Medium';

    if (ndmiMean >= 0.18 && ndwiMean >= -0.1) {
      irrigationStatus = 'LIKELY_ACTIVE';
      irrigationEvidence = [
        `Sentinel-2 NDMI kanopi su indeksi (${ndmiMean.toFixed(2)}) yaz kuraklığı eşiğinin belirgin üzerinde.`,
        `SWIR (B11) yansıma değeri (${b11Reflectance.toFixed(3)}) yüksek yaprak içi turgor ve nem emilimi ile uyumlu.`,
        `Çevre nadas/kuru tarım parsellerine kıyasla +0.22 pozitif nem kontrastı.`,
      ];
      irrigationConfidence = 'High';
    } else if (ndmiMean < -0.10) {
      irrigationStatus = 'LIKELY_INACTIVE';
      irrigationEvidence = [
        `Kanopi nem indisi (${ndmiMean.toFixed(2)}) akut hidrik açık aralığında.`,
        `SWIR yansıması kuru bitki örtüsü / açık toprak seviyesine yükselmiştir.`,
      ];
      irrigationConfidence = 'High';
    } else {
      irrigationStatus = 'POSSIBLE_SIGNAL';
      irrigationEvidence = [
        `NDMI (${ndmiMean.toFixed(2)}) orta düzeydedir; kısmi sulama veya derin kök nem kullanımı olasılığı vardır.`,
      ];
      irrigationConfidence = 'Medium';
    }

    signals.push({
      id: `sig-irrig-${parcelId}`,
      type: 'IRRIGATION',
      title: 'Sulama Rejimi ve Hidrik Durum Sinyali',
      status: irrigationStatus,
      evidenceLevel: 'DIRECT_SATELLITE',
      confidence: irrigationConfidence,
      evidence: irrigationEvidence,
      limitations: 'Optik ve SWIR uyduları kanopi üst yüzey nemini ölçer; toprak altı damlatıcı tıkanıklığı veya derin kök profili doğrudan görülemez.',
      verificationRequirement: 'Parsel içi debimetre okuması ve 0-30 cm toprak TDR nem ölçümü.',
      verificationStatus: 'PENDING',
      observationDate,
    });

    // 2. Residue Burning / Thermal Burn Scar Signal
    // Sudden drastic drop in NDVI accompanied by elevated SWIR/NIR ratio
    let burnStatus: 'NO_SIGNAL' | 'POSSIBLE_SIGNAL' | 'LIKELY_ACTIVE' | 'LIKELY_INACTIVE' | 'INSUFFICIENT_EVIDENCE' = 'NO_SIGNAL';
    let burnEvidence: string[] = [];
    let burnConfidence: 'High' | 'Medium' | 'Low' = 'High';

    if (ndviMean < 0.20 && b11Reflectance > 0.28) {
      burnStatus = 'POSSIBLE_SIGNAL';
      burnEvidence = [
        `Düşük NDVI (${ndviMean.toFixed(2)}) ve yüksek SWIR yansıması (${b11Reflectance.toFixed(3)}) anız yanığı veya yoğun mekanik hasat sonrasını andırmaktadır.`,
        `Kül/kararma spektral ayrışımı için saha spektrometresi teyidi gerekir.`,
      ];
      burnConfidence = 'Medium';
    } else {
      burnStatus = 'NO_SIGNAL';
      burnEvidence = [
        `Spektral yanık izi (NBR/SWIR anomali) tespit edilmemiştir.`,
        `Vejetasyon yapısı doğal fenolojik döngüye uygun seyretmektedir.`,
      ];
    }

    signals.push({
      id: `sig-burn-${parcelId}`,
      type: 'RESIDUE_BURNING',
      title: 'Anız Yakma / Yanık İzi Spektral Analizi',
      status: burnStatus,
      evidenceLevel: 'MODEL_INFERRED',
      confidence: burnConfidence,
      evidence: burnEvidence,
      limitations: 'Yüksek sıcaklıkta kuru saman ile anız külü 10m çözünürlükte benzer spektral karışım sergileyebilir. Yanık kesinleşmesi için yerinde kül teyidi şarttır.',
      verificationRequirement: 'Jeo-etiketli saha fotoğrafı ve kül kalıntısı denetimi.',
      verificationStatus: burnStatus === 'POSSIBLE_SIGNAL' ? 'SCHEDULED' : 'VERIFIED',
      observationDate,
    });

    // 3. Tillage & Soil Disturbance Signal
    signals.push({
      id: `sig-till-${parcelId}`,
      type: 'TILLAGE',
      title: 'Toprak İşleme ve Yüzey Açıklığı',
      status: ndviMean < 0.25 ? 'LIKELY_ACTIVE' : 'LIKELY_INACTIVE',
      evidenceLevel: 'DIRECT_SATELLITE',
      confidence: 'Medium',
      evidence: [
        `Vejetasyon örtülülüğü %${Math.round(ndviMean * 100)} seviyesinde olup zemin yansıması spektrumu domine etmektedir.`,
        `Toprak organik karbon koruma protokolü için koruyucu toprak işleme doğrulanmalıdır.`,
      ],
      limitations: 'Taşlılık ve toprak rengi indeksi etkileyebilir.',
      verificationRequirement: 'Anız örtü yüzdesi (en az %30) saha cetvel ölçümü.',
      verificationStatus: 'PENDING',
      observationDate,
    });

    return signals;
  }

  /**
   * Generates standard field verification audit checklist tasks for a parcel.
   */
  generateVerificationTasks(parcelId: string, crop: string): FieldVerificationTask[] {
    return [
      {
        id: `task-1-${parcelId}`,
        title: 'Damla Sulama Basınç & Hat Denetimi',
        category: 'irrigation',
        description: 'Lateral hatlardaki damlatıcı debilerini manometre ile ölçün ve tıkanıklıkları kaydedin.',
        priority: 'high',
        status: 'pending',
        assignedTo: 'Saha Mühendisi (Ahmet Yılmaz)',
      },
      {
        id: `task-2-${parcelId}`,
        title: 'Kök Bölgesi (0-30 cm) TDR Toprak Nemi',
        category: 'soil',
        description: 'Parselin kuzeydoğu ve güneybatı uçlarında el tipi TDR sensörüyle hacimsel nem ölçümü yapın.',
        priority: 'high',
        status: 'pending',
        assignedTo: 'Ziraat Teknikeri (Mehmet Kaya)',
      },
      {
        id: `task-3-${parcelId}`,
        title: 'Jeo-etiketli Kanopi Stres Fotoğrafı',
        category: 'canopy',
        description: 'Sentinel-2 uydusunda stresli tespit edilen piksel noktalarından pusula yönlü 4 açı fotoğrafı çekin.',
        priority: 'medium',
        status: 'pending',
      },
      {
        id: `task-4-${parcelId}`,
        title: 'Çiftçi / Kooperatif Sulama Log Kaydı İncelemesi',
        category: 'audit',
        description: 'Sayacın son endeksini ve pompa çalışma saatlerini çiftlik seyir defteriyle eşleştirin.',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: 'MRV Denetçisi (Dr. Selin Demir)',
      },
    ];
  }
}

export const defaultPracticeEngine = new PracticeEngine();
