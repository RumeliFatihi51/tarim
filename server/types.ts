export type AnalysisMode = 'LIVE' | 'DEMO';

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [lng, lat]
}

export interface SatelliteScene {
  id: string;
  provider: string; // 'Microsoft Planetary Computer' | 'Earth Search AWS' | 'Copernicus Data Space'
  platform: string; // 'Sentinel-2A' | 'Sentinel-2B'
  collection: string;
  datetime: string;
  cloudCoverPercent: number;
  tileId: string;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  assets: {
    B02?: { href: string };
    B03?: { href: string };
    B04?: { href: string };
    B08?: { href: string };
    B11?: { href: string };
    B12?: { href: string };
    SCL?: { href: string };
    visual?: { href: string };
    rendered_preview?: { href: string };
    thumbnail?: { href: string };
    [key: string]: { href: string } | undefined;
  };
}

export interface SpectralStatistics {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

export interface RasterAnalysisResult {
  scene: SatelliteScene;
  pixelStats: {
    totalPixels: number;
    validPixels: number;
    cloudMaskedPixels: number;
    validPixelRatio: number; // e.g. 0.94
    cloudMaskedRatio: number; // e.g. 0.06
    resolutionMeters: number; // 10
  };
  reflectances: {
    B02: number; // Blue (490 nm)
    B03: number; // Green (560 nm)
    B04: number; // Red (665 nm)
    B08: number; // NIR (842 nm)
    B11: number; // SWIR (1610 nm)
  };
  indices: {
    ndvi: SpectralStatistics;
    ndwi: SpectralStatistics;
    ndmi: SpectralStatistics;
    ndre?: SpectralStatistics;
    evi?: SpectralStatistics;
    savi?: SpectralStatistics;
  };
  spatialRiskGrid?: {
    totalCells: number;
    stressedCells: number;
    watchCells: number;
    healthyCells: number;
    stressPercentage: number;
  };
  derivedMoistureProxy: {
    canopyMoistureIndex: number; // derived from NDMI
    estimatedMoistureScore: number; // 0-100 proxy indicator
    disclaimer: string;
  };
  visualizations: {
    rgbPreviewUrl?: string;
    rgbPngBase64?: string;
    ndviPngBase64?: string;
    ndwiPngBase64?: string;
    ndmiPngBase64?: string;
    stressPngBase64?: string;
    bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  };
}

export interface WeatherData {
  parcelId: string;
  period: string;
  temperatureC: number;
  temperatureAnomalyC: number;
  rainfallMm: number;
  rainfallAnomalyPercent: number;
  relativeHumidityPercent: number;
  et0MmPerDay: number; // Reference evapotranspiration
  droughtRiskIndex: 'Low' | 'Moderate' | 'High' | 'Severe';
  correlationSummary: string;
}

export interface PracticeSignal {
  id: string;
  type: 'IRRIGATION' | 'RESIDUE_BURNING' | 'TILLAGE' | 'CANOPY_CLEARING';
  title: string;
  status: 'NO_SIGNAL' | 'POSSIBLE_SIGNAL' | 'LIKELY_ACTIVE' | 'LIKELY_INACTIVE' | 'INSUFFICIENT_EVIDENCE';
  evidenceLevel: 'DIRECT_SATELLITE' | 'MODEL_INFERRED' | 'FIELD_VERIFIED';
  confidence: 'High' | 'Medium' | 'Low';
  evidence: string[];
  limitations: string;
  verificationRequirement: string;
  verificationStatus: 'PENDING' | 'SCHEDULED' | 'VERIFIED' | 'REJECTED';
  observationDate: string;
}

export interface FieldVerificationTask {
  id: string;
  title: string;
  category: 'irrigation' | 'soil' | 'canopy' | 'audit';
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  notes?: string;
  photoCount?: number;
  completedAt?: string;
}

export interface AIUIAction {
  type: 'SHOW_PARCELS' | 'OPEN_PARCEL' | 'TRIGGER_ANALYSIS' | 'OPEN_MRV_REPORT' | 'HIGHLIGHT_STRESS';
  parcelId?: string;
  parcelIds?: string[];
  filter?: string;
  label?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structured?: {
    answer?: string;
    evidence?: string[];
    interpretation?: string;
    confidence?: 'High' | 'Medium' | 'Low';
    limitations?: string[];
    recommendedAction?: string;
  };
  actions?: AIUIAction[];
  dataRef?: {
    parcelId?: string;
    reportId?: string;
    sceneId?: string;
  };
}

export interface AuditTrailEntry {
  timestamp: string;
  stage: string;
  action: string;
  operator: string;
  details: string;
  evidenceRef?: string;
}

export interface TimeSeriesObservation {
  date: string;
  sceneId: string;
  cloudCover: number;
  validPixelRatio: number;
  ndvi: number;
  ndwi: number;
  ndmi: number;
  soilMoistureProxy: number;
  sustainabilityScore: number;
}

export interface PipelineStageStatus {
  id: string;
  number: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  techDetail?: string;
  durationMs?: number;
}

export interface AnalysisJob {
  id: string;
  mode: AnalysisMode;
  status: 'queued' | 'running' | 'completed' | 'failed';
  currentStageNumber: number;
  totalStages: number;
  stages: PipelineStageStatus[];
  error?: string;
  result?: any;
  createdAt: string;
  updatedAt: string;
}
