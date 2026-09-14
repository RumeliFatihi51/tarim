import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  Flame, 
  Wheat, 
  ShieldCheck, 
  Download, 
  Plus, 
  Filter, 
  FileText, 
  Layers, 
  Sun, 
  CloudRain, 
  Wind, 
  ArrowRight,
  ExternalLink,
  MapPin,
  Sparkles,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Parcel, PracticeSignal, FieldVerificationTask, WeatherData } from '../../types';

interface PracticesViewProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
  onOpenReport: (parcel: Parcel) => void;
}

export const PracticesView: React.FC<PracticesViewProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  onOpenReport,
}) => {
  const activeParcel = selectedParcel || parcels[0];
  const [tasks, setTasks] = useState<FieldVerificationTask[]>([]);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [practiceSignals, setPracticeSignals] = useState<PracticeSignal[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskPhotos, setTaskPhotos] = useState<Record<string, string>>({});

  const handleCapturePhoto = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setTaskPhotos((prev) => ({ ...prev, [taskId]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    // Fetch live weather and practice data for active parcel
    fetch(`/api/weather/${activeParcel.id}`)
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch(() => setWeatherData(null));

    fetch(`/api/practices/${activeParcel.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.signals) setPracticeSignals(data.signals);
        if (data.tasks && data.tasks.length > 0) {
          setTasks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newOnes = data.tasks.filter((t: FieldVerificationTask) => !existingIds.has(t.id));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch(() => setPracticeSignals([]));
  }, [activeParcel.id]);

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? 'Bugün' : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: FieldVerificationTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: 'audit',
      description: 'Saha denetmeni tarafından oluşturulan yerinde doğrulama görevi.',
      priority: 'medium',
      status: 'pending',
      assignedTo: 'Saha Denetim Ekibi',
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return t.status !== 'completed';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="flex-1 h-full w-full overflow-y-auto bg-[#080c14] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Tarımsal Pratikler & MRV Saha Doğrulama
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Copernicus Sentinel-2 spektral sinyalleri ile tarımsal yönetim pratiklerinin (sulama, anız yakma, toprak işleme) otomatik doğrulanması.
            </p>
          </div>

          {/* Quick Parcel Switcher */}
          <div className="flex items-center gap-3">
            <select
              value={activeParcel.id}
              onChange={(e) => {
                const target = parcels.find((p) => p.id === e.target.value);
                if (target) onSelectParcel(target);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            >
              {parcels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number} - {p.name}
                </option>
              ))}
            </select>

            {/* Export Buttons */}
            <a
              href={`/api/export/geojson/${activeParcel.id}`}
              download
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>GeoJSON</span>
            </a>
            <a
              href={`/api/export/csv/${activeParcel.id}`}
              download
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Zaman Serisi CSV</span>
            </a>
          </div>
        </div>

        {/* Top Weather & Environmental Grid */}
        {weatherData && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Agrometeorolojik & Kuraklık Göstergeleri ({activeParcel.name})
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Kaynak: {weatherData.dataSource}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Sıcaklık (Ort)</span>
                <span className="text-base font-extrabold text-white font-mono mt-0.5 block">
                  {weatherData.temperatureC}°C
                </span>
                <span className="text-[10px] text-slate-500">Min: {weatherData.tempMinC}°C Max: {weatherData.tempMaxC}°C</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Referans ET0</span>
                <span className="text-base font-extrabold text-amber-400 font-mono mt-0.5 block">
                  {weatherData.et0MmPerDay} mm/gün
                </span>
                <span className="text-[10px] text-slate-500">Buharlaşma-Terleme</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Yağış Anomalisi</span>
                <span className="text-base font-extrabold text-rose-400 font-mono mt-0.5 block">
                  %{weatherData.rainfallAnomalyPercent}
                </span>
                <span className="text-[10px] text-rose-500/80">Şiddetli yaz açığı</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Bağıl Nem</span>
                <span className="text-base font-extrabold text-blue-400 font-mono mt-0.5 block">
                  %{weatherData.relativeHumidityPercent}
                </span>
                <span className="text-[10px] text-slate-500">Rüzgar: {weatherData.windSpeedKmh} km/s</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Toprak Yüzey Sıcaklığı</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">
                  {weatherData.soilTemperatureC}°C
                </span>
                <span className="text-[10px] text-slate-500">Termal zemin dengesi</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Kuraklık Sınıfı</span>
                <span className="text-xs font-bold text-amber-400 mt-1 block">
                  {weatherData.droughtStressCategory}
                </span>
                <span className="text-[10px] text-slate-500">SPEI Index Uyumlu</span>
              </div>
            </div>
          </div>
        )}

        {/* Agricultural Practices Signal Cards */}
        <div>
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">
            Otomatik Spektral Pratik Doğrulama Sinyalleri
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {practiceSignals.map((signal, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      %{signal.confidence} Doğruluk
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {signal.detectedStatus}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2">{signal.practiceName}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {signal.spectralEvidence}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">
                    MRV Denetim Etkisi:
                  </span>
                  <p className="text-xs text-slate-300">{signal.mrvAuditImpact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Verification Task Tracker */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Saha Doğrulama & Denetim Görevleri (Ground-Truthing)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Uydu anomalilerini yerinde doğrulamak üzere saha ziraat mühendislerine atanan görevler.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  taskFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü ({tasks.length})
              </button>
              <button
                onClick={() => setTaskFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  taskFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bekleyenler ({tasks.filter((t) => t.status !== 'completed').length})
              </button>
              <button
                onClick={() => setTaskFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  taskFilter === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tamamlananlar ({tasks.filter((t) => t.status === 'completed').length})
              </button>
            </div>
          </div>

          {/* New Task Input */}
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Yeni saha denetim görevi ekleyin (örn: Batı sınırında lateraller kontrol edilecek)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Görev Ekle</span>
            </button>
          </form>

          {/* Task List */}
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  task.status === 'completed'
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 hover:border-emerald-500 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                    {task.notes && (
                      <p className="text-[11px] text-emerald-400/90 font-medium mt-1">
                        Not: {task.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-500">Atanan: {task.assignedTo || 'Atanmadı'}</span>
                      {task.completedAt && (
                        <span className="text-[10px] text-emerald-400">• Tamamlandı: {task.completedAt}</span>
                      )}
                    </div>

                    {/* Mobile Camera Evidence & Photo Attachment */}
                    <div className="mt-3 flex items-center gap-3">
                      {taskPhotos[task.id] && (
                        <div className="relative group">
                          <img
                            src={taskPhotos[task.id]}
                            alt="Saha Doğrulama Kanıtı"
                            className="w-14 h-14 rounded-lg object-cover border border-emerald-500/40 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-emerald-300 text-center font-bold py-0.5 rounded-b-lg">
                            GPS Kanıtı
                          </span>
                        </div>
                      )}

                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-semibold border border-slate-700 active:scale-95 transition">
                        <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{taskPhotos[task.id] ? 'Yeni Fotoğraf Çek' : 'Kamera ile Fotoğraf Ekle'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleCapturePhoto(task.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.priority === 'high' ? 'Yüksek Öncelik' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
