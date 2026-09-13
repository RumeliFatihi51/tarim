import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ParcelMap } from './components/map/ParcelMap';
import { SelectedParcelCard } from './components/map/SelectedParcelCard';
import { LiveAnalysisPipeline } from './components/pipeline/LiveAnalysisPipeline';
import { AnalysisResultView } from './components/pipeline/AnalysisResultView';
import { ReportsArchiveView } from './components/reports/ReportsArchiveView';
import { MethodologyView } from './components/methodology/MethodologyView';
import { AICopilotView } from './components/ai/AICopilotView';
import { PracticesView } from './components/practices/PracticesView';
import { MRVReportModal } from './components/reports/MRVReportModal';
import { INITIAL_PARCELS } from './data/parcels';
import { Parcel, ActiveTab, FullAnalysisPayload } from './types';
import { Activity } from 'lucide-react';
import { getDemoAnalysisPayload } from './demo/sampleData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitor');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(INITIAL_PARCELS[0]); // Emiralem Zeytinliği by default
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [analysisPayload, setAnalysisPayload] = useState<FullAnalysisPayload | null>(null);

  // Custom polygon drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Default to LIVE Sentinel-2 mode, user can toggle to DEMO if needed
  const [isDemoMode, setIsDemoMode] = useState(false);

  // MRV Modal State
  const [mrvModalOpen, setMrvModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Quick Preset Selection
  const handleSelectQuickPreset = (presetId: string) => {
    const found = INITIAL_PARCELS.find((p) => p.id === presetId);
    if (found) {
      setSelectedParcel(found);
      setIsDrawingMode(false);
    }
  };

  // Trigger Satellite Analysis Pipeline
  const handleStartAnalysis = () => {
    const parcelToAnalyze = selectedParcel || INITIAL_PARCELS[0];
    setSelectedParcel(parcelToAnalyze);
    setIsAnalyzing(true);
    setPipelineFinished(false);
    setActiveTab('analysis');
  };

  const handlePipelineCompleted = (payload?: FullAnalysisPayload) => {
    if (payload) {
      setAnalysisPayload(payload);
    } else if (isDemoMode) {
      setAnalysisPayload(getDemoAnalysisPayload(selectedParcel?.id));
    }
    setIsAnalyzing(false);
    setPipelineFinished(true);
  };

  const handleOpenReportModal = () => {
    setMrvModalOpen(true);
  };

  // Finished custom polygon drawing on map
  const handleFinishCustomDrawing = (coords: [number, number][]) => {
    setIsDrawingMode(false);

    // Compute approximate area in ha from coords
    let areaHa = 4.0;
    if (coords.length >= 3) {
      // Shoelace approximation for small coordinates
      let area = 0;
      const n = coords.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = coords[i][1] * 111320 * Math.cos((coords[i][0] * Math.PI) / 180);
        const yi = coords[i][0] * 110540;
        const xj = coords[j][1] * 111320 * Math.cos((coords[j][0] * Math.PI) / 180);
        const yj = coords[j][0] * 110540;
        area += xi * yj - xj * yi;
      }
      areaHa = Math.max(0.2, parseFloat((Math.abs(area) / 2 / 10000).toFixed(2)));
    }

    const customParcel: Parcel = {
      id: `poly-${Date.now().toString().slice(-4)}`,
      number: `#USR-${coords.length}K`,
      name: 'Özel Çizilen Parsel Alanı',
      location: 'Emiralem / Menemen Bölgesi',
      crop: 'Zeytinlik (Özel Sınır)',
      areaHa,
      status: 'moderate',
      sustainabilityScore: 78,
      scoreBreakdown: { vegetation: 78, water: 70, soil: 75, carbon: 80, management: 75 },
      ndvi: 0.65,
      ndwi: 0.20,
      soilMoisture: 36,
      waterStress: 'Medium',
      plantHealth: 'Good',
      carbonIndicator: 'Positive',
      lastObservation: '08 Eylül 2026',
      polygon: coords,
      historicalData: INITIAL_PARCELS[0].historicalData,
    };
    setSelectedParcel(customParcel);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080c14] text-slate-100 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isDemoMode={isDemoMode}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          selectedParcel={selectedParcel}
          onSearchLocation={(query) => {
            if (query.toLowerCase().includes('emiralem')) {
              handleSelectQuickPreset('emiralem-01');
            } else if (query.toLowerCase().includes('karasu') || query.toLowerCase().includes('domates')) {
              handleSelectQuickPreset('042');
            } else if (query.toLowerCase().includes('pamuk')) {
              handleSelectQuickPreset('063');
            }
          }}
          onSelectQuickDemo={() => handleSelectQuickPreset('emiralem-01')}
          onStartAnalysis={handleStartAnalysis}
          isAnalyzing={isAnalyzing}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isDemoMode={isDemoMode}
          onToggleDemoMode={setIsDemoMode}
        />

        {/* Dynamic Views based on Active Tab */}
        <div className="flex-1 overflow-hidden relative">
          {/* TAB 1: MONITOR (Map + Right Selection Panel) */}
          {activeTab === 'monitor' && (
            <div className="relative w-full h-full flex flex-col lg:flex-row">
              {/* Map Canvas */}
              <div className="flex-1 h-full relative">
                <ParcelMap
                  parcels={INITIAL_PARCELS}
                  selectedParcel={selectedParcel}
                  onSelectParcel={(p) => setSelectedParcel(p)}
                  isDrawingMode={isDrawingMode}
                  onFinishDrawing={handleFinishCustomDrawing}
                  onCancelDrawing={() => setIsDrawingMode(false)}
                  analysisPayload={analysisPayload}
                />
              </div>

              {/* Selected Area Floating Card on the Right */}
              <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                <SelectedParcelCard
                  parcel={selectedParcel}
                  onStartAnalysis={handleStartAnalysis}
                  isAnalyzing={isAnalyzing}
                  isDrawing={isDrawingMode}
                  onToggleDrawing={() => setIsDrawingMode(!isDrawingMode)}
                  isDemoMode={isDemoMode}
                  onSelectQuickPreset={handleSelectQuickPreset}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ANALYSIS (Live Pipeline OR Analysis Result View) */}
          {activeTab === 'analysis' && (
            <div className="w-full h-full">
              {isAnalyzing ? (
                <LiveAnalysisPipeline
                  parcel={selectedParcel || INITIAL_PARCELS[0]}
                  onComplete={handlePipelineCompleted}
                  isDemoMode={isDemoMode}
                />
              ) : analysisPayload ? (
                <AnalysisResultView
                  analysisData={analysisPayload}
                  onOpenReport={handleOpenReportModal}
                  onBackToMap={() => setActiveTab('monitor')}
                />
              ) : (
                /* Empty state prompting user to start */
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#080c14]">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <Activity className="w-8 h-8 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Henüz Bir Alan Analiz Edilmedi</h2>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                    Harita üzerinden bir parsel seçin veya hemen Emiralem Zeytinliği canlı Sentinel-2 analizini başlatın.
                  </p>
                  <button
                    onClick={handleStartAnalysis}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95"
                  >
                    Emiralem Zeytinliği Analizini Başlat
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI ASSISTANT */}
          {activeTab === 'assistant' && (
            <div className="w-full h-full">
              <AICopilotView
                parcels={INITIAL_PARCELS}
                selectedParcel={selectedParcel}
                onSelectParcel={(p) => setSelectedParcel(p)}
                onOpenReport={(p) => {
                  setSelectedParcel(p);
                  handleOpenReportModal();
                }}
                onStartAnalysis={handleStartAnalysis}
              />
            </div>
          )}

          {/* TAB 4: PRACTICES & FIELD VERIFICATION */}
          {activeTab === 'practices' && (
            <div className="w-full h-full">
              <PracticesView
                parcels={INITIAL_PARCELS}
                selectedParcel={selectedParcel}
                onSelectParcel={(p) => setSelectedParcel(p)}
                onOpenReport={(p) => {
                  setSelectedParcel(p);
                  handleOpenReportModal();
                }}
              />
            </div>
          )}

          {/* TAB 5: REPORTS (MRV Archives & Downloads) */}
          {activeTab === 'reports' && (
            <div className="w-full h-full p-4 sm:p-8 overflow-y-auto bg-[#080c14]">
              <div className="max-w-6xl mx-auto">
                <ReportsArchiveView
                  parcels={INITIAL_PARCELS}
                  onOpenReport={(p) => {
                    setSelectedParcel(p);
                    handleOpenReportModal();
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 6: METHODOLOGY (Scientific Documentation) */}
          {activeTab === 'methodology' && (
            <div className="w-full h-full">
              <MethodologyView />
            </div>
          )}
        </div>
      </div>

      {/* 19-Section Corporate MRV Report Modal */}
      {mrvModalOpen && (
        <MRVReportModal
          parcel={selectedParcel || INITIAL_PARCELS[0]}
          analysis={analysisPayload ? analysisPayload.aiAssessment : null}
          fullPayload={analysisPayload}
          onClose={() => setMrvModalOpen(false)}
        />
      )}
    </div>
  );
}
