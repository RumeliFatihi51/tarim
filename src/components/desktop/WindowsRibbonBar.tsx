import React from 'react';
import { 
  Play, 
  Map, 
  FileText, 
  Sparkles, 
  Camera, 
  Download, 
  Radio, 
  Layers, 
  Compass, 
  Maximize2, 
  PenTool, 
  RefreshCw, 
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { Parcel } from '../../types';

interface WindowsRibbonBarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  selectedParcel: Parcel | null;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  onOpenReportModal: () => void;
  onOpenExeModal: () => void;
  isDrawingMode: boolean;
  onToggleDrawing: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const WindowsRibbonBar: React.FC<WindowsRibbonBarProps> = ({
  activeTab,
  onSelectTab,
  selectedParcel,
  onStartAnalysis,
  isAnalyzing,
  onOpenReportModal,
  onOpenExeModal,
  isDrawingMode,
  onToggleDrawing,
  isDemoMode,
  onToggleDemoMode,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  return (
    <div
      id="windows-ribbon-bar"
      className="w-full bg-[#0d1424] border-b border-white/[0.08] px-3 py-2 flex items-center justify-between gap-3 select-none text-slate-200 overflow-x-auto"
    >
      {/* Group 1: GIS Navigation & Map Views */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition border ${
              isSidebarOpen
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}
            title="Sol Gezgin Panelini Aç / Kapat"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isSidebarOpen ? 'Gezgini Gizle' : 'Gezgini Göster'}</span>
          </button>
        )}

        <button
          onClick={() => onSelectTab('monitor')}
          className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition ${
            activeTab === 'monitor'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'hover:bg-white/5 text-slate-300 border border-transparent'
          }`}
          title="Sentinel-2 GIS Parsel Haritası"
        >
          <Map className="w-4 h-4 text-emerald-400" />
          <span>GIS Harita</span>
        </button>

        {/* Custom Polygon Drawing Tool */}
        <button
          onClick={onToggleDrawing}
          className={`px-2.5 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition ${
            isDrawingMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
              : 'hover:bg-white/5 text-slate-300 border border-white/[0.05]'
          }`}
          title="Harita Üzerinde Serbest Parsel Çiz & Alan Hesapla"
        >
          <PenTool className="w-3.5 h-3.5 text-amber-400" />
          <span>{isDrawingMode ? 'Çizim Aktif (Tıkla)' : 'Poligon Çiz'}</span>
        </button>
      </div>

      <div className="h-7 w-px bg-white/[0.08] shrink-0" />

      {/* Group 2: Remote Sensing & Spectral Pipeline */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onStartAnalysis}
          disabled={isAnalyzing}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition"
          title="14 Aşamalı Sentinel-2 MSI L2A Spektral Boru Hattını Çalıştır"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isAnalyzing ? 'İşleniyor (%42)...' : '14 Aşamalı Analiz'}</span>
        </button>

        <button
          onClick={() => onSelectTab('analysis')}
          className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition ${
            activeTab === 'analysis'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'hover:bg-white/5 text-slate-300 border border-transparent'
          }`}
        >
          <Radio className="w-4 h-4 text-cyan-400" />
          <span>Spektral Konsol</span>
        </button>
      </div>

      <div className="h-7 w-px bg-white/[0.08] shrink-0" />

      {/* Group 3: MRV Reports & Field Verification */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onSelectTab('reports')}
          className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition ${
            activeTab === 'reports'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'hover:bg-white/5 text-slate-300 border border-transparent'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>MRV Rapor Arşivi</span>
        </button>

        <button
          onClick={onOpenReportModal}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
          title="19 Bölümlü ISO 14064-2 Kurumsal Denetim Raporunu Aç"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>19 Bölümlü Rapor</span>
        </button>

        <button
          onClick={() => onSelectTab('practices')}
          className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition ${
            activeTab === 'practices'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'hover:bg-white/5 text-slate-300 border border-transparent'
          }`}
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Saha Denetim</span>
        </button>

        <button
          onClick={() => onSelectTab('assistant')}
          className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition ${
            activeTab === 'assistant'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'hover:bg-white/5 text-slate-300 border border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Gemini Copilot</span>
        </button>
      </div>

      <div className="h-7 w-px bg-white/[0.08] shrink-0" />

      {/* Group 4: Live / Demo Mode & Windows EXE Installer Trigger */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleDemoMode}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
            isDemoMode
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}
          title="Canlı Sentinel-2 / Demo Veri Modu"
        >
          {isDemoMode ? 'Demo Veri' : 'Canlı S2-MSI'}
        </button>

        {/* Big Windows .EXE Setup Button */}
        <button
          onClick={onOpenExeModal}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Windows EXE Paketi</span>
        </button>
      </div>
    </div>
  );
};
