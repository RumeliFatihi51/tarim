import React, { useState } from 'react';
import { 
  X, 
  Download, 
  CheckCircle2, 
  HardDrive, 
  Monitor, 
  ShieldCheck, 
  Folder, 
  Cpu, 
  Terminal, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Archive
} from 'lucide-react';

interface WindowsExeInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsExeInstallerModal: React.FC<WindowsExeInstallerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [installPath, setInstallPath] = useState('C:\\Program Files\\TerraSat AI Workstation');
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [enableGpuAcceleration, setEnableGpuAcceleration] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadExe = () => {
    setIsDownloading(true);
    // Trigger download
    const link = document.createElement('a');
    link.href = '/api/desktop/download-exe';
    link.download = 'TerraSat_AI_Workstation_Setup_v3.0.0.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  const handleDownloadPortableZip = () => {
    const link = document.createElement('a');
    link.href = '/api/desktop/download-portable';
    link.download = 'TerraSat_Windows_Portable_v3.0.0.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 select-none">
      {/* Windows 11 Fluent Window Frame */}
      <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 shadow-2xl rounded-xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Windows Dialog Titlebar */}
        <div className="h-10 bg-[#090e1a] px-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <HardDrive className="w-3 h-3 text-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              TerraSat AI Workstation 2026 Enterprise — Kurulum Sihirbazı (Setup.exe)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Body with Left Banner & Right Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[380px]">
          {/* Left Visual Banner */}
          <div className="p-5 bg-gradient-to-b from-[#0b1329] to-[#060b17] border-r border-white/[0.06] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-[#070b14] rounded-[14px] flex items-center justify-center">
                  <span className="text-emerald-400 font-black text-xl leading-none">TS</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">TerraSat AI Workstation</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Sürüm 3.0.0 (x64 EXE)</p>
              </div>

              {/* Verified Badge */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Build artifact SHA-256 ile doğrulanır</span>
              </div>
            </div>

            {/* System Status */}
            <div className="space-y-1.5 pt-4 text-[10px] text-slate-400 font-mono border-t border-white/[0.06]">
              <div className="flex justify-between">
                <span>Mimari:</span>
                <span className="text-white">x86_64 Intel/AMD</span>
              </div>
              <div className="flex justify-between">
                <span>Grafik:</span>
                <span className="text-emerald-400">DirectX 12 / Vulkan</span>
              </div>
              <div className="flex justify-between">
                <span>Boyut:</span>
                <span className="text-white">48.8 MB</span>
              </div>
            </div>
          </div>

          {/* Right Configuration / Download Wizard */}
          <div className="col-span-2 p-6 flex flex-col justify-between bg-[#0e1628]">
            {activeStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Windows Masaüstü Kurulum Sihirbazına Hoş Geldiniz
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Bu sihirbaz, <strong className="text-emerald-400">TerraSat AI Workstation Enterprise (.EXE)</strong> uygulamasını bilgisayarınıza kurmak veya doğrudan taşınabilir olarak çalıştırmak için gerekli dosyaları sağlar.
                  </p>
                </div>

                {/* Features Highlights */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Copernicus Sentinel-2 MSI L2A 10m multispektral uydu analiz motoru</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>19 Bölümlü ISO 14064-2 ve GHG Protocol kurumsal MRV denetim raporlaması</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Entegre Gemini 3.8 Yapay Zekâ Agronomist ve GIS mühendislik copilotu</span>
                  </div>
                </div>

                {/* Target Installation Path */}
                <div className="pt-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Hedef Kurulum Klasörü:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={installPath}
                      onChange={(e) => setInstallPath(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300"
                    >
                      Gözat...
                    </button>
                  </div>
                </div>

                {/* Options checkboxes */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createDesktopShortcut}
                      onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Masaüstüne kısayol simgesi oluştur (TerraSat Workstation.lnk)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableGpuAcceleration}
                      onChange={(e) => setEnableGpuAcceleration(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>DirectX 12 Donanım Hızlandırmalı Raster İşlemeyi Etkinleştir</span>
                  </label>
                </div>
              </div>
            )}

            {/* Wizard Actions & Primary Download Buttons */}
            <div className="pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadPortableZip}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Kurulum gerektirmeyen taşınabilir ZIP paketi"
              >
                <Archive className="w-4 h-4 text-slate-400" />
                <span>Taşınabilir .ZIP İndir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  İptal
                </button>

                <button
                  type="button"
                  onClick={handleDownloadExe}
                  disabled={isDownloading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>{isDownloading ? 'Oluşturuluyor...' : 'Setup.exe İndir (48.8 MB)'}</span>
                </button>
              </div>
            </div>

            {/* Download Success Notice */}
            {downloadSuccess && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>TerraSat_AI_Workstation_Setup_v3.0.0.exe</strong> başarıyla indirildi! Windows bilgisayarınızda çift tıklayarak kurabilirsiniz.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
