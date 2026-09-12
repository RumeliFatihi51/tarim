import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  ExternalLink, 
  Calendar, 
  Award, 
  MapPin 
} from 'lucide-react';
import { Parcel, AIAnalysisResult } from '../../types';

interface ReportsArchiveViewProps {
  parcels: Parcel[];
  onOpenReport: (parcel: Parcel) => void;
}

export const ReportsArchiveView: React.FC<ReportsArchiveViewProps> = ({
  parcels,
  onOpenReport,
}) => {
  return (
    <div className="space-y-5">
      {/* Header Info Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Kurumsal MRV Denetim & Doğrulama Raporları
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gıda sanayisi ve ihracatçı şirketler için CSRD, Scope 3 ve tedarikçi çevre izleme arşivi
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-slate-300">Dönem: 2026 Sezonu (Menemen / Gediz)</span>
          <span className="block text-[11px] text-emerald-400">Tescilli 1,284 Parsel Kapsamında</span>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parcels.map((parcel) => (
          <div
            key={parcel.id}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                    TS-MRV-2026-{parcel.id}-001
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{parcel.name}</h3>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    parcel.status === 'healthy'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : parcel.status === 'moderate'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {parcel.status === 'healthy' ? 'Düşük Risk' : parcel.status === 'moderate' ? 'Orta Risk' : 'Yüksek Risk'}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1 my-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{parcel.location} • {parcel.crop} ({parcel.areaHa} ha)</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gözlem: {parcel.lastObservation}</span>
                </div>
              </div>

              {/* Mini metric indicators */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Sürdürülebilirlik</span>
                  <span className="font-mono font-bold text-white">{parcel.sustainabilityScore}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">NDVI</span>
                  <span className="font-mono font-bold text-emerald-400">{parcel.ndvi}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Su Stresi</span>
                  <span className="font-mono font-bold text-slate-300">{parcel.waterStress}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Sentinel-2 L2A Spektrumu</span>
              <button
                onClick={() => onOpenReport(parcel)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Raporu Görüntüle</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
