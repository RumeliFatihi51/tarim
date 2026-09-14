import { describe, expect, it } from 'vitest';
import { PracticeEngine } from '../server/practices/practiceEngine';

describe('practice evidence', () => {
  it('never marks satellite-only output as field verified', () => {
    const signals = new PracticeEngine().evaluatePracticeSignals('p', 'crop', 0.1, -0.2, -0.1, 0.3, '2026-01-01');
    expect(signals.every((signal) => signal.verificationStatus !== 'VERIFIED')).toBe(true);
    expect(signals.find((signal) => signal.type === 'RESIDUE_BURNING')?.status).toBe('INSUFFICIENT_EVIDENCE');
    expect(signals.find((signal) => signal.type === 'TILLAGE')?.status).toBe('INSUFFICIENT_EVIDENCE');
  });
});

