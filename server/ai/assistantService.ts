import crypto from 'crypto';
import type { AIChatMessage } from '../types';
import { aiToolRouter } from './toolRouter';

export class AssistantService {
  async processUserMessage(
    userPrompt: string,
    history: AIChatMessage[] = [],
    context: { activeParcelId?: string; companyId?: string } = {},
  ): Promise<AIChatMessage> {
    const companyId = context.companyId || 'local-dev';
    const parcelId = context.activeParcelId;
    const priorContext = history.slice(-6).map((item) => `${item.role}: ${item.content}`).join('\n');
    if (!parcelId) return this.message('Bir parsel seçin ve gerçek analizi tamamlayın. Ölçüm bulunmadan sonuç üretemem.', [], ['No active parcel or analysis evidence.']);
    const toolResult = aiToolRouter.getLatestAnalysis(companyId, parcelId);
    const analysis = toolResult.data;
    if (!analysis) return this.message('Bu parsel için kalıcı analiz kaydı bulunamadı. LIVE analizi çalıştırmadan spektral değer yorumlayamam.', [], toolResult.limitations);

    const indices = analysis.calculatedIndices;
    const evidence = [
      `MEASURED — NDVI ${indices.ndvi.toFixed(3)}, Sentinel-2 ${analysis.satelliteMetadata.sceneId}`,
      `MEASURED — NDWI ${indices.ndwi.toFixed(3)} (${analysis.spectralStats ? 'B03/B08' : 'formula metadata unavailable'})`,
      `MEASURED — NDMI ${indices.ndmi.toFixed(3)}; valid pixels ${analysis.pixelStats?.validPixelRatio ?? 'unavailable'}`,
    ];
    const answer = `Kayıtlı Sentinel-2 analizine göre ${analysis.parcel.name} için NDVI ${indices.ndvi.toFixed(3)}, NDWI ${indices.ndwi.toFixed(3)} ve NDMI ${indices.ndmi.toFixed(3)} ölçüldü. Bunlar uydu-türevli ölçümlerdir; tarımsal uygulama veya saha koşulunu tek başına doğrulamaz.`;
    return this.message(answer, evidence, [
      'FIELD_VERIFIED değildir.',
      `Konuşma bağlamında ${history.length} önceki mesaj kullanıldı.${priorContext ? '' : ' Önceki mesaj yok.'}`,
    ]);
  }

  private message(content: string, evidence: string[], limitations: string[]): AIChatMessage {
    return {
      id: crypto.randomUUID(), role: 'assistant', content, timestamp: new Date().toISOString(),
      structured: { answer: content, evidence, interpretation: 'AI_INFERENCE based only on retrieved TerraSat evidence.', confidence: evidence.length ? 'Medium' : 'Low', limitations },
    };
  }
}

export const defaultAssistantService = new AssistantService();
