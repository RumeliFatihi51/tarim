import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Activity, 
  HelpCircle,
  Clock,
  Compass,
  CornerDownLeft,
  RefreshCw,
  Droplets,
  Flame,
  Wheat
} from 'lucide-react';
import { Parcel, AIChatMessage, AIUIAction } from '../../types';

interface AICopilotViewProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel) => void;
  onOpenReport: (parcel: Parcel) => void;
  onStartAnalysis: () => void;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  onOpenReport,
  onStartAnalysis,
}) => {
  const activeParcel = selectedParcel || parcels[0];
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Merhaba! Ben TerraSat MRV Uzaktan Algılama Asistanıyım. Yalnızca tamamlanmış analizlerden getirilen kanıtları yorumlarım; ölçüm yoksa sonuç üretmem.`,
      timestamp: 'Şimdi',
      structured: {
        answer: `${activeParcel.name} parseli seçili. Güncel kanıtı görmek için kayıtlı analizi sorgulayın.`,
        evidence: [
          `Başlangıç mesajı ölçüm iddiası içermez.`,
        ],
        interpretation: 'Analiz sonucu bekleniyor.',
        confidence: 'Low',
        limitations: [
          '10m optik piksel boyutu taç küre ortalamasını temsil eder.',
          'Bulutlu günlerde Sentinel-2 optik gözlem yapılamaz.',
        ],
        recommendedAction: 'Sulama durumu veya anız yakma kontrolü yapmak için aşağıdaki hazır sorulardan birini seçebilirsiniz.',
      },
      actions: [
        { type: 'OPEN_PARCEL', parcelId: activeParcel.id, label: 'Parseli Haritada Göster' },
        { type: 'OPEN_MRV_REPORT', parcelId: activeParcel.id, label: 'MRV Raporunu İncele' },
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { text: 'Bu parselde sulama yeterli mi, su stresi var mı?', icon: Droplets },
    { text: 'Anız yakma veya yanık kalıntısı tespit edildi mi?', icon: Flame },
    { text: 'Şirket genelinde hangi parseller acil risk altında?', icon: AlertTriangle },
    { text: 'Bu parsel için son Sentinel-2 spektral özetini ver.', icon: Activity },
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          activeParcelId: activeParcel.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sunucu yanıtı: ${response.status}`);
      }

      const botMessage: AIChatMessage = await response.json();
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const fallbackMessage: AIChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `AI servisine erişilemedi. Kanıt olmadan yerel bir analiz sonucu üretilmedi.`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        structured: {
          answer: 'Service unavailable',
          evidence: [],
          interpretation: 'No inference was generated.',
          confidence: 'Low',
          limitations: [err instanceof Error ? err.message : 'AI service unavailable'],
          recommendedAction: 'Bağlantıyı kontrol edip tekrar deneyin.',
        },
        actions: [
          { type: 'OPEN_PARCEL', parcelId: activeParcel.id, label: 'Parseli Haritada İncele' },
        ],
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = (action: AIUIAction) => {
    if (action.type === 'OPEN_PARCEL' && action.parcelId) {
      const p = parcels.find((item) => item.id === action.parcelId);
      if (p) onSelectParcel(p);
    } else if (action.type === 'OPEN_MRV_REPORT') {
      const p = action.parcelId ? parcels.find((item) => item.id === action.parcelId) : activeParcel;
      if (p) onOpenReport(p);
    } else if (action.type === 'TRIGGER_ANALYSIS') {
      onStartAnalysis();
    }
  };

  return (
    <div className="flex h-full w-full flex-col lg:flex-row bg-[#080c14] overflow-hidden">
      {/* Left Context Column: Active Parcel Snapshot */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 sm:p-5 flex flex-col gap-4 bg-slate-900/40 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-wide uppercase">AI MRV Asistanı</h3>
            <p className="text-[10px] text-slate-400">Copernicus Sentinel-2 & Gemini</p>
          </div>
        </div>

        {/* Selected Parcel Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{activeParcel.number}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              activeParcel.status === 'healthy'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : activeParcel.status === 'moderate'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {activeParcel.status === 'healthy' ? 'Normal' : activeParcel.status === 'moderate' ? 'İzleme' : 'Yüksek Risk'}
            </span>
          </div>

          <h4 className="text-sm font-bold text-white line-clamp-1">{activeParcel.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{activeParcel.crop}</p>
          <p className="text-[11px] text-slate-500">{activeParcel.location} • {activeParcel.areaHa} ha</p>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 block">NDVI</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{activeParcel.ndvi.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 block">NDWI</span>
              <span className="text-xs font-mono font-bold text-blue-400">{activeParcel.ndwi.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 block">NDMI</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{typeof activeParcel.ndmi === 'number' && Number.isFinite(activeParcel.ndmi) ? activeParcel.ndmi.toFixed(2) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Parcel Selector Dropdown */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Sorgulanan Parseli Değiştir
          </label>
          <select
            value={activeParcel.id}
            onChange={(e) => {
              const target = parcels.find((p) => p.id === e.target.value);
              if (target) onSelectParcel(target);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          >
            {parcels.map((p) => (
              <option key={p.id} value={p.id}>
                {p.number} - {p.name} ({p.crop})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Suggestions */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">
            Örnek Uzman Soruları
          </span>
          <div className="flex flex-col gap-1.5">
            {suggestedQuestions.map((q, idx) => {
              const IconComp = q.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  disabled={loading}
                  className="text-left p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-2 group"
                >
                  <IconComp className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                  <span className="line-clamp-2 leading-tight">{q.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 sm:p-5 ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-lg shadow-emerald-950/40 text-xs sm:text-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-xl'
                }`}
              >
                {/* Main Message Text */}
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Structured Evidence Card for Assistant */}
                {msg.structured && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                    {/* Evidence Points */}
                    {msg.structured.evidence && msg.structured.evidence.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Doğrulayıcı Spektral Kanıtlar:
                        </span>
                        <ul className="space-y-1">
                          {msg.structured.evidence.map((ev, i) => (
                            <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interpretation */}
                    {msg.structured.interpretation && (
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                          Agronomik Değerlendirme:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {msg.structured.interpretation}
                        </p>
                      </div>
                    )}

                    {/* Limitations & Uncertainty */}
                    {msg.structured.limitations && msg.structured.limitations.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Uzaktan Algılama Belirsizlik & Sınırları:
                        </span>
                        <ul className="space-y-0.5">
                          {msg.structured.limitations.map((lim, i) => (
                            <li key={i} className="text-[11px] text-slate-400">
                              • {lim}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Action */}
                    {msg.structured.recommendedAction && (
                      <div className="text-xs font-medium text-emerald-300 pt-1">
                        <span className="text-[10px] text-slate-500 block uppercase">Önerilen Saha Adımı:</span>
                        {msg.structured.recommendedAction}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap gap-2">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleExecuteAction(act)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Compass className="w-3 h-3" />
                        {act.label || 'Görüntüle'}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-500 block text-right mt-2">{msg.timestamp}</span>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto justify-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Sentinel-2 spektral verileri ve agronomik modeller sorgulanıyor...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Parsel su stresi, anız riski, uydu spektrumu veya MRV hakkında bir soru sorun..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Gönder</span>
            </button>
          </form>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            Copernicus Sentinel-2 Level-2A BOA yüzey yansımaları ve Gemini 2.5 Flash ile desteklenmektedir.
          </p>
        </div>
      </div>
    </div>
  );
};
