import React from 'react';
import { 
  Satellite, 
  MapPin, 
  Layers, 
  Activity, 
  FileText, 
  BookOpen, 
  X,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Bot,
  CheckSquare
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  isDemoMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  isDemoMode = false,
}) => {
  const navItems = [
    {
      id: 'monitor' as ActiveTab,
      label: 'Monitor',
      sublabel: 'Uydu Haritası & İzleme',
      icon: Layers,
      badge: 'Sentinel-2',
    },
    {
      id: 'analysis' as ActiveTab,
      label: 'Analysis',
      sublabel: 'Canlı Pipeline & Göstergeler',
      icon: Activity,
      badge: 'Gemini AI',
    },
    {
      id: 'assistant' as ActiveTab,
      label: 'AI Asistan',
      sublabel: 'Spektral & MRV Copilot',
      icon: Bot,
      badge: 'L2A',
    },
    {
      id: 'practices' as ActiveTab,
      label: 'Pratikler & Saha',
      sublabel: 'Sulama, Anız, Denetim',
      icon: CheckSquare,
      badge: 'Doğrulama',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports',
      sublabel: 'Kurumsal MRV Raporları',
      icon: FileText,
      badge: 'Denetim',
    },
    {
      id: 'methodology' as ActiveTab,
      label: 'Methodology',
      sublabel: 'Sensör & Formüller',
      icon: BookOpen,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080c14] border-r border-slate-800/80 text-slate-300 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">TerraSat</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Tarımsal MRV & Uydu Altyapısı
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Menüyü Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Navigasyon
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <div className="text-left">
                  <div className="font-bold text-slate-100">{item.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{item.sublabel}</div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sensor & Data Source Footer Card */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aktif Veri Kaynağı</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <div className="space-y-1 font-mono text-[10px] text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Uydu:</span>
            <span className="text-slate-200">Sentinel-2B MSI</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">MGRS Tile:</span>
            <span className="text-emerald-400">T35SNC (Gediz)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Çözünürlük:</span>
            <span className="text-slate-300">10 metre (L2A)</span>
          </div>
        </div>

        {isDemoMode && (
          <div className="pt-2 border-t border-slate-800 text-[10px] text-amber-400 font-medium">
            ⚠️ Demo Modu Aktif (Örnek Veri)
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex flex-col w-64 max-w-xs bg-[#080c14] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
