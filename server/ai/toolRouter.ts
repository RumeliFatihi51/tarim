import { analysisStore } from '../persistence/analysisStore';

export interface ToolResult<T = unknown> {
  data: T | null; source: string; timestamp: string; confidence: 'High' | 'Medium' | 'Low';
  verificationStatus: 'NOT_VERIFIED' | 'FIELD_VERIFIED'; limitations: string[];
}

const result = <T>(data: T | null, source: string, limitations: string[] = []): ToolResult<T> => ({
  data, source, timestamp: new Date().toISOString(), confidence: data ? 'High' : 'Low',
  verificationStatus: 'NOT_VERIFIED', limitations,
});

export class AIToolRouter {
  getParcel(companyId: string, parcelId: string) { return result(analysisStore.get(companyId, parcelId)?.parcel ?? null, 'TerraSat persistent analysis store'); }
  searchParcels(companyId: string, query = '') { return result(analysisStore.list(companyId).map((p) => p.parcel).filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), 'TerraSat persistent analysis store'); }
  getLatestAnalysis(companyId: string, parcelId: string) { return result(analysisStore.get(companyId, parcelId) ?? null, 'TerraSat measured analysis', ['Satellite inference is not field verification.']); }
  getHistoricalObservations(companyId: string, parcelId: string) { return result(analysisStore.get(companyId, parcelId)?.historicalObservations ?? null, 'Processed Sentinel-2 observations'); }
  getMRVReport(companyId: string, parcelId: string) { return result(analysisStore.get(companyId, parcelId)?.mrvReport ?? null, 'TerraSat MRV compiler', ['A generated report is not third-party certification.']); }
  getWeatherData(companyId: string, parcelId: string) { return result(analysisStore.get(companyId, parcelId)?.weatherData ?? null, 'Weather provider response'); }
  getPracticeSignals(companyId: string, parcelId: string) { return result(analysisStore.get(companyId, parcelId)?.practiceSignals ?? null, 'TerraSat inference engine', ['Practice signals require field verification.']); }
  getEvidence(companyId: string, parcelId: string) {
    const analysis = analysisStore.get(companyId, parcelId);
    return result(analysis ? { scene: analysis.satelliteMetadata, pixelStats: analysis.pixelStats, indices: analysis.spectralStats } : null, 'Sentinel-2 raster evidence');
  }
  getSatelliteScenes(companyId: string, parcelId: string) { const a = analysisStore.get(companyId, parcelId); return result(a ? [a.satelliteMetadata] : null, 'STAC catalog and processed scene'); }
  compareParcels(companyId: string, parcelIds: string[]) { return result(parcelIds.map((id) => analysisStore.get(companyId, id)?.parcel).filter(Boolean), 'TerraSat persistent analysis store'); }
  getCompanyRiskSummary(companyId: string) { const parcels = analysisStore.list(companyId).map((a) => a.parcel); return result({ total: parcels.length, highRisk: parcels.filter((p) => p.status === 'high-risk').length }, 'TerraSat persistent analysis store'); }
}
export const aiToolRouter = new AIToolRouter();

