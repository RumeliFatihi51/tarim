import React, { useState } from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Download, 
  Monitor, 
  Cpu, 
  Layers, 
  ChevronDown, 
  FileText, 
  Play, 
  Sparkles, 
  Info,
  ExternalLink,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

interface WindowsTitleBarProps {
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onOpenExeModal: () => void;
  onSelectTab: (tabId: string) => void;
  activeTab: string;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  isMaximized,
  onToggleMaximize,
  onMinimize,
  onClose,
  onOpenExeModal,
  onSelectTab,
  activeTab,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div
      id="windows-titlebar-container"
      className="w-full bg-[#0a0f1d] border-b border-white/[0.08] flex flex-col select-none z-50 text-slate-200"
    >
      {/* Top Titlebar Row: App Icon, Title, Hardware Pill, Download EXE, Window Controls */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-white/[0.04]">
        {/* Left: Window Icon and Application Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-teal-700 p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#070b14] rounded-[3px] flex items-center justify-center">
              <span className="text-emerald-400 font-black text-[10px] leading-none">TS</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-200 tracking-wide truncate">
            TerraSat AI Workstation 2026 Enterprise — [Sentinel-2 MSI Level-2A Multispectral Engine]
          </span>
          <span className="hidden lg:inline-block text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
            v3.0.0 (x64 EXE)
          </span>
        </div>

        {/* Center: System Telemetry Pill */}
        <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1 rounded-full border border-white/[0.05]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>GPU telemetrisi: kullanılamıyor</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>RAM: kullanılamıyor</span>
          <span className="text-slate-600">|</span>
          <span>CPU: kullanılamıyor</span>
        </div>

        {/* Right: EXE Download action & Windows Standard Window Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Direct EXE Installer Button */}
          <button
            id="btn-download-exe-titlebar"
            onClick={onOpenExeModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
            title="Windows Kurulum Dosyasını İndir (.EXE)"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Setup.exe İndir</span>
          </button>

          {/* Windows Minimize Button */}
          <button
            id="win-btn-minimize"
            onClick={onMinimize}
            className="w-10 h-7 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition"
            title="Simge Durumuna Küçült"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Windows Maximize / Restore Button */}
          <button
            id="win-btn-maximize"
            onClick={onToggleMaximize}
            className="w-10 h-7 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition"
            title={isMaximized ? 'Önceki Boyut' : 'Ekranı Kapla'}
          >
            <Square className="w-3 h-3" />
          </button>

          {/* Windows Close Button (Red on hover) */}
          <button
            id="win-btn-close"
            onClick={onClose}
            className="w-10 h-7 flex items-center justify-center hover:bg-red-600 text-slate-400 hover:text-white transition"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Second Row: Traditional Windows Menu Bar (Dosya, Görünüm, Analiz, GIS, Raporlar, Yardım) */}
      <div className="h-7 px-2 flex items-center gap-1 text-xs text-slate-300 relative bg-[#070c18]">
        {/* Menu: Dosya */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('file')}
            className={`px-2.5 py-0.5 rounded hover:bg-white/10 transition ${
              openMenu === 'file' ? 'bg-white/15 text-white' : ''
            }`}
          >
            Dosya
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#111827] border border-slate-700 shadow-2xl rounded-md py-1 z-50 text-xs">
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onOpenExeModal();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-600 hover:text-white flex items-center justify-between"
              >
                <span>Windows Yükleyicisi (.exe)</span>
                <span className="text-[10px] opacity-70">Ctrl+E</span>
              </button>
              <div className="my-1 border-t border-slate-700" />
              <a
                href="/api/export/csv/emiralem-01"
                download="emiralem_timeseries.csv"
                onClick={() => setOpenMenu(null)}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-600 hover:text-white flex items-center justify-between block"
              >
                <span>CSV Zaman Serisini Dışa Aktar</span>
                <span className="text-[10px] opacity-70">Ctrl+S</span>
              </a>
              <a
                href="/api/export/geojson/emiralem-01"
                download="emiralem_sentinel2.geojson"
                onClick={() => setOpenMenu(null)}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-600 hover:text-white flex items-center justify-between block"
              >
                <span>GeoJSON Poligonunu Dışa Aktar</span>
              </a>
              <div className="my-1 border-t border-slate-700" />
              <button
                onClick={() => {
                  setOpenMenu(null);
                  onClose();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-red-600 hover:text-white flex items-center justify-between text-red-300"
              >
                <span>Çıkış</span>
                <span className="text-[10px] opacity-70">Alt+F4</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu: Analiz */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('analysis')}
            className={`px-2.5 py-0.5 rounded hover:bg-white/10 transition ${
              openMenu === 'analysis' ? 'bg-white/15 text-white' : ''
            }`}
          >
            Analiz
          </button>
          {openMenu === 'analysis' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#111827] border border-slate-700 shadow-2xl rounded-md py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onSelectTab('analysis');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-600 hover:text-white flex items-center justify-between"
              >
                <span>14 Aşamalı Spektral Boru Hattı</span>
                <span className="text-[10px] opacity-70">F5</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('monitor');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-600 hover:text-white flex items-center justify-between"
              >
                <span>Sentinel-2 Canlı GIS Haritası</span>
                <span className="text-[10px] opacity-70">F6</span>
              </button>
              <div className="my-1 border-t border-slate-700" />
              <button
                onClick={() => {
                  onSelectTab('reports');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-600 hover:text-white flex items-center justify-between"
              >
                <span>19 Bölümlü ISO 14064-2 MRV Raporu</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu: Saha & Denetim */}
        <div className="relative">
          <button
            onClick={() => {
              onSelectTab('practices');
              setOpenMenu(null);
            }}
            className={`px-2.5 py-0.5 rounded hover:bg-white/10 transition ${
              activeTab === 'practices' ? 'bg-white/15 text-white' : ''
            }`}
          >
            Saha Denetim
          </button>
        </div>

        {/* Menu: Yapay Zekâ */}
        <div className="relative">
          <button
            onClick={() => {
              onSelectTab('assistant');
              setOpenMenu(null);
            }}
            className={`px-2.5 py-0.5 rounded hover:bg-white/10 transition ${
              activeTab === 'assistant' ? 'bg-white/15 text-white' : ''
            }`}
          >
            Gemini Copilot
          </button>
        </div>

        {/* Menu: Metodoloji */}
        <div className="relative">
          <button
            onClick={() => {
              onSelectTab('methodology');
              setOpenMenu(null);
            }}
            className={`px-2.5 py-0.5 rounded hover:bg-white/10 transition ${
              activeTab === 'methodology' ? 'bg-white/15 text-white' : ''
            }`}
          >
            Metodoloji
          </button>
        </div>

        {/* Menu: Yardım */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('help')}
            className={`px-2.5 py-0.5 rounded hover:bg-white/10 transition ${
              openMenu === 'help' ? 'bg-white/15 text-white' : ''
            }`}
          >
            Yardım
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#111827] border border-slate-700 shadow-2xl rounded-md py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onOpenExeModal();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-emerald-600 hover:text-white flex items-center justify-between"
              >
                <span>TerraSat Workstation Hakkında</span>
                <span className="text-[10px] opacity-70">F1</span>
              </button>
              <div className="my-1 border-t border-slate-700" />
              <div className="px-3 py-2 text-[11px] text-slate-400 leading-tight">
                Copernicus Sentinel-2 Level-2A BOA yüzey yansıması ve ISO 14064-2 MRV denetim motoru.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
