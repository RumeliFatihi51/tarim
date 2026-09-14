import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Wifi, 
  HardDrive, 
  Clock, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  Download,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Parcel } from '../../types';

interface WindowsStatusBarProps {
  selectedParcel: Parcel | null;
  onOpenExeModal: () => void;
  isDemoMode: boolean;
}

export const WindowsStatusBar: React.FC<WindowsStatusBarProps> = ({
  selectedParcel,
  onOpenExeModal,
  isDemoMode,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const lat = selectedParcel && selectedParcel.polygon?.[0] ? selectedParcel.polygon[0][0].toFixed(4) : '—';
  const lng = selectedParcel && selectedParcel.polygon?.[0] ? selectedParcel.polygon[0][1].toFixed(4) : '—';

  return (
    <footer
      id="windows-status-bar"
      className="h-6 w-full bg-[#070b16] border-t border-white/[0.08] px-3 flex items-center justify-between text-[11px] text-slate-400 select-none font-mono shrink-0 z-40"
    >
      {/* Left Segment: GIS Coordinates & Projection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>
            {lat}° K, {lng}° D
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="hidden sm:inline text-slate-400">UTM Zone 35N</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">EPSG:4326</span>
      </div>

      {/* Center Segment: Sentinel-2 Satellite State */}
      <div className="hidden md:flex items-center gap-2 text-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span className="text-slate-400 font-semibold">Provider status unavailable</span>
        <span className="text-slate-600">•</span>
        <span>Analysis layer: {selectedParcel?.satelliteMetadata?.tileId ?? 'not loaded'}</span>
        <span className="text-slate-600">•</span>
        <span>Cloud: {selectedParcel?.satelliteMetadata ? `%${selectedParcel.satelliteMetadata.cloudCoveragePercent}` : 'unavailable'}</span>
      </div>

      {/* Right Segment: Engine Specs, Direct EXE link & Windows Time */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenExeModal}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline transition"
          title="Windows Kurulum Dosyası Bilgileri"
        >
          <Download className="w-3 h-3" />
          <span>Setup.exe (v3.0.0)</span>
        </button>

        <span className="text-slate-600">|</span>

        <div className="flex items-center gap-1 text-slate-300">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{timeStr || '12:00:00'}</span>
        </div>
      </div>
    </footer>
  );
};
