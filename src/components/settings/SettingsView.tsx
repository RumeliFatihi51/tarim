import React from 'react';
import { 
  Satellite, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  ExternalLink 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6 text-slate-200">
      {/* Overview Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">TerraSat AI Sistem & Metodoloji</h2>
            <p className="text-xs text-slate-400">
              Tarımsal MRV (Ölçüm, Raporlama, Doğrulama) & Uzaktan Algılama Mimarisi
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          TerraSat AI, büyük gıda üreticileri ve kurumsal tarım şirketlerinin yüzlerce veya binlerce sözleşmeli parselini
          uydu gözlemleri, spektral indeksler ve yapay zekâ destekli anomali modelleriyle sürekli izlemesini sağlayan
          bir kurumsal sürdürülebilirlik platformudur.
        </p>

        {/* Future Architecture Pipeline diagram */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
          <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">
            Uzaktan Algılama Veri ve MRV İşlem Hattı:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-mono font-bold text-white">1. Uydu Girişi</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Sentinel-2 & Landsat-9</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-mono font-bold text-cyan-400">2. Ön İşleme</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Bulut Maskeleme & L2A</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-mono font-bold text-amber-400">3. İndeks Hesaplama</div>
              <div className="text-slate-400 text-[10px] mt-0.5">NDVI, NDWI, Nem & Trend</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-mono font-bold text-emerald-400">4. AI & MRV</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Gemini Analizi & Rapor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Satellite Sensors Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Layers className="w-4 h-4" />
            <span>Aktif Sensör Konfigürasyonu</span>
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Birincil Takımyıldız:</span>
              <span className="font-mono text-white">Sentinel-2A / 2B (ESA Copernicus)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Mekânsal Çözünürlük:</span>
              <span className="font-mono text-white">10m (B2, B3, B4, B8) & 20m (B11, B12)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Geçiş Sıklığı:</span>
              <span className="font-mono text-white">5 günde bir (Ege Bölgesi)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Bulut Filtresi Eşiği:</span>
              <span className="font-mono text-emerald-400">&lt; %15 Bulutsuzluk</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Bilimsel Dürüstlük İlkeleri</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            TerraSat AI konsept demonstratöründe gösterilen analizler abartılı iddialardan arındırılmıştır:
          </p>
          <ul className="space-y-1.5 text-slate-400 text-[11px]">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Yalnızca uydu ile %100 kesin toprak karbonu iddiasında bulunulmaz.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Uzaktan algılama, fiziksel saha teftişinin yerine geçmez; önceliklendirir.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Tüm su ve biyokütle değerleri "gösterge" ve "risk sinyali" olarak sunulur.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
