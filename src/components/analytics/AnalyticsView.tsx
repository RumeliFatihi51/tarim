import React, { useState } from 'react';
import { 
  Activity, 
  Droplets, 
  Sprout, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  Info,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Parcel, AnalyticsSubTab } from '../../types';
import { Tooltip } from '../common/Tooltip';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid,
  Cell
} from 'recharts';

interface AnalyticsViewProps {
  parcels: Parcel[];
  onSelectParcel: (parcel: Parcel) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ parcels, onSelectParcel }) => {
  const [subTab, setSubTab] = useState<AnalyticsSubTab>('vegetation');

  // Distribution data for Vegetation
  const ndviDistribution = [
    { range: '< 0.55', count: 64, label: 'Kritik / Zayıf', color: '#f43f5e' },
    { range: '0.55 - 0.65', count: 182, label: 'Orta Vigor', color: '#f59e0b' },
    { range: '0.65 - 0.75', count: 540, label: 'Sağlıklı', color: '#10b981' },
    { range: '0.75 - 0.85+', count: 498, label: 'Yüksek Biyokütle', color: '#059669' },
  ];

  // Water Stress distribution
  const waterDistribution = [
    { level: 'Düşük Stres (İyi)', count: 874, percentage: 68, color: '#06b6d4' },
    { level: 'Orta Stres (İzleme)', count: 308, percentage: 24, color: '#f59e0b' },
    { level: 'Yüksek Stres (Acil)', count: 102, percentage: 8, color: '#ef4444' },
  ];

  return (
    <div className="space-y-5">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-xl">
        <button
          onClick={() => setSubTab('vegetation')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            subTab === 'vegetation'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Vejetasyon (NDVI)</span>
        </button>
        <button
          onClick={() => setSubTab('water')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            subTab === 'water'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Su & Nem (NDWI)</span>
        </button>
        <button
          onClick={() => setSubTab('soil')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            subTab === 'soil'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Toprak Göstergesi</span>
        </button>
        <button
          onClick={() => setSubTab('carbon')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            subTab === 'carbon'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Karbon & Örtü</span>
        </button>
      </div>

      {/* Tab 1: VEGETATION */}
      {subTab === 'vegetation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Tedarik Zinciri Ortalaması</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">0.74 NDVI</div>
              <p className="text-xs text-slate-400 mt-1">Gediz Havzası normallerine uygun kanopi örtüsü</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Sağlıklı Kanopi Oranı</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">%88.6</div>
              <p className="text-xs text-slate-400 mt-1">1,138 parsel optimum fotosentetik aktivitede</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Vejetasyon Zayıflaması</span>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">64 Parsel</div>
              <p className="text-xs text-slate-400 mt-1">Sezonluk bazın altında sarkan alanlar</p>
            </div>
          </div>

          {/* Bar Chart of Distribution */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Tedarik Zinciri NDVI Dağılım Matrisi (1,284 Parsel)
                </h3>
                <p className="text-xs text-slate-400">Sentinel-2 10m yansıma bantları frekans histogramı</p>
              </div>
              <span className="text-xs font-mono text-emerald-400">Eylül 2026</span>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ndviDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {ndviDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WATER */}
      {subTab === 'water' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Ortalama NDWI</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">0.51 NDWI</div>
              <p className="text-xs text-slate-400 mt-1">Kanopi sıvı su içeriği endeksi</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Model-Türetilmiş Toprak Nemi</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">%44.2</div>
              <p className="text-xs text-slate-400 mt-1">Yüzey nem tahmini (0-10 cm)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-semibold">Acil Sulama Teftişi</span>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">18 Parsel</div>
              <p className="text-xs text-slate-400 mt-1">Akut hidrik kısıt gösteren öncelikli alanlar</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-sm font-bold text-white tracking-tight mb-3">
              Su Kısıtı & Kuraklık Riski Seviyeleri
            </h3>
            <div className="space-y-3">
              {waterDistribution.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-slate-200">{item.level}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">{item.count} Parsel</span>
                    <span className="font-bold text-white">%{item.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SOIL */}
      {subTab === 'soil' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Toprak Sağlığı & Yüzey Göstergeleri
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Model-türetilmiş spektral korelasyonlar ve yüzey nemi projeksiyonu
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Model Göstergesi
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-1">
              <Info className="w-4 h-4" />
              <span>Bilimsel Dürüstlük İlkesi:</span>
            </div>
            Optik uydu sensörleri toprak profilinin derin katmanlarındaki organik maddeyi veya besin elementlerini
            doğrudan ölçemez. TerraSat AI, yüzey nemi ve vejetatif örtü sürekliliği verilerini zemin laboratuvar
            analizleriyle eşleştirilecek önceliklendirme göstergesi olarak sunar.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Yüzey Örtü Stabilitesi</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">%82 Uyum</span>
              <p className="text-[11px] text-slate-500 mt-1">Erozyon riskini azaltan zemin örtüsü</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Nadas / Boş Alan İndeksi</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">%14</span>
              <p className="text-[11px] text-slate-500 mt-1">Münavebe döngüsündeki parseller</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Tuzluluk / Nem Riski</span>
              <span className="text-lg font-bold text-amber-400 font-mono">Düşük – Orta</span>
              <p className="text-[11px] text-slate-500 mt-1">Gediz kıyı alüvyon göstergeleri</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: CARBON */}
      {subTab === 'carbon' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Karbon Göstergesi & Çok Yıllık Örtü İzleme
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kanopi biyo-kütlesi ve toprak üstü yeşil örtü tutum projeksiyonu
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Demonstrasyon Eğilimi
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <p>
              Uydulardan doğrudan doğrulanmış karbon tonajı ölçülemez. TerraSat AI, bitki örtüsünün fotosentetik süresi,
              zeytin gibi çok yıllık kanopi biyokütlesi ve toprak örtüsü sürekliliğini analiz ederek kurumsal Scope 3
              emisyon azaltımı hedeflerine yönelik <strong>niteliksel yön ve eğilim göstergeleri</strong> üretir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-teal-400 mb-1">Çok Yıllık Kanopiler (Zeytin & Bağ)</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Seyrek ve Çukurköy bölgelerindeki 39.8 hektarlık çok yıllık kanopi, yüksek biyo-kütle stabilitesiyle
                pozitif karbon göstergesine en yüksek katkıyı sağlamaktadır.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-emerald-400 mb-1">Tek Yıllık Münavebe (Domates & Mısır)</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Hasat sonrası anız yakılmaması ve örtü bitkisi yönetimi göstergesi takip edilmektedir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
