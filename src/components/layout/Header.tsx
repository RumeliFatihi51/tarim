import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Satellite, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Layers, 
  Menu,
  ShieldCheck,
  X,
  Play,
  RotateCw
} from 'lucide-react';
import { Parcel, ActiveTab } from '../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  selectedParcel: Parcel | null;
  onSearchLocation: (query: string) => void;
  onSelectQuickDemo: () => void;
  onStartAnalysis: () => void;
  isAnalyzing: boolean;
  onToggleMobileMenu: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  selectedParcel,
  onSearchLocation,
  onSelectQuickDemo,
  onStartAnalysis,
  isAnalyzing,
  onToggleMobileMenu,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchLocation(searchInput.trim());
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[#090d16]/95 border-b border-slate-800/90 backdrop-blur-md">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-sans">
              TerraSat AI
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              MRV
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-300">
              {selectedParcel ? selectedParcel.location : 'Menemen / İzmir (Gediz Deltası)'}
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right: Search, Observation Date, Data Source, Quick Demo, Analyze */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Konum veya bölge ara (Örn: Emiralem, Menemen)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-48 lg:w-64 pl-8 pr-7 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Observation Date */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs font-mono text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>08 Eyl 2026</span>
        </div>

        {/* Data Source Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs text-slate-300">
          <Satellite className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px]">Sentinel-2 L2A</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Quick Demo Preset Button */}
        <button
          onClick={onSelectQuickDemo}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 rounded-xl transition shadow-sm"
          title="Emiralem Zeytinlik prototip alanını seçer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Örnek Demo (Emiralem)</span>
          <span className="sm:hidden">Demo</span>
        </button>

        {/* Primary "Alanı Analiz Et" Action Button */}
        <button
          onClick={onStartAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
            isAnalyzing
              ? 'bg-slate-800 text-slate-400 cursor-wait'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>İşleniyor...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Alanı Analiz Et</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
