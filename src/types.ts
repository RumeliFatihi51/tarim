export type RiskStatus = 'healthy' | 'moderate' | 'high-risk';
export type WaterStressLevel = 'Low' | 'Medium' | 'High';
export type PlantHealthLevel = 'Poor' | 'Moderate' | 'Good';
export type CarbonIndicatorTrend = 'Negative' | 'Stable' | 'Positive';

export interface HistoricalObservation {
  date: string;
  ndvi: number;
  ndwi: number;
  soilMoisture: number;
  sustainabilityScore: number;
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
  polygon: [number, number][]; // [lat, lng] array for Leaflet
  historicalData: HistoricalObservation[];
  alerts?: ParcelAlert[];
  farmerName?: string;
  contractId?: string;
}

export interface AIAnalysisRisk {
  title: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface AIAnalysisResult {
  overallStatus: string;
  summary: string;
  keyFindings: string[];
  risks: AIAnalysisRisk[];
  positiveSignals: string[];
  recommendedActions: string[];
  verificationNeeded: string[];
  generatedAt?: string;
  modelUsed?: string;
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
  verifiedBy?: string;
}

export type ActiveTab = 'dashboard' | 'map' | 'parcels' | 'analytics' | 'reports' | 'settings';
export type TabType = ActiveTab;
export type LayerMode = 'status' | 'ndvi' | 'water';
export type AnalyticsSubTab = 'vegetation' | 'water' | 'soil' | 'carbon';
