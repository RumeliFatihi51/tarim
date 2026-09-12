import React from 'react';
import { 
  Satellite, 
  BookOpen, 
  Layers, 
  Activity, 
  Droplets, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  FileText
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#080c14] text-slate-200 overflow-y-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Bilimsel Dokümantasyon & Standartlar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            TerraSat AI Uzaktan Algılama & MRV Metodolojisi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Copernicus Sentinel-2 spektral verileri, optik indeks formülleri, bulut filtreleme ve yapay zekâ destekli kurumsal denetim prensipleri.
          </p>
        </div>

        {/* Section 1: Sentinel-2 & Spectral Bands */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0d131f] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Satellite className="w-5 h-5 text-emerald-400" />
            <h2>1. Copernicus Sentinel-2 Sensör Mimarisi</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sentinel-2, Avrupa Uzay Ajansı (ESA) tarafından Copernicus programı kapsamında işletilen yüksek çözünürlüklü çok bantlı optik görüntüleme uydularıdır (Sentinel-2A ve Sentinel-2B ikiz uyduları). Ekvatorda 5 günde bir aynı noktayı yeniden ziyaret eder. TerraSat AI, atmosferik düzeltmesi yapılmış <strong>Level-2A Bottom-of-Atmosphere (BOA)</strong> yüzey yansıma verilerini kullanır.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left border border-slate-800 rounded-xl overflow-hidden font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Bant</th>
                  <th className="p-2.5">Merkezi Dalga Boyu</th>
                  <th className="p-2.5">Mekansal Çözünürlük</th>
                  <th className="p-2.5">Tarımsal Kullanım Amacı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-2.5 font-bold text-white">B02 Blue</td>
                  <td className="p-2.5">490 nm</td>
                  <td className="p-2.5 text-emerald-400">10 Metre</td>
                  <td className="p-2.5 text-slate-400">Toprak/vejetasyon ayrımı, atmosfer aerosolü</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">B03 Green</td>
                  <td className="p-2.5">560 nm</td>
                  <td className="p-2.5 text-emerald-400">10 Metre</td>
                  <td className="p-2.5 text-slate-400">Klorofil yansıması ve bitki sağlığı</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">B04 Red</td>
                  <td className="p-2.5">665 nm</td>
                  <td className="p-2.5 text-emerald-400">10 Metre</td>
                  <td className="p-2.5 text-slate-400">Klorofil emilimi (fotosentez canlılığı)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">B08 NIR</td>
                  <td className="p-2.5">842 nm</td>
                  <td className="p-2.5 text-emerald-400">10 Metre</td>
                  <td className="p-2.5 text-slate-400">Yaprak hücresel yapısı ve biyokütle yansıması</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">B11 SWIR-1</td>
                  <td className="p-2.5">1610 nm</td>
                  <td className="p-2.5 text-cyan-400">20 Metre</td>
                  <td className="p-2.5 text-slate-400">Kanopi sıvı su içeriği ve yaprak nem stresi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Mathematical Formulas for Indices */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0d131f] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2>2. Spektral İndeks Hesaplama Formülleri</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NDVI */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs uppercase font-mono">
                  NDVI (Normalized Difference Vegetation Index)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">B08 / B04</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg text-center font-mono text-xs font-bold text-white border border-slate-800">
                NDVI = (B08 - B04) / (B08 + B04)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fotosentez yapan klorofilin kırmızı ışığı (B04) absorbe edip yakın kızılötesini (B08) güçlü şekilde yansıtması prensibine dayanır. -1 ile +1 arasındadır. Tarımsal arazilerde 0.60 – 0.85 arası sağlıklı vejetasyona karşılık gelir.
              </p>
            </div>

            {/* NDWI */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 text-xs uppercase font-mono">
                  NDWI (Gao Normalized Difference Water Index)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">B08 / B11</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg text-center font-mono text-xs font-bold text-white border border-slate-800">
                NDWI = (B08 - B11) / (B08 + B11)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Bitki örtüsünün yaprak içi sıvı su içeriğini ölçmek için Bo-cai Gao (1996) tarafından geliştirilmiştir. Kısa dalga kızılötesi (SWIR B11) sudaki güçlü emilime duyarlıdır.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Cloud Masking & Quality Thresholds */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0d131f] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2>3. Bulut Filtreleme (Cloud Screening) ve Kalite Kontrolü</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            TerraSat AI uydu verilerini körü körüne analize dahil etmez. Copernicus Scene Classification Layer (SCL) maskesini kullanarak her sahnede bulut, bulut gölgesi ve ince sirrüs tespiti yapar. Parsel üzerindeki bulut örtüsü %15'i aşarsa görüntü otomatik olarak analiz dışı bırakılır ve zaman serisi interpolasyonuna tabi tutulur.
          </p>
        </div>

        {/* Section 4: Gemini AI's Precise Role */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0d131f] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2>4. Yapay Zekânın (Gemini 3.8 Flash) Rolü</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Gemini veriyi uydurmaz veya ölçümün yerine geçmez.</strong> Rolü: Sentinel-2'den elde edilen doğrulanmış spektral indeksleri, meteorolojik değişkenleri ve ürün fenolojisini sentezleyerek kurumsal risk analistlerine eyleme geçirilebilir içgörüler sunmaktır.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300">
            Yapılandırılmış Veri Girdisi ➔ Gemini Çevre Analisti ➔ Risk Sinyalleri & Saha Teyit Planı
          </div>
        </div>

        {/* Section 5: The MRV Principle & Scientific Honesty */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0d131f] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2>5. MRV Sınıflandırması & Bilimsel Dürüstlük İlkesi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 uppercase font-mono block">M - Measurement</span>
              <p className="text-[11px] text-slate-400">
                Uydu sensörü ile doğrudan ölçülen fiziksel spektrofotometrik yansımalar ve spektral indeksler.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 uppercase font-mono block">R - Reporting</span>
              <p className="text-[11px] text-slate-400">
                Şirketlerin CSRD ve Scope 3 karbon/su muhasebesine dahil edilecek kurumsal raporlama formatı.
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 uppercase font-mono block">V - Verification</span>
              <p className="text-[11px] text-slate-400">
                Saha denetimleri, toprak karot numuneleri ve üretici beyanlarıyla yapılan fiziksel akreditasyon.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300/90 leading-relaxed">
            <strong>Karbon Hakkında Bilimsel Sorumluluk:</strong> Optik uydular toprak altı organik karbonunu doğrudan ölçemez. Sistemdeki karbon göstergeleri çok yıllık kanopi biyokütlesi ve toprak örtüsü devamlılığına dayalı model tahminidir (proxy indicator). Kesin karbon hesabı için ISO 14064 kapsamında yerinde toprak analizi şarttır.
          </div>
        </div>
      </div>
    </div>
  );
};
