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
  Check
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
  const { parcel, satelliteMetadata, spectralBands, calculatedIndices, historicalObservations, aiAssessment, isDemoMode } = analysisData;
  const [imageLayer, setImageLayer] = useState<'rgb' | 'ndvi' | 'ndwi' | 'moisture'>('ndvi');

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
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {isDemoMode ? 'DEMO MODE — SAMPLE DATA' : 'Sentinel-2 L2A BOA Analizi'}
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
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Kurumsal MRV Raporu Oluştur</span>
            </button>
          </div>
        </div>

        {/* 4 Core Quantitative Environmental Indicator Cards (Section 11) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* VEGETATION (NDVI) */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vejetasyon (NDVI)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                B08/B04
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {calculatedIndices.ndvi}
              </span>
              <span className={`text-xs font-bold font-mono flex items-center gap-1 ${calculatedIndices.ndviTrend < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {calculatedIndices.ndviTrend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{calculatedIndices.ndviTrend > 0 ? '+' : ''}{calculatedIndices.ndviTrend}%</span>
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Durum:</span>
              <span className="font-semibold text-slate-200">
                {calculatedIndices.ndvi >= 0.7 ? 'Sağlıklı Kanopi' : calculatedIndices.ndvi >= 0.6 ? 'Hafif Yavaşlama' : 'Belirgin Düşüş'}
              </span>
            </div>
          </div>

          {/* WATER (NDWI) */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kanopi Suyu (NDWI)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                Gao (B08-B11)
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {calculatedIndices.ndwi}
              </span>
              <span className={`text-xs font-bold font-mono flex items-center gap-1 ${calculatedIndices.ndwiTrend < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {calculatedIndices.ndwiTrend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                <span>{calculatedIndices.ndwiTrend > 0 ? '+' : ''}{calculatedIndices.ndwiTrend}%</span>
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Su Stresi:</span>
              <span className={`font-semibold ${
                calculatedIndices.waterStress === 'High' ? 'text-rose-400' : calculatedIndices.waterStress === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {calculatedIndices.waterStress === 'High' ? 'Yüksek Stres' : calculatedIndices.waterStress === 'Medium' ? 'Orta Düzey Kısıt' : 'Optimal'}
              </span>
            </div>
          </div>

          {/* MOISTURE (NDMI / Soil) */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Toprak Nemi (Model)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                NDMI Proxy
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                %{calculatedIndices.soilMoisture}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Profil: 0-30cm
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Tavsiye:</span>
              <span className="font-semibold text-amber-400">
                Saha Ölçümü Önerilir
              </span>
            </div>
          </div>

          {/* CARBON (Scientific Honesty Indicator - Section 12) */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-slate-800/90 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tahmini Karbon Eğilimi</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                Model Proxy
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-lg font-bold font-sans text-emerald-300 tracking-tight">
                {calculatedIndices.carbonIndicator === 'Positive' ? 'Pozitif Yönlü' : 'Dengeli / Stabil'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Örtü Vigor
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 leading-tight">
              *Model tahminidir. Kesin karbon stoku için yerinde toprak karot numunesi zorunludur.
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
                <span>Uydu Görüntüsü Katmanı</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <button
                  onClick={() => setImageLayer('rgb')}
                  className={`px-2 py-0.5 rounded ${imageLayer === 'rgb' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  RGB
                </button>
                <button
                  onClick={() => setImageLayer('ndvi')}
                  className={`px-2 py-0.5 rounded ${imageLayer === 'ndvi' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  NDVI
                </button>
                <button
                  onClick={() => setImageLayer('ndwi')}
                  className={`px-2 py-0.5 rounded ${imageLayer === 'ndwi' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  NDWI
                </button>
                <button
                  onClick={() => setImageLayer('moisture')}
                  className={`px-2 py-0.5 rounded ${imageLayer === 'moisture' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Stres
                </button>
              </div>
            </div>

            {/* Visualizer Image Canvas */}
            <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')`,
                  filter:
                    imageLayer === 'ndvi'
                      ? 'hue-rotate(60deg) saturate(2.2) contrast(1.3)'
                      : imageLayer === 'ndwi'
                      ? 'hue-rotate(180deg) saturate(1.8) contrast(1.2)'
                      : imageLayer === 'moisture'
                      ? 'hue-rotate(330deg) saturate(2.0)'
                      : 'none',
                }}
              />

              {/* Parcel boundary SVG overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <svg className="w-56 h-56 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" viewBox="0 0 100 100">
                  <polygon
                    points="20,25 80,15 85,75 15,80"
                    fill={
                      imageLayer === 'ndvi' 
                        ? 'rgba(16, 185, 129, 0.45)' 
                        : imageLayer === 'ndwi'
                        ? 'rgba(6, 182, 212, 0.45)'
                        : 'rgba(16, 185, 129, 0.25)'
                    }
                    stroke="#ffffff"
                    strokeWidth="3.5"
                  />
                </svg>
              </div>

              {/* Coordinates Badge */}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
                Sentinel-2B MSI • 10m L2A
              </div>

              {/* Cloud coverage */}
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-400 border border-slate-800">
                Bulut: %{satelliteMetadata.cloudCoveragePercent}
              </div>
            </div>

            {/* Spektral Bant Tablosu */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-[11px] font-mono text-slate-300">
              <div className="grid grid-cols-5 gap-1 text-center">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">B02 Blue</span>
                  <span className="text-white font-bold">{spectralBands.B02}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">B03 Green</span>
                  <span className="text-white font-bold">{spectralBands.B03}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">B04 Red</span>
                  <span className="text-white font-bold">{spectralBands.B04}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">B08 NIR</span>
                  <span className="text-emerald-400 font-bold">{spectralBands.B08}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">B11 SWIR</span>
                  <span className="text-cyan-400 font-bold">{spectralBands.B11}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: 6-Month Historical Time-Series Chart (7 cols) */}
          <div className="lg:col-span-7 bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Sentinel-2 Zaman Serisi Eğilimi (Nisan – Eylül 2026)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  6 periyodik uydu geçişinde vejetasyon (NDVI) ve kanopi su (NDWI) dinamikleri
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                10m Çözünürlük
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <TrendChart historicalData={historicalObservations} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase">NDVI Zirvesi</span>
                <span className="text-emerald-400 font-bold">15 Haz: 0.74</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px] uppercase">NDWI Gerilemesi</span>
                <span className="text-cyan-400 font-bold">0.35 ➔ 0.21 (-11.2%)</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[9px] uppercase">Gözlem Kalitesi</span>
                <span className="text-slate-200 font-bold">%100 Bulutsuz (&lt;%5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Environmental Assessment & Verification Panel (Gemini 3.8 Flash) - Sections 13, 14, 15, 16 */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Yapay Zekâ Çevresel Risk Değerlendirmesi
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {aiAssessment.modelUsed || 'Gemini 3.8 Flash'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Spektral indeksler ve meteorolojik kontekst üzerinden otomatik MRV çıkarımı
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Genel Durum:</span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                {aiAssessment.overallStatus}
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] block mb-1">
              Yönetici Özeti:
            </span>
            {aiAssessment.summary}
          </div>

          {/* 3 Key Findings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Temel Spektral Bulgular (Key Findings)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {aiAssessment.keyFindings.map((finding, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-relaxed">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk & Anomaly Signals */}
          {aiAssessment.risks && aiAssessment.risks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Tespit Edilen Çevresel Risk & Anomali Sinyalleri</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiAssessment.risks.map((risk, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{risk.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 uppercase">
                        {risk.severity === 'high' ? 'Yüksek' : 'Orta'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{risk.explanation}</p>
                    {risk.evidence && (
                      <div className="text-[10px] font-mono text-amber-400/80 pt-1">
                        Kanıt: {risk.evidence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Verification Protocol (Section 16) */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span>Önerilen Saha Doğrulama Planı (Field Verification Protocol)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">MRV Uyumluluk</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              TerraSat AI uzaktan algılama sinyallerini tespit eder; sertifikasyon ve denetim güvenliği için aşağıdaki yerinde kontrollerin tamamlanmasını şart koşar:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {aiAssessment.verificationNeeded.map((ver, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-slate-200 text-[11px]">{ver}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MRV Distinction Matrix: Measurement vs Reporting vs Verification (Section 17 - Part 10) */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              MRV Sınıflandırma Matrisi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* MEASUREMENT */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5" />
                  <span>1. Measurement (Ölçüm)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {aiAssessment.mrvStatus.measurement.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              {/* REPORTING */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. Reporting (Raporlama)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {aiAssessment.mrvStatus.reporting.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* VERIFICATION */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3. Verification (Doğrulama)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {aiAssessment.mrvStatus.verification.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
