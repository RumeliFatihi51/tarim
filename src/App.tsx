import React, { useState } from 'react';
import { WindowsTitleBar } from './components/desktop/WindowsTitleBar';
import { WindowsRibbonBar } from './components/desktop/WindowsRibbonBar';
import { WindowsSidebarExplorer } from './components/desktop/WindowsSidebarExplorer';
import { WindowsStatusBar } from './components/desktop/WindowsStatusBar';
import { WindowsExeInstallerModal } from './components/desktop/WindowsExeInstallerModal';
import { WindowsCloseDialog } from './components/desktop/WindowsCloseDialog';
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
import { Activity, Play, Download, HardDrive, CheckCircle2 } from 'lucide-react';
import { getDemoAnalysisPayload } from './demo/sampleData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitor');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(INITIAL_PARCELS[0]); // Emiralem Zeytinliği by default
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [analysisPayload, setAnalysisPayload] = useState<FullAnalysisPayload | null>(null);

  // Custom polygon drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Default to LIVE Sentinel-2 mode
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Windows Desktop Modals & States
  const [exeModalOpen, setExeModalOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [mrvModalOpen, setMrvModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [trayNotification, setTrayNotification] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // Quick Preset Selection
  const handleSelectQuickPreset = (presetId: string) => {
    const found = INITIAL_PARCELS.find((p) => p.id === presetId);
    if (found) {
      setSelectedParcel(found);
      setIsDrawingMode(false);
    }
  };

  // Custom polygon drawing on map
  const handleFinishCustomDrawing = (coords: [number, number][]) => {
    setIsDrawingMode(false);

    let areaHa = 4.0;
    if (coords.length >= 3) {
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
      sustainabilityScore: Number.NaN,
      scoreBreakdown: { vegetation: Number.NaN, water: Number.NaN, soil: Number.NaN, carbon: Number.NaN, management: Number.NaN },
      ndvi: Number.NaN,
      ndwi: Number.NaN,
      soilMoisture: Number.NaN,
      waterStress: 'Medium',
      plantHealth: 'Good',
      carbonIndicator: 'Stable',
      lastObservation: 'Awaiting analysis',
      polygon: coords,
      historicalData: [],
    };
    setSelectedParcel(customParcel);
  };

  // Windows Window Control Actions
  const handleMinimize = () => {
    setIsMinimized(true);
    setTrayNotification(true);
  };

  const handleRestoreFromTray = () => {
    setIsMinimized(false);
    setTrayNotification(false);
  };

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleOpenCloseDialog = () => {
    setCloseDialogOpen(true);
  };

  const handleConfirmExit = () => {
    setCloseDialogOpen(false);
    // Alert or minimize
    setIsMinimized(true);
    setTrayNotification(true);
  };

  return (
    <div
      id="windows-workstation-root"
      className="w-full h-full min-h-full bg-[#050811] flex items-center justify-center p-0 overflow-hidden font-sans text-slate-100 select-none"
    >
      {/* Minimized Tray Banner if window is minimized */}
      {isMinimized ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center p-6 bg-[#0c1222] border border-slate-700 rounded-2xl shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
            <HardDrive className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">TerraSat AI Workstation Sistem Tepsisinde</h3>
            <p className="text-xs text-slate-400 mt-1">
              Copernicus Sentinel-2 L2A izleme motoru arka planda çalışmaya devam ediyor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestoreFromTray}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              Pencereyi Geri Yükle
            </button>
            <button
              onClick={() => setExeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Setup.exe İndir
            </button>
          </div>
        </div>
      ) : (
        /* The Windows 11 Desktop Workstation Window Frame */
        <div
          className={`w-full h-full bg-[#0a0f1d] flex flex-col border border-white/[0.12] shadow-2xl overflow-hidden ${
            isMaximized ? 'rounded-none' : 'max-w-7xl max-h-[92vh] rounded-none md:rounded-xl border-slate-700'
          }`}
        >
          {/* 1. Windows Native Title Bar (Mica/Acrylic style + Menus + Window Controls + Direct EXE) */}
          <WindowsTitleBar
            isMaximized={isMaximized}
            onToggleMaximize={handleToggleMaximize}
            onMinimize={handleMinimize}
            onClose={handleOpenCloseDialog}
            onOpenExeModal={() => setExeModalOpen(true)}
            onSelectTab={(t) => setActiveTab(t as ActiveTab)}
            activeTab={activeTab}
          />

          {/* 2. Windows Ribbon Bar (GIS and Remote Sensing quick action tiles) */}
          <WindowsRibbonBar
            activeTab={activeTab}
            onSelectTab={(t) => setActiveTab(t as ActiveTab)}
            selectedParcel={selectedParcel}
            onStartAnalysis={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
            onOpenReportModal={handleOpenReportModal}
            onOpenExeModal={() => setExeModalOpen(true)}
            isDrawingMode={isDrawingMode}
            onToggleDrawing={() => setIsDrawingMode(!isDrawingMode)}
            isDemoMode={isDemoMode}
            onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* 3. Main Workspace Area: Split Left Explorer Dock + Center Document Area */}
          <div className="flex-1 w-full flex overflow-hidden relative bg-[#070b16]">
            {/* Left Explorer Dock (Parcels, Spectral Bands, Indices) */}
            {isSidebarOpen && (
              <WindowsSidebarExplorer
                parcels={INITIAL_PARCELS}
                selectedParcel={selectedParcel}
                onSelectParcel={(p) => {
                  setSelectedParcel(p);
                  setIsDrawingMode(false);
                }}
                onOpenReport={(p) => {
                  setSelectedParcel(p);
                  handleOpenReportModal();
                }}
              />
            )}

            {/* Center Workstation Document Viewport */}
            <main className="flex-1 h-full overflow-hidden relative flex flex-col bg-[#060a14]">
              {/* TAB 1: MONITOR (GIS Map with Floating Parcel Inspector) */}
              {activeTab === 'monitor' && (
                <div className="relative w-full h-full flex flex-col">
                  {/* Interactive Leaflet Satellite GIS Canvas */}
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

                  {/* Desktop Bottom Floating Selected Parcel Card */}
                  <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 pointer-events-auto">
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

              {/* TAB 2: ANALYSIS (Live 14-Stage Sentinel-2 Pipeline OR Results) */}
              {activeTab === 'analysis' && (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-[#060a14]">
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
                    /* Workstation Empty State prompting user to launch analysis */
                    <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center p-8 text-center bg-[#070c18] border border-white/[0.05] rounded-2xl">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/15">
                        <Activity className="w-8 h-8 animate-pulse" />
                      </div>
                      <h2 className="text-lg font-bold text-white">
                        Copernicus Sentinel-2 Spektral Analiz Konsolu
                      </h2>
                      <p className="text-xs text-slate-400 max-w-md mt-1 mb-6 leading-relaxed">
                        <strong className="text-emerald-400">{selectedParcel ? selectedParcel.name : 'Emiralem Zeytinliği'}</strong> parseli için 10m L2A yüzey yansımaları, 14 aşamalı spektral boru hattı ve toprak organik karbon (SOC) stok analizini başlatın.
                      </p>
                      <button
                        onClick={handleStartAnalysis}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition active:scale-95"
                      >
                        14 Aşamalı Spektral Boru Hattını Başlat
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REPORTS (Corporate MRV Archive) */}
              {activeTab === 'reports' && (
                <div className="w-full h-full p-4 sm:p-6 overflow-y-auto bg-[#060a14]">
                  <ReportsArchiveView
                    parcels={INITIAL_PARCELS}
                    onOpenReport={(p) => {
                      setSelectedParcel(p);
                      handleOpenReportModal();
                    }}
                  />
                </div>
              )}

              {/* TAB 4: PRACTICES & FIELD VERIFICATION */}
              {activeTab === 'practices' && (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-[#060a14]">
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

              {/* TAB 5: AI COPILOT & AGRONOMIC ASSISTANT (Gemini 3.8) */}
              {activeTab === 'assistant' && (
                <div className="w-full h-full overflow-hidden bg-[#060a14]">
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

              {/* TAB 6: METHODOLOGY & SCIENTIFIC FORMULAS */}
              {activeTab === 'methodology' && (
                <div className="w-full h-full overflow-y-auto p-4 sm:p-6 bg-[#060a14]">
                  <MethodologyView />
                </div>
              )}
            </main>
          </div>

          {/* 4. Windows Status Bar (GIS Coordinates, Sensor Status, Projection, Clock, EXE link) */}
          <WindowsStatusBar
            selectedParcel={selectedParcel}
            onOpenExeModal={() => setExeModalOpen(true)}
            isDemoMode={isDemoMode}
          />
        </div>
      )}

      {/* Windows 11 Setup Wizard Modal (.EXE Download & Installer) */}
      <WindowsExeInstallerModal
        isOpen={exeModalOpen}
        onClose={() => setExeModalOpen(false)}
      />

      {/* Windows Close Confirmation Dialog */}
      <WindowsCloseDialog
        isOpen={closeDialogOpen}
        onCancel={() => setCloseDialogOpen(false)}
        onMinimizeToTray={() => {
          setCloseDialogOpen(false);
          handleMinimize();
        }}
        onConfirmExit={handleConfirmExit}
      />

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
