import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TerraSat AI Engine',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Parcel Analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const parcel = req.body;
    if (!parcel || (!parcel.id && !parcel.number)) {
      return res.status(400).json({ error: 'Geçerli bir parsel verisi gereklidir.' });
    }

    const ai = getGeminiClient();

    // Fallback generator for realistic seminar demonstration when API key is not yet set
    const generateSmartFallback = (p: any) => {
      const isHighRisk = p.status === 'high-risk' || p.waterStress === 'High' || p.ndvi < 0.55;
      const isModerate = p.status === 'moderate' || p.waterStress === 'Medium';

      const statusTr = isHighRisk ? 'Yüksek Risk' : isModerate ? 'Orta Düzey Risk' : 'Düşük Risk / Sağlıklı';

      const findings: string[] = [];
      const risks: { title: string; severity: 'low' | 'medium' | 'high'; explanation: string }[] = [];
      const positive: string[] = [];
      const actions: string[] = [];
      const verification: string[] = [];

      // NDVI analysis
      if (p.ndvi >= 0.75) {
        positive.push(`NDVI (${p.ndvi}) değeri fotosentetik aktivite ve kanopi yoğunluğunun kuvvetli olduğunu göstermektedir.`);
        findings.push(`Bitki kanopisi (${p.crop}) fenolojik dönemine uygun optimum yeşil biyokütleye sahiptir.`);
      } else if (p.ndvi >= 0.65) {
        findings.push(`NDVI (${p.ndvi}) kabul edilebilir sınırlar içinde olmakla birlikte son dönemde durağanlaşma gözlemlenmiştir.`);
      } else {
        risks.push({
          title: 'Vejetasyon İndeksinde (NDVI) Kritik Sapma',
          severity: 'high',
          explanation: `NDVI seviyesi ${p.ndvi} değerine gerileyerek beklenen mevsimsel bazın belirgin altına inmiştir. Yaprak sararması veya erken yaprak dökülmesi olasılığı mevcuttur.`,
        });
      }

      // NDWI / Water Stress analysis
      if (p.waterStress === 'High' || p.ndwi < 0.35) {
        risks.push({
          title: 'Ciddi Su Stresi & Kuraklık İndikatörü',
          severity: 'high',
          explanation: `NDWI (${p.ndwi}) ve tahmini toprak nemi (%${p.soilMoisture}) kritik eşik altına inmiştir. Bitki bünyesindeki su potansiyeli düşüş göstermektedir.`,
        });
        actions.push('Sulama vanaları, damlatıcı hatları ve debi sayaçları ivedilikle fiziksel kontrolden geçirilmelidir.');
        verification.push('Yaprak su potansiyeli (baskı odası/pressure chamber) veya el tipi nem ölçer ile yerinde ölçüm.');
      } else if (p.waterStress === 'Medium' || p.ndwi < 0.50) {
        risks.push({
          title: 'Gelişmekte Olan Su Kısıtı Sinyali',
          severity: 'medium',
          explanation: `NDWI (${p.ndwi}) değerinde gözlenen hafif gerileme ve %${p.soilMoisture} toprak nemi, sulama sıklığının hava sıcaklığı artışını tam kompanse edemediğini düşündürmektedir.`,
        });
        actions.push('Son 14 günlük meteorolojik buharlaşma (ET0) verileri ile sulama takvimi karşılaştırılmalıdır.');
        verification.push('Parselin uç noktalarında toprak profil nemi kontrolü.');
      } else {
        positive.push(`NDWI (${p.ndwi}) su göstergesi ve %${p.soilMoisture} toprak nemi parsel genelinde hidrik dengenin korunduğuna işaret etmektedir.`);
      }

      // Carbon & Soil
      if (p.carbonIndicator === 'Positive') {
        positive.push('Tahmini toprak-örtü karbon tutum göstergesi pozitif yönde, çok yıllık/örtü yönetimi sürdürülebilirliği destekliyor.');
      }

      actions.push('Sentinel-2 bir sonraki uydu geçişinde (5 gün sonra) trend devamlılığı otomatik takibe alınmalıdır.');
      verification.push('Sözleşmeli üretici kayıtları ve gübreleme/ilaçlama defterlerinin tedarik zinciri portalı üzerinden teyidi.');

      const summary = isHighRisk
        ? `${p.name} (#${p.id}) parselinde son gözlem periyodunda hem vejetasyon vigorunda hem de su göstergelerinde belirgin bir gerileme tespit edilmiştir. Mevcut sinyaller kuraklık stresi veya kök bölgesi sulama aksaklığı ile uyumludur.`
        : isModerate
        ? `${p.name} (#${p.id}) genel durumu kabul edilebilir eşiklerdedir; ancak NDWI ve toprak nemindeki hafif düşüş eğilimi orta vadeli bir su kısıtı riskine işaret etmektedir. Önleyici tedbirler alınması önerilir.`
        : `${p.name} (#${p.id}) parselinde izlenen tüm çevresel ve spektral göstergeler yüksek sürdürülebilirlik seviyesini teyit etmektedir. Herhangi bir akut risk faktörü bulunmamaktadır.`;

      return {
        overallStatus: statusTr,
        summary,
        keyFindings: findings.length ? findings : ['Parsel göstergeleri mevsimsel normallere uygun seyretmektedir.'],
        risks,
        positiveSignals: positive,
        recommendedActions: actions,
        verificationNeeded: verification,
        generatedAt: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
        modelUsed: 'TerraSat Hibrit Analiz Motoru (Kural & Spektral Model)',
      };
    };

    if (!ai) {
      console.log('No GEMINI_API_KEY configured, using domain expert rule fallback.');
      const result = generateSmartFallback(parcel);
      return res.json(result);
    }

    const systemPrompt = `Sen TerraSat AI kurumsal tarımsal sürdürülebilirlik ve MRV (Ölçüm, Raporlama, Doğrulama) platformunun kıdemli uzaktan algılama ve tarım analistisin.
Görevin: Büyük gıda ve tarım şirketlerinin tedarik zincirindeki tescilli parselleri uydu göstergeleri (NDVI, NDWI, Toprak Nemi, vb.) ve zaman serisi trendleri üzerinden bilimsel dürüstlükle yorumlamak.

Kurallar:
1. Bilimsel Dürüstlük: Uydu verilerinin doğrudan ve tek başına kesin tarla teşhisi veya yasal sertifikasyon sunamayacağını bil; verileri "gösterge", "sinyal", "işaret edebilir", "saha doğrulaması önerilir" diliyle aktar.
2. Kesinlik iddiasında bulunma, gözlem ile hipotezi ayır.
3. Çıktı dilin Türkçe, resmi, kurumsal ve analitik olmalıdır.
4. Yanıtı SADECE geçerli JSON formatında ver.`;

    const userPrompt = `Aşağıdaki tarım parseline ait uzaktan algılama ve sürdürülebilirlik verilerini analiz et:
${JSON.stringify({
  parselNo: parcel.number || parcel.id,
  parselAdi: parcel.name,
  konum: parcel.location,
  urun: parcel.crop,
  alanHektar: parcel.areaHa,
  surdurulebilirlikSkoru: parcel.sustainabilityScore,
  ndvi: parcel.ndvi,
  ndwi: parcel.ndwi,
  toprakNemi: parcel.soilMoisture,
  suStresi: parcel.waterStress,
  bitkiSagligi: parcel.plantHealth,
  karbonGostergesi: parcel.carbonIndicator,
  sonGozlemTarihi: parcel.lastObservation,
  tarihselZamanSerisi: parcel.historicalData,
}, null, 2)}

Şu JSON şemasına birebir uygun yanıt ver:
{
  "overallStatus": "Düşük Risk" | "Orta Düzey Risk" | "Yüksek Risk",
  "summary": "2-3 cümlelik yönetici özeti",
  "keyFindings": ["bulgu 1", "bulgu 2", "bulgu 3"],
  "risks": [
    {
      "title": "Risk Başlığı",
      "severity": "low" | "medium" | "high",
      "explanation": "Detaylı risk açıklaması ve hipotez"
    }
  ],
  "positiveSignals": ["olumlu gösterge 1", "olumlu gösterge 2"],
  "recommendedActions": ["eylem 1", "eylem 2"],
  "verificationNeeded": ["fiziksel saha kontrolü önerisi 1", "veri kontrolü önerisi 2"]
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallStatus: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ['title', 'severity', 'explanation'],
                },
              },
              positiveSignals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              verificationNeeded: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['overallStatus', 'summary', 'keyFindings', 'risks', 'positiveSignals', 'recommendedActions', 'verificationNeeded'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Boş model yanıtı alındı');
      }

      const parsed = JSON.parse(text);
      parsed.generatedAt = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
      parsed.modelUsed = 'Gemini 3.8 Flash (Uzaktan Algılama Analisti)';

      return res.json(parsed);
    } catch (modelError: any) {
      console.warn('Gemini API call warning, serving domain model fallback:', modelError?.message);
      const fallback = generateSmartFallback(parcel);
      return res.json(fallback);
    }
  } catch (error: any) {
    console.error('API Error in /api/analyze:', error);
    res.status(500).json({ error: 'Analiz sırasında sunucu hatası oluştu.' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TerraSat AI Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
