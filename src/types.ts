export type RiskStatus = 'healthy' | 'moderate' | 'high-risk';
export type WaterStressLevel = 'Low' | 'Medium' | 'High';
export type PlantHealthLevel = 'Poor' | 'Moderate' | 'Good';
export type CarbonIndicatorTrend = 'Negative' | 'Stable' | 'Positive';

export interface SpectralBands {
  B02: number; // Blue (490 nm)
  B03: number; // Green (560 nm)
  B04: number; // Red (665 nm)
  B08: number; // NIR (842 nm)
  B11: number; // SWIR (1610 nm)
  B12?: number; // SWIR-2 (2190 nm)
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
}

export interface HistoricalObservation {
  date: string;
  ndvi: number;
  ndwi: number;
  soilMoisture: number;
  sustainabilityScore: number;
  cloudCover?: number;
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
  soilMoisture: number;
  waterStress: WaterStressLevel;
  plantHealth: PlantHealthLevel;
  carbonIndicator: CarbonIndicatorTrend;
  lastObservation: string;
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
  historicalObservations: HistoricalObservation[];
  aiAssessment: AIAnalysisResult;
  isDemoMode: boolean;
  dataSourceLabel: string;
  timestamp?: string;
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
}

export type ActiveTab = 'monitor' | 'analysis' | 'reports' | 'methodology';
export type TabType = ActiveTab;
export type LayerMode = 'satellite' | 'ndvi' | 'ndwi' | 'water';
export type AnalyticsSubTab = 'vegetation' | 'water' | 'soil' | 'carbon';
