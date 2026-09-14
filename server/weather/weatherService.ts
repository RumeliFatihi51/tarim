import { WeatherData } from '../types';
import { fetchWithTimeout } from '../http';
import { AppError } from '../errors';

interface OpenMeteoDaily {
  time: string[]; temperature_2m_mean: number[]; temperature_2m_min: number[]; temperature_2m_max: number[];
  precipitation_sum: number[]; relative_humidity_2m_mean: number[]; et0_fao_evapotranspiration: number[];
  wind_speed_10m_max: number[];
}

export class WeatherService {
  async getParcelWeatherData(parcelId: string, lat: number, lng: number, observationDateStr?: string): Promise<WeatherData> {
    const parsedDate = observationDateStr ? new Date(observationDateStr) : new Date();
    const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    const end = date.toISOString().slice(0, 10);
    const startDate = new Date(date); startDate.setUTCDate(startDate.getUTCDate() - 29);
    const start = startDate.toISOString().slice(0, 10);
    const params = new URLSearchParams({
      latitude: String(lat), longitude: String(lng), start_date: start, end_date: end,
      daily: 'temperature_2m_mean,temperature_2m_min,temperature_2m_max,precipitation_sum,relative_humidity_2m_mean,et0_fao_evapotranspiration,wind_speed_10m_max',
      timezone: 'UTC',
    });
    try {
      const response = await fetchWithTimeout(`https://archive-api.open-meteo.com/v1/archive?${params}`);
      if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
      const payload = await response.json() as { daily?: OpenMeteoDaily; daily_units?: Record<string, string> };
      const daily = payload.daily;
      if (!daily?.time?.length) throw new Error('Open-Meteo returned no daily observations');
      const mean = (values: number[]) => values.filter(Number.isFinite).reduce((sum, value) => sum + value, 0) / values.filter(Number.isFinite).length;
      const sum = (values: number[]) => values.filter(Number.isFinite).reduce((total, value) => total + value, 0);
      const rainfall = sum(daily.precipitation_sum);
      const et0 = mean(daily.et0_fao_evapotranspiration);
      const droughtRisk: WeatherData['droughtRiskIndex'] = rainfall < 10 && et0 > 5 ? 'Severe' : rainfall < 25 ? 'High' : rainfall < 50 ? 'Moderate' : 'Low';
      return {
        parcelId, period: `${start}/${end}`, temperatureC: Number(mean(daily.temperature_2m_mean).toFixed(1)),
        rainfallMm: Number(rainfall.toFixed(1)), relativeHumidityPercent: Math.round(mean(daily.relative_humidity_2m_mean)),
        et0MmPerDay: Number(et0.toFixed(1)), droughtRiskIndex: droughtRisk,
        correlationSummary: 'Meteorological context is reported independently. No NDVI–rainfall correlation is claimed unless a paired time-series calculation is available.',
        tempMinC: Number(Math.min(...daily.temperature_2m_min).toFixed(1)), tempMaxC: Number(Math.max(...daily.temperature_2m_max).toFixed(1)),
        windSpeedKmh: Number(Math.max(...daily.wind_speed_10m_max).toFixed(1)), observationDate: end,
        provider: 'Open-Meteo Historical Weather API', dataSource: 'Open-Meteo', fetchedAt: new Date().toISOString(),
        location: { lat, lng }, units: payload.daily_units || {}, dataFreshness: `Fetched ${new Date().toISOString()}`,
      };
    } catch (error) {
      throw new AppError('WEATHER_PROVIDER_ERROR', `Weather data unavailable: ${error instanceof Error ? error.message : String(error)}`, 502);
    }
  }
}

export const defaultWeatherService = new WeatherService();
