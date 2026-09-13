import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Parcel, RiskStatus, FullAnalysisPayload } from '../../types';
import { 
  Layers, 
  RotateCcw, 
  Eye, 
  MapPin, 
  Sparkles, 
  Pencil, 
  Check, 
  X, 
  Compass, 
  Info,
  Maximize2
} from 'lucide-react';

interface ParcelMapProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
  isDrawingMode: boolean;
  onFinishDrawing?: (coords: [number, number][]) => void;
  onCancelDrawing?: () => void;
  analysisPayload?: FullAnalysisPayload | null;
  className?: string;
}

export type MapLayerMode = 'satellite' | 'ndvi' | 'ndwi' | 'moisture';

export const ParcelMap: React.FC<ParcelMapProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  isDrawingMode,
  onFinishDrawing,
  onCancelDrawing,
  analysisPayload,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<{ [id: string]: L.Polygon }>({});
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);

  const [layerMode, setLayerMode] = useState<MapLayerMode>('satellite');
  const [basemap, setBasemap] = useState<'satellite' | 'dark' | 'streets'>('satellite');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Focus point: Emiralem / Menemen region (38.642, 27.118)
  const EMIRALEM_CENTER: [number, number] = [38.6420, 27.1180];
  const DEFAULT_ZOOM = 14;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: EMIRALEM_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Default: High-resolution Esri World Imagery (True Color Satellite)
    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: 'Esri, Maxar, Earthstar Geographics',
      }
    );

    satelliteTiles.addTo(map);
    tileLayerRef.current = satelliteTiles;

    // Layer group for polygon drawing
    const drawingGroup = L.layerGroup().addTo(map);
    drawingLayerRef.current = drawingGroup;

    mapInstanceRef.current = map;

    // Immediately schedule an invalidateSize to ensure tiles render if container was animating/resizing
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Observe container size changes (e.g. window resize, sidebar toggle, iframe dimension change)
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle basemap changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    if (basemap === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: 'Esri' }
      );
    } else if (basemap === 'dark') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, attribution: 'CARTO' }
      );
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: 'OpenStreetMap' }
      );
    }

    tileLayerRef.current.addTo(mapInstanceRef.current);
  }, [basemap]);

  // Click handler for drawing custom parcel
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingMode) return;

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints((prev) => [...prev, newPoint]);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode]);

  // Render drawing preview
  useEffect(() => {
    const group = drawingLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (drawnPoints.length > 0) {
      drawnPoints.forEach((pt) => {
        const marker = L.circleMarker(pt, {
          radius: 5,
          fillColor: '#10b981',
          fillOpacity: 1,
          color: '#ffffff',
          weight: 2,
        });
        marker.addTo(group);
      });

      if (drawnPoints.length > 1) {
        const polyline = L.polyline(drawnPoints, {
          color: '#34d399',
          weight: 3,
          dashArray: '5, 5',
        });
        polyline.addTo(group);
      }

      if (drawnPoints.length > 2) {
        const polygon = L.polygon(drawnPoints, {
          fillColor: '#10b981',
          fillOpacity: 0.25,
          color: '#10b981',
          weight: 2,
        });
        polygon.addTo(group);
      }
    }
  }, [drawnPoints]);

  // Real raster overlay rendering
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
      imageOverlayRef.current = null;
    }

    if (!selectedParcel || !analysisPayload?.visualizations) return;

    let overlayUrl: string | undefined;
    if (layerMode === 'ndvi') overlayUrl = analysisPayload.visualizations.ndviPngBase64;
    else if (layerMode === 'ndwi') overlayUrl = analysisPayload.visualizations.ndwiPngBase64;
    else if (layerMode === 'moisture') overlayUrl = analysisPayload.visualizations.ndmiPngBase64;
    else if (layerMode === 'satellite') overlayUrl = analysisPayload.visualizations.rgbPngBase64;

    if (overlayUrl && selectedParcel.polygon?.length >= 3) {
      const lats = selectedParcel.polygon.map((p) => p[0]);
      const lngs = selectedParcel.polygon.map((p) => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const bounds: L.LatLngBoundsExpression = [
        [minLat, minLng],
        [maxLat, maxLng],
      ];
      const overlay = L.imageOverlay(overlayUrl, bounds, {
        opacity: 0.88,
        interactive: false,
      });
      overlay.addTo(map);
      imageOverlayRef.current = overlay;
    }
  }, [selectedParcel, analysisPayload, layerMode]);

  // Style calculator for parcels based on layerMode
  const getParcelStyle = (parcel: Parcel, isSelected: boolean) => {
    let fillColor = '#10b981';
    let borderColor = '#34d399';
    let fillOpacity = isSelected ? 0.65 : 0.38;

    if (layerMode === 'satellite') {
      fillColor = isSelected ? '#10b981' : '#059669';
      borderColor = isSelected ? '#ffffff' : '#34d399';
      fillOpacity = isSelected ? 0.45 : 0.22;
    } else if (layerMode === 'ndvi') {
      if (parcel.ndvi >= 0.75) {
        fillColor = '#059669';
        borderColor = '#10b981';
      } else if (parcel.ndvi >= 0.65) {
        fillColor = '#10b981';
        borderColor = '#6ee7b7';
      } else if (parcel.ndvi >= 0.55) {
        fillColor = '#84cc16';
        borderColor = '#a3e635';
      } else {
        fillColor = '#eab308';
        borderColor = '#facc15';
      }
      fillOpacity = isSelected ? 0.75 : 0.55;
    } else if (layerMode === 'ndwi') {
      if (parcel.ndwi >= 0.45) {
        fillColor = '#0284c7';
        borderColor = '#38bdf8';
      } else if (parcel.ndwi >= 0.30) {
        fillColor = '#06b6d4';
        borderColor = '#22d3ee';
      } else {
        fillColor = '#f59e0b';
        borderColor = '#fbbf24';
      }
      fillOpacity = isSelected ? 0.75 : 0.55;
    } else if (layerMode === 'moisture') {
      if (parcel.waterStress === 'Low') {
        fillColor = '#06b6d4';
        borderColor = '#22d3ee';
      } else if (parcel.waterStress === 'Medium') {
        fillColor = '#f59e0b';
        borderColor = '#fbbf24';
      } else {
        fillColor = '#ef4444';
        borderColor = '#f87171';
      }
      fillOpacity = isSelected ? 0.75 : 0.55;
    }

    return {
      fillColor,
      fillOpacity,
      color: isSelected ? '#ffffff' : borderColor,
      weight: isSelected ? 3.5 : 2,
    };
  };

  // Render & update parcels
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(polygonLayersRef.current).forEach((layer) => {
      map.removeLayer(layer);
    });
    polygonLayersRef.current = {};

    parcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;
      const style = getParcelStyle(parcel, isSelected);

      const polygon = L.polygon(parcel.polygon, style);

      const tooltipContent = `
        <div style="font-family: inherit; font-size: 11px; padding: 4px; line-height: 1.4; color: #f1f5f9;">
          <div style="font-weight: 800; color: #34d399; font-size: 12px; margin-bottom: 2px;">
            ${parcel.number || ''} ${parcel.name}
          </div>
          <div style="color: #cbd5e1;"><strong>Ürün:</strong> ${parcel.crop} (${parcel.areaHa} ha)</div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">
            NDVI: ${parcel.ndvi} | NDWI: ${parcel.ndwi} | Su Stresi: ${parcel.waterStress}
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        className: 'custom-leaflet-tooltip',
        direction: 'top',
        offset: [0, -10],
        sticky: true,
      });

      polygon.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectParcel(parcel);
      });

      polygon.addTo(map);
      polygonLayersRef.current[parcel.id] = polygon;
    });
  }, [parcels, selectedParcel, layerMode]);

  // Center on selected parcel
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedParcel || !selectedParcel.polygon?.length) return;

    const layer = polygonLayersRef.current[selectedParcel.id];
    if (layer) {
      map.panTo(layer.getBounds().getCenter(), {
        animate: true,
        duration: 0.8,
      });
    } else {
      map.panTo(selectedParcel.polygon[0], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedParcel]);

  const handleFinishCustomDrawing = () => {
    if (drawnPoints.length < 3) return;

    if (onFinishDrawing) {
      onFinishDrawing(drawnPoints);
    }
    setDrawnPoints([]);
  };

  const handleCancelCustomDrawing = () => {
    setDrawnPoints([]);
    if (onCancelDrawing) {
      onCancelDrawing();
    }
  };

  const handleResetToEmiralem = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(EMIRALEM_CENTER, DEFAULT_ZOOM, {
        animate: true,
      });
    }
  };

  return (
    <div className={`relative w-full h-full bg-slate-950 overflow-hidden ${className}`}>
      {/* Map Viewport Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Spectral Layer Selector & Basemap */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-md">
        {/* Layer Mode Tabs */}
        <div className="flex items-center p-1 bg-[#090d16]/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl">
          <button
            onClick={() => setLayerMode('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              layerMode === 'satellite'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Orijinal Uydu (RGB)</span>
          </button>

          <button
            onClick={() => setLayerMode('ndvi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              layerMode === 'ndvi'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>NDVI Katmanı</span>
          </button>

          <button
            onClick={() => setLayerMode('ndwi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              layerMode === 'ndwi'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>NDWI Su Katmanı</span>
          </button>

          <button
            onClick={() => setLayerMode('moisture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              layerMode === 'moisture'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Su Stresi (NDMI)</span>
          </button>
        </div>

        {/* Basemap Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#090d16]/90 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-lg w-fit text-xs text-slate-300">
          <span className="text-[10px] text-slate-500 uppercase px-2 font-mono">Altlık:</span>
          <button
            onClick={() => setBasemap('satellite')}
            className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
              basemap === 'satellite' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Esri Uydu
          </button>
          <button
            onClick={() => setBasemap('dark')}
            className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
              basemap === 'dark' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Koyu CBS
          </button>
          <button
            onClick={() => setBasemap('streets')}
            className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
              basemap === 'streets' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Açık Harita
          </button>
        </div>
      </div>

      {/* Top Center: Custom Drawing Status Banner */}
      {isDrawingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/90 border border-emerald-500/50 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span className="text-xs font-bold">
              Haritaya tıklayarak parsel sınır noktalarını belirleyin ({drawnPoints.length} köşe)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {drawnPoints.length >= 3 && (
              <button
                onClick={handleFinishCustomDrawing}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Alanı Onayla</span>
              </button>
            )}

            <button
              onClick={handleCancelCustomDrawing}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="İptal Et"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Left: Map Controls & Quick Reset */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={handleResetToEmiralem}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#090d16]/90 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium shadow-lg transition"
          title="Emiralem Zeytinliği merkezine odaklan"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Emiralem'e Odaklan</span>
        </button>

        <div className="flex items-center gap-1 bg-[#090d16]/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg text-xs font-mono text-slate-400">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-white rounded-lg transition"
          >
            +
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-white rounded-lg transition"
          >
            -
          </button>
        </div>
      </div>

      {/* Bottom Center: Map Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-3 px-3 py-1.5 bg-[#090d16]/90 backdrop-blur-md border border-slate-800/80 rounded-xl text-[11px] text-slate-300 font-mono shadow-lg">
        {layerMode === 'ndvi' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">NDVI:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#eab308]" /> &lt;0.55</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]" /> 0.55-0.65</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" /> 0.65-0.75</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#059669]" /> &gt;0.75</span>
          </div>
        )}

        {layerMode === 'ndwi' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">NDWI:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /> &lt;0.30 (Kuru)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]" /> 0.30-0.45 (Orta)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7]" /> &gt;0.45 (Optimal)</span>
          </div>
        )}

        {layerMode === 'moisture' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Su Stresi:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" /> Yüksek</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /> Orta</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]" /> Düşük</span>
          </div>
        )}

        {layerMode === 'satellite' && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Sentinel-2 L2A BOA Yansıma Katmanı (10m Çözünürlük)</span>
          </div>
        )}
      </div>
    </div>
  );
};
