import React from 'react';
import { 
  Satellite, 
  MapPin, 
  Play, 
  Layers, 
  Sparkles, 
  Calendar, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Crop,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Parcel } from '../../types';

interface SelectedParcelCardProps {
  parcel: Parcel | null;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  isDrawing: boolean;
  onToggleDrawing: () => void;
  onClearCustomArea?: () => void;
  isDemoMode: boolean;
  onSelectQuickPreset: (presetId: string) => void;
}

export const SelectedParcelCard: React.FC<SelectedParcelCardProps> = ({
  parcel,
  onStartAnalysis,
  isAnalyzing,
  isDrawing,
  onToggleDrawing,
  onClearCustomArea,
  isDemoMode,
  onSelectQuickPreset,
}) => {
  if (!parcel) {
    return (
      <div className="w-80 lg:w-96 bg-[#080c14]/95 border border-slate-800/90 rounded-2xl p-5 text-slate-300 shadow-2xl backdrop-blur-md flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Alan Seçimi
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
              Sentinel-2 MSI
            </span>
          </div>

          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Haritadan Alan Belirleyin</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Harita üzerinde herhangi bir noktaya tıklayın, kendi poligonunuzu çizin veya demo alanını seçin.
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Hızlı Demo Alanları:
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                onClick={() => onSelectQuickPreset('emiralem-01')}
                className="w-full text-left px-3 py-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between transition group"
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Emiralem Zeytinliği (Önerilen)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">4.8 ha • Memecik Zeytin • Sentinel-2 L2A</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 group-hover:translate-x-0.5 transition">Seç →</span>
              </button>

              <button
                onClick={() => onSelectQuickPreset('042')}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex items-center justify-between transition"
              >
                <div>
                  <div className="font-semibold text-slate-200">Karasu Domates Sahası</div>
                  <div className="text-[10px] text-slate-400">12.4 ha • Sanayi Tipi Domates</div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Seç →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Custom Drawing Button */}
        <div className="pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={onToggleDrawing}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              isDrawing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{isDrawing ? 'Çizim Modundan Çık' : 'Haritada Özel Poligon Çiz'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Calculate center coordinate for display
  const centerLat = parcel.polygon && parcel.polygon.length > 0 
    ? parcel.polygon[0][0].toFixed(4)
    : '38.6420';
  const centerLng = parcel.polygon && parcel.polygon.length > 0
    ? parcel.polygon[0][1].toFixed(4)
    : '27.1180';

  return (
    <div className="w-80 lg:w-96 bg-[#080c14]/95 border border-slate-800/90 rounded-2xl p-5 text-slate-300 shadow-2xl backdrop-blur-md flex flex-col justify-between max-h-[85vh] overflow-y-auto">
      <div className="space-y-4">
        {/* Header Badge & Title */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {parcel.number || '#PARCEL'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{parcel.location}</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-1">
              {parcel.name}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {parcel.areaHa} ha
            </span>
          </div>
        </div>

        {/* Spatial Coordinates & Crop */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Koordinat</span>
            <span className="text-slate-200 text-[11px] font-semibold">
              {centerLat}°K, {centerLng}°D
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Ürün Tipi</span>
            <span className="text-emerald-300 text-[11px] font-semibold truncate block">
              {parcel.crop}
            </span>
          </div>
        </div>

        {/* Satellite Data Availability Section */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sentinel-2 Veri Durumu</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              6 Gözlem Mevcut
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300 pt-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Son Geçiş:</span>
              <span className="text-slate-200">08 Eylül 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bulutluluk:</span>
              <span className="text-emerald-400 font-semibold">%4.2 (Uygun)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Spektral Bantlar:</span>
              <span className="text-slate-300">B02, B04, B08, B11</span>
            </div>
          </div>
        </div>

        {/* Quick Spectral Indicators Preview */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Spektral İndeksler (Önizleme)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">L2A BOA</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">NDVI</span>
              <span className="text-xs font-bold font-mono text-emerald-400">{parcel.ndvi}</span>
              <span className="text-[9px] text-slate-500 block">Bitki Gücü</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">NDWI</span>
              <span className="text-xs font-bold font-mono text-cyan-400">{parcel.ndwi}</span>
              <span className="text-[9px] text-slate-500 block">Su Katsayısı</span>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Su Stresi</span>
              <span className={`text-xs font-bold font-mono ${
                parcel.waterStress === 'High' ? 'text-rose-400' : parcel.waterStress === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {parcel.waterStress === 'High' ? 'Yüksek' : parcel.waterStress === 'Medium' ? 'Orta' : 'Düşük'}
              </span>
              <span className="text-[9px] text-slate-500 block">Nem Kısıtı</span>
            </div>
          </div>
        </div>

        {/* Data Honesty Notice */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed flex items-start gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span>
            {isDemoMode ? (
              <strong className="text-amber-400">DEMO MODU: Örnek Sentinel-2 spektral verisi kullanılmaktadır.</strong>
            ) : (
              <span>Copernicus Sentinel-2B 10m L2A yansıma verileri üzerinden analiz gerçekleştirilir.</span>
            )}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
        <button
          onClick={onStartAnalysis}
          disabled={isAnalyzing}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${
            isAnalyzing
              ? 'bg-slate-800 text-slate-400 cursor-wait'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analiz Pipeline Çalışıyor...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Bu Alanı Analiz Et</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
          <span>Sentinel-2 • 10m Çözünürlük</span>
          <button
            onClick={onToggleDrawing}
            className="text-emerald-400 hover:underline"
          >
            {isDrawing ? 'Çizimi İptal Et' : 'Yeni Sınır Çiz'}
          </button>
        </div>
      </div>
    </div>
  );
};
