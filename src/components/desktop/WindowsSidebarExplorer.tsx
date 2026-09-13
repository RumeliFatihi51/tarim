import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  MapPin, 
  Eye, 
  EyeOff, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  Search,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Parcel } from '../../types';

interface WindowsSidebarExplorerProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
  onOpenReport: (parcel: Parcel) => void;
}

export const WindowsSidebarExplorer: React.FC<WindowsSidebarExplorerProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  onOpenReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    parcels: true,
    bands: true,
    indices: true,
    audits: true,
  });

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    rgb: true,
    nir: false,
    swir: false,
    ndvi: true,
    ndwi: false,
    soc: false,
  });

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
  };

  const toggleLayer = (layerKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const filteredParcels = parcels.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      id="windows-sidebar-explorer"
      className="w-80 h-full bg-[#0b101e] border-r border-white/[0.08] flex flex-col select-none text-xs text-slate-300 shrink-0"
    >
      {/* Sidebar Header: Explorer title & Search bar */}
      <div className="p-3 border-b border-white/[0.06] space-y-2 bg-[#080d19]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-wide uppercase text-[11px]">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>GIS Proje Gezgini</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">EPSG:4326</span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Parsel veya ürün filtrele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tree View Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 font-sans">
        {/* FOLDER 1: Parseller */}
        <div>
          <button
            onClick={() => toggleFolder('parcels')}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 font-bold text-slate-200"
          >
            {expandedFolders.parcels ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>Tarımsal Parseller ({parcels.length})</span>
          </button>

          {expandedFolders.parcels && (
            <div className="ml-5 mt-1 space-y-1">
              {filteredParcels.map((parcel) => {
                const isSelected = selectedParcel?.id === parcel.id;
                return (
                  <div
                    key={parcel.id}
                    onClick={() => onSelectParcel(parcel)}
                    className={`p-2 rounded-lg cursor-pointer transition border ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm'
                        : 'hover:bg-white/5 border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate text-xs">{parcel.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          parcel.sustainabilityScore >= 80
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : parcel.sustainabilityScore >= 70
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {parcel.sustainabilityScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{parcel.crop}</span>
                      <span className="font-mono text-emerald-400/90">{parcel.areaHa} ha</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOLDER 2: Sentinel-2 Multispektral Bantlar */}
        <div>
          <button
            onClick={() => toggleFolder('bands')}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 font-bold text-slate-200"
          >
            {expandedFolders.bands ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Sentinel-2 L2A Bantları</span>
          </button>

          {expandedFolders.bands && (
            <div className="ml-5 mt-1 space-y-1 text-[11px]">
              <div
                onClick={(e) => toggleLayer('rgb', e)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {activeLayers.rgb ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>B04-B03-B02 Doğal Renk (10m)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">RGB</span>
              </div>

              <div
                onClick={(e) => toggleLayer('nir', e)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {activeLayers.nir ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>B08 Yakın Kızılötesi NIR (10m)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">842nm</span>
              </div>

              <div
                onClick={(e) => toggleLayer('swir', e)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {activeLayers.swir ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>B11 Kısa Dalga SWIR-1 (20m)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">1610nm</span>
              </div>
            </div>
          )}
        </div>

        {/* FOLDER 3: Biyofiziksel & Spektral İndeksler */}
        <div>
          <button
            onClick={() => toggleFolder('indices')}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 font-bold text-slate-200"
          >
            {expandedFolders.indices ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Spektral İndeks Katmanları</span>
          </button>

          {expandedFolders.indices && (
            <div className="ml-5 mt-1 space-y-1 text-[11px]">
              <div
                onClick={(e) => toggleLayer('ndvi', e)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {activeLayers.ndvi ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>NDVI (Bitki Örtüsü Gücü)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">0.74</span>
              </div>

              <div
                onClick={(e) => toggleLayer('ndwi', e)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {activeLayers.ndwi ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>NDWI (Bitki Su Stresi)</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">0.28</span>
              </div>

              <div
                onClick={(e) => toggleLayer('soc', e)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {activeLayers.soc ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>SOC (Toprak Karbon Stoku)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">42 t/ha</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Parcel Quick Card Footer */}
      {selectedParcel && (
        <div className="p-3 bg-[#080d19] border-t border-white/[0.08] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs truncate">{selectedParcel.name}</span>
            <button
              onClick={() => onOpenReport(selectedParcel)}
              className="text-[10px] text-emerald-400 hover:underline font-semibold"
            >
              MRV Raporu ↗
            </button>
          </div>
          <p className="text-[11px] text-slate-400">{selectedParcel.location}</p>
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              NDVI: <span className="text-emerald-400 font-bold">{selectedParcel.ndvi}</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Nem: <span className="text-cyan-400 font-bold">%{selectedParcel.soilMoisture}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
