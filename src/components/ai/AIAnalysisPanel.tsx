import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  RotateCw,
  Cpu,
  FileCheck2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { AIAnalysisResult, Parcel } from '../../types';

interface AIAnalysisPanelProps {
  parcel: Parcel;
  analysis: AIAnalysisResult | null;
  loading: boolean;
  onRunAnalysis: () => void;
  onGenerateReport: () => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  parcel,
  analysis,
  loading,
  onRunAnalysis,
  onGenerateReport,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Yapay Zekâ Destekli Tarımsal Çevre Analizi
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gemini 3.8 Flash • Uzaktan Algılama ve MRV Değerlendirme Motoru
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={onRunAnalysis}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
            loading
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analiz Ediliyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{analysis ? 'Analizi Yenile' : 'AI Analizini Başlat'}</span>
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <Sparkles className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-sm font-semibold text-slate-200">
            Spektral Göstergeler Gemini Modeline İletiliyor...
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Parsel #{parcel.id} için 6 aylık NDVI, NDWI ve toprak nemi zaman serisi eğilimleri değerlendiriliyor.
          </p>
        </div>
      )}

      {/* Empty State before first run */}
      {!loading && !analysis && (
        <div className="py-10 px-4 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
          <Cpu className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300">
            Parsel Göstergeleri Analize Hazır
          </h4>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1 leading-relaxed">
            Yukarıdaki <strong>"AI Analizini Başlat"</strong> düğmesine tıklayarak Gemini 3.8 Flash modelinin
            bu parseldeki su stresi, kanopi biyo-kütlesi ve sürdürülebilirlik eğilimlerini otomatik yorumlamasını sağlayabilirsiniz.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Spektral Zaman Serisi Hazır
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Yapılandırılmış Çıktı Şeması
            </span>
          </div>
        </div>
      )}

      {/* Render Analysis Results */}
      {!loading && analysis && (
        <div className="space-y-4 text-left">
          {/* Executive Status Banner */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Genel Durum Değerlendirmesi:
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono ${
                    analysis.overallStatus.toLowerCase().includes('yüksek')
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : analysis.overallStatus.toLowerCase().includes('orta')
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {analysis.overallStatus}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium">
                {analysis.summary}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block font-mono">
                {analysis.generatedAt || '08 Eyl 2026'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {analysis.modelUsed || 'Gemini 3.8 Flash'}
              </span>
            </div>
          </div>

          {/* Key Findings */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Temel Bulgular & Spektral Yorumlar</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {analysis.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Signals & Positive Signals in 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Risk Signals */}
            <div className="p-4 rounded-xl bg-rose-950/10 border border-rose-900/30">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Risk & Anomali Sinyalleri ({analysis.risks.length})</span>
              </div>
              {analysis.risks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Akut bir risk sinyali tespit edilmedi.</p>
              ) : (
                <div className="space-y-2">
                  {analysis.risks.map((risk, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-rose-900/40">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-rose-200">{risk.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${
                            risk.severity === 'high'
                              ? 'bg-rose-500/20 text-rose-300'
                              : risk.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {risk.severity === 'high' ? 'Yüksek' : risk.severity === 'medium' ? 'Orta' : 'Düşük'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {risk.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Positive Signals */}
            <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-900/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Olumlu Göstergeler</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {analysis.positiveSignals.map((pos, idx) => (
                  <li key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-emerald-900/30 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Actions & Verification Needed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Recommended Actions */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                <span>Önerilen Önleyici Eylemler</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold font-mono text-[11px]">{idx + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Field Verification Protocol */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Önerilen Saha Doğrulaması</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.verificationNeeded.map((verif, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold font-mono text-[11px]">{idx + 1}.</span>
                    <span>{verif}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Action to generate MRV Report */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Bu Analizle Kurumsal MRV Raporu Oluşturun</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Uydu verileri, zaman serileri ve yapay zekâ değerlendirmesini denetim formatına dönüştürün.
              </p>
            </div>
            <button
              onClick={onGenerateReport}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>MRV Raporunu Görüntüle</span>
            </button>
          </div>

          {/* Scientific Honesty Disclaimer */}
          <div className="text-[10px] text-slate-500 text-center leading-relaxed">
            TerraSat AI karar destek platformudur. Yapay zekâ analizleri uzaktan algılama ve meteorolojik göstergelere dayanır;
            kurumsal ESG / CSRD doğrulaması için saha numuneleri ve üretici beyanlarıyla desteklenmelidir.
          </div>
        </div>
      )}
    </div>
  );
};
