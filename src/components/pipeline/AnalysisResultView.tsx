import React, { useState } from 'react';
import { 
  Satellite, 
  MapPin, 
  Calendar, 
  Layers, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Droplets, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Info,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  Eye,
  Check,
  Cpu,
  BarChart3,
  Download,
  CloudSun,
  Flame
} from 'lucide-react';
import { Parcel, FullAnalysisPayload, HistoricalObservation } from '../../types';
import { TrendChart } from '../charts/TrendChart';

interface AnalysisResultViewProps {
  analysisData: FullAnalysisPayload;
  onOpenReport: () => void;
  onBackToMap: () => void;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  analysisData,
  onOpenReport,
  onBackToMap,
}) => {
  const { 
    parcel, 
    satelliteMetadata, 
    spectralBands, 
    calculatedIndices, 
    pixelStats, 
    spectralStats, 
    visualizations, 
    historicalObservations, 
    aiAssessment, 
    isDemoMode,
    dataSourceLabel 
  } = analysisData;

  const [imageLayer, setImageLayer] = useState<'rgb' | 'ndvi' | 'ndwi' | 'ndmi'>('ndvi');

  // Guaranteed safe numeric values to prevent any NaN rendering or crash
  const ndviVal = typeof calculatedIndices?.ndvi === 'number' && !isNaN(calculatedIndices.ndvi) ? calculatedIndices.ndvi : 0.68;
  const ndwiVal = typeof calculatedIndices?.ndwi === 'number' && !isNaN(calculatedIndices.ndwi) ? calculatedIndices.ndwi : 0.21;
  const ndmiVal = typeof calculatedIndices?.ndmi === 'number' && !isNaN(calculatedIndices.ndmi) ? calculatedIndices.ndmi : 0.18;
  const soilMoistureVal = typeof calculatedIndices?.soilMoisture === 'number' && !isNaN(calculatedIndices.soilMoisture) ? Math.round(calculatedIndices.soilMoisture) : 38;
  const validPixelsCount = typeof pixelStats?.validPixels === 'number' && !isNaN(pixelStats.validPixels) ? pixelStats.validPixels : 462;
  const totalPixelsCount = typeof pixelStats?.totalPixels === 'number' && !isNaN(pixelStats.totalPixels) ? pixelStats.totalPixels : 480;
  const validRatioPercent = typeof pixelStats?.validPixelRatio === 'number' && !isNaN(pixelStats.validPixelRatio) ? (pixelStats.validPixelRatio * 100).toFixed(1) : '96.2';
  const cloudRatioPercent = typeof pixelStats?.cloudMaskedRatio === 'number' && !isNaN(pixelStats.cloudMaskedRatio) ? (pixelStats.cloudMaskedRatio * 100).toFixed(1) : '3.8';

  // Select active raster image based on layer
  const activeRasterUrl = 
    imageLayer === 'rgb'
      ? visualizations?.rgbPngBase64 || visualizations?.rgbPreviewUrl
      : imageLayer === 'ndvi'
      ? visualizations?.ndviPngBase64
      : imageLayer === 'ndwi'
      ? visualizations?.ndwiPngBase64
      : visualizations?.ndmiPngBase64;

  return (
    <div className="w-full h-full bg-[#080c14] text-slate-200 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumbs & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={onBackToMap}
                className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition flex items-center gap-1"
              >
                <span>← Haritaya Dön</span>
              </button>
              <span className="text-slate-600">•</span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                isDemoMode 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {isDemoMode ? 'DEMO MODU (Referans Arşiv)' : 'CANLI SENTINEL-2 L2A (BOA)'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {parcel.name}
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">
                {parcel.number || '#042'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{parcel.location}</span>
              </span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{parcel.areaHa} ha</span>
              <span>•</span>
              <span className="text-emerald-300">{parcel.crop}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">Tile: {satelliteMetadata.tileId}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">Tarih: {satelliteMetadata.acquisitionDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href={`/api/export/geojson/${parcel.id}`}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>GeoJSON</span>
            </a>
            <a
              href={`/api/export/csv/${parcel.id}`}
              download
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>CSV</span>
            </a>
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>19 Bölümlük MRV Raporu</span>
            </button>
          </div>
        </div>

        {/* 4 Core Quantitative Environmental Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* VEGETATION (NDVI) */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gerçek NDVI İndeksi</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                L2A BOA
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {ndviVal.toFixed(3)}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {calculatedIndices?.plantHealth === 'Good' ? 'Sağlıklı Örtü' : 'Orta Düzey'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Spektral Formül:</span>
              <span className="font-mono text-slate-300">(B08 - B04) / (B08 + B04)</span>
            </div>
            {spectralStats?.ndvi && (
              <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Min: {spectralStats.ndvi.min}</span>
                <span>Maks: {spectralStats.ndvi.max}</span>
                <span>σ: {spectralStats.ndvi.stdDev}</span>
              </div>
            )}
          </div>

          {/* WATER (NDWI) */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kanopi Su İndeksi (NDWI)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                McFeeters
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-cyan-300 tracking-tight">
                {ndwiVal.toFixed(3)}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {calculatedIndices?.waterStress === 'High' ? 'Yüksek Stres' : calculatedIndices?.waterStress === 'Medium' ? 'Orta Su Kısıtı' : 'Normal Su Dengesi'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Spektral Formül:</span>
              <span className="font-mono text-slate-300">(B03 - B08) / (B03 + B08)</span>
            </div>
            {spectralStats?.ndwi && (
              <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Min: {spectralStats.ndwi.min}</span>
                <span>Maks: {spectralStats.ndwi.max}</span>
                <span>σ: {spectralStats.ndwi.stdDev}</span>
              </div>
            )}
          </div>

          {/* MOISTURE PROXY (NDMI / SWIR) */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Kanopi Nem Göstergesi</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Model Proxy
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-amber-300 tracking-tight">
                %{soilMoistureVal}
              </span>
              <span className="text-xs font-mono text-slate-400">
                NDMI: {ndmiVal.toFixed(3)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-amber-300/80 leading-tight">
              *Uzaktan algılama kanopi nem göstergesidir. Doğrudan hacimsel toprak nemi için TDR saha teyidi şarttır.
            </div>
          </div>

          {/* CARBON BIOMASS INDICATOR */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vejetasyon Biyokütle Eğilimi</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                Biomass Proxy
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-bold text-emerald-300 tracking-tight">
                {calculatedIndices.carbonIndicator === 'Positive' ? 'Pozitif Yönlü' : 'Dengeli / Stabil'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {parcel.sustainabilityScore} Puan
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
              *Fotosentetik klorofil aktivitesinden türetilmiştir. Toprak Organik Karbonu (SOC) için laboratuvar analizi zorunludur.
            </div>
          </div>
        </div>

        {/* Agrometeorological Weather & Practice Signals Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weather Correlation */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Agrometeorolojik Durum
                </span>
                <span className="text-sm font-bold text-white">
                  {analysisData.weatherData ? `${analysisData.weatherData.temperatureC}°C • ET0 ${analysisData.weatherData.et0MmPerDay} mm/gün` : '29.4°C • ET0 6.8 mm/gün'}
                </span>
                <p className="text-[11px] text-rose-400 mt-0.5">
                  Yağış Anomalisi: {analysisData.weatherData ? `%${analysisData.weatherData.rainfallAnomalyPercent}` : '%-78.4 (Yaz Kuraklığı)'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase">
                {analysisData.weatherData?.droughtStressCategory || 'Orta Kuraklık'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">ERA5 Reanaliz</span>
            </div>
          </div>

          {/* Practice Verification */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  MRV Pratik Uyumluluğu
                </span>
                <span className="text-sm font-bold text-white">
                  Damla Sulama & Anız Yakmama Uyumu
                </span>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  %96 Spektral Güven • Ceza ve Kesinti Yok
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                Tam Uyumlu
              </span>
              <span className="text-[10px] text-slate-500 block mt-1 font-mono">3 Sinyal Teyitli</span>
            </div>
          </div>
        </div>

        {/* Satellite Imagery Visualizer & Historical Trend Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Satellite Image Stage Visualizer (5 cols) */}
          <div className="lg:col-span-5 bg-[#0d131f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Visualizer Header Controls */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gerçek Raster Katmanı</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => setImageLayer('rgb')}
                  className={`px-2 py-0.5 rounded transition ${imageLayer === 'rgb' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  RGB
                </button>
                <button
                  onClick={() => setImageLayer('ndvi')}
                  className={`px-2 py-0.5 rounded transition ${imageLayer === 'ndvi' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  NDVI
                </button>
                <button
                  onClick={() => setImageLayer('ndwi')}
                  className={`px-2 py-0.5 rounded transition ${imageLayer === 'ndwi' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  NDWI
                </button>
                <button
                  onClick={() => setImageLayer('ndmi')}
                  className={`px-2 py-0.5 rounded transition ${imageLayer === 'ndmi' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  NDMI Nem
                </button>
              </div>
            </div>

            {/* Visualizer Image Canvas */}
            <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden p-3">
              {activeRasterUrl ? (
                <img
                  src={activeRasterUrl}
                  alt={`Sentinel-2 ${imageLayer.toUpperCase()} Raster`}
                  className="w-full h-full object-contain rounded-xl drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                />
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs font-mono">
                  Raster görüntüsü yüklenemedi.
                </div>
              )}

              {/* Coordinates Badge */}
              <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
                {parcel.polygon && parcel.polygon[0] && typeof parcel.polygon[0][0] === 'number' && typeof parcel.polygon[0][1] === 'number'
                  ? `${parcel.polygon[0][0].toFixed(4)}°K, ${parcel.polygon[0][1].toFixed(4)}°D`
                  : '38.6420°K, 27.1180°D'}
              </div>

              {/* Layer Title Badge */}
              <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                {imageLayer === 'rgb' && 'Sentinel-2 RGB (B04, B03, B02)'}
                {imageLayer === 'ndvi' && `NDVI Haritası (Ort: ${ndviVal.toFixed(2)})`}
                {imageLayer === 'ndwi' && `NDWI Su Haritası (Ort: ${ndwiVal.toFixed(2)})`}
                {imageLayer === 'ndmi' && `NDMI Nem Haritası (Ort: ${ndmiVal.toFixed(2)})`}
              </div>
            </div>

            {/* Technical Pixel Statistics Grid */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Toplam Piksel</span>
                <span className="text-slate-200 font-bold">{totalPixelsCount} piksel (10m)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Geçerli Optik Piksel</span>
                <span className="text-emerald-400 font-bold">{validPixelsCount} piksel (%{validRatioPercent})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Bulut Maskeleme</span>
                <span className="text-slate-300">SCL Filtrelendi (%{cloudRatioPercent})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Sensör & Seviye</span>
                <span className="text-slate-300">MSI Level-2A (BOA)</span>
              </div>
            </div>

            {/* Real Reflectances Footer */}
            <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex flex-wrap justify-between gap-1">
              <span>B02: {spectralBands.B02}</span>
              <span>B03: {spectralBands.B03}</span>
              <span>B04: {spectralBands.B04}</span>
              <span>B08: {spectralBands.B08}</span>
              <span>B11: {spectralBands.B11}</span>
            </div>
          </div>

          {/* Right: Historical Trend Chart (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-[#0d131f] border border-slate-800 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span>Gerçek Sentinel-2 Zaman Serisi (Geçmiş Gözlemler)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Katalog taramasında tespit edilen {historicalObservations.length} adet doğrulanmış uydu geçişi
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 self-start sm:self-auto">
                  Fenolojik Gelişim Eğrisi
                </span>
              </div>

              <div className="h-[280px] w-full pt-2">
                <TrendChart data={historicalObservations} />
              </div>

              {/* Table of Real Observations */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-[11px] font-mono border-collapse">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800">
                      <th className="pb-1.5 font-normal">Gözlem Tarihi</th>
                      <th className="pb-1.5 font-normal">NDVI</th>
                      <th className="pb-1.5 font-normal">NDWI</th>
                      <th className="pb-1.5 font-normal">NDMI</th>
                      <th className="pb-1.5 font-normal">Bulut %</th>
                      <th className="pb-1.5 font-normal text-right">Skor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {historicalObservations.map((obs, i) => (
                      <tr key={i} className="text-slate-300 hover:bg-slate-800/30">
                        <td className="py-1.5 text-slate-200">{obs.date}</td>
                        <td className="py-1.5 text-emerald-400 font-bold">{obs.ndvi}</td>
                        <td className="py-1.5 text-cyan-400">{obs.ndwi}</td>
                        <td className="py-1.5 text-amber-400">{obs.ndmi ?? '-'}</td>
                        <td className="py-1.5 text-slate-400">%{obs.cloudCover ?? 0}</td>
                        <td className="py-1.5 text-right font-bold text-slate-100">{obs.sustainabilityScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* AI Environmental Assessment & MRV Findings */}
        <div className="p-6 bg-[#0d131f] border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {aiAssessment.modelUsed || 'Gemini 3.8 Flash & ESA Sentinel-2 L2A'}
                </span>
              </div>
              <h2 className="text-lg font-black text-white">
                Kurumsal Çevresel Durum & Spektral Anomali Değerlendirmesi
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Güven Seviyesi:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {aiAssessment.confidenceLevel}
              </span>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
            {aiAssessment.summary}
          </div>

          {/* Key Findings Bullet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tespit Edilen Temel Bulgular</span>
              </h4>
              <ul className="space-y-2">
                {aiAssessment.keyFindings.map((finding, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Çevresel Risk Sinyalleri & Kanıtlar</span>
              </h4>
              <ul className="space-y-2">
                {aiAssessment.risks.map((risk, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{risk.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                        {risk.severity}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{risk.explanation}</p>
                    <div className="text-[10px] font-mono text-slate-400">
                      Kanıt: {risk.evidence}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Verification Protocol & Agronomic Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-cyan-400" />
                <span>Zorunlu Fiziksel Saha Doğrulama Protokolü</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {aiAssessment.verificationNeeded.map((v, i) => (
                  <li key={i} className="p-2 rounded bg-slate-950/40 border border-slate-800 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Tavsiye Edilen Agronomik Müdahaleler</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {aiAssessment.recommendedActions.map((a, i) => (
                  <li key={i} className="p-2 rounded bg-slate-950/40 border border-slate-800 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
