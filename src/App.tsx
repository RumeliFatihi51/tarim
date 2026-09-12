import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MetricsOverview } from './components/dashboard/MetricsOverview';
import { ActiveAlerts } from './components/dashboard/ActiveAlerts';
import { ParcelMap } from './components/map/ParcelMap';
import { ParcelDetailDrawer } from './components/parcels/ParcelDetailDrawer';
import { ParcelsTable } from './components/parcels/ParcelsTable';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ReportsArchiveView } from './components/reports/ReportsArchiveView';
import { SettingsView } from './components/settings/SettingsView';
import { MRVReportModal } from './components/reports/MRVReportModal';
import { PARCELS_DATA } from './data/parcels';
import { Parcel, LayerMode, TabType, AIAnalysisResult } from './types';
import { 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Layers, 
  Satellite, 
  ShieldCheck, 
  FileCheck2,
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [activeLayer, setActiveLayer] = useState<LayerMode>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // MRV Modal State
  const [mrvModalOpen, setMrvModalOpen] = useState(false);
  const [reportParcel, setReportParcel] = useState<Parcel | null>(null);
  const [reportAnalysis, setReportAnalysis] = useState<AIAnalysisResult | null>(null);

  // Quick select a parcel
  const handleSelectParcel = (parcel: Parcel) => {
    setSelectedParcel(parcel);
  };

  // Open MRV Report Modal
  const handleOpenReport = (parcel: Parcel, analysis: AIAnalysisResult | null = null) => {
    setReportParcel(parcel);
    setReportAnalysis(analysis);
    setMrvModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a11] text-slate-100 antialiased font-sans">
      {/* Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        activeParcelCount={PARCELS_DATA.length}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          selectedParcel={selectedParcel}
          onSearch={setSearchQuery}
          onOpenAlertParcel={(parcel) => {
            setSelectedParcel(parcel);
          }}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {/* TAB 1: DASHBOARD (Overview) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Region & Mission Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Satellite className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                        Menemen / Gediz Havzası Pilot Alanı
                      </h1>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Sentinel-2 Aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      1,284 tedarikçi parselinde eşzamanlı vejetasyon, su stresi ve toprak nemi denetimi
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Haritayı Genişlet</span>
                  </button>
                  <button
                    onClick={() => handleSelectParcel(PARCELS_DATA[0])}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Örnek Parseli İncele (#042)</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards & Supply Chain Pipeline */}
              <MetricsOverview onFilterStatus={() => setActiveTab('parcels')} />

              {/* Main Grid: Interactive Map (7 cols) + Active Alerts (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-8 flex flex-col min-h-[480px]">
                  <ParcelMap
                    parcels={PARCELS_DATA}
                    selectedParcel={selectedParcel}
                    onSelectParcel={handleSelectParcel}
                    activeLayer={activeLayer}
                    onLayerChange={setActiveLayer}
                  />
                </div>

                <div className="lg:col-span-4 flex flex-col min-h-[480px]">
                  <ActiveAlerts
                    parcels={PARCELS_DATA}
                    onSelectParcel={handleSelectParcel}
                  />
                </div>
              </div>

              {/* Featured Demonstration Parcels Quick-Row */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Örnek Tedarikçi Parselleri (Hızlı Erişim)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Farklı ürün ve risk profillerini temsil eden demonstrasyon parselleri
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('parcels')}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Tüm Parselleri Listele</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PARCELS_DATA.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectParcel(p)}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400">{p.number}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            p.status === 'healthy'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {p.status === 'healthy' ? 'Sağlıklı' : 'Orta Risk'}
                        </span>
                      </div>
                      <div className="font-bold text-white text-xs mt-1.5 group-hover:text-emerald-300 transition">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.crop} • {p.areaHa} ha
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">NDVI: <strong className="text-white">{p.ndvi}</strong></span>
                        <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-semibold">
                          Detayları Aç <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEOSPATIAL MAP (Full view) */}
          {activeTab === 'map' && (
            <div className="h-[calc(100vh-140px)] flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Mekânsal CBS & Uydu Analiz Haritası
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sentinel-2 L2A spektral katmanları ve parsel sınırları
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <ParcelMap
                  parcels={PARCELS_DATA}
                  selectedParcel={selectedParcel}
                  onSelectParcel={handleSelectParcel}
                  activeLayer={activeLayer}
                  onLayerChange={setActiveLayer}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PARCELS TABLE */}
          {activeTab === 'parcels' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Tedarikçi Parsel Envanteri & Göstergeleri
                </h2>
                <p className="text-xs text-slate-400">
                  Menemen Gediz Deltası'ndaki tüm kayıtlı tarım arazilerinin spektral ve çevresel durumu
                </p>
              </div>

              <ParcelsTable
                parcels={PARCELS_DATA}
                onSelectParcel={handleSelectParcel}
                onGenerateReport={(parcel) => handleOpenReport(parcel)}
              />
            </div>
          )}

          {/* TAB 4: ENVIRONMENTAL ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Çevresel Göstergeler & Tedarik Zinciri Dağılımı
                </h2>
                <p className="text-xs text-slate-400">
                  NDVI (Vejetasyon), NDWI (Su), Toprak Nemi ve Karbon Tutum Göstergeleri
                </p>
              </div>

              <AnalyticsView
                parcels={PARCELS_DATA}
                onSelectParcel={handleSelectParcel}
              />
            </div>
          )}

          {/* TAB 5: MRV REPORTS ARCHIVE */}
          {activeTab === 'reports' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <ReportsArchiveView
                parcels={PARCELS_DATA}
                onOpenReport={(parcel) => handleOpenReport(parcel)}
              />
            </div>
          )}

          {/* TAB 6: SETTINGS & METHODOLOGY */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              <SettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Parcel Detail Drawer */}
      {selectedParcel && (
        <ParcelDetailDrawer
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          onGenerateReport={(parcel, analysis) => {
            handleOpenReport(parcel, analysis);
          }}
        />
      )}

      {/* Corporate MRV Report Modal */}
      {mrvModalOpen && reportParcel && (
        <MRVReportModal
          parcel={reportParcel}
          analysis={reportAnalysis}
          onClose={() => setMrvModalOpen(false)}
        />
      )}
    </div>
  );
}
