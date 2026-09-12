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
  Check,
  Activity,
  Droplets,
  ClipboardCheck,
  HelpCircle
} from 'lucide-react';
import { Parcel, AIAnalysisResult, FullAnalysisPayload } from '../../types';

interface MRVReportModalProps {
  parcel: Parcel;
  analysis: AIAnalysisResult | null;
  fullPayload?: FullAnalysisPayload | null;
  onClose: () => void;
}

export const MRVReportModal: React.FC<MRVReportModalProps> = ({
  parcel,
  analysis,
  fullPayload,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const reportId = `TS-MRV-2026-${parcel.id || 'EMR-01'}-001`;
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

  const centerLat = parcel.polygon && parcel.polygon[0] ? parcel.polygon[0][0].toFixed(4) : '38.6420';
  const centerLng = parcel.polygon && parcel.polygon[0] ? parcel.polygon[0][1].toFixed(4) : '27.1180';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-200">
        {/* Top Control Bar (Hidden on print) */}
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
          {/* Official Document Cover & Header */}
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
                    Corporate MRV & Agricultural Environmental Intelligence
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-300">
                Tarımsal Çevresel İzleme ve MRV Denetim Raporu
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-1 text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div><strong className="text-slate-200">Rapor No:</strong> {reportId}</div>
              <div><strong className="text-slate-200">Tarih:</strong> {reportDate}</div>
              <div><strong className="text-slate-200">İzleme Periyodu:</strong> {period}</div>
              <div><strong className="text-slate-200">Sensör:</strong> Copernicus Sentinel-2B L2A</div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>01.</span>
              <span>Yönetici Özeti (Executive Summary)</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-200">
              {analysis?.summary || (
                `${parcel.name} (#${parcel.number || parcel.id}) parseli için 08 Eylül 2026 tarihli Sentinel-2B L2A optik yansıma analizi tamamlanmıştır. Bitki örtüsü NDVI seviyesi ${parcel.ndvi} ile genel vejetasyon biyokütlesini korumaktadır; ancak NDWI (${parcel.ndwi}) su indeksinde gözlenen gerileme kök bölgesinde hidrik kısıt riskine işaret etmektedir. Fiziksel saha kontrolü ve sulama teyidi önerilmektedir.`
              )}
            </div>
          </div>

          {/* Section 2: Parcel Information & Geometry */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>02.</span>
              <span>Parsel Künyesi & Coğrafi Geometri (Parcel Information)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Parsel No & Adı</span>
                <span className="font-bold text-white mt-0.5 block">{parcel.number || '#EMR-01'} {parcel.name}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Konum & Koordinat</span>
                <span className="font-bold text-slate-200 mt-0.5 block">{centerLat}°K, {centerLng}°D</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Tescilli Ürün</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">{parcel.crop}</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Alan Büyüklüğü</span>
                <span className="font-bold text-white mt-0.5 block">{parcel.areaHa} Hektar</span>
              </div>
            </div>
          </div>

          {/* Section 3: Data Sources & Methodology */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>03.</span>
              <span>Veri Kaynakları & Metodoloji (Data Sources & Methodology)</span>
            </h2>
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block">Uydu Sensörü:</span>
                  <span className="text-slate-200">Copernicus Sentinel-2B MSI</span>
                </div>
                <div>
                  <span className="text-slate-500 block">İşleme Düzeyi:</span>
                  <span className="text-slate-200">Level-2A (Bottom-of-Atmosphere)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kullanılan Spektral Bantlar:</span>
                  <span className="text-slate-200">B02, B03, B04, B08, B11</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
                Bitki sağlığı <strong>NDVI = (B08 - B04) / (B08 + B04)</strong> formülü ile; kanopi su içeriği ise <strong>Gao NDWI = (B08 - B11) / (B08 + B11)</strong> yöntemiyle türetilmiştir. Bulut maskeleme eşiği %15 altında olup parsel üzerinde %4.2 bulutsuz gözlem kalitesi doğrulanmıştır.
              </p>
            </div>
          </div>

          {/* Section 4: Satellite Observations & Imagery */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>04.</span>
              <span>Uydu Görüntüleri & Spektral Haritalar (Satellite Imagery)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* RGB True Color */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="p-2 bg-slate-950 text-[10px] font-mono text-slate-300 flex justify-between">
                  <span>RGB Gerçek Renk</span>
                  <span className="text-slate-500">B04-B03-B02</span>
                </div>
                <div 
                  className="aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80')` }}
                />
              </div>

              {/* NDVI False Color */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="p-2 bg-slate-950 text-[10px] font-mono text-emerald-400 flex justify-between">
                  <span>NDVI Vejetasyon</span>
                  <span className="text-slate-500">B08-B04</span>
                </div>
                <div 
                  className="aspect-video bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80')`,
                    filter: 'hue-rotate(60deg) saturate(2.2) contrast(1.3)',
                  }}
                />
              </div>

              {/* NDWI Water Map */}
              <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="p-2 bg-slate-950 text-[10px] font-mono text-cyan-400 flex justify-between">
                  <span>NDWI Sıvı Su Katmanı</span>
                  <span className="text-slate-500">B08-B11</span>
                </div>
                <div 
                  className="aspect-video bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80')`,
                    filter: 'hue-rotate(180deg) saturate(1.8) contrast(1.2)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 5 & 6: Quantitative Matrix (Vegetation & Water) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>05 & 06.</span>
              <span>Vejetasyon & Su Stresi Analitik Matrisi</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-800 rounded-xl overflow-hidden">
                <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Gösterge</th>
                    <th className="p-3">Spektral Bant</th>
                    <th className="p-3">Ölçülen Değer</th>
                    <th className="p-3">6 Aylık Eğilim</th>
                    <th className="p-3">Sınıflandırma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                  <tr className="bg-slate-950/40">
                    <td className="p-3 font-semibold text-white">NDVI (Bitki Sağlığı)</td>
                    <td className="p-3 text-slate-400">B08 / B04 (NIR/Red)</td>
                    <td className="p-3 font-bold text-emerald-400">{parcel.ndvi}</td>
                    <td className="p-3 text-amber-400">↓ 6.4%</td>
                    <td className="p-3 text-emerald-300">Sağlıklı Kanopi</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="p-3 font-semibold text-white">NDWI (Kanopi Su Katsayısı)</td>
                    <td className="p-3 text-slate-400">B08 / B11 (NIR/SWIR)</td>
                    <td className="p-3 font-bold text-cyan-400">{parcel.ndwi}</td>
                    <td className="p-3 text-rose-400">↓ 11.2%</td>
                    <td className="p-3 text-amber-400">Orta Düzey Kısıt</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="p-3 font-semibold text-white">Toprak Nemi (Model Tahmini)</td>
                    <td className="p-3 text-slate-400">SWIR2 / Termal Denge</td>
                    <td className="p-3 font-bold text-slate-200">%{parcel.soilMoisture}</td>
                    <td className="p-3 text-amber-400">↓ 8.3%</td>
                    <td className="p-3 text-amber-300">İzleme Tavsiye Edilir</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="p-3 font-semibold text-white">Karbon Yutak Göstergesi</td>
                    <td className="p-3 text-slate-400">Biyokütle Örtü Modeli</td>
                    <td className="p-3 font-bold text-emerald-400">Pozitif</td>
                    <td className="p-3 text-emerald-400">Stabil (+1.8%)</td>
                    <td className="p-3 text-slate-300">Doğrulama Gerektirir*</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 7 & 8: Environmental Risks & AI Interpretation */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>07 & 08.</span>
              <span>Çevresel Risk Değerlendirmesi & Yapay Zekâ Yorumu</span>
            </h2>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Model: Gemini 3.8 Flash (Uzaktan Algılama Analisti)</span>
                <span className="font-mono text-emerald-400 text-[10px] uppercase">Güven Düzeyi: Yüksek</span>
              </div>
              <div className="space-y-2">
                {analysis?.risks?.map((risk, i) => (
                  <div key={i} className="p-2.5 rounded bg-slate-950 border border-amber-500/20 text-slate-300 text-[11px]">
                    <strong className="text-amber-400 block mb-0.5">{risk.title}:</strong>
                    {risk.explanation}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 9: Field Verification Plan (Section 16) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>09.</span>
              <span>Saha Doğrulama Planı (Field Verification Protocol)</span>
            </h2>
            <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-slate-300 space-y-2">
              <p className="text-[11px] text-slate-400">
                MRV akreditasyonu ve bağımsız üçüncü taraf denetimi için tamamlanması gereken zemin teyit adımları:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-200 text-[11px]">
                <li>Parsel sınırları içinde 3 farklı kök bölgesinde el tipi TDR sensörü ile toprak nemi profil kontrolü.</li>
                <li>Çiftçi sulama kayıt defteri ve debimetre saat endekslerinin doğrulanması.</li>
                <li>Toprak Organik Maddesi (SOM) laboratuvar analizi için parselden karot numunesi alınması.</li>
                <li>13 Eylül 2026 tarihindeki bir sonraki Sentinel-2 geçişinde su toparlanmasının takibi.</li>
              </ul>
            </div>
          </div>

          {/* Section 10: MRV Status Categorization (Section 17 - Part 10) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>10.</span>
              <span>MRV Sınıflandırma Ayrımı (Measurement, Reporting, Verification)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase block">
                  MEASUREMENT (Ölçüm)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Sentinel-2B L2A spektrofotometrik yansıma değerleri, NDVI ve NDWI indeksleri (10m piksel ölçeği).
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-400 font-mono text-[10px] uppercase block">
                  REPORTING (Raporlama)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  CSRD, Scope 3 ve kurumsal sürdürülebilirlik KPI entegrasyonu; dönemsel çevresel risk endeksi.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 font-mono text-[10px] uppercase block">
                  VERIFICATION (Doğrulama)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Saha denetimi, üretici beyanları, toprak numune tahlilleri ve bağımsız denetim onayları.
                </p>
              </div>
            </div>
          </div>

          {/* Section 11: Limitations & Data Quality */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span>11.</span>
              <span>Kısıtlamalar & Veri Kalitesi (Limitations & Data Quality)</span>
            </h2>
            <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              Bu raporda yer alan optik spektral veriler, 10 metrelik yer örnekleme mesafesine (GSD) sahip Sentinel-2 MSI uydusundan alınmıştır. Bulut örtüsü (%4.2) eşik değerinin altındadır. Toprak nemi ve karbon tutum değerleri uydu göstergelerinden türetilen model tahminleri olup resmi sertifikasyon için fiziksel zemin numunesi zorunludur.
            </div>
          </div>

          {/* Section 12: Conclusion & Official Sign-off */}
          <div className="pt-4 border-t-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div>
              <div><strong>Doğrulama Durumu:</strong> <span className="text-emerald-400">Ön İnceleme Tamamlandı (Saha Teyidi Bekliyor)</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">Denetim Kodu: SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                TerraSat AI Doğrulama Mührü
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
