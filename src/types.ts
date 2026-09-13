export type RiskStatus = 'healthy' | 'moderate' | 'high-risk';
export type WaterStressLevel = 'Low' | 'Medium' | 'High';
export type PlantHealthLevel = 'Poor' | 'Moderate' | 'Good';
export type CarbonIndicatorTrend = 'Negative' | 'Stable' | 'Positive';
export type AnalysisMode = 'LIVE' | 'DEMO';

export interface SpectralBands {
  B02: number; // Blue (490 nm)
  B03: number; // Green (560 nm)
  B04: number; // Red (665 nm)
  B08: number; // NIR (842 nm)
  B11: number; // SWIR (1610 nm)
  B12?: number; // SWIR-2 (2190 nm)
}

export interface PixelStatistics {
  totalPixels: number;
  validPixels: number;
  cloudMaskedPixels: number;
  validPixelRatio: number; // e.g. 0.94
  cloudMaskedRatio: number; // e.g. 0.06
  resolutionMeters: number; // 10
}

export interface IndexDistributionStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
}

export interface RasterVisualizations {
  rgbPreviewUrl?: string;
  rgbPngBase64?: string;
  ndviPngBase64?: string;
  ndwiPngBase64?: string;
  ndmiPngBase64?: string;
  bounds?: [[number, number], [number, number]]; // [[south, west], [north, east]]
}

export interface SatelliteMetadata {
  sensor: string; // e.g. 'Copernicus Sentinel-2B MSI'
  sceneId: string; // e.g. 'S2B_MSIL2A_20260908T084559_N0500_R107_T35SNC'
  tileId: string; // e.g. 'T35SNC'
  acquisitionDate: string; // e.g. '08 Eylül 2026'
  cloudCoveragePercent: number; // e.g. 4.2
  cloudScreeningPassed: boolean;
  spatialResolutionMeters: number; // 10
  processingLevel: string; // 'L2A (Bottom of Atmosphere Surface Reflectance)'
  bandsUsed: string[];
  dataSource?: string;
}

export interface HistoricalObservation {
  date: string;
  ndvi: number;
  ndwi: number;
  ndmi?: number;
  soilMoisture: number;
  soilMoistureProxy?: number;
  sustainabilityScore: number;
  cloudCover?: number;
  sceneId?: string;
  validPixelRatio?: number;
}

export interface ParcelAlert {
  id: string;
  type: 'warning' | 'critical' | 'positive';
  title: string;
  message: string;
  date: string;
}

export interface Parcel {
  id: string;
  number: string;
  name: string;
  location: string;
  crop: string;
  areaHa: number;
  status: RiskStatus;
  sustainabilityScore: number;
  scoreBreakdown: {
    vegetation: number;
    water: number;
    soil: number;
    carbon: number;
    management: number;
  };
  ndvi: number;
  ndwi: number;
  ndmi?: number;
  soilMoisture: number;
  waterStress: WaterStressLevel;
  plantHealth: PlantHealthLevel;
  carbonIndicator: CarbonIndicatorTrend;
  lastObservation: string;
  lastUpdated?: string;
  polygon: [number, number][]; // [lat, lng] array
  historicalData: HistoricalObservation[];
  alerts?: ParcelAlert[];
  farmerName?: string;
  contractId?: string;
  isDemo?: boolean;
  satelliteMetadata?: SatelliteMetadata;
  spectralBands?: SpectralBands;
}

export interface PipelineStep {
  id: string;
  title: string;
  description: string;
  status: 'waiting' | 'running' | 'completed' | 'error';
  techDetail?: string;
  timestamp?: string;
}

export interface AIAnalysisRisk {
  title: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  evidence: string;
}

export interface AIAnalysisResult {
  overallStatus: string;
  summary: string;
  keyFindings: string[];
  risks: AIAnalysisRisk[];
  positiveSignals: string[];
  possibleDrivers: string[];
  recommendedActions: string[];
  verificationNeeded: string[];
  mrvStatus: {
    measurement: string[];
    reporting: string[];
    verification: string[];
  };
  confidenceLevel: 'High' | 'Medium' | 'Low';
  confidenceJustification: string;
  limitations?: string[];
  generatedAt?: string;
  modelUsed?: string;
}

export interface FullAnalysisPayload {
  parcel: Parcel;
  satelliteMetadata: SatelliteMetadata;
  spectralBands: SpectralBands;
  calculatedIndices: {
    ndvi: number;
    ndviTrend: number;
    ndwi: number;
    ndwiTrend: number;
    ndmi: number;
    soilMoisture: number;
    waterStress: WaterStressLevel;
    plantHealth: PlantHealthLevel;
    carbonIndicator: CarbonIndicatorTrend;
  };
  pixelStats?: PixelStatistics;
  spectralStats?: {
    ndvi: IndexDistributionStats;
    ndwi: IndexDistributionStats;
    ndmi: IndexDistributionStats;
  };
  visualizations?: RasterVisualizations;
  historicalObservations: HistoricalObservation[];
  aiAssessment: AIAnalysisResult;
  isDemoMode: boolean;
  dataSourceLabel: string;
  timestamp?: string;
  mrvReport?: any;
  weatherData?: WeatherData;
  practiceSignals?: PracticeSignal[];
  verificationTasks?: FieldVerificationTask[];
  spatialRiskGrid?: {
    totalCells: number;
    stressedCells: number;
    watchCells: number;
    healthyCells: number;
    stressPercentage: number;
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
  et0MmPerDay: number;
  droughtRiskIndex: 'Low' | 'Moderate' | 'High' | 'Severe';
  correlationSummary: string;
  droughtStressCategory?: string;
  dataSource?: string;
  tempMinC?: number;
  tempMaxC?: number;
  windSpeedKmh?: number;
  soilTemperatureC?: number;
  observationDate?: string;
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
  detectedStatus?: string;
  practiceName?: string;
  spectralEvidence?: string;
  mrvAuditImpact?: string;
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

export interface MRVReportRecord {
  reportId: string;
  parcelId: string;
  parcelName: string;
  crop: string;
  location: string;
  areaHa: number;
  generatedDate: string;
  period: string;
  status: RiskStatus;
  sustainabilityScore: number;
  analysis: AIAnalysisResult;
  satelliteMetadata: SatelliteMetadata;
  isDemoMode: boolean;
  verifiedBy?: string;
  payload?: FullAnalysisPayload;
}

export type ActiveTab = 'monitor' | 'analysis' | 'parcels' | 'reports' | 'assistant' | 'methodology' | 'settings' | 'practices';
export type TabType = ActiveTab;
export type LayerMode = 'satellite' | 'rgb' | 'ndvi' | 'ndwi' | 'ndmi' | 'water' | 'stress';
export type AnalyticsSubTab = 'vegetation' | 'water' | 'soil' | 'carbon';
