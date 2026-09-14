import PDFDocument from 'pdfkit';
import crypto from 'crypto';

export async function renderMrvPdf(report: Record<string, unknown>): Promise<{ buffer: Buffer; sha256: string }> {
  const document = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'TerraSat AI MRV Report' } });
  const chunks: Buffer[] = [];
  document.on('data', (chunk: Buffer) => chunks.push(chunk));
  document.fontSize(20).text('TerraSat AI — MRV Evidence Report');
  document.moveDown().fontSize(10).text('Satellite-derived measurements, estimates and inferences are explicitly separated. Field verification is required where stated.');
  document.moveDown().fontSize(12).text(JSON.stringify(report, null, 2), { width: 500 });
  const completed = new Promise<Buffer>((resolve, reject) => {
    document.on('end', () => resolve(Buffer.concat(chunks)));
    document.on('error', reject);
  });
  document.end();
  const buffer = await completed;
  return { buffer, sha256: crypto.createHash('sha256').update(buffer).digest('hex') };
}

