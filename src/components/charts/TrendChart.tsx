import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HistoricalObservation } from '../../types';

interface TrendChartProps {
  data: HistoricalObservation[];
  cropName: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, cropName }) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'ndvi' | 'ndwi' | 'moisture' | 'score'>('all');
  const [timeRange, setTimeRange] = useState<'30d' | '3m' | '6m' | '1y'>('6m');

  // Filter data according to timeRange
  const getFilteredData = () => {
    if (timeRange === '30d') {
      return data.slice(-2);
    }
    if (timeRange === '3m') {
      return data.slice(-3);
    }
    return data; // 6m / 1y full range for demo
  };

  const chartData = getFilteredData();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Tarihsel Spektral & Çevresel Eğilimler
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Sentinel-2 L2A
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Nisan – Eylül 2026 Gözlem Penceresi ({cropName})
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['30d', '3m', '6m', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                timeRange === r
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === '30d' ? '30 Gün' : r === '3m' ? '3 Ay' : r === '6m' ? '6 Ay' : '1 Yıl'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric filter chips */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveMetric('all')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeMetric === 'all'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Tüm Göstergeler
        </button>
        <button
          onClick={() => setActiveMetric('ndvi')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeMetric === 'ndvi'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          NDVI (Yeşillik)
        </button>
        <button
          onClick={() => setActiveMetric('ndwi')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeMetric === 'ndwi'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          NDWI (Su)
        </button>
        <button
          onClick={() => setActiveMetric('moisture')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeMetric === 'moisture'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Toprak Nemi (%)
        </button>
        <button
          onClick={() => setActiveMetric('score')}
          className={`px-2.5 py-1 rounded-lg font-medium transition ${
            activeMetric === 'score'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          Sürdürülebilirlik
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              domain={[0, 1]}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '11px',
                paddingTop: '8px',
              }}
            />

            {(activeMetric === 'all' || activeMetric === 'ndvi') && (
              <Line
                type="monotone"
                dataKey="ndvi"
                name="NDVI (Bitki Örtüsü)"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'ndwi') && (
              <Line
                type="monotone"
                dataKey="ndwi"
                name="NDWI (Su İndeksi)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 5 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'moisture') && (
              <Line
                type="monotone"
                dataKey={(v) => v.soilMoisture / 100}
                name="Toprak Nemi (Oran)"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#f59e0b' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'score') && (
              <Line
                type="monotone"
                dataKey={(v) => v.sustainabilityScore / 100}
                name="Sürdürülebilirlik Endeksi"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#14b8a6' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[10px] text-slate-500 text-center font-mono">
        * Sentinel-2 L2A 10m yansıma bantlarından (B4, B8, B11) hesaplanmış normalize endekslerdir.
      </div>
    </div>
  );
};
