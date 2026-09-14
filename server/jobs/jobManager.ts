import { AnalysisJob, PipelineStageStatus } from '../types';
import fs from 'fs';
import path from 'path';

export const PIPELINE_STAGES: { id: string; name: string; description: string }[] = [
  { id: 'stage-1', name: 'Parsel Geometrisi Doğrulandı', description: 'GeoJSON koordinatları ve Bounding Box hesaplandı' },
  { id: 'stage-2', name: 'Copernicus Sentinel-2 Katalog Taraması', description: 'STAC Level-2A BOA görüntüleri taranıyor' },
  { id: 'stage-3', name: 'En Uygun Uydu Gözlemi Seçildi', description: 'Asset bütünlüğü ve poligon içi SCL geçerli/bulut/gölge oranlarıyla adaylar sıralandı' },
  { id: 'stage-4', name: 'Uydu Verisi ve Bantlarına Erişim', description: '10m ve 20m COG raster URL’leri hazırlandı' },
  { id: 'stage-5', name: 'Bulut ve Gölge Filtreleme (SCL)', description: 'Scene Classification Layer ile geçersiz pikseller maskelendi' },
  { id: 'stage-6', name: 'Raster Parsel Sınırına Kırpılıyor', description: 'Seçilen poligon içi piksel matrisi ayrıştırıldı' },
  { id: 'stage-7', name: 'Multispektral Yansıma İşleme', description: 'B02, B03, B04, B08 NIR ve B11 SWIR değerleri okundu' },
  { id: 'stage-8', name: 'Gerçek NDVI Hesaplanıyor', description: 'Her geçerli piksel için (B08 - B04) / (B08 + B04) hesaplandı' },
  { id: 'stage-9', name: 'Gerçek NDWI Hesaplanıyor', description: 'Her geçerli piksel için (B03 - B08) / (B03 + B08) hesaplandı' },
  { id: 'stage-10', name: 'Gerçek NDMI ve Nem Hesaplanıyor', description: 'Her geçerli piksel için (B08 - B11) / (B08 + B11) hesaplandı' },
  { id: 'stage-11', name: 'Tarihsel Zaman Serisi Derleniyor', description: 'Geçmiş 6-12 aylık gerçek Sentinel-2 gözlemleri tarandı' },
  { id: 'stage-12', name: 'Yapay Zekâ Çevre Değerlendirmesi', description: 'Ölçülen veriler Gemini ile yorumlanıyor' },
  { id: 'stage-13', name: 'MRV Göstergeleri Oluşturuluyor', description: 'Ölçüm, Raporlama ve Saha Doğrulama protokolü ayrıştırıldı' },
  { id: 'stage-14', name: 'Kurumsal Denetim Raporu Hazırlandı', description: 'CSRD ve Scope 3 uyumlu resmi MRV raporu derlendi' },
];

export class JobManager {
  private jobs = new Map<string, AnalysisJob>();
  private readonly storePath: string;

  constructor(storePath = path.join(process.cwd(), 'data', 'jobs.json')) {
    this.storePath = storePath;
    try {
      const entries = JSON.parse(fs.readFileSync(this.storePath, 'utf8')) as AnalysisJob[];
      for (const job of entries) this.jobs.set(job.id, job);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.warn('[JOB] Could not load persistent job store');
    }
  }

  private persist(): void {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    const temporary = `${this.storePath}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify([...this.jobs.values()]));
    fs.renameSync(temporary, this.storePath);
  }

  createJob(jobId: string, mode: 'LIVE' | 'DEMO' = 'LIVE'): AnalysisJob {
    const stages: PipelineStageStatus[] = PIPELINE_STAGES.map((s, idx) => ({
      id: s.id,
      number: idx + 1,
      name: s.name,
      description: s.description,
      status: idx === 0 ? 'running' : 'pending',
    }));

    const job: AnalysisJob = {
      id: jobId,
      mode,
      status: 'running',
      currentStageNumber: 1,
      totalStages: PIPELINE_STAGES.length,
      stages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);
    this.persist();
    return job;
  }

  getJob(jobId: string): AnalysisJob | undefined {
    return this.jobs.get(jobId);
  }

  updateStage(
    jobId: string,
    stageNumber: number,
    status: 'running' | 'completed' | 'failed',
    techDetail?: string
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.updatedAt = new Date().toISOString();
    job.currentStageNumber = stageNumber;

    const stage = job.stages[stageNumber - 1];
    if (stage) {
      stage.status = status;
      if (techDetail) stage.techDetail = techDetail;
    }

    // Set next stage to running if completed
    if (status === 'completed' && stageNumber < job.totalStages) {
      job.stages[stageNumber].status = 'running';
      job.currentStageNumber = stageNumber + 1;
    }

    if (status === 'failed') {
      job.status = 'failed';
    }
    this.persist();
  }

  completeJob(jobId: string, result: any): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'completed';
    job.result = result;
    job.updatedAt = new Date().toISOString();
    // Mark all stages completed
    job.stages.forEach((s) => {
      s.status = 'completed';
    });
    this.persist();
  }

  failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'failed';
    job.error = error;
    job.updatedAt = new Date().toISOString();
    this.persist();
  }
}

export const defaultJobManager = new JobManager();
