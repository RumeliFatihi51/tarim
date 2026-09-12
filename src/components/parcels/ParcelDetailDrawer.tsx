import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileCheck2, 
  MapPin, 
  Droplets, 
  Activity, 
  Layers, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  ExternalLink,
  Info,
  Maximize2
} from 'lucide-react';
import { Parcel, AIAnalysisResult } from '../../types';
import { TrendChart } from '../charts/TrendChart';
import { AIAnalysisPanel } from '../ai/AIAnalysisPanel';
import { Tooltip } from '../common/Tooltip';

interface ParcelDetailDrawerProps {
  parcel: Parcel | null;
  onClose: () => void;
  onGenerateReport: (parcel: Parcel, analysis: AIAnalysisResult | null) => void;
}

export const ParcelDetailDrawer: React.FC<ParcelDetailDrawerProps> = ({
  parcel,
  onClose,
  onGenerateReport,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  if (!parcel) return null;

  // Run AI analysis via backend API /api/analyze
  const handleRunAI = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parcel),
      });

      if (!response.ok) {
        throw new Error('Sunucu analizi tamamlayamadı');
      }

      const data: AIAnalysisResult = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  const isHealthy = parcel.status === 'healthy';
  const isModerate = parcel.status === 'moderate';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#090d16] border-l border-slate-800/90 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d131f]/90 flex items-start justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {parcel.number}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">{parcel.name}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {parcel.location}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-200">{parcel.crop}</span>
            <span>•</span>
            <span>{parcel.areaHa} ha</span>
            <span>•</span>
            <span className="text-slate-400 font-mono">{parcel.contractId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Status & Composite Sustainability Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sustainability Score Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Sürdürülebilirlik Skoru
                </span>
              </div>
              <Tooltip content="Bileşik demonstrasyon skoru: Vejetasyon, su dengesi, toprak nemi ve karbon tutum indikatörlerinin ağırlıklı ortalamasıdır." />
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {parcel.sustainabilityScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
              <span
                className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isHealthy
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isModerate
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isHealthy ? 'Yüksek Uyum' : isModerate ? 'Orta Düzey Uyum' : 'Düşük / Riskli'}
              </span>
            </div>

            {/* Subscore progress bars */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Vejetasyon & Kanopi Sağlığı:</span>
                <span className="font-mono text-slate-200 font-semibold">{parcel.scoreBreakdown.vegetation}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${parcel.scoreBreakdown.vegetation}%` }} />
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-1">
                <span>Su Göstergesi & Verimlilik:</span>
                <span className="font-mono text-slate-200 font-semibold">{parcel.scoreBreakdown.water}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${parcel.scoreBreakdown.water}%` }} />
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-1">
                <span>Toprak Nemi & Durumu:</span>
                <span className="font-mono text-slate-200 font-semibold">{parcel.scoreBreakdown.soil}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${parcel.scoreBreakdown.soil}%` }} />
              </div>

              <div className="flex items-center justify-between text-slate-400 pt-1">
                <span>Karbon Tutum Eğilimi:</span>
                <span className="font-mono text-slate-200 font-semibold">{parcel.scoreBreakdown.carbon}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${parcel.scoreBreakdown.carbon}%` }} />
              </div>
            </div>
          </div>

          {/* Quick Status & Observation Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Son Uydu Gözlemi
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{parcel.lastObservation}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Sensör: <span className="text-slate-300 font-mono">Sentinel-2 MSI (10m)</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Üretici / İşletme:</span>
                <span className="text-slate-200 font-medium truncate max-w-[180px]">{parcel.farmerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Risk Sınıfı:</span>
                <span
                  className={`font-semibold ${
                    isHealthy ? 'text-emerald-400' : isModerate ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {isHealthy ? 'Düşük Risk / Sağlıklı' : isModerate ? 'Orta Düzey Risk' : 'Yüksek Risk / Teftiş Gerekli'}
                </span>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleRunAI}
                disabled={loadingAI}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Analizi</span>
              </button>
              <button
                onClick={() => onGenerateReport(parcel, aiAnalysis)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>MRV Raporu</span>
              </button>
            </div>
          </div>
        </div>

        {/* 6 Remote Sensing Indicator Cards */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Uzaktan Algılama Göstergeleri (Sentinel-2)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">L2A Yansıma İndeksleri</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* NDVI Card */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>NDVI İndeksi</span>
                <Tooltip content="Normalize Fark Vejetasyon İndeksi (NDVI), klorofil emilimini ölçerek bitki kanopisi canlılığını gösterir." />
              </div>
              <div className="text-xl font-bold text-emerald-400 font-mono">{parcel.ndvi}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Vejetasyon: {parcel.plantHealth}</div>
            </div>

            {/* NDWI Card */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>NDWI İndeksi</span>
                <Tooltip content="Normalize Fark Su İndeksi (NDWI), yaprak kanopisindeki sıvı su içeriğini yansıtır." />
              </div>
              <div className="text-xl font-bold text-cyan-400 font-mono">{parcel.ndwi}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Su Göstergesi: Orta</div>
            </div>

            {/* Soil Moisture */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>Toprak Nemi</span>
                <Tooltip content="Model-türetilmiş toprak nemi tahmini. Sentinel-2 ve yüzey sıcaklığı korelasyonuyla hesaplanır." />
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono">%{parcel.soilMoisture}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Durum: Model Göstergesi</div>
            </div>

            {/* Water Stress */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>Su Stresi Seviyesi</span>
                <Tooltip content="NDWI ve meteorolojik buharlaşma dengesiyle hesaplanan göreceli su kısıtı." />
              </div>
              <div className={`text-base font-bold font-mono ${
                parcel.waterStress === 'Low' ? 'text-emerald-400' : parcel.waterStress === 'Medium' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {parcel.waterStress === 'Low' ? 'Düşük' : parcel.waterStress === 'Medium' ? 'Orta Düzey' : 'Yüksek'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Sulama Dengesi</div>
            </div>

            {/* Plant Health */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>Bitki Sağlığı</span>
                <Tooltip content="Kırmızı kenar (Red Edge) ve yakın kızılötesi bantların fenolojik dönem normlarına uygunluğu." />
              </div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {parcel.plantHealth === 'Good' ? 'İyi / Güçlü' : parcel.plantHealth === 'Moderate' ? 'Orta' : 'Zayıf'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Biyo-kütle Vigor</div>
            </div>

            {/* Carbon Indicator */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span>Karbon Göstergesi</span>
                <Tooltip content="Doğrudan ölçüm değildir! Çok yıllık örtü, sürekli biyo-kütle ve toprak koruma uygulamalarına dayalı eğilim göstergesidir." />
              </div>
              <div className="text-base font-bold text-teal-400 font-mono">
                {parcel.carbonIndicator === 'Positive' ? 'Pozitif Eğilim' : parcel.carbonIndicator === 'Stable' ? 'Dengeli' : 'Negatif'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Model Tahmini</div>
            </div>
          </div>
        </div>

        {/* 6-Month Historical Trend Chart */}
        <TrendChart data={parcel.historicalData} cropName={parcel.crop} />

        {/* Gemini AI Analysis Component */}
        <AIAnalysisPanel
          parcel={parcel}
          analysis={aiAnalysis}
          loading={loadingAI}
          onRunAnalysis={handleRunAI}
          onGenerateReport={() => onGenerateReport(parcel, aiAnalysis)}
        />
      </div>
    </div>
  );
};
