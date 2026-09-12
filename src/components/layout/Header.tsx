import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Satellite, 
  Sparkles, 
  MapPin, 
  ChevronDown, 
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Menu
} from 'lucide-react';
import { Parcel, ActiveTab } from '../../types';
import { GLOBAL_ALERTS } from '../../data/parcels';

interface HeaderProps {
  activeTab: ActiveTab;
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
  onOpenSidebar?: () => void;
  onQuickDemoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  parcels,
  selectedParcel,
  onSelectParcel,
  onOpenSidebar,
  onQuickDemoClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  // Filter parcels based on search query
  const filteredParcels = searchQuery.trim()
    ? parcels.filter(
        (p) =>
          p.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Tarımsal İzleme Özeti',
          subtitle: 'Menemen / Gediz Havzası izlenen tedarik zinciri parselleri',
        };
      case 'parcels':
        return {
          title: 'Tüm Parseller & Sözleşmeli Alanlar',
          subtitle: '1,284 kayıtlı parselin çevresel ve spektral envanteri',
        };
      case 'analytics':
        return {
          title: 'Çevresel Göstergeler & Analitik',
          subtitle: 'Vejetasyon, su dengesi, toprak sağlığı ve karbon göstergeleri',
        };
      case 'reports':
        return {
          title: 'MRV Raporlama Arşivi',
          subtitle: 'Kurumsal denetim ve sürdürülebilirlik kanıt dokümantasyonu',
        };
      case 'settings':
        return {
          title: 'Sistem Parametreleri & Metodoloji',
          subtitle: 'Sentinel-2 uzaktan algılama kalibrasyonu ve model eşikleri',
        };
      default:
        return { title: 'TerraSat AI', subtitle: 'Tarımsal İzleme Platformu' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0d131f]/90 border-b border-slate-800/80 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h1>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Pilot: Menemen / İzmir
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Right: Search, Satellite status & Alerts */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Demo Shortcut Button */}
        {onQuickDemoClick && (
          <button
            onClick={onQuickDemoClick}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition shadow-sm hover:border-emerald-400/50"
            title="Seminer için Parsel #042'yi açar"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Örnek Demo (#042)</span>
          </button>
        )}

        {/* Global Search */}
        <div ref={searchRef} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Parsel ara (Örn: 042, Domates)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-36 sm:w-60 pl-8 pr-7 py-1.5 text-xs bg-slate-900/80 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Arama Sonuçları ({filteredParcels.length})
              </div>
              {filteredParcels.length === 0 ? (
                <div className="px-4 py-3 text-xs text-slate-400 text-center">
                  "{searchQuery}" ile eşleşen parsel bulunamadı.
                </div>
              ) : (
                filteredParcels.map((parcel) => (
                  <button
                    key={parcel.id}
                    onClick={() => {
                      onSelectParcel(parcel);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between transition border-b border-slate-800/40 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-400">{parcel.number}</span>
                        <span className="text-xs text-slate-200 font-medium">{parcel.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{parcel.crop}</span>
                        <span>•</span>
                        <span>{parcel.areaHa} ha</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          parcel.status === 'healthy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : parcel.status === 'moderate'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {parcel.sustainabilityScore} / 100
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Satellite Sync Info */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300">
          <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-400">Sentinel-2B • 08 Eyl 2026</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Alerts Popover */}
        <div ref={alertsRef} className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
            aria-label="Bildirimler"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-[#0d131f]"></span>
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Tedarik Zinciri Uyarıları</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                  {GLOBAL_ALERTS.length} Aktif Uyarı
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                {GLOBAL_ALERTS.map((alert) => (
                  <div key={alert.id} className="p-3 hover:bg-slate-800/50 transition text-left">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200">{alert.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{alert.date}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 bg-slate-950/60 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">
                  Otomatik Sentinel-2 spektral anomali taraması
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
