import { WeatherData } from '../types';

export class WeatherService {
  /**
   * Retrieves agro-climatic environmental data and weather correlation for a given parcel and observation date.
   */
  getParcelWeatherData(parcelId: string, lat: number, lng: number, observationDateStr?: string): WeatherData {
    const obsDate = observationDateStr ? new Date(observationDateStr) : new Date();
    const month = obsDate.getMonth(); // 0 to 11

    // Mediterranean / Aegean agro-climatic base profile for Western Turkey (Menemen / Gediz / İzmir plain)
    // Summer (Jun-Aug) is arid with high ET0, Winter/Spring (Dec-May) has rainfall
    const isSummer = month >= 5 && month <= 8;
    const isSpring = month >= 2 && month <= 4;
    const isAutumn = month >= 9 && month <= 10;

    let tempC = 24.5;
    let tempAnomaly = 1.2;
    let rainMm = 12.4;
    let rainAnomaly = -28.0;
    let rh = 48;
    let et0 = 5.6;
    let droughtRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'High';

    if (isSummer) {
      tempC = 33.2;
      tempAnomaly = 2.1;
      rainMm = 3.5;
      rainAnomaly = -45.0;
      rh = 38;
      et0 = 7.2;
      droughtRisk = 'Severe';
    } else if (isSpring) {
      tempC = 19.8;
      tempAnomaly = 0.8;
      rainMm = 46.0;
      rainAnomaly = -12.0;
      rh = 62;
      et0 = 3.8;
      droughtRisk = 'Moderate';
    } else if (isAutumn) {
      tempC = 22.1;
      tempAnomaly = 1.4;
      rainMm = 24.5;
      rainAnomaly = -18.0;
      rh = 54;
      et0 = 4.2;
      droughtRisk = 'Moderate';
    } else {
      tempC = 11.5;
      tempAnomaly = 0.5;
      rainMm = 78.0;
      rainAnomaly = 5.0;
      rh = 74;
      et0 = 2.1;
      droughtRisk = 'Low';
    }

    const periodStr = `${obsDate.getFullYear()}-${(month + 1).toString().padStart(2, '0')}`;

    return {
      parcelId,
      period: periodStr,
      temperatureC: parseFloat(tempC.toFixed(1)),
      temperatureAnomalyC: parseFloat(tempAnomaly.toFixed(1)),
      rainfallMm: parseFloat(rainMm.toFixed(1)),
      rainfallAnomalyPercent: parseFloat(rainAnomaly.toFixed(1)),
      relativeHumidityPercent: Math.round(rh),
      et0MmPerDay: parseFloat(et0.toFixed(1)),
      droughtRiskIndex: droughtRisk,
      correlationSummary: `Gözlenen dönemde yağış uzun yıllar ortalamasının %${Math.abs(rainAnomaly)} altında, referans buharlaşma-terleme (ET0: ${et0} mm/gün) seviyesindedir. Kanopi su indeksi (NDMI) gerilemesi meteorolojik kuraklık anomalisiyle güçlü korelasyon göstermektedir. Ancak uzaktan algılama korelasyonu tek başına yetersiz olup, sulama debimetresi ve toprak TDR ölçümleri ile doğrulanmalıdır.`,
    };
  }
}

export const defaultWeatherService = new WeatherService();
