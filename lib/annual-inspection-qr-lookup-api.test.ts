import { describe, expect, it } from 'vitest';
import { formatInspectionQrLookupDate } from '@/lib/annual-inspection-qr-lookup-api';

describe('formatInspectionQrLookupDate', () => {
  it('formats ISO dates for display in es-VE', () => {
    expect(formatInspectionQrLookupDate('2026-03-15T10:30:00Z')).toMatch(/15\/03\/2026/);
  });

  it('returns the original value when parsing fails', () => {
    expect(formatInspectionQrLookupDate('fecha-no-valida')).toBe('fecha-no-valida');
  });

  it('returns an em dash for empty values', () => {
    expect(formatInspectionQrLookupDate('')).toBe('—');
  });
});
