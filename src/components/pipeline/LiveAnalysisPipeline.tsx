import React, { useEffect, useState } from 'react';
import { 
  Satellite, 
  CheckCircle2, 
  RotateCw, 
  Layers, 
  Eye, 
  Activity, 
  Sparkles, 
  MapPin, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Parcel } from '../../types';

interface LiveAnalysisPipelineProps {
  parcel: Parcel;
  onComplete: () => void;
  isDemoMode?: boolean;
}

interface PipelineStepItem {
  id: string;
  title: string;
  techDetail: string;
  visualStage: 'original' | 'geometry' | 'cloud' | 'ndvi' | 'ndwi' | 'stress';
}

export const LiveAnalysisPipeline: React.FC<LiveAnalysisPipelineProps> = ({
  parcel,
  onComplete,
  isDemoMode = false,
}) => {
  const steps: PipelineStepItem[] = [
    {
      id: 'step-1',
      title: 'Parsel geometrisi ve koordinat sınırları alındı',
      techDetail: `GeoJSON Polygon (${parcel.areaHa} ha, Bounding Box hesaplandı)`,
      visualStage: 'geometry',
    },
    {
      id: 'step-2',
      title: 'Copernicus Sentinel-2 L2A katalog taraması',
      techDetail: 'MGRS Tile: T35SNC (Sentinel-2B MSI MultiSpectral Instrument)',
      visualStage: 'original',
    },
    {
      id: 'step-3',
      title: 'Bulut filtreleme ve atmosferik düzeltme (Cloud Screening)',
      techDetail: 'Bulutluluk: %4.2 (<%15 eşik değeri onaylandı, L2A BOA)',
      visualStage: 'cloud',
    },
    {
      id: 'step-4',
      title: 'Spektral bant ayrıştırma (B02, B03, B04, B08 NIR, B11 SWIR)',
      techDetail: '10m ve 20m zemin yansıma değerleri normalize edildi',
      visualStage: 'original',
    },
    {
      id: 'step-5',
      title: 'NDVI Bitki Sağlığı indeksi hesaplanıyor',
      techDetail: 'Formül: (B08 - B04) / (B08 + B04) = ' + parcel.ndvi,
      visualStage: 'ndvi',
    },
    {
      id: 'step-6',
      title: 'NDWI (Gao) Kanopi su içeriği hesaplanıyor',
      techDetail: 'Formül: (B08 - B11) / (B08 + B11) = ' + parcel.ndwi,
      visualStage: 'ndwi',
    },
    {
      id: 'step-7',
      title: 'NDMI & Yüzey nem / su kısıtı analizi',
      techDetail: 'Tahmini toprak profili nemi: %' + parcel.soilMoisture + ' (Model-türetilmiş)',
      visualStage: 'stress',
    },
    {
      id: 'step-8',
      title: '6 aylık tarihsel zaman serisi çıkarımı',
      techDetail: 'Nisan - Eylül 2026 periyodu (6 uydu geçişi doğrulandı)',
      visualStage: 'stress',
    },
    {
      id: 'step-9',
      title: 'Gemini 3.8 Flash kurumsal çevre & anomali değerlendirmesi',
      techDetail: 'Yönetici özeti, risk sinyalleri ve saha teyit protokolü oluşturuluyor',
      visualStage: 'ndvi',
    },
    {
      id: 'step-10',
      title: 'Kurumsal MRV denetim raporu derleme',
      techDetail: 'CSRD ve Scope 3 uyumlu resmi doğrulama çıktısı hazırlandı',
      visualStage: 'geometry',
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (currentStepIndex < steps.length) {
      // Step durations between 350ms and 650ms for a snappy, realistic 5-second seminar demonstration
      const timeout = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, currentStepIndex === 8 ? 800 : 450);

      return () => clearTimeout(timeout);
    } else {
      // Finished all steps! Complete after brief delay
      const finishTimeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(finishTimeout);
    }
  }, [currentStepIndex, steps.length, onComplete]);

  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];

  return (
    <div className="w-full h-full bg-[#080c14] text-slate-200 flex flex-col p-4 sm:p-8 overflow-y-auto">
      {/* Header Banner */}
      <div className="max-w-5xl mx-auto w-full mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">
              Canlı Spektral Analiz Pipeline
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Sentinel-2B MSI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {parcel.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{parcel.location}</span>
            <span>•</span>
            <span className="text-slate-300 font-mono">{parcel.areaHa} ha ({parcel.crop})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className="text-[11px] text-slate-500 block uppercase">İlerleme</span>
            <span className="text-base font-bold text-emerald-400">
              %{Math.min(100, Math.round(((currentStepIndex + 1) / steps.length) * 100))}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <RotateCw className="w-5 h-5 text-emerald-400 animate-spin" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Step List (Left) + Satellite Visual Simulation (Right) */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Pipeline Step Flow (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5 bg-[#090d16]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Analiz Aşamaları
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {Math.min(currentStepIndex + 1, steps.length)} / {steps.length} Aşama
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isRunning = idx === currentStepIndex;
              const isWaiting = idx > currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                    isRunning
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                      : 'bg-slate-950/20 border-transparent text-slate-600 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isRunning ? (
                      <RotateCw className="w-4 h-4 text-emerald-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold truncate ${isRunning ? 'text-white font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                        {step.title}
                      </span>
                      {isRunning && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
                          İşleniyor
                        </span>
                      )}
                    </div>

                    {(isRunning || isCompleted) && (
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {step.techDetail}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Satellite Imagery Stage Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spektral Önizleme</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {currentStep.visualStage === 'original' && 'RGB True Color'}
                {currentStep.visualStage === 'geometry' && 'Parsel Vektör Sınırı'}
                {currentStep.visualStage === 'cloud' && 'Bulut Maskesi (SCL)'}
                {currentStep.visualStage === 'ndvi' && 'NDVI False Color'}
                {currentStep.visualStage === 'ndwi' && 'NDWI Sıvı Su Katsayısı'}
                {currentStep.visualStage === 'stress' && 'Hidrik Stres Isı Haritası'}
              </span>
            </div>

            {/* Satellite Image Graphic Frame */}
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Simulated Esri / Sentinel Tile with False-Color filter based on visualStage */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')`,
                  filter: 
                    currentStep.visualStage === 'ndvi'
                      ? 'hue-rotate(60deg) saturate(2.2) contrast(1.3)'
                      : currentStep.visualStage === 'ndwi'
                      ? 'hue-rotate(180deg) saturate(1.8) contrast(1.2)'
                      : currentStep.visualStage === 'cloud'
                      ? 'brightness(1.3) contrast(1.1)'
                      : currentStep.visualStage === 'stress'
                      ? 'hue-rotate(330deg) saturate(2.0)'
                      : 'none',
                }}
              />

              {/* Raster Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent h-16 w-full animate-pulse pointer-events-none" />

              {/* Parcel boundary SVG overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <svg className="w-48 h-48 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" viewBox="0 0 100 100">
                  <polygon
                    points="20,25 80,15 85,75 15,80"
                    fill={
                      currentStep.visualStage === 'ndvi' 
                        ? 'rgba(16, 185, 129, 0.45)' 
                        : currentStep.visualStage === 'ndwi'
                        ? 'rgba(6, 182, 212, 0.45)'
                        : 'rgba(16, 185, 129, 0.25)'
                    }
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeDasharray={currentStep.visualStage === 'geometry' ? '4 2' : 'none'}
                  />
                </svg>
              </div>

              {/* Coordinates Badge */}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
                38.6420°K, 27.1180°D
              </div>

              {/* Scene ID */}
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-slate-400 border border-slate-800">
                S2B_L2A_20260908
              </div>
            </div>

            {/* Quick Live Telemetry */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Sensör</span>
                <span className="text-slate-200">Sentinel-2B MSI</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Spektral Çözünürlük</span>
                <span className="text-slate-200">10 Metre (B04/B08)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Atmosferik Seviye</span>
                <span className="text-emerald-400">BOA (Bottom-of-Atmosphere)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Gözlem Tarihi</span>
                <span className="text-slate-200">08 Eylül 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
