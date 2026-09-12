import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ParcelMap } from './components/map/ParcelMap';
import { SelectedParcelCard } from './components/map/SelectedParcelCard';
import { LiveAnalysisPipeline } from './components/pipeline/LiveAnalysisPipeline';
import { AnalysisResultView } from './components/pipeline/AnalysisResultView';
import { ReportsArchiveView } from './components/reports/ReportsArchiveView';
import { MethodologyView } from './components/methodology/MethodologyView';
import { MRVReportModal } from './components/reports/MRVReportModal';
import { INITIAL_PARCELS } from './data/parcels';
import { Parcel, ActiveTab, FullAnalysisPayload, AIAnalysisResult } from './types';
import { Layers, Sparkles, Activity, FileText, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('monitor');
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(INITIAL_PARCELS[0]); // Emiralem Zeytinliği by default
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [analysisPayload, setAnalysisPayload] = useState<FullAnalysisPayload | null>(null);

  // Custom polygon drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Demo vs Sentinel-2 Live Mode toggle
  const [isDemoMode, setIsDemoMode] = useState(true);

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
  const handleStartAnalysis = async () => {
    const parcelToAnalyze = selectedParcel || INITIAL_PARCELS[0];
    setSelectedParcel(parcelToAnalyze);
    setIsAnalyzing(true);
    setPipelineFinished(false);
    setActiveTab('analysis');

    try {
      // Call our backend remote sensing pipeline
      const res = await fetch('/api/satellite/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId: parcelToAnalyze.id,
          parcelName: parcelToAnalyze.name,
          crop: parcelToAnalyze.crop,
          areaHa: parcelToAnalyze.areaHa,
          polygon: parcelToAnalyze.polygon,
          isDemo: isDemoMode,
        }),
      });

      if (res.ok) {
        const payload: FullAnalysisPayload = await res.json();
        setAnalysisPayload(payload);
      } else {
        // Fallback payload if fetch returned error
        createLocalPayload(parcelToAnalyze);
      }
    } catch (err) {
      console.error('Remote sensing pipeline error, using fallback payload:', err);
      createLocalPayload(parcelToAnalyze);
    }
  };

  const createLocalPayload = (parcel: Parcel) => {
    const payload: FullAnalysisPayload = {
      parcel,
      satelliteMetadata: {
        sensor: 'Copernicus Sentinel-2B MSI',
        sceneId: 'S2B_MSIL2A_20260908T084559_N0500_R107_T35SNC',
        tileId: 'T35SNC',
        acquisitionDate: '08 Eylül 2026',
        cloudCoveragePercent: 4.2,
        cloudScreeningPassed: true,
        spatialResolutionMeters: 10,
        processingLevel: 'L2A (BOA Surface Reflectance)',
        bandsUsed: ['B02', 'B03', 'B04', 'B08', 'B11'],
      },
      spectralBands: {
        B02: 0.042,
        B03: 0.078,
        B04: 0.062,
        B08: 0.325,
        B11: 0.175,
      },
      calculatedIndices: {
        ndvi: parcel.ndvi || 0.68,
        ndviTrend: -6.4,
        ndwi: parcel.ndwi || 0.21,
        ndwiTrend: -11.2,
        ndmi: 0.19,
        soilMoisture: parcel.soilMoisture || 38,
        waterStress: parcel.waterStress || 'Medium',
        plantHealth: parcel.plantHealth || 'Good',
        carbonIndicator: parcel.carbonIndicator || 'Positive',
      },
      historicalObservations: parcel.historicalData || [],
      aiAssessment: {
        summary: `${parcel.name} parseli için 08 Eylül 2026 tarihli Sentinel-2B L2A analizi tamamlandı. NDVI seviyesi ${parcel.ndvi} ile kanopi biyokütlesi korunmakta olup, NDWI ${parcel.ndwi} değerine gerilemiştir. Hidrik stres nedeniyle sulama kontrolü önerilmektedir.`,
        overallStatus: 'Orta Düzey Çevresel Stres',
        keyFindings: [
          'NDVI 0.68 seviyesinde: Çok yıllık zeytin kanopisi fotosentetik canlılığını sürdürüyor.',
          'NDWI su indeksi 60 günde %11.2 gerileyerek 0.21 seviyesine indi.',
          'Gözlem kalitesi: Bulut örtüsü %4.2 ile yüksek güvenilirlikte spektral okuma.',
          'Karbon yutak fonksiyonu dengeli ve pozitif eğilimdedir.',
        ],
        risks: [
          {
            title: 'Yaz Sonu Hidrik Su Kısıtı (NDWI Gerilemesi)',
            severity: 'medium',
            explanation: 'SWIR B11 bandındaki emilim zayıflaması kanopi yaprak su içeriğinin azaldığına işaret etmektedir.',
            evidence: 'NDWI 0.21 (B08: 0.325, B11: 0.175)',
          },
        ],
        positiveSignals: [
          'Vejetasyon indeksi bölgesel zeytin referans eşiğinin üzerindedir.',
          'Atmosferik aerosol ve sirrüs engeli bulunmamaktadır.',
        ],
        possibleDrivers: [
          'Ağustos ve Eylül ayı yüksek buharlaşması (ET0)',
          'Sulama periyodunun uzamış olması',
        ],
        recommendedActions: [
          'Damlama sulama sisteminin filtre ve basınç kontrolü',
          'Ağaç tacı altına organik malç uygulaması',
        ],
        verificationNeeded: [
          'Kök derinliğinde (0-30cm) TDR el tipi sensörle toprak nemi teyidi.',
          'Kooperatif sulama log defteri ve sayaç kayıtlarının incelenmesi.',
          'Sonraki Sentinel-2 döngüsünde (13 Eylül) spektral toparlanma takibi.',
        ],
        mrvStatus: {
          measurement: [
            'Sentinel-2 L2A BOA yansıma değerleri (B04, B08, B11)',
            'NDVI = 0.68, NDWI = 0.21 piksel ortalamaları',
          ],
          reporting: [
            'CSRD ve Scope 3 uyumlu dönemsel çevresel performans endeksi',
            'Kurumsal su riski skorlaması',
          ],
          verification: [
            'Zemin nemi TDR kontrolü',
            'Çiftçi sulama beyanı teyidi',
          ],
        },
        confidenceLevel: 'High',
        confidenceJustification: 'Bulutsuz (%4.2) Sentinel-2 L2A yansıma verileri ve 6 aylık tutarlı zaman serisi trendi.',
        modelUsed: 'Gemini 3.8 Flash & ESA L2A',
      },
      isDemoMode: true,
      dataSourceLabel: 'Copernicus Sentinel-2B MSI (Level-2A BOA)',
      timestamp: new Date().toISOString(),
    };
    setAnalysisPayload(payload);
  };

  const handlePipelineCompleted = () => {
    setIsAnalyzing(false);
    setPipelineFinished(true);
  };

  const handleOpenReportModal = () => {
    setMrvModalOpen(true);
  };

  // Finished custom polygon drawing on map
  const handleFinishCustomDrawing = (coords: [number, number][]) => {
    setIsDrawingMode(false);
    const customParcel: Parcel = {
      id: `poly-${Date.now().toString().slice(-4)}`,
      number: `#USR-${coords.length}K`,
      name: 'Özel Çizilen Parsel Alanı',
      location: 'Emiralem / Menemen Bölgesi',
      crop: 'Zeytinlik (Özel Sınır)',
      areaHa: 5.2,
      status: 'moderate',
      sustainabilityScore: 79,
      scoreBreakdown: { vegetation: 80, water: 72, soil: 76, carbon: 84, management: 76 },
      ndvi: 0.68,
      ndwi: 0.21,
      soilMoisture: 38,
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
            // Quick search handler
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
                />
              </div>

              {/* Selected Area Floating Card on the Right (Section 34) */}
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
                    Harita üzerinden bir parsel seçin veya hemen Emiralem Zeytinliği örnek demonstrasyonunu başlatın.
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

          {/* TAB 3: REPORTS (MRV Archives & Downloads) */}
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

          {/* TAB 4: METHODOLOGY (Scientific Documentation) */}
          {activeTab === 'methodology' && (
            <div className="w-full h-full">
              <MethodologyView />
            </div>
          )}
        </div>
      </div>

      {/* 12-Section Corporate MRV Report Modal */}
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
