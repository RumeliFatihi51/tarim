import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Parcel, RiskStatus } from '../../types';
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
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<{ [id: string]: L.Polygon }>({});
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
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

    return () => {
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
        { maxZoom: 19, attribution: 'CartoDB' }
      );
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: 'OSM' }
      );
    }

    tileLayerRef.current.addTo(mapInstanceRef.current);
  }, [basemap]);

  // Click handler on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      if (isDrawingMode) {
        // Add vertex to custom polygon
        setDrawnPoints((prev) => [...prev, [lat, lng]]);
      } else {
        // If not drawing, clicking empty space creates an area selection box around the click
        const delta = 0.0035; // ~3.5 ha
        const customPolygon: [number, number][] = [
          [lat - delta, lng - delta],
          [lat + delta, lng - delta * 0.8],
          [lat + delta * 0.9, lng + delta],
          [lat - delta * 0.7, lng + delta],
        ];

        const customParcel: Parcel = {
          id: `custom-${Date.now().toString().slice(-4)}`,
          number: `#SEC-${lat.toFixed(2)}`,
          name: `Seçilen Tarım Alanı (${lat.toFixed(3)}°K, ${lng.toFixed(3)}°D)`,
          location: 'Menemen / İzmir Bölgesi',
          crop: 'Zeytinlik / Karışık Dikili Tarım',
          areaHa: 4.2,
          status: 'moderate',
          sustainabilityScore: 78,
          scoreBreakdown: { vegetation: 80, water: 72, soil: 76, carbon: 82, management: 74 },
          ndvi: 0.69,
          ndwi: 0.24,
          soilMoisture: 40,
          waterStress: 'Medium',
          plantHealth: 'Good',
          carbonIndicator: 'Positive',
          lastObservation: '08 Eylül 2026',
          polygon: customPolygon,
          historicalData: [
            { date: '15 Nis', ndvi: 0.65, ndwi: 0.38, soilMoisture: 54, sustainabilityScore: 78 },
            { date: '15 May', ndvi: 0.72, ndwi: 0.34, soilMoisture: 49, sustainabilityScore: 81 },
            { date: '15 Haz', ndvi: 0.74, ndwi: 0.30, soilMoisture: 45, sustainabilityScore: 82 },
            { date: '15 Tem', ndvi: 0.71, ndwi: 0.27, soilMoisture: 42, sustainabilityScore: 80 },
            { date: '15 Ağu', ndvi: 0.69, ndwi: 0.25, soilMoisture: 40, sustainabilityScore: 79 },
            { date: '08 Eyl', ndvi: 0.69, ndwi: 0.24, soilMoisture: 40, sustainabilityScore: 78 },
          ],
        };

        onSelectParcel(customParcel);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode, onSelectParcel]);

  // Render drawing preview
  useEffect(() => {
    const group = drawingLayerRef.current;
    if (!group) return;

    group.clearLayers();

    if (drawnPoints.length > 0) {
      // Draw markers for vertices
      drawnPoints.forEach((pt, index) => {
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
        // Draw polyline
        const polyline = L.polyline(drawnPoints, {
          color: '#34d399',
          weight: 3,
          dashArray: '5, 5',
        });
        polyline.addTo(group);
      }

      if (drawnPoints.length > 2) {
        // Draw filled polygon preview
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

  // Style calculator for parcels based on layerMode
  const getParcelStyle = (parcel: Parcel, isSelected: boolean) => {
    let fillColor = '#10b981';
    let borderColor = '#34d399';
    let fillOpacity = isSelected ? 0.65 : 0.38;

    if (layerMode === 'satellite') {
      // Clean boundary highlight over original satellite imagery
      fillColor = isSelected ? '#10b981' : '#059669';
      borderColor = isSelected ? '#ffffff' : '#34d399';
      fillOpacity = isSelected ? 0.45 : 0.22;
    } else if (layerMode === 'ndvi') {
      // False color vegetation vigor: yellow -> lime -> deep emerald
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
      // Canopy water content (cyan/blue)
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
      // Water stress indicator
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
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
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
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
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
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Su Stresi</span>
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
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#eab308]"></span> &lt;0.55</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]"></span> 0.55-0.65</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]"></span> 0.65-0.75</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#059669]"></span> &gt;0.75</span>
          </div>
        )}

        {layerMode === 'ndwi' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">NDWI:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span> &lt;0.30 (Kuru)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]"></span> 0.30-0.45 (Orta)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#0284c7]"></span> &gt;0.45 (Optimal)</span>
          </div>
        )}

        {layerMode === 'moisture' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Su Stresi:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]"></span> Yüksek</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span> Orta</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4]"></span> Düşük</span>
          </div>
        )}

        {layerMode === 'satellite' && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Sentinel-2 L2A BOA Yansıma Katmanı (10m Çözünürlük)</span>
          </div>
        )}
      </div>
    </div>
  );
};
