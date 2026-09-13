import React from 'react';
import { AlertCircle, X, Check, ArrowDownToLine } from 'lucide-react';

interface WindowsCloseDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onMinimizeToTray: () => void;
  onConfirmExit: () => void;
}

export const WindowsCloseDialog: React.FC<WindowsCloseDialogProps> = ({
  isOpen,
  onCancel,
  onMinimizeToTray,
  onConfirmExit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[120] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#111827] border border-slate-700 shadow-2xl rounded-xl overflow-hidden flex flex-col text-slate-200 animate-in fade-in zoom-in-95 duration-100">
        {/* Title */}
        <div className="h-9 px-3 bg-[#0b0f19] border-b border-white/[0.08] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            TerraSat AI Workstation — Çıkış Onayı
          </span>
          <button
            onClick={onCancel}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Çalışma İstasyonunu Kapat</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sentinel-2 MSI Level-2A uydu veri senkronizasyonu arka planda devam edebilir. Uygulamayı sistem tepsisinde (System Tray) çalışır durumda bırakmak ister misiniz?
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-3 bg-[#0a0e1a] border-t border-white/[0.08] flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
          >
            İptal
          </button>
          <button
            onClick={onMinimizeToTray}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Tepsiye Küçült</span>
          </button>
          <button
            onClick={onConfirmExit}
            className="px-3.5 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold transition"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};
