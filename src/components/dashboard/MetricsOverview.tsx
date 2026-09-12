import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { SUPPLY_CHAIN_STATS } from '../../data/parcels';
import { Tooltip } from '../common/Tooltip';

interface MetricsOverviewProps {
  onFilterStatus?: (status: string) => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ onFilterStatus }) => {
  return (
    <div className="space-y-4">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Active Parcels */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Aktif Parseller</span>
            <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300">
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {SUPPLY_CHAIN_STATS.totalMonitoredParcels.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{SUPPLY_CHAIN_STATS.newParcelsThisMonth} yeni tescilli parsel</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Toplam {SUPPLY_CHAIN_STATS.monitoredHectares.toLocaleString()} hektar izleniyor
          </p>
        </div>

        {/* Metric 2: Healthy Parcels */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sağlıklı Parseller</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              %{SUPPLY_CHAIN_STATS.healthyPercentage}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({SUPPLY_CHAIN_STATS.healthyCount} parsel)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Optimum spektral klorofil & su dengesi</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Mevsimsel normallere uygun biyokütle
          </p>
        </div>

        {/* Metric 3: At Risk */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Risk Altındaki Parseller</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {SUPPLY_CHAIN_STATS.atRiskCount}
            </span>
            <span className="text-xs text-rose-400 font-medium">
              ({SUPPLY_CHAIN_STATS.highPriorityVerificationCount} acil)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
            <span>Su stresi veya vejetasyon zayıflığı</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Saha doğrulaması önerilen parseller
          </p>
        </div>

        {/* Metric 4: Sustainability Score */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Sürdürülebilirlik Skoru</span>
              <Tooltip content="Vejetasyon, su verimliliği, toprak nemi ve karbon tutum indikatörlerinin bileşik kurumsal endeksidir." />
            </div>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {SUPPLY_CHAIN_STATS.averageSustainabilityScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Önceki periyoda göre +%4.8 artış</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Tedarik zinciri hedefi: ≥75 puan
          </p>
        </div>
      </div>

      {/* Corporate Agricultural Supply Chain Pipeline Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Kurumsal Tarım Tedarik Zinciri MRV Hunisi</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 lowercase">
                ölçeklenebilir izleme
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Fiziksel saha teftişinin imkansız olduğu binlerce parselde uzaktan algılama ile önceliklendirme
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono self-start sm:self-auto">
            Gediz Deltası Havzası
          </span>
        </div>

        {/* Pipeline steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">Kayıtlı Parsel</div>
              <div className="font-bold text-slate-200 font-mono text-sm">1,284 parsel</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden md:block" />
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-400 font-medium">Sağlıklı / Uyumlu</div>
              <div className="font-bold text-emerald-300 font-mono text-sm">1,117 (%87)</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden md:block" />
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-400 font-medium">İzleme Altında</div>
              <div className="font-bold text-amber-300 font-mono text-sm">64 riskli</div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden md:block" />
          </div>

          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-rose-400 font-medium">Saha Doğrulaması</div>
              <div className="font-bold text-rose-300 font-mono text-sm">18 öncelikli</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
