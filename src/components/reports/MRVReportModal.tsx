import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  Calendar, 
  Satellite, 
  Sparkles, 
  AlertTriangle,
  Award,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { Parcel, AIAnalysisResult } from '../../types';

interface MRVReportModalProps {
  parcel: Parcel;
  analysis: AIAnalysisResult | null;
  onClose: () => void;
}

export const MRVReportModal: React.FC<MRVReportModalProps> = ({
  parcel,
  analysis,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const reportId = `TS-MRV-2026-${parcel.id}-001`;
  const reportDate = '08 Eylül 2026';
  const period = 'Nisan – Eylül 2026 (6 Aylık İzleme Döngüsü)';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0d131f] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-200">
        {/* Top Control Bar (Non-printed toolbar) */}
        <div className="print:hidden px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-mono text-emerald-400 font-bold">{reportId}</span>
            <span>•</span>
            <span>Kurumsal MRV Doğrulama Çıktısı</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Bağlantıyı Kopyala'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-2"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official MRV Document Body */}
        <div className="p-6 sm:p-10 space-y-8 bg-[#0b0f17]">
          {/* Document Header */}
          <div className="border-b-2 border-slate-700 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                  <Satellite className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                    TerraSat AI
                  </h1>
                  <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">
                    Corporate MRV & Sustainability Intelligence
                  </p>
                </div>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-3">
                Tarımsal Sürdürülebilirlik & Çevresel İzleme Raporu
              </h2>
              <p className="text-xs text-slate-400">
                Uzaktan Algılama Kanıt Zinciri ve Tedarikçi Sürdürülebilirlik Değerlendirmesi
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 sm:text-right shrink-0">
              <div>
                <span className="text-slate-400">Rapor No: </span>
                <span className="font-mono font-bold text-emerald-400">{reportId}</span>
              </div>
              <div>
                <span className="text-slate-400">Rapor Tarihi: </span>
                <span className="text-slate-200">{reportDate}</span>
              </div>
              <div>
                <span className="text-slate-400">İzleme Periyodu: </span>
                <span className="text-slate-200">{period}</span>
              </div>
              <div>
                <span className="text-slate-400">Metodoloji: </span>
                <span className="font-mono text-cyan-400">TS-MRV-v2.4 / Sentinel-2</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>1. Yönetici Özeti (Executive Summary)</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {analysis?.summary || (
                <span>
                  Bu rapor, Menemen / Gediz Havzası'nda kayıtlı <strong>{parcel.number} ({parcel.name})</strong> sanayi tipi domates
                  üretim parselinin 6 aylık Sentinel-2 uzaktan algılama zaman serisini analiz etmektedir.
                  Parselin ortalama sürdürülebilirlik skoru <strong>{parcel.sustainabilityScore}/100</strong> seviyesinde olup,
                  kanopi vejetasyon gelişimi genel olarak sağlıklı; ancak Ağustos-Eylül döneminde NDWI su indeksinde hafif gerileme
                  ve yüzey toprak neminde düşüş gözlenmiştir. Saha kontrolü ve sulama programı teyidi tavsiye edilir.
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Parcel & Contract Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>2. Parsel & Tedarik Sözleşmesi Künyesi</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Parsel Kodu</span>
                <span className="font-bold font-mono text-slate-100">{parcel.number}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Ürün Türü</span>
                <span className="font-bold text-slate-100">{parcel.crop}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Yüzölçümü</span>
                <span className="font-bold font-mono text-slate-100">{parcel.areaHa} Hektar</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Konum</span>
                <span className="font-bold text-slate-100 truncate block">{parcel.location}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Üretici / Ortak</span>
                <span className="font-bold text-slate-100 truncate block">{parcel.farmerName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Sözleşme ID</span>
                <span className="font-bold font-mono text-slate-100">{parcel.contractId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Koordinat Merkezi</span>
                <span className="font-bold font-mono text-slate-100 text-[11px]">38.6042N, 27.0583E</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Durum Değerlendirmesi</span>
                <span className="font-bold text-amber-400">İzleme Altında (Orta)</span>
              </div>
            </div>
          </div>

          {/* Section 3: Remote Sensing Indicators Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>3. Uzaktan Algılama Çevresel Göstergeler Matrisi</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="p-3">Gösterge</th>
                    <th className="p-3">Spektral Kaynak</th>
                    <th className="p-3">Gözlem Değeri</th>
                    <th className="p-3">Referans Aralık</th>
                    <th className="p-3">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-emerald-400">NDVI (Bitki Sağlığı)</td>
                    <td className="p-3 font-mono text-slate-400">Sentinel-2 (B8 - B4) / (B8 + B4)</td>
                    <td className="p-3 font-mono font-bold text-white">{parcel.ndvi}</td>
                    <td className="p-3 text-slate-400">0.65 – 0.85</td>
                    <td className="p-3"><span className="text-emerald-400 font-medium">Uyumlu</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-cyan-400">NDWI (Bitki Su İndeksi)</td>
                    <td className="p-3 font-mono text-slate-400">Sentinel-2 (B8 - B11) / (B8 + B11)</td>
                    <td className="p-3 font-mono font-bold text-white">{parcel.ndwi}</td>
                    <td className="p-3 text-slate-400">0.50 – 0.70</td>
                    <td className="p-3"><span className="text-amber-400 font-medium">Hafif Düşük</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-amber-400">Toprak Nemi (Yüzey)</td>
                    <td className="p-3 font-mono text-slate-400">S2 Bant Oranlama & ERA5-Land</td>
                    <td className="p-3 font-mono font-bold text-white">%{parcel.soilMoisture}</td>
                    <td className="p-3 text-slate-400">%40 – %65</td>
                    <td className="p-3"><span className="text-amber-400 font-medium">Orta Düzey</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-rose-400">Su Stresi İndikatörü</td>
                    <td className="p-3 font-mono text-slate-400">Evapotranspirasyon Oranlaması</td>
                    <td className="p-3 font-mono font-bold text-white">{parcel.waterStress}</td>
                    <td className="p-3 text-slate-400">Düşük</td>
                    <td className="p-3"><span className="text-amber-400 font-medium">İzleme Gerekli</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-teal-400">Karbon Tutum Göstergesi</td>
                    <td className="p-3 font-mono text-slate-400">Model-Türetilmiş Biyo-Kütle</td>
                    <td className="p-3 font-mono font-bold text-white">{parcel.carbonIndicator}</td>
                    <td className="p-3 text-slate-400">Pozitif / Stabil</td>
                    <td className="p-3"><span className="text-emerald-400 font-medium">Pozitif Eğilim</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Composite Sustainability Scoring */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>4. Bileşik Sürdürülebilirlik Değerlendirmesi</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Vejetasyon</div>
                <div className="text-lg font-bold font-mono text-emerald-400">{parcel.scoreBreakdown.vegetation}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Su Verimliliği</div>
                <div className="text-lg font-bold font-mono text-cyan-400">{parcel.scoreBreakdown.water}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Toprak Sağlığı</div>
                <div className="text-lg font-bold font-mono text-amber-400">{parcel.scoreBreakdown.soil}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Karbon Eğilimi</div>
                <div className="text-lg font-bold font-mono text-teal-400">{parcel.scoreBreakdown.carbon}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Yönetim / İzleme</div>
                <div className="text-lg font-bold font-mono text-slate-200">{parcel.scoreBreakdown.management}</div>
              </div>
            </div>
          </div>

          {/* Section 5: AI Interpretation & Field Verification Protocol */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>5. Yapay Zekâ Analiz Bulguları & Saha Doğrulama Önerileri</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-200 block mb-1">Tespit Edilen Risk Faktörleri:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                  <li>NDWI değerinin 0.58'den 0.48'e gerilemesi sulama etkinliğinde kısmi daralmaya işaret etmektedir.</li>
                  <li>Yüzey toprak nemi %42 seviyesinde olup Gediz Ovası mevsimsel ortalamasının 4 puan altındadır.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">Gerekli Saha Doğrulama Protokolü:</span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1">
                  <li>Yerinde yaprak su potansiyeli veya el tipi nem ölçer ile kök bölgesi teyidi.</li>
                  <li>Üretici damlama sulama debi kayıtlarının tedarik zinciri sistemine işlenmesi.</li>
                  <li>Bir sonraki Sentinel-2 geçişinde (13 Eylül 2026) spektral trendin yeniden taranması.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 6: Scientific Honesty & Methodology Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bilimsel Dürüstlük & Metodoloji Beyanı (Scientific Transparency)</span>
            </div>
            <p>
              TerraSat AI bir kurumsal konsept demonstratörüdür. Bu raporda sunulan veriler Sentinel-2 optik yansıma
              bantları üzerinden modellenmiş örnek verilerdir. Üretim versiyonunda doğrulanmış uydu, meteorolojik (ERA5-Land)
              ve yerinde toprak sensörü verileriyle kalibre edilmiş ISO 14064 / GHG Protocol MRV yönergeleri kullanılmalıdır.
            </p>
          </div>

          {/* Signatures / Approval Line */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span>Sistem Onayı: </span>
              <span className="text-slate-300 font-mono">TERRASAT-CORE-AUTOMATION-V2</span>
            </div>
            <div>
              <span>Doğrulama Durumu: </span>
              <span className="text-emerald-400 font-semibold">Ön MRV Kanıtı Onaylandı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
