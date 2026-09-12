import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Parcel, RiskStatus } from '../../types';
import { 
  Layers, 
  RotateCcw, 
  Maximize2, 
  Eye, 
  MapPin, 
  Info,
  Droplets,
  Activity,
  ShieldAlert
} from 'lucide-react';

interface ParcelMapProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
  className?: string;
}

type MapLayerMode = 'status' | 'ndvi' | 'waterStress';

export const ParcelMap: React.FC<ParcelMapProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<{ [id: string]: L.Polygon }>({});
  const [layerMode, setLayerMode] = useState<MapLayerMode>('status');
  const [basemap, setBasemap] = useState<'satellite' | 'dark'>('satellite');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const MENEMEN_CENTER: [number, number] = [38.6042, 27.0583];
  const DEFAULT_ZOOM = 13;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: MENEMEN_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    // Add satellite tile layer (Esri World Imagery)
    const satelliteTiles = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: 'Esri, Maxar, Earthstar Geographics',
      }
    );

    satelliteTiles.addTo(map);
    tileLayerRef.current = satelliteTiles;
    mapInstanceRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle basemap toggle (satellite vs dark)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    if (basemap === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Esri, Maxar',
        }
      );
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          attribution: 'CartoDB',
        }
      );
    }

    tileLayerRef.current.addTo(mapInstanceRef.current);
  }, [basemap]);

  // Color generator based on active layer mode
  const getParcelStyle = (parcel: Parcel, isSelected: boolean) => {
    let fillColor = '#10b981';
    let borderColor = '#34d399';

    if (layerMode === 'status') {
      if (parcel.status === 'healthy') {
        fillColor = '#10b981'; // Emerald
        borderColor = '#34d399';
      } else if (parcel.status === 'moderate') {
        fillColor = '#f59e0b'; // Amber
        borderColor = '#fbbf24';
      } else {
        fillColor = '#f43f5e'; // Rose
        borderColor = '#fb7185';
      }
    } else if (layerMode === 'ndvi') {
      // NDVI gradient: 0.5 (light green-yellow) to 0.85 (deep emerald)
      if (parcel.ndvi >= 0.8) {
        fillColor = '#059669';
        borderColor = '#10b981';
      } else if (parcel.ndvi >= 0.7) {
        fillColor = '#10b981';
        borderColor = '#6ee7b7';
      } else if (parcel.ndvi >= 0.6) {
        fillColor = '#84cc16';
        borderColor = '#a3e635';
      } else {
        fillColor = '#eab308';
        borderColor = '#facc15';
      }
    } else if (layerMode === 'waterStress') {
      if (parcel.waterStress === 'Low') {
        fillColor = '#06b6d4'; // Cyan (well watered)
        borderColor = '#22d3ee';
      } else if (parcel.waterStress === 'Medium') {
        fillColor = '#f59e0b'; // Amber
        borderColor = '#fbbf24';
      } else {
        fillColor = '#ef4444'; // Red (severe stress)
        borderColor = '#f87171';
      }
    }

    return {
      fillColor,
      fillOpacity: isSelected ? 0.65 : 0.4,
      color: isSelected ? '#ffffff' : borderColor,
      weight: isSelected ? 3.5 : 2,
      dashArray: isSelected ? '' : undefined,
    };
  };

  // Render & update polygon overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous polygons
    Object.values(polygonLayersRef.current).forEach((layer) => {
      map.removeLayer(layer);
    });
    polygonLayersRef.current = {};

    // Render new polygons
    parcels.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;
      const style = getParcelStyle(parcel, isSelected);

      const polygon = L.polygon(parcel.polygon, style);

      // Tooltip HTML
      const tooltipContent = `
        <div style="font-family: inherit; font-size: 11px; padding: 4px; line-height: 1.4; color: #f1f5f9;">
          <div style="font-weight: 700; color: #34d399; font-size: 12px; margin-bottom: 2px;">
            ${parcel.number} • ${parcel.name}
          </div>
          <div style="color: #cbd5e1;"><strong>Ürün:</strong> ${parcel.crop} (${parcel.areaHa} ha)</div>
          <div style="color: #cbd5e1;"><strong>Sürdürülebilirlik:</strong> ${parcel.sustainabilityScore}/100</div>
          <div style="color: #94a3b8; font-size: 10px; margin-top: 3px;">
            NDVI: ${parcel.ndvi} | Su Stresi: ${parcel.waterStress}
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, {
        className: 'custom-leaflet-tooltip',
        direction: 'top',
        offset: [0, -10],
        sticky: true,
      });

      polygon.on('click', () => {
        onSelectParcel(parcel);
      });

      polygon.addTo(map);
      polygonLayersRef.current[parcel.id] = polygon;
    });
  }, [parcels, selectedParcel, layerMode]);

  // Center on selected parcel
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedParcel) return;

    const layer = polygonLayersRef.current[selectedParcel.id];
    if (layer) {
      map.panTo(layer.getBounds().getCenter(), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedParcel]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(MENEMEN_CENTER, DEFAULT_ZOOM, {
        animate: true,
      });
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-xl ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Map Mode & Layer Switcher */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg">
          <button
            onClick={() => setLayerMode('status')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              layerMode === 'status'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Durumu</span>
          </button>
          <button
            onClick={() => setLayerMode('ndvi')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              layerMode === 'ndvi'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>NDVI Spektrumu</span>
          </button>
          <button
            onClick={() => setLayerMode('waterStress')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              layerMode === 'waterStress'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Su Stresi / NDWI</span>
          </button>
        </div>

        {/* Basemap Switcher */}
        <button
          onClick={() => setBasemap(basemap === 'satellite' ? 'dark' : 'satellite')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-lg"
          title="Altlık Haritayı Değiştir"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{basemap === 'satellite' ? 'Optik Uydu' : 'Vektör Koyu'}</span>
        </button>
      </div>

      {/* Top Right: Custom Zoom & Center Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <div className="flex flex-col bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold transition flex items-center justify-center border-b border-slate-800"
            aria-label="Yakınlaştır"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold transition flex items-center justify-center"
            aria-label="Uzaklaştır"
          >
            −
          </button>
        </div>

        <button
          onClick={handleResetView}
          className="p-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-lg flex items-center justify-center"
          title="Menemen Havzasına Odaklan"
          aria-label="Görünümü Sıfırla"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left: Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs shadow-xl max-w-xs">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>
            {layerMode === 'status'
              ? 'Risk Durumu Lejandı'
              : layerMode === 'ndvi'
              ? 'NDVI Biyo-kütle Skalası'
              : 'Su Kısıtı Seviyesi'}
          </span>
          <span className="text-emerald-400 font-mono">Sentinel-2</span>
        </div>

        {layerMode === 'status' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span className="text-slate-300 text-[11px]">Sağlıklı</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
              <span className="text-slate-300 text-[11px]">Orta Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
              <span className="text-slate-300 text-[11px]">Yüksek Risk</span>
            </div>
          </div>
        )}

        {layerMode === 'ndvi' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">0.50</span>
            <div className="w-28 h-2 rounded bg-gradient-to-r from-yellow-500 via-lime-500 to-emerald-600"></div>
            <span className="text-[10px] text-emerald-400 font-semibold">0.85+</span>
          </div>
        )}

        {layerMode === 'waterStress' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300 text-[11px]">Düşük</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-slate-300 text-[11px]">Orta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-slate-300 text-[11px]">Yüksek</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right: Location metadata */}
      <div className="absolute bottom-3 right-3 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur border border-slate-800/80 rounded-lg text-[10px] font-mono text-slate-400">
        <MapPin className="w-3 h-3 text-emerald-400" />
        <span>38°36'15" K, 27°03'30" D • Menemen / Gediz</span>
      </div>
    </div>
  );
};
