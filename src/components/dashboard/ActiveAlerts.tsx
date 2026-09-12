import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle, ArrowUpRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { Parcel } from '../../types';

interface ActiveAlertsProps {
  parcels: Parcel[];
  onSelectParcel: (parcel: Parcel) => void;
}

export const ActiveAlerts: React.FC<ActiveAlertsProps> = ({ parcels, onSelectParcel }) => {
  // Find parcels with active alerts
  const alertsList: { parcel: Parcel; alert: any }[] = [];
  parcels.forEach((p) => {
    if (p.alerts) {
      p.alerts.forEach((alert) => {
        alertsList.push({ parcel: p, alert });
      });
    }
  });

  return (
    <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Aktif Saha Uyarıları</h2>
            <p className="text-[11px] text-slate-400">Otomatik spektral anomali ve risk bildirimleri</p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {alertsList.length} Tespit
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
        {alertsList.map(({ parcel, alert }) => {
          const isCritical = alert.type === 'critical';
          const isWarning = alert.type === 'warning';
          const isPositive = alert.type === 'positive';

          return (
            <div
              key={alert.id}
              onClick={() => onSelectParcel(parcel)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition group hover:scale-[1.01] ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-500/50'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-900/40 hover:border-amber-500/50'
                  : 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {isCritical ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-bold tracking-tight ${
                      isCritical
                        ? 'text-rose-300'
                        : isWarning
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }`}
                  >
                    {alert.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {alert.date}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                {alert.message}
              </p>

              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-bold text-white">{parcel.number}</span>
                  <span>•</span>
                  <span>{parcel.crop}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-0.5 transition-transform text-[11px] font-medium">
                  <span>Parseli İncele</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 text-center border-t border-slate-800/80">
        <span className="text-[10px] text-slate-400">
          Tüm uyarılar Sentinel-2 zaman serisi sapma algoritmalarıyla üretilmektedir.
        </span>
      </div>
    </div>
  );
};
