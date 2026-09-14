import { describe, expect, it } from 'vitest';
import crypto from 'crypto';
import { renderMrvPdf } from '../server/mrv/pdfReport';

describe('MRV artifacts', () => {
  it('renders a real PDF and computes its SHA-256', async () => {
    const { buffer, sha256 } = await renderMrvPdf({ mode: 'LIVE', status: 'MEASURED', limitation: 'Not field verified' });
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(sha256).toBe(crypto.createHash('sha256').update(buffer).digest('hex'));
  });
});

