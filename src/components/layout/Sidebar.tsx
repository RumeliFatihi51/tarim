import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Activity, 
  FileText, 
  Settings, 
  Globe, 
  Sprout, 
  X,
  Satellite,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Droplets,
  Layers
} from 'lucide-react';
import { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeParcelCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
  activeParcelCount = 1284,
}) => {
  const navItems = [
    {
      group: 'GENEL BAKIŞ',
      items: [
        { id: 'dashboard' as ActiveTab, label: 'Gösterge Paneli', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      group: 'İZLEME & ÇEVRESEL VERİ',
      items: [
        { id: 'map' as ActiveTab, label: 'CBS Uydu Haritası', icon: Layers, badge: 'Sentinel-2' },
        { id: 'parcels' as ActiveTab, label: 'Tüm Parseller', icon: Map, badge: `${activeParcelCount}` },
        { id: 'analytics' as ActiveTab, label: 'Çevresel Göstergeler', icon: Activity, badge: null },
      ],
    },
    {
      group: 'KURUMSAL RAPORLAMA',
      items: [
        { id: 'reports' as ActiveTab, label: 'MRV Raporları', icon: FileText, badge: 'Doğrulama' },
      ],
    },
    {
      group: 'SİSTEM & METODOLOJİ',
      items: [
        { id: 'settings' as ActiveTab, label: 'Ayarlar & Kalibrasyon', icon: Settings, badge: null },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080c14] border-r border-slate-800/80 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Satellite className="w-5 h-5 text-emerald-100" />
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">TerraSat</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Tarımsal MRV & Uydu Analitiği
              </p>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation list */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navItems.map((group, gIdx) => (
          <div key={gIdx}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {group.group}
              </div>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition group text-left ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 hover:bg-slate-800/60'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Corporate Scope / MRV Assurance box */}
      {!collapsed && (
        <div className="p-3 mx-3 mb-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>MRV Doğrulama Katmanı</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Avrupa Yeşil Mutabakatı (CSRD) & kurumsal tedarik zinciri uyumluluğu için uzaktan algılama denetim izi.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Gediz Havzası</span>
            <span className="text-emerald-400">16,420 ha Aktif</span>
          </div>
        </div>
      )}

      {/* Subtle scientific demonstrator note in footer */}
      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-400 bg-slate-950/40">
        {!collapsed ? (
          <p className="leading-tight text-slate-400">
            TerraSat AI Konsept Demonstratörü
            <br />
            <span className="text-slate-400">Örnek veriler Sentinel-2 10m bazlı modellenmiştir.</span>
          </p>
        ) : (
          <div className="text-center text-slate-400">TS</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-40 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
