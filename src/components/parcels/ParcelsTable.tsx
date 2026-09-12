import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { Parcel, RiskStatus, WaterStressLevel } from '../../types';

interface ParcelsTableProps {
  parcels: Parcel[];
  onSelectParcel: (parcel: Parcel) => void;
  onGenerateReport: (parcel: Parcel) => void;
}

export const ParcelsTable: React.FC<ParcelsTableProps> = ({
  parcels,
  onSelectParcel,
  onGenerateReport,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStress, setSelectedStress] = useState<string>('all');

  // Extract unique crops
  const crops = ['all', ...Array.from(new Set(parcels.map((p) => p.crop)))];

  // Filter parcels
  const filtered = parcels.filter((p) => {
    const matchSearch =
      p.number.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.crop.toLowerCase().includes(search.toLowerCase());

    const matchCrop = selectedCrop === 'all' || p.crop === selectedCrop;
    const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchStress = selectedStress === 'all' || p.waterStress === selectedStress;

    return matchSearch && matchCrop && matchStatus && matchStress;
  });

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Parsel no, ürün veya konum ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Crop Filter */}
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tüm Ürünler ({parcels.length})</option>
            {crops.filter((c) => c !== 'all').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="healthy">Sağlıklı</option>
            <option value="moderate">Orta Düzey Risk</option>
            <option value="high-risk">Yüksek Risk</option>
          </select>

          {/* Water Stress Filter */}
          <select
            value={selectedStress}
            onChange={(e) => setSelectedStress(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tüm Su Stresi</option>
            <option value="Low">Düşük Stres</option>
            <option value="Medium">Orta Stres</option>
            <option value="High">Yüksek Stres</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Parsel No</th>
                <th className="p-4">İsim & Konum</th>
                <th className="p-4">Ürün</th>
                <th className="p-4">Alan (ha)</th>
                <th className="p-4">Durum</th>
                <th className="p-4">NDVI</th>
                <th className="p-4">NDWI</th>
                <th className="p-4">Toprak Nemi</th>
                <th className="p-4">Su Stresi</th>
                <th className="p-4">Sürdürülebilirlik</th>
                <th className="p-4 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400">
                    Filtre kriterlerinize uygun parsel bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((parcel) => (
                  <tr
                    key={parcel.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectParcel(parcel)}
                  >
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {parcel.number}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white group-hover:text-emerald-300 transition">
                        {parcel.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{parcel.location}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-200">{parcel.crop}</td>
                    <td className="p-4 font-mono">{parcel.areaHa} ha</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          parcel.status === 'healthy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : parcel.status === 'moderate'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {parcel.status === 'healthy' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : parcel.status === 'moderate' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>
                          {parcel.status === 'healthy' ? 'Sağlıklı' : parcel.status === 'moderate' ? 'Orta Risk' : 'Yüksek Risk'}
                        </span>
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {parcel.ndvi}
                    </td>
                    <td className="p-4 font-mono text-cyan-400">
                      {parcel.ndwi}
                    </td>
                    <td className="p-4 font-mono text-amber-400">
                      %{parcel.soilMoisture}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold ${
                          parcel.waterStress === 'Low'
                            ? 'text-emerald-400'
                            : parcel.waterStress === 'Medium'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {parcel.waterStress === 'Low' ? 'Düşük' : parcel.waterStress === 'Medium' ? 'Orta' : 'Yüksek'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-extrabold text-white">
                      {parcel.sustainabilityScore} / 100
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectParcel(parcel)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          title="Detay Görüntüle"
                        >
                          İncele
                        </button>
                        <button
                          onClick={() => onGenerateReport(parcel)}
                          className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 transition"
                          title="MRV Raporu"
                        >
                          <FileCheck2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{filtered.length} parsel listelendi (Toplam 1,284 tedarikçi parseli tescilli)</span>
          <span>Sentinel-2 L2A Gözlem Döngüsü</span>
        </div>
      </div>
    </div>
  );
};
