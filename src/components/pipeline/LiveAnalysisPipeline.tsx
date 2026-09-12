import React, { useEffect, useState, useRef } from 'react';
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
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { Parcel, FullAnalysisPayload } from '../../types';

interface LiveAnalysisPipelineProps {
  parcel: Parcel;
  onComplete: (payload?: FullAnalysisPayload) => void;
  isDemoMode?: boolean;
}

interface StepUiState {
  id: string;
  number: number;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  techDetail?: string;
}

const DEFAULT_STAGES: StepUiState[] = [
  { id: 'stage-1', number: 1, name: 'Parsel Geometrisi Doğrulandı', description: 'GeoJSON koordinatları ve Bounding Box hesaplandı', status: 'running' },
  { id: 'stage-2', number: 2, name: 'Copernicus Sentinel-2 Katalog Taraması', description: 'STAC Level-2A BOA görüntüleri taranıyor', status: 'pending' },
  { id: 'stage-3', number: 3, name: 'En Uygun Uydu Gözlemi Seçildi', description: 'Düşük bulutluluklu en güncel sahne filtrelendi', status: 'pending' },
  { id: 'stage-4', number: 4, name: 'Uydu Verisi ve Bantlarına Erişim', description: '10m ve 20m COG raster URL’leri hazırlandı', status: 'pending' },
  { id: 'stage-5', number: 5, name: 'Bulut ve Gölge Filtreleme (SCL)', description: 'Scene Classification Layer ile geçersiz pikseller maskelendi', status: 'pending' },
  { id: 'stage-6', number: 6, name: 'Raster Parsel Sınırına Kırpılıyor', description: 'Seçilen poligon içi piksel matrisi ayrıştırıldı', status: 'pending' },
  { id: 'stage-7', number: 7, name: 'Multispektral Yansıma İşleme', description: 'B02, B03, B04, B08 NIR ve B11 SWIR değerleri okundu', status: 'pending' },
  { id: 'stage-8', number: 8, name: 'Gerçek NDVI Hesaplanıyor', description: 'Her geçerli piksel için (B08 - B04) / (B08 + B04) hesaplandı', status: 'pending' },
  { id: 'stage-9', number: 9, name: 'Gerçek NDWI Hesaplanıyor', description: 'Her geçerli piksel için (B03 - B08) / (B03 + B08) hesaplandı', status: 'pending' },
  { id: 'stage-10', number: 10, name: 'Gerçek NDMI ve Nem Hesaplanıyor', description: 'Her geçerli piksel için (B08 - B11) / (B08 + B11) hesaplandı', status: 'pending' },
  { id: 'stage-11', number: 11, name: 'Tarihsel Zaman Serisi Derleniyor', description: 'Geçmiş 6-12 aylık gerçek Sentinel-2 gözlemleri tarandı', status: 'pending' },
  { id: 'stage-12', number: 12, name: 'Yapay Zekâ Çevre Değerlendirmesi', description: 'Ölçülen veriler Gemini AI ile yorumlanıyor', status: 'pending' },
  { id: 'stage-13', number: 13, name: 'MRV Göstergeleri Oluşturuluyor', description: 'Ölçüm, Raporlama ve Saha Doğrulama protokolü ayrıştırıldı', status: 'pending' },
  { id: 'stage-14', number: 14, name: 'Kurumsal Denetim Raporu Hazırlandı', description: 'CSRD ve Scope 3 uyumlu resmi MRV raporu derlendi', status: 'pending' },
];

export const LiveAnalysisPipeline: React.FC<LiveAnalysisPipelineProps> = ({
  parcel,
  onComplete,
  isDemoMode = false,
}) => {
  const [stages, setStages] = useState<StepUiState[]>(DEFAULT_STAGES);
  const [currentStageNumber, setCurrentStageNumber] = useState(1);
  const [analysisPayload, setAnalysisPayload] = useState<FullAnalysisPayload | null>(null);
  const [activePreviewType, setActivePreviewType] = useState<'geometry' | 'rgb' | 'ndvi' | 'ndwi' | 'ndmi'>('geometry');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    let intervalId: any = null;
    let isCancelled = false;

    async function runJob() {
      try {
        console.log('[PIPELINE] Starting live satellite analysis job for parcel:', parcel.name);
        
        const startRes = await fetch('/api/satellite/start-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parcelId: parcel.id,
            name: parcel.name,
            crop: parcel.crop,
            location: parcel.location,
            polygon: parcel.polygon,
            isDemo: isDemoMode,
          }),
        });

        if (!startRes.ok) {
          throw new Error('Analiz işi başlatılamadı.');
        }

        const { jobId } = await startRes.json();
        console.log('[PIPELINE] Job ID created:', jobId);

        // Poll job status every 350ms
        intervalId = setInterval(async () => {
          if (isCancelled || isFinishedRef.current) return;

          try {
            const jobRes = await fetch(`/api/satellite/job/${jobId}`);
            if (!jobRes.ok) return;

            const jobData = await jobRes.json();
            
            if (jobData.stages && Array.isArray(jobData.stages)) {
              setStages(jobData.stages);
              setCurrentStageNumber(jobData.currentStageNumber || 1);

              // Update preview mode based on stage
              if (jobData.currentStageNumber >= 10) {
                setActivePreviewType('ndmi');
              } else if (jobData.currentStageNumber >= 9) {
                setActivePreviewType('ndwi');
              } else if (jobData.currentStageNumber >= 8) {
                setActivePreviewType('ndvi');
              } else if (jobData.currentStageNumber >= 4) {
                setActivePreviewType('rgb');
              }
            }

            if (jobData.status === 'completed' && jobData.result) {
              clearInterval(intervalId);
              isFinishedRef.current = true;
              setAnalysisPayload(jobData.result);
              console.log('[PIPELINE] Job completed successfully!');
              
              setTimeout(() => {
                onComplete(jobData.result);
              }, 800);
            } else if (jobData.status === 'failed') {
              clearInterval(intervalId);
              setErrorMsg(jobData.error || 'İşlem sırasında hata meydana geldi.');
            }
          } catch (pollErr) {
            console.warn('[PIPELINE] Poll warning:', pollErr);
          }
        }, 350);

      } catch (err: any) {
        console.error('[PIPELINE] Execution error:', err);
        setErrorMsg(err.message || 'Analiz başlatılamadı.');
      }
    }

    runJob();

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [parcel, isDemoMode, onComplete]);

  const currentStage = stages[Math.min(currentStageNumber - 1, stages.length - 1)];

  return (
    <div className="w-full h-full bg-[#080c14] text-slate-200 flex flex-col p-4 sm:p-8 overflow-y-auto">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto w-full mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-400">
              Canlı Spektral Analiz Pipeline (14 Aşama)
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">
              {isDemoMode ? 'Demo Arşivi' : 'Copernicus Sentinel-2 L2A BOA'}
            </span>
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
              %{Math.min(100, Math.round((currentStageNumber / stages.length) * 100))}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            {errorMsg ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <RotateCw className="w-5 h-5 text-emerald-400 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-6xl mx-auto w-full mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">Analiz Hatası:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Main Grid: Pipeline Step List (Left) + Satellite Visual Simulation (Right) */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Pipeline Step Flow (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5 bg-[#090d16]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Analitik İşlem Aşamaları
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {Math.min(currentStageNumber, stages.length)} / {stages.length} Aşama
            </span>
          </div>

          <div className="space-y-1.5 pt-1 max-h-[580px] overflow-y-auto pr-1">
            {stages.map((stage, idx) => {
              const isCompleted = stage.status === 'completed';
              const isRunning = stage.status === 'running';
              const isFailed = stage.status === 'failed';

              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                    isRunning
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                      : isFailed
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-slate-950/20 border-transparent text-slate-600 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isRunning ? (
                      <RotateCw className="w-4 h-4 text-emerald-400 animate-spin" />
                    ) : isFailed ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold truncate ${isRunning ? 'text-white font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                        {stage.name}
                      </span>
                      {isRunning && (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider animate-pulse">
                          İşleniyor
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {stage.techDetail || stage.description}
                    </div>
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
                <span>Gerçek Spektral Görüntü</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {activePreviewType === 'geometry' && 'Parsel Vektör Sınırı'}
                {activePreviewType === 'rgb' && 'Sentinel-2 L2A (RGB)'}
                {activePreviewType === 'ndvi' && 'Hesaplanan NDVI Matrisi'}
                {activePreviewType === 'ndwi' && 'Hesaplanan NDWI Su İndeksi'}
                {activePreviewType === 'ndmi' && 'Hesaplanan NDMI Nem İndeksi'}
              </span>
            </div>

            {/* Satellite Image Graphic Frame */}
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* If real raster PNG has arrived from backend, display it directly */}
              {analysisPayload?.visualizations?.rgbPngBase64 && activePreviewType === 'rgb' ? (
                <img
                  src={analysisPayload.visualizations.rgbPngBase64}
                  alt="Sentinel-2 L2A True Color"
                  className="w-full h-full object-contain p-4 transition-all duration-500"
                />
              ) : analysisPayload?.visualizations?.ndviPngBase64 && activePreviewType === 'ndvi' ? (
                <img
                  src={analysisPayload.visualizations.ndviPngBase64}
                  alt="Calculated NDVI Raster"
                  className="w-full h-full object-contain p-4 transition-all duration-500"
                />
              ) : analysisPayload?.visualizations?.ndwiPngBase64 && activePreviewType === 'ndwi' ? (
                <img
                  src={analysisPayload.visualizations.ndwiPngBase64}
                  alt="Calculated NDWI Raster"
                  className="w-full h-full object-contain p-4 transition-all duration-500"
                />
              ) : analysisPayload?.visualizations?.ndmiPngBase64 && activePreviewType === 'ndmi' ? (
                <img
                  src={analysisPayload.visualizations.ndmiPngBase64}
                  alt="Calculated NDMI Raster"
                  className="w-full h-full object-contain p-4 transition-all duration-500"
                />
              ) : analysisPayload?.visualizations?.rgbPreviewUrl ? (
                <img
                  src={analysisPayload.visualizations.rgbPreviewUrl}
                  alt="Sentinel-2 STAC Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                /* High-tech vector wireframe scan while bands are downloading */
                <div className="absolute inset-0 bg-[#060a12] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-32 h-32 relative mb-4">
                    <svg className="w-full h-full text-emerald-500/30 animate-pulse" viewBox="0 0 100 100">
                      <polygon
                        points="25,20 80,15 85,80 15,85"
                        fill="rgba(16, 185, 129, 0.15)"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Satellite className="w-10 h-10 text-emerald-400 animate-bounce" />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">
                    Level-2A BOA Raster Ayrıştırılıyor...
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 max-w-xs">
                    Piksel seviyesinde atmosferik düzeltme ve bulut filtreleme yürütülüyor
                  </span>
                </div>
              )}

              {/* Raster Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent h-16 w-full animate-pulse pointer-events-none" />

              {/* Coordinates Badge */}
              <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 border border-slate-800">
                {parcel.polygon[0]?.[0].toFixed(4)}°K, {parcel.polygon[0]?.[1].toFixed(4)}°D
              </div>

              {/* Tile / Scene Badge */}
              <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                {analysisPayload?.satelliteMetadata?.sceneId ? analysisPayload.satelliteMetadata.sceneId.slice(0, 22) + '...' : 'T35SNC'}
              </div>
            </div>

            {/* Live Telemetry Footer */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Sensör</span>
                <span className="text-slate-200">
                  {analysisPayload?.satelliteMetadata?.sensor || 'Sentinel-2B MSI'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Çözünürlük</span>
                <span className="text-slate-200">10 Metre (B02, B03, B04, B08)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Atmosferik Seviye</span>
                <span className="text-emerald-400">BOA (Bottom-of-Atmosphere)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Bulut Filtresi</span>
                <span className="text-emerald-400">SCL Geçerli</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
